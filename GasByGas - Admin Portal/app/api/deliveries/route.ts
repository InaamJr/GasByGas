import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  let connection;
  try {
    connection = await pool.getConnection();

    // Get all deliveries from delivery_schedule
    const [rows] = await connection.execute(`
      SELECT 
        ds.schedule_id,
        ds.order_id,
        ds.scheduled_by,
        ds.scheduled_date,
        ds.delivery_date,
        ds.status as delivery_status,
        oo.order_date,
        oo.expected_delivery_date,
        o.outlet_name,
        o.district,
        om.manager_name,
        om.contact_no,
        ha.name as admin_name
      FROM delivery_schedule ds
      JOIN outlet_order oo ON ds.order_id = oo.order_id
      JOIN outlet o ON oo.outlet_id = o.outlet_id
      JOIN outlet_manager om ON o.manager_id = om.manager_id
      JOIN head_office_admin ha ON ds.scheduled_by = ha.admin_id
      ORDER BY ds.scheduled_date DESC
    `);

    if (!(rows as any[]).length) {
      return NextResponse.json([]);
    }

    // Get order details for each delivery
    const deliveries = await Promise.all(
      (rows as any[]).map(async (row) => {
        const [details] = await connection.execute(`
          SELECT 
            od.detail_id,
            ct.name as cylinder_type,
            ct.weight_kg,
            od.quantity,
            od.status as detail_status
          FROM order_details od
          JOIN cylinder_types ct ON od.cylinder_type_id = ct.type_id
          WHERE od.order_id = ?
        `, [row.order_id]);

        // Filter out cancelled items if delivery is scheduled
        const filteredDetails = row.delivery_status === 'scheduled' 
          ? (details as any[]).filter(d => d.detail_status !== 'cancelled')
          : details;

        return {
          id: row.schedule_id,
          order_id: row.order_id,
          outlet_name: row.outlet_name,
          district: row.district,
          manager_name: row.manager_name,
          contact_no: row.contact_no,
          admin_name: row.admin_name,
          scheduled_date: row.scheduled_date,
          delivery_date: row.delivery_date,
          status: row.delivery_status,
          order_date: row.order_date,
          expected_delivery_date: row.expected_delivery_date,
          order_details: filteredDetails
        };
      })
    );

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error('Error fetching scheduled deliveries:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch deliveries' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}

export async function PUT(request: Request) {
  let connection;
  try {
    const body = await request.json();
    const { orderId, detailIds, action } = body;

    if (!orderId || !action || (action === 'complete' && (!detailIds || !Array.isArray(detailIds)))) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    if (action === 'complete') {
      // Mark as completed logic
      // 1. Update order details status to delivered
      await connection.execute(
        `UPDATE order_details 
         SET status = 'delivered' 
         WHERE order_id = ? AND detail_id IN (${detailIds.map(() => '?').join(',')})`,
        [orderId, ...detailIds]
      );

      // 2. Update delivery schedule status to completed
      await connection.execute(
        `UPDATE delivery_schedule 
         SET status = 'completed' 
         WHERE order_id = ?`,
        [orderId]
      );

      // 3. Update stock for each delivered item
      const [orderDetails] = await connection.execute(
        `SELECT 
          od.detail_id,
          od.cylinder_type_id,
          od.quantity,
          oo.outlet_id
         FROM order_details od
         JOIN outlet_order oo ON od.order_id = oo.order_id
         WHERE od.detail_id IN (${detailIds.map(() => '?').join(',')})`,
        detailIds
      );

      for (const detail of orderDetails as any[]) {
        // Get current stock
        const [currentStock] = await connection.execute(
          `SELECT quantity 
           FROM outlet_stock 
           WHERE outlet_id = ? AND cylinder_type_id = ?`,
          [detail.outlet_id, detail.cylinder_type_id]
        );

        const currentQuantity = currentStock[0]?.quantity || 0;
        const newQuantity = currentQuantity + detail.quantity;

        // Update or insert stock
        if (currentStock[0]) {
          await connection.execute(
            `UPDATE outlet_stock 
             SET quantity = ? 
             WHERE outlet_id = ? AND cylinder_type_id = ?`,
            [newQuantity, detail.outlet_id, detail.cylinder_type_id]
          );
        } else {
          await connection.execute(
            `INSERT INTO outlet_stock (outlet_id, cylinder_type_id, quantity) 
             VALUES (?, ?, ?)`,
            [detail.outlet_id, detail.cylinder_type_id, detail.quantity]
          );
        }

        // Record stock transaction
        await connection.execute(
          `INSERT INTO stock_transaction 
           (outlet_id, cylinder_type_id, transaction_type, quantity, transaction_date, reference_order_id) 
           VALUES (?, ?, 'in', ?, NOW(), ?)`,
          [detail.outlet_id, detail.cylinder_type_id, detail.quantity, orderId]
        );
      }
    } else if (action === 'cancel') {
      // Mark all scheduled items as cancelled
      await connection.execute(
        `UPDATE order_details 
         SET status = 'cancelled' 
         WHERE order_id = ? AND status = 'scheduled'`,
        [orderId]
      );

      // Update delivery schedule status to cancelled
      await connection.execute(
        `UPDATE delivery_schedule 
         SET status = 'cancelled' 
         WHERE order_id = ?`,
        [orderId]
      );
    }

    await connection.commit();
    return NextResponse.json({ success: true });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error updating delivery:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update delivery' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}
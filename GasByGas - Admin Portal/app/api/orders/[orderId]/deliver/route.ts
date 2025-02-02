import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const orderId = parseInt(params.orderId);
  console.log('=== START: Processing delivery for order:', orderId, '===');

  if (isNaN(orderId)) {
    console.error('Invalid order ID:', params.orderId);
    return NextResponse.json(
      { success: false, error: 'Invalid order ID' },
      { status: 400 }
    );
  }

  // Get the cylinder types to deliver from request body
  const body = await request.json();
  const { detailIds } = body;

  if (!detailIds || !Array.isArray(detailIds) || detailIds.length === 0) {
    return NextResponse.json(
      { success: false, error: 'No items specified for delivery' },
      { status: 400 }
    );
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    console.log('Started transaction');

    // 1. Get order details and verify order exists
    console.log('Fetching order details...');
    const [orders] = await connection.execute(
      `SELECT 
        oo.order_id, 
        oo.outlet_id,
        o.outlet_name,
        od.detail_id,
        od.cylinder_type_id,
        od.status,
        ct.name as cylinder_name, 
        od.quantity
       FROM outlet_order oo
       JOIN outlet o ON oo.outlet_id = o.outlet_id
       JOIN order_details od ON oo.order_id = od.order_id
       JOIN cylinder_types ct ON od.cylinder_type_id = ct.type_id
       WHERE oo.order_id = ? AND od.detail_id IN (${detailIds.map(() => '?').join(',')})`,
      [orderId, ...detailIds]
    );

    if (!orders || (orders as any[]).length === 0) {
      throw new Error('Order details not found');
    }

    const orderDetails = orders as any[];
    console.log('Found order details:', JSON.stringify(orderDetails, null, 2));

    // Verify all selected items are in scheduled status
    for (const detail of orderDetails) {
      if (detail.status !== 'scheduled') {
        throw new Error(`Item ${detail.cylinder_name} must be scheduled before marking as delivered`);
      }
    }

    // 2. Update order details status
    console.log('Updating order details status to delivered...');
    await connection.execute(
      `UPDATE order_details 
       SET status = 'delivered' 
       WHERE detail_id IN (${detailIds.map(() => '?').join(',')})`,
      detailIds
    );

    // 3. Process each cylinder type stock update
    for (const detail of orderDetails) {
      console.log('\n=== Processing cylinder ===');
      console.log('Detail:', {
        outlet_id: detail.outlet_id,
        outlet_name: detail.outlet_name,
        cylinder_type_id: detail.cylinder_type_id,
        cylinder_name: detail.cylinder_name,
        quantity: detail.quantity
      });

      // First get current stock
      const [currentStock] = await connection.execute(
        `SELECT quantity 
         FROM outlet_stock 
         WHERE outlet_id = ? AND cylinder_type_id = ?`,
        [detail.outlet_id, detail.cylinder_type_id]
      );
      
      const currentQuantity = currentStock[0]?.quantity || 0;
      console.log('Current stock:', currentQuantity);

      // Update stock
      const newQuantity = currentQuantity + detail.quantity;
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
         (outlet_id, cylinder_type_id, transaction_type, quantity, reference_id, reference_type) 
         VALUES (?, ?, 'in', ?, ?, 'order')`,
        [detail.outlet_id, detail.cylinder_type_id, detail.quantity, detail.detail_id]
      );
    }

    await connection.commit();
    console.log('=== END: Successfully processed delivery ===');
    return NextResponse.json({ success: true });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error processing delivery:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to process delivery' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}

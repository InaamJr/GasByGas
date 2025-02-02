import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendEmail, generateOrderStatusEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  let connection;

  try {
    connection = await pool.getConnection();
    
    // First check if there are any pending orders
    const [countResult] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM outlet_order oo
      JOIN order_details od ON oo.order_id = od.order_id
      WHERE od.status = 'pending'
      GROUP BY oo.order_id
    `);
    const count = countResult ? (countResult as any[]).length : 0;

    if (count === 0) {
      return NextResponse.json([]);
    }
    
    // Get orders with outlet and manager information
    const [orders] = await connection.execute(`
      SELECT DISTINCT
        oo.order_id,
        oo.order_date,
        oo.expected_delivery_date,
        o.outlet_name,
        o.district,
        om.manager_name,
        om.contact_no
      FROM outlet_order oo
      JOIN outlet o ON oo.outlet_id = o.outlet_id
      JOIN outlet_manager om ON o.manager_id = om.manager_id
      JOIN order_details od ON oo.order_id = od.order_id
      WHERE od.status = 'pending'
      ORDER BY oo.order_date DESC
    `);

    if (!orders || (orders as any[]).length === 0) {
      console.log('No pending orders found');
      return NextResponse.json([]);
    }

    // Get order details with cylinder types
    const orderIds = (orders as any[]).map(o => o.order_id);
    const placeholders = orderIds.map(() => '?').join(',');
    const [orderDetails] = await connection.execute(`
      SELECT 
        od.order_id,
        od.detail_id,
        ct.name as cylinder_type,
        ct.weight_kg,
        od.quantity,
        od.status
      FROM order_details od
      JOIN cylinder_types ct ON od.cylinder_type_id = ct.type_id
      WHERE od.order_id IN (${placeholders})
    `, orderIds);

    // Group order details by order_id
    const detailsMap: { [key: number]: any[] } = {};
    (orderDetails as any[]).forEach((detail: any) => {
      const orderId = detail.order_id;
      if (!detailsMap[orderId]) {
        detailsMap[orderId] = [];
      }
      detailsMap[orderId].push({
        detail_id: detail.detail_id,
        cylinder_type: detail.cylinder_type,
        weight_kg: detail.weight_kg,
        quantity: detail.quantity,
        status: detail.status
      });
    });

    // Combine orders with their details
    const fullOrders = (orders as any[]).map(order => ({
      id: order.order_id,
      order_date: order.order_date ? new Date(order.order_date).toISOString() : null,
      expected_delivery_date: order.expected_delivery_date ? new Date(order.expected_delivery_date).toISOString() : null,
      outlet_name: order.outlet_name,
      district: order.district,
      manager_name: order.manager_name,
      contact_no: order.contact_no,
      order_details: detailsMap[order.order_id] || [],
      status: 'pending'
    }));

    return NextResponse.json(fullOrders);

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}

export async function POST(request: Request) {
  let connection;

  try {
    const body = await request.json();
    const { outlet_id, expected_delivery_date, order_details } = body;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insert the order
    const [orderResult] = await connection.execute(
      'INSERT INTO outlet_order (outlet_id, order_date, expected_delivery_date, status) VALUES (?, NOW(), ?, ?)',
      [outlet_id, expected_delivery_date, 'pending']
    );
    const orderId = orderResult.insertId;

    // Insert order details
    for (const detail of order_details) {
      await connection.execute(
        'INSERT INTO order_details (order_id, cylinder_type_id, quantity) VALUES (?, ?, ?)',
        [orderId, detail.cylinder_type_id, detail.quantity]
      );
    }

    await connection.commit();

    return NextResponse.json({ success: true, order_id: orderId });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
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
    const { orderId, detailIds, status } = body;

    if (!orderId || !detailIds || !Array.isArray(detailIds) || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get outlet and manager details first
    const [orderDetails] = await connection.execute(`
      SELECT 
        o.outlet_name,
        o.district,
        om.manager_name,
        om.email,
        om.contact_no,
        oo.order_date,
        oo.expected_delivery_date
      FROM outlet_order oo
      JOIN outlet o ON oo.outlet_id = o.outlet_id
      JOIN outlet_manager om ON o.manager_id = om.manager_id
      WHERE oo.order_id = ?
    `, [orderId]);

    if (!orderDetails || (orderDetails as any[]).length === 0) {
      throw new Error('Order not found');
    }

    const outlet = (orderDetails as any[])[0];

    // Get selected order details with cylinder information
    const [selectedOrderDetails] = await connection.execute(`
      SELECT 
        od.detail_id,
        ct.name as cylinder_type,
        ct.weight_kg,
        od.quantity
      FROM order_details od
      JOIN cylinder_types ct ON od.cylinder_type_id = ct.type_id
      WHERE od.detail_id IN (${detailIds.map(() => '?').join(',')})
    `, detailIds);

    // Format order items for email
    const orderItems = (selectedOrderDetails as any[]).map(detail => ({
      type: detail.cylinder_type,
      weight: detail.weight_kg,
      quantity: detail.quantity
    }));

    // Update status for selected order details
    await connection.execute(
      `UPDATE order_details 
       SET status = ? 
       WHERE detail_id IN (${detailIds.map(() => '?').join(',')})`,
      [status, ...detailIds]
    );

    // If status is scheduled, also mark unselected items as cancelled
    if (status === 'scheduled') {
      // Get all detail IDs for this order
      const [allDetails] = await connection.execute(
        `SELECT detail_id FROM order_details WHERE order_id = ?`,
        [orderId]
      );
      
      const allDetailIds = (allDetails as any[]).map(d => d.detail_id);
      const unselectedIds = allDetailIds.filter(id => !detailIds.includes(id));
      
      if (unselectedIds.length > 0) {
        await connection.execute(
          `UPDATE order_details 
           SET status = 'cancelled' 
           WHERE detail_id IN (${unselectedIds.map(() => '?').join(',')})`,
          unselectedIds
        );
      }

      // Create delivery schedule entry
      const deliveryDate = new Date(body.deliveryDate);
      const formattedDeliveryDate = deliveryDate.toISOString().split('T')[0];

      await connection.execute(
        `INSERT INTO delivery_schedule 
         (order_id, scheduled_by, scheduled_date, delivery_date, status)
         VALUES (?, ?, NOW(), ?, 'scheduled')`,
        [orderId, body.scheduledBy, formattedDeliveryDate]
      );

      // Send scheduled email notification
      await sendEmail({
        to: outlet.email,
        subject: 'Order Scheduled for Delivery',
        html: generateOrderStatusEmail(
          orderId,
          'scheduled',
          outlet.manager_name,
          {
            deliveryDate: deliveryDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            deliveryAddress: `${outlet.outlet_name}, ${outlet.district}`,
            orderDate: new Date(outlet.order_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            items: orderItems
          }
        )
      });
    } else if (status === 'cancelled') {
      // Send cancellation email notification
      await sendEmail({
        to: outlet.email,
        subject: 'Order Cancelled',
        html: generateOrderStatusEmail(
          orderId,
          'cancelled',
          outlet.manager_name,
          {
            orderDate: new Date(outlet.order_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            items: orderItems
          }
        )
      });
    }

    await connection.commit();
    return NextResponse.json({ success: true });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update order' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}
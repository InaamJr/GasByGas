import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  let connection;

  try {
    connection = await pool.getConnection();
    
    // Get pending orders from registered outlets
    const [orders] = await connection.execute(`
      SELECT 
        o.order_id as id,
        o.expected_delivery_date,
        o.status,
        o.order_date,
        out.outlet_name,
        out.district,
        om.manager_name,
        om.contact_no,
        out.outlet_registration_id,
        out.registration_status
      FROM outlet_order o
      JOIN outlet out ON o.outlet_id = out.outlet_id
      JOIN outlet_manager om ON out.outlet_id = om.outlet_id
      WHERE o.status = 'pending'
      AND out.registration_status = 'verified'
      ORDER BY o.order_date DESC
    `);

    // Get order details
    const [orderDetails] = await connection.execute(`
      SELECT 
        od.order_id,
        ct.name as cylinder_type,
        od.quantity
      FROM order_details od
      JOIN cylinder_types ct ON od.cylinder_type_id = ct.type_id
      WHERE od.order_id IN (?)
    `, [orders.map(order => order.id)]);

    // Group order details by order_id
    const detailsMap = orderDetails.reduce((acc, detail) => {
      if (!acc[detail.order_id]) {
        acc[detail.order_id] = [];
      }
      acc[detail.order_id].push({
        cylinder_type: detail.cylinder_type,
        quantity: detail.quantity
      });
      return acc;
    }, {});

    // Combine orders with their details
    const parsedOrders = orders.map(order => ({
      ...order,
      order_details: detailsMap[order.id] || []
    }));

    return NextResponse.json(parsedOrders);
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending orders' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

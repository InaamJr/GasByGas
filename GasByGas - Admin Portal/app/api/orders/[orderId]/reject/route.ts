import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendEmail, generateOrderStatusEmail } from '@/lib/email';

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const orderId = params.orderId;
  let connection;

  try {
    connection = await pool.getConnection();
    
    // Get order and customer details
    const [orderRows] = await connection.execute(
      `SELECT o.*, c.Name, c.Email, c.Address 
       FROM outlet_order o 
       JOIN consumer c ON o.ConsumerID = c.ConsumerID 
       WHERE o.order_id = ?`,
      [orderId]
    );
    const order = orderRows[0];

    if (!order) {
      throw new Error('Order not found');
    }

    // Update order status to rejected
    await connection.execute(
      'UPDATE outlet_order SET status = ? WHERE order_id = ?',
      ['cancelled', orderId]
    );

    // Send email notification
    await sendEmail({
      to: order.Email,
      subject: 'Order Cancelled',
      html: generateOrderStatusEmail(
        orderId,
        'cancelled',
        order.Name
      )
    });

    return NextResponse.json({ message: 'Order rejected successfully' });
  } catch (error) {
    console.error('Error rejecting order:', error);
    return NextResponse.json(
      { error: 'Failed to reject order' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

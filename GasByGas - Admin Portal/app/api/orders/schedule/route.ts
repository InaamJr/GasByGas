import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendEmail, generateOrderStatusEmail } from '@/lib/email';

export async function POST(request: Request) {
  let connection;

  try {
    const body = await request.json();
    const { orderId, adminId, deliveryDate } = body;

    if (!orderId || !adminId || !deliveryDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Start transaction
    await connection.beginTransaction();

    try {
      // Update order status
      await connection.execute(
        'UPDATE outlet_order SET status = ? WHERE order_id = ?',
        ['scheduled', orderId]
      );

      // Insert into scheduled_deliveries
      await connection.execute(
        `INSERT INTO scheduled_deliveries (
          order_id, 
          admin_id, 
          scheduled_date, 
          status,
          created_at
        ) VALUES (?, ?, ?, ?, NOW())`,
        [orderId, adminId, new Date(deliveryDate), 'pending']
      );

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

      // Format date for email
      const formattedDate = new Date(deliveryDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Send email notification
      await sendEmail({
        to: order.Email,
        subject: 'Order Scheduled for Delivery',
        html: generateOrderStatusEmail(
          orderId,
          'scheduled',
          order.Name,
          {
            deliveryDate: formattedDate,
            deliveryAddress: order.Address
          }
        )
      });

      // Commit transaction
      await connection.commit();

      return NextResponse.json({ message: 'Delivery scheduled successfully' });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error scheduling delivery:', error);
    return NextResponse.json(
      { error: 'Failed to schedule delivery' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
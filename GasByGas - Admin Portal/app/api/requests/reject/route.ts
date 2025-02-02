import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendEmail, generateRequestStatusEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, id } = body;
    const connection = await pool.getConnection();

    if (type === 'outlet') {
      const [managerRows] = await connection.execute(
        'SELECT * FROM outlet_manager WHERE Manager_ID = ?',
        [id]
      );
      const manager = managerRows[0];

      if (!manager) throw new Error('Manager not found');

      // Delete the outlet manager record
      await connection.execute(
        'DELETE FROM outlet_manager WHERE Manager_ID = ?',
        [id]
      );

      // Send rejection email to outlet manager
      await sendEmail({
        to: manager.Email,
        subject: 'Outlet Request Rejected',
        html: generateRequestStatusEmail('outlet', 'rejected', manager.Manager_Name)
      });
    } else if (type === 'business') {
      const [consumerRows] = await connection.execute(
        'SELECT * FROM consumer WHERE ConsumerID = ?',
        [id]
      );
      const consumer = consumerRows[0];

      if (!consumer) throw new Error('Consumer not found');

      // Update consumer type to rejected
      await connection.execute(
        'UPDATE consumer SET ConsumerType = "Business_Rejected" WHERE ConsumerID = ?',
        [id]
      );

      // Send rejection email to business consumer
      await sendEmail({
        to: consumer.Email,
        subject: 'Business Request Rejected',
        html: generateRequestStatusEmail('business', 'rejected', consumer.Name)
      });
    }

    connection.release();
    return NextResponse.json({ message: 'Request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting request:', error);
    return NextResponse.json(
      { error: 'Failed to reject request' },
      { status: 500 }
    );
  }
}

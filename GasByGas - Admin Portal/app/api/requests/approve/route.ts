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

      await connection.execute(
        'INSERT INTO outlet (Manager_ID, Outlet_Name, District) VALUES (?, ?, ?)',
        [id, manager.Outlet_Name, manager.Outlet_Address.split(',').pop().trim()]
      );

      // Send approval email to outlet manager
      await sendEmail({
        to: manager.Email,
        subject: 'Outlet Request Approved',
        html: generateRequestStatusEmail('outlet', 'approved', manager.Manager_Name)
      });
    } else if (type === 'business') {
      const [consumerRows] = await connection.execute(
        'SELECT * FROM consumer WHERE ConsumerID = ?',
        [id]
      );
      const consumer = consumerRows[0];

      if (!consumer) throw new Error('Consumer not found');

      await connection.execute(
        'UPDATE consumer SET ConsumerType = "Business_Verified" WHERE ConsumerID = ?',
        [id]
      );

      // Send approval email to business consumer
      await sendEmail({
        to: consumer.Email,
        subject: 'Business Request Approved',
        html: generateRequestStatusEmail('business', 'approved', consumer.Name)
      });
    }

    connection.release();
    return NextResponse.json({ message: 'Request approved successfully' });
  } catch (error) {
    console.error('Error approving request:', error);
    return NextResponse.json(
      { error: 'Failed to approve request' },
      { status: 500 }
    );
  }
}
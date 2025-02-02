import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { status, admin_id } = await request.json();
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      // Update verification status
      await connection.execute(
        `UPDATE business_consumer 
         SET verification_status = ?,
             verification_date = NOW(),
             verified_by = ?
         WHERE business_consumer_id = ?`,
        [status, admin_id, params.id]
      );

      // Update consumer status if rejected
      if (status === 'rejected') {
        await connection.execute(
          `UPDATE consumer 
           SET status = 'inactive'
           WHERE consumer_id = ?`,
          [params.id]
        );
      }

      // Create notification
      await connection.execute(
        `INSERT INTO notification (
          recipient_type,
          recipient_id,
          type,
          message,
          sent_via,
          sent_date,
          status
        ) VALUES (
          'consumer',
          ?,
          'request_status',
          ?,
          'both',
          NOW(),
          'pending'
        )`,
        [
          params.id,
          status === 'accepted' 
            ? 'Your business registration has been approved. You can now start using the system.'
            : 'Your business registration has been rejected. Please contact support for more information.'
        ]
      );

      await connection.commit();
      connection.release();

      return NextResponse.json({ 
        message: `Business consumer ${status === 'accepted' ? 'approved' : 'rejected'} successfully` 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error verifying business consumer:', error);
    return NextResponse.json(
      { error: 'Failed to verify business consumer' },
      { status: 500 }
    );
  }
}

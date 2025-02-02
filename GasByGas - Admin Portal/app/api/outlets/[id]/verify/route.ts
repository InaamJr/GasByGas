import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function POST(request: NextRequest, { params }: Props) {
  const managerId = params.id; // Store id in a variable to avoid async access issues
  
  try {
    const { status, admin_id } = await request.json();
    const connection = await pool.getConnection();

    await connection.beginTransaction();

    try {
      // Update verification status
      await connection.execute(
        `UPDATE outlet_manager 
         SET verification_status = ?,
             verification_date = NOW(),
             verified_by = ?
         WHERE manager_id = ?`,
        [status, admin_id, managerId]
      );

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
          'outlet_manager',
          ?,
          'request_status',
          ?,
          'both',
          NOW(),
          'pending'
        )`,
        [
          managerId,
          status === 'accepted' 
            ? 'Your outlet registration has been approved. You can now start using the system.'
            : 'Your outlet registration has been rejected. Please contact support for more information.'
        ]
      );

      await connection.commit();
      connection.release();

      return NextResponse.json({ 
        message: `Outlet ${status === 'accepted' ? 'approved' : 'rejected'} successfully` 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error verifying outlet:', error);
    return NextResponse.json(
      { error: 'Failed to verify outlet' },
      { status: 500 }
    );
  }
}

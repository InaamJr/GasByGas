import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const consumerId = parseInt(await Promise.resolve(params.id));
  
  if (!consumerId) {
    return NextResponse.json(
      { error: 'Invalid consumer ID' },
      { status: 400 }
    );
  }

  try {
    const { status, admin_id } = await request.json();

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be either accepted or rejected' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Start transaction
      await connection.beginTransaction();

      // 1. Get the business consumer details
      const [consumers] = await connection.execute(
        `SELECT 
          c.*, 
          bc.business_name,
          bc.business_reg_no,
          bc.verification_status
        FROM consumer c
        JOIN business_consumer bc ON c.consumer_id = bc.business_consumer_id
        WHERE c.consumer_id = ?`,
        [consumerId]
      );

      if (!consumers || (consumers as any[]).length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: 'Business consumer not found' },
          { status: 404 }
        );
      }

      const consumer = (consumers as any[])[0];

      // Check if already verified
      if (consumer.verification_status !== 'pending') {
        await connection.rollback();
        return NextResponse.json(
          { error: 'Consumer registration already verified' },
          { status: 400 }
        );
      }

      // 2. Update business consumer verification status
      await connection.execute(
        `UPDATE business_consumer 
         SET verification_status = ?,
             verification_date = NOW(),
             verified_by = ?
         WHERE business_consumer_id = ?`,
        [status, admin_id, consumerId]
      );

      // 3. Update consumer status based on verification result
      await connection.execute(
        `UPDATE consumer 
         SET status = ?
         WHERE consumer_id = ?`,
        [status === 'accepted' ? 'active' : 'inactive', consumerId]
      );

      // Commit the transaction
      await connection.commit();
      
      return NextResponse.json({
        message: `Business consumer registration ${status}`,
        consumer_id: consumerId
      });

    } catch (error) {
      // Rollback on error
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error verifying business consumer:', error);
    return NextResponse.json(
      { error: 'Failed to verify business consumer' },
      { status: 500 }
    );
  }
}

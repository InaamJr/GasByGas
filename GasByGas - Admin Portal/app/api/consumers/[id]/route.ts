import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!params?.id) {
    return NextResponse.json(
      { error: 'Missing consumer ID' },
      { status: 400 }
    );
  }

  const consumerId = parseInt(params.id);
  if (isNaN(consumerId)) {
    return NextResponse.json(
      { error: 'Invalid consumer ID format' },
      { status: 400 }
    );
  }

  let connection;
  try {
    connection = await pool.getConnection();
    
    // Start transaction
    await connection.beginTransaction();
    
    // First check if consumer exists and get their type
    const [consumers] = await connection.execute(
      'SELECT consumer_type FROM consumer WHERE consumer_id = ?',
      [consumerId]
    );
    
    if (!(consumers as any[]).length) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Consumer not found' },
        { status: 404 }
      );
    }

    // Update consumer status to deleted
    await connection.execute(
      'UPDATE consumer SET status = ? WHERE consumer_id = ?',
      ['inactive', consumerId]
    );

    // If it's a business consumer, update their verification status
    const consumer = (consumers as any[])[0];
    if (consumer.consumer_type === 'business') {
      await connection.execute(
        'UPDATE business_consumer SET verification_status = ? WHERE business_consumer_id = ?',
        ['rejected', consumerId]
      );
    }

    await connection.commit();
    
    return NextResponse.json({
      message: 'Consumer deleted successfully'
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error deleting consumer:', error);
    return NextResponse.json(
      { error: 'Failed to delete consumer', details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

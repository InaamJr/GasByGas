import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Executing consumers query...');
    
    const [rows] = await connection.execute(`
      SELECT 
        c.*,
        CASE 
          WHEN bc.business_consumer_id IS NOT NULL THEN bc.business_name
          ELSE c.name
        END as display_name,
        CASE 
          WHEN bc.business_consumer_id IS NOT NULL THEN 'business'
          ELSE 'general'
        END as consumer_type,
        bc.business_name,
        bc.business_reg_no,
        bc.verification_status,
        bc.verification_date,
        gc.username as general_username,
        CASE
          WHEN bc.business_consumer_id IS NOT NULL AND bc.verification_status = 'accepted' THEN 'active'
          WHEN bc.business_consumer_id IS NOT NULL AND bc.verification_status IN ('rejected', 'pending') THEN 'inactive'
          ELSE c.status
        END as status
      FROM consumer c
      LEFT JOIN business_consumer bc ON c.consumer_id = bc.business_consumer_id
      LEFT JOIN general_consumer gc ON c.consumer_id = gc.general_consumer_id
      WHERE c.status != 'deleted'
      ORDER BY c.consumer_id DESC
    `);
    console.log('Query executed successfully, number of rows:', rows.length);
    
    // Transform the data to ensure proper types
    const transformedRows = (rows as any[]).map(row => ({
      ...row,
      consumer_type: row.consumer_type || 'general',
      status: row.status || 'inactive',
      verification_status: row.verification_status || null,
      business_name: row.business_name || null,
      business_reg_no: row.business_reg_no || null
    }));
    
    const response = NextResponse.json(transformedRows);
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      sql: error.sql
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch consumers', details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
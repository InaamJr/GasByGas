import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const connection = await pool.getConnection();
    
    // Get pending outlet requests
    const [outletRows] = await connection.execute(`
      SELECT 
        om.Manager_ID,
        om.Outlet_Name,
        om.Manager_Name,
        om.Contact_No,
        om.Email,
        'Pending' as status,
        CASE 
          WHEN om.outlet_certificate IS NOT NULL THEN 1
          ELSE 0
        END as has_certificate
      FROM outlet_manager om
      LEFT JOIN outlet o ON om.Manager_ID = o.Manager_ID
      WHERE o.Outlet_ID IS NULL
    `);

    // Get pending business requests
    const [businessRows] = await connection.execute(`
      SELECT 
        c.consumer_id as ConsumerID,
        bc.business_name as Business_Name,
        c.name as Name,
        c.contact_no as ContactNo,
        c.email as Email,
        'Pending' as status,
        CASE 
          WHEN bc.certification_document IS NOT NULL THEN 1
          ELSE 0
        END as has_document
      FROM consumer c
      JOIN business_consumer bc ON c.consumer_id = bc.business_consumer_id
      WHERE c.consumer_type = 'business' 
      AND c.consumer_id NOT IN (
        SELECT consumer_id FROM gas_request
      )
    `);

    connection.release();

    // Transform the data to ensure it's serializable
    const outletRequests = (outletRows as any[]).map(row => ({
      ...row,
      type: 'outlet',
      has_certificate: Boolean(row.has_certificate)
    }));

    const businessRequests = (businessRows as any[]).map(row => ({
      ...row,
      type: 'business',
      has_document: Boolean(row.has_document)
    }));

    return NextResponse.json({
      outletRequests,
      businessRequests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching pending registrations from database...');
    const connection = await pool.getConnection();

    // Get pending outlet registrations
    const [outlets] = await connection.execute(`
      SELECT 
        om.manager_id,
        om.outlet_registration_id,
        om.outlet_name,
        om.outlet_address,
        CASE 
          WHEN om.outlet_certificate IS NOT NULL THEN 'Available'
          ELSE 'Not Available'
        END as document_status,
        om.manager_name,
        om.nic,
        om.email,
        om.contact_no,
        om.verification_status,
        om.verification_date,
        'outlet' as type
      FROM outlet_manager om
      WHERE om.verification_status = 'pending'
      ORDER BY om.manager_id DESC
    `);
    console.log('Pending outlets:', outlets);

    // Get pending business consumer registrations
    const [businesses] = await connection.execute(`
      SELECT 
        c.consumer_id,
        c.name as manager_name,
        c.nic,
        c.email,
        c.contact_no,
        c.joined_date,
        bc.business_name,
        bc.business_reg_no,
        CASE 
          WHEN bc.certification_document IS NOT NULL THEN 'Available'
          ELSE 'Not Available'
        END as document_status,
        bc.verification_status,
        bc.verification_date,
        'business' as type
      FROM business_consumer bc
      JOIN consumer c ON bc.business_consumer_id = c.consumer_id
      WHERE bc.verification_status = 'pending'
      ORDER BY c.consumer_id DESC
    `);
    console.log('Pending businesses:', businesses);

    connection.release();

    // Transform the data to ensure it's serializable
    const transformedOutlets = (outlets as any[]).map(outlet => ({
      ...outlet,
      has_document: outlet.document_status === 'Available'
    }));

    const transformedBusinesses = (businesses as any[]).map(business => ({
      ...business,
      has_document: business.document_status === 'Available'
    }));

    const response = {
      outlets: transformedOutlets,
      businesses: transformedBusinesses
    };
    console.log('API Response:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in pending-registrations API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending registrations' },
      { status: 500 }
    );
  }
}

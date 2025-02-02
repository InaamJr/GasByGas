import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const business_name = formData.get('business_name') as string;
    const business_reg_no = formData.get('business_reg_no') as string;
    const name = formData.get('name') as string;
    const nic = formData.get('nic') as string;
    const email = formData.get('email') as string;
    const contact_no = formData.get('contact_no') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const certification_document = formData.get('certification_document') as File;

    if (!certification_document) {
      return NextResponse.json(
        { error: 'Certification document is required' },
        { status: 400 }
      );
    }

    const certificationBuffer = Buffer.from(await certification_document.arrayBuffer());

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // First create consumer record
      const [consumerResult] = await connection.execute(
        `INSERT INTO consumer (
          name, 
          nic, 
          email, 
          contact_no, 
          consumer_type,
          joined_date,
          status
        ) VALUES (?, ?, ?, ?, 'business', NOW(), 'inactive')`,
        [name, nic, email, contact_no]
      );

      const consumerId = (consumerResult as any).insertId;

      // Then create business consumer record
      await connection.execute(
        `INSERT INTO business_consumer (
          business_consumer_id,
          business_name,
          business_reg_no,
          certification_document,
          username,
          password,
          verification_status
        ) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [consumerId, business_name, business_reg_no, certificationBuffer, username, password]
      );

      await connection.commit();

      return NextResponse.json({
        message: 'Business registration successful',
        consumerId
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register business' },
      { status: 500 }
    );
  }
}

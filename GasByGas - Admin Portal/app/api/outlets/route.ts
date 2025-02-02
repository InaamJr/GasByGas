import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      SELECT 
        o.outlet_id,
        o.outlet_name,
        o.district,
        o.status,
        om.manager_id,
        om.outlet_registration_id,
        om.manager_name,
        om.nic,
        om.email,
        om.contact_no,
        om.verification_status,
        om.verification_date
      FROM outlet o
      JOIN outlet_manager om ON o.manager_id = om.manager_id
      ORDER BY o.outlet_id DESC
    `);
    connection.release();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching outlets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outlets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const outlet_name = formData.get('outlet_name') as string;
    const district = formData.get('district') as string;
    const manager_name = formData.get('manager_name') as string;
    const nic = formData.get('nic') as string;
    const email = formData.get('email') as string;
    const contact_no = formData.get('contact_no') as string;
    const password = formData.get('password') as string;
    const certificate = formData.get('certificate') as File;
    const outlet_address = formData.get('outlet_address') as string;

    if (!outlet_address) {
      return NextResponse.json(
        { error: 'Outlet address is required' },
        { status: 400 }
      );
    }

    // Generate registration ID
    const outlet_registration_id = `OUT${Date.now()}`;

    // Get certificate data as buffer
    const certificateBuffer = Buffer.from(await certificate.arrayBuffer());

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create outlet manager
      const [managerResult] = await connection.execute(
        `INSERT INTO outlet_manager (
          outlet_registration_id,
          outlet_name,
          outlet_address,
          outlet_certificate,
          manager_name,
          nic,
          email,
          contact_no,
          password,
          verification_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          outlet_registration_id,
          outlet_name,
          outlet_address,
          certificateBuffer,
          manager_name,
          nic,
          email,
          contact_no,
          password
        ]
      );

      const managerId = (managerResult as any).insertId;

      // Create outlet
      await connection.execute(
        `INSERT INTO outlet (
          outlet_name,
          district,
          manager_id,
          status
        ) VALUES (?, ?, ?, 'active')`,
        [outlet_name, district, managerId]
      );

      await connection.commit();

      return NextResponse.json({
        message: 'Outlet registered successfully',
        outlet_registration_id
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error registering outlet:', error);
    return NextResponse.json(
      { error: 'Failed to register outlet' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const outlet_id = formData.get('outlet_id');
    const outlet_name = formData.get('outlet_name');
    const district = formData.get('district');
    const manager_name = formData.get('manager_name');
    const nic = formData.get('nic');
    const email = formData.get('email');
    const contact_no = formData.get('contact_no');
    const outlet_address = formData.get('outlet_address');

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update outlet manager
      await connection.execute(
        `UPDATE outlet_manager 
        SET 
          outlet_name = ?,
          outlet_address = ?,
          manager_name = ?,
          nic = ?,
          email = ?,
          contact_no = ?
        WHERE manager_id = (
          SELECT manager_id 
          FROM outlet 
          WHERE outlet_id = ?
        )`,
        [
          outlet_name,
          outlet_address,
          manager_name,
          nic,
          email,
          contact_no,
          outlet_id
        ]
      );

      // Update outlet
      await connection.execute(
        `UPDATE outlet 
        SET 
          outlet_name = ?,
          district = ?
        WHERE outlet_id = ?`,
        [outlet_name, district, outlet_id]
      );

      await connection.commit();

      return NextResponse.json({
        message: 'Outlet updated successfully'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating outlet:', error);
    return NextResponse.json(
      { error: 'Failed to update outlet' },
      { status: 500 }
    );
  }
}
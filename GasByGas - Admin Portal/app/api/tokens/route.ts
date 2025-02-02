import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      SELECT 
        t.token_id,
        t.token_no,
        t.generated_date,
        t.expiry_date,
        t.status as token_status,
        gr.request_id,
        gr.request_date,
        gr.expected_pickup_date,
        gr.status as request_status,
        c.consumer_id,
        c.name as consumer_name,
        c.contact_no,
        c.consumer_type,
        o.outlet_name,
        o.district,
        bc.business_name,
        grd.cylinder_type_id,
        ct.name as cylinder_type,
        ct.weight_kg,
        grd.quantity
      FROM token t
      JOIN gas_request gr ON t.request_id = gr.request_id
      JOIN consumer c ON gr.consumer_id = c.consumer_id
      JOIN outlet o ON gr.outlet_id = o.outlet_id
      LEFT JOIN business_consumer bc ON c.consumer_id = bc.business_consumer_id
      JOIN gas_request_details grd ON gr.request_id = grd.request_id
      JOIN cylinder_types ct ON grd.cylinder_type_id = ct.type_id
      ORDER BY t.token_id DESC
    `);

    // Group cylinder details by token
    const tokens = (rows as any[]).reduce((acc, row) => {
      const tokenId = row.token_id;
      if (!acc[tokenId]) {
        acc[tokenId] = {
          id: row.token_id,
          token_no: row.token_no,
          generated_date: row.generated_date,
          expiry_date: row.expiry_date,
          status: row.token_status,
          request: {
            id: row.request_id,
            date: row.request_date,
            expected_pickup_date: row.expected_pickup_date,
            status: row.request_status
          },
          consumer: {
            id: row.consumer_id,
            name: row.business_name || row.consumer_name,
            contact_no: row.contact_no,
            type: row.consumer_type
          },
          outlet: {
            name: row.outlet_name,
            district: row.district
          },
          cylinders: []
        };
      }
      
      acc[tokenId].cylinders.push({
        type: row.cylinder_type,
        weight_kg: row.weight_kg,
        quantity: row.quantity
      });
      
      return acc;
    }, {});

    return NextResponse.json(Object.values(tokens));
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function PUT(request: Request) {
  let connection;
  try {
    const body = await request.json();
    const { token_id, status } = body;

    if (!token_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Update token status
    await connection.execute(
      'UPDATE token SET status = ? WHERE token_id = ?',
      [status, token_id]
    );

    // If token is used, update the request status as well
    if (status === 'used') {
      await connection.execute(`
        UPDATE gas_request gr
        JOIN token t ON gr.request_id = t.request_id
        SET gr.status = 'completed'
        WHERE t.token_id = ?
      `, [token_id]);
    }

    return NextResponse.json({ 
      message: `Token ${status === 'used' ? 'marked as used' : 'status updated'}`
    });
  } catch (error) {
    console.error('Error updating token status:', error);
    return NextResponse.json(
      { error: 'Failed to update token status' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
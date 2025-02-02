import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }> | { id: string }
};

export async function GET(
  _request: NextRequest,
  { params }: Props
) {
  let connection;
  try {
    // Ensure params is handled as a Promise
    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    if (!id || typeof id !== 'string') {
      return new NextResponse(
        JSON.stringify({ error: 'Missing or invalid consumer ID' }),
        { status: 400 }
      );
    }

    const consumerId = parseInt(id);
    if (isNaN(consumerId)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid consumer ID format' }),
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    
    // Get gas requests with outlet information
    const [requests] = await connection.execute(`
      SELECT 
        gr.request_id,
        gr.outlet_id,
        o.outlet_name,
        gr.request_date,
        gr.expected_pickup_date,
        gr.status,
        gr.reallocation_status,
        t.token_no,
        t.status as token_status,
        t.expiry_date as token_expiry
      FROM gas_request gr
      JOIN outlet o ON gr.outlet_id = o.outlet_id
      LEFT JOIN token t ON gr.request_id = t.request_id
      WHERE gr.consumer_id = ?
      ORDER BY gr.request_date DESC
    `, [consumerId]);

    // Get request details with cylinder information
    const [requestDetails] = await connection.execute(`
      SELECT 
        grd.request_id,
        ct.name as cylinder_type,
        ct.weight_kg,
        grd.quantity
      FROM gas_request_details grd
      JOIN cylinder_types ct ON grd.cylinder_type_id = ct.type_id
      WHERE grd.request_id IN (
        SELECT request_id FROM gas_request WHERE consumer_id = ?
      )
    `, [consumerId]);

    // Combine requests with their details
    const requestsWithDetails = (requests as any[]).map(request => {
      const details = (requestDetails as any[])
        .filter(detail => detail.request_id === request.request_id)
        .map(detail => ({
          cylinder_type: detail.cylinder_type,
          weight_kg: detail.weight_kg,
          quantity: detail.quantity
        }));

      return {
        ...request,
        request_date: request.request_date ? new Date(request.request_date).toISOString() : null,
        expected_pickup_date: request.expected_pickup_date ? new Date(request.expected_pickup_date).toISOString() : null,
        token_expiry: request.token_expiry ? new Date(request.token_expiry).toISOString() : null,
        details
      };
    });

    return new NextResponse(JSON.stringify(requestsWithDetails), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error fetching gas requests:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch gas requests', details: error.message }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

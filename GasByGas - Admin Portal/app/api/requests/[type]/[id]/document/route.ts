import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  const { type, id } = params;

  try {
    const connection = await pool.getConnection();

    let document;
    if (type === 'outlet') {
      const [rows] = await connection.execute(
        'SELECT outlet_certificate FROM outlet_manager WHERE manager_id = ?',
        [id]
      );
      document = rows[0]?.outlet_certificate;
    } else {
      const [rows] = await connection.execute(
        'SELECT certification_document FROM business_consumer WHERE consumer_id = ?',
        [id]
      );
      document = rows[0]?.certification_document;
    }

    connection.release();

    if (!document) {
      return new NextResponse('Document not found', { status: 404 });
    }

    // Convert Buffer to Blob
    const blob = new Blob([document], { type: 'application/pdf' });
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="document.pdf"'
      }
    });

  } catch (error) {
    console.error('Error fetching document:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

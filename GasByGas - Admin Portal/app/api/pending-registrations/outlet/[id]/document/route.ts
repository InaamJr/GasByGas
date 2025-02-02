import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Properly await and validate the ID parameter
    const params = await Promise.resolve(context.params);
    if (!params?.id) {
      return new NextResponse('Missing ID parameter', { status: 400 });
    }

    const managerId = parseInt(params.id);
    if (isNaN(managerId)) {
      return new NextResponse('Invalid ID format', { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Get the outlet certificate
      const [rows] = await connection.execute(
        'SELECT outlet_certificate FROM outlet_manager WHERE manager_id = ?',
        [managerId]
      );

      const document = (rows as any[])[0]?.outlet_certificate;

      if (!document) {
        return new NextResponse('Document not found', { status: 404 });
      }

      // Return the document as a PDF
      return new NextResponse(Buffer.from(document), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="outlet-certificate.pdf"'
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching outlet document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

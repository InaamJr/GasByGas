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

    const consumerId = parseInt(params.id);
    if (isNaN(consumerId)) {
      return new NextResponse('Invalid ID format', { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Get the business certification document
      const [rows] = await connection.execute(
        'SELECT certification_document FROM business_consumer WHERE business_consumer_id = ?',
        [consumerId]
      );

      const document = (rows as any[])[0]?.certification_document;

      if (!document) {
        return new NextResponse('Document not found', { status: 404 });
      }

      // Return the document as a PDF
      return new NextResponse(Buffer.from(document), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="business-certificate.pdf"'
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching business document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

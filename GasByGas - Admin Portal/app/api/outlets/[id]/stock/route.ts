import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Get the ID from the URL using the new URL API
  const url = new URL(req.url);
  const id = url.pathname.split('/')[3]; // This will get the id from /api/outlets/[id]/stock

  if (!id) {
    return NextResponse.json(
      { error: 'Outlet ID is required' },
      { status: 400 }
    );
  }

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      SELECT 
        ct.type_id,
        ct.name,
        ct.weight_kg,
        os.quantity,
        os.last_updated
      FROM outlet_stock os
      JOIN cylinder_types ct ON os.cylinder_type_id = ct.type_id
      WHERE os.outlet_id = ?
      ORDER BY ct.name
    `, [id]);
    
    connection.release();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching outlet stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outlet stock' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Get the ID from the URL
  const url = new URL(req.url);
  const id = url.pathname.split('/')[3];

  if (!id) {
    return NextResponse.json(
      { error: 'Outlet ID is required' },
      { status: 400 }
    );
  }

  try {
    const { cylinder_type_id, quantity, transaction_type, reference_request_id, reference_order_id } = await req.json();
    const connection = await pool.getConnection();

    await connection.beginTransaction();
    try {
      // Record the transaction
      await connection.execute(
        `INSERT INTO stock_transaction (
          outlet_id,
          cylinder_type_id,
          transaction_type,
          quantity,
          transaction_date,
          reference_request_id,
          reference_order_id
        ) VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
        [id, cylinder_type_id, transaction_type, quantity, reference_request_id || null, reference_order_id || null]
      );

      // Update or insert stock record
      const [existingStock] = await connection.execute(
        'SELECT * FROM outlet_stock WHERE outlet_id = ? AND cylinder_type_id = ?',
        [id, cylinder_type_id]
      );

      if ((existingStock as any[]).length > 0) {
        const currentQuantity = (existingStock as any[])[0].quantity;
        const newQuantity = transaction_type === 'in' 
          ? currentQuantity + quantity 
          : currentQuantity - quantity;

        await connection.execute(
          `UPDATE outlet_stock 
           SET quantity = ?, last_updated = NOW()
           WHERE outlet_id = ? AND cylinder_type_id = ?`,
          [newQuantity, id, cylinder_type_id]
        );
      } else {
        await connection.execute(
          `INSERT INTO outlet_stock (
            outlet_id,
            cylinder_type_id,
            quantity,
            last_updated
          ) VALUES (?, ?, ?, NOW())`,
          [id, cylinder_type_id, quantity]
        );
      }

      // Check if stock is low after update
      const [stockInfo] = await connection.execute(
        `SELECT os.quantity, ct.name
         FROM outlet_stock os
         JOIN cylinder_types ct ON os.cylinder_type_id = ct.type_id
         WHERE os.outlet_id = ? AND os.cylinder_type_id = ?`,
        [id, cylinder_type_id]
      );

      if ((stockInfo as any[])[0].quantity < 10) {
        // Create low stock notification
        await connection.execute(
          `INSERT INTO notification (
            recipient_type,
            recipient_id,
            type,
            message,
            sent_via,
            sent_date,
            status
          ) VALUES (
            'outlet_manager',
            ?,
            'stock_alert',
            ?,
            'both',
            NOW(),
            'pending'
          )`,
          [
            id,
            `Low stock alert: Only ${(stockInfo as any[])[0].quantity} ${(stockInfo as any[])[0].name} cylinders remaining`
          ]
        );
      }

      await connection.commit();
      connection.release();

      return NextResponse.json({
        message: 'Stock updated successfully',
        newQuantity: (stockInfo as any[])[0].quantity
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}

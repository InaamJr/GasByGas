import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function GET(req) {
  try {
    const outletId = req.headers.get("outlet-id");
    if (!outletId) {
      return NextResponse.json({ error: "Missing outlet ID" }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query(
      `
      SELECT 
          o.order_id, 
          o.order_date, 
          o.expected_delivery_date, 
          od.status, 
          ct.name AS cylinder_name, 
          od.quantity, 
          CASE
            WHEN od.status IN ('scheduled') THEN DATE(ds.delivery_date)
            ELSE NULL
          END AS scheduled_delivery_date
      FROM outlet_order o
      JOIN order_details od ON o.order_id = od.order_id
      JOIN cylinder_types ct ON od.cylinder_type_id = ct.type_id
      LEFT JOIN delivery_schedule ds ON o.order_id = ds.order_id
      WHERE o.outlet_id = ? AND od.status NOT IN ('completed')
      ORDER BY o.order_date DESC;
      `,
      [outletId]
    );

    await connection.end();
    return NextResponse.json({ orders: rows });
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

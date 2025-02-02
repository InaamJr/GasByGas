// app/api/manager/fetch-current-stock/route.js
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function GET(req) {
  const outletId = req.headers.get("outlet-id");

  if (!outletId) {
    return NextResponse.json({ error: "Missing outlet ID" }, { status: 400 });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query(
      `SELECT 
         os.cylinder_type_id, 
         ct.name AS cylinder_name, 
         os.quantity 
       FROM outlet_stock os
       JOIN cylinder_types ct ON os.cylinder_type_id = ct.type_id
       WHERE os.outlet_id = ?`,
      [outletId]
    );

    await connection.end();

    return NextResponse.json({ stock: rows });
  } catch (error) {
    console.error("Error fetching current stock levels:", error);
    return NextResponse.json({ error: "Failed to fetch current stock levels" }, { status: 500 });
  }
}

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
    const { searchParams } = new URL(req.url);
    const outlet_id = searchParams.get("outlet_id");

    if (!outlet_id) {
      return NextResponse.json({ error: "Outlet ID is required" }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query(
      `SELECT gr.request_id, c.name, c.email, c.nic, c.contact_no, 
              gr.request_date, gr.expected_pickup_date, gr.status,
              GROUP_CONCAT(CONCAT(ct.name, ' - ', grd.quantity) SEPARATOR ', ') AS cylinder_details
      FROM gas_request gr
      INNER JOIN consumer c ON gr.consumer_id = c.consumer_id
      LEFT JOIN gas_request_details grd ON gr.request_id = grd.request_id
      LEFT JOIN cylinder_types ct ON grd.cylinder_type_id = ct.type_id
      WHERE gr.outlet_id = ? AND c.consumer_type = 'general'
      GROUP BY gr.request_id
      ORDER BY gr.request_date DESC`,
      [outlet_id]
    );
    console.log("Query Results:", rows); // Add this to log the query results
    await connection.end();

    return NextResponse.json({ requests: rows });
  } catch (error) {
    console.error("Error fetching general consumer requests:", error);
    return NextResponse.json({ error: "Failed to fetch general consumer requests" }, { status: 500 });
  }
}

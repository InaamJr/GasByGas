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
      `SELECT gr.request_id, bc.business_name AS name, bc.business_reg_no, 
              c.email, c.contact_no, gr.request_date, gr.expected_pickup_date, gr.status,
              GROUP_CONCAT(CONCAT(ct.name, ' - ', grd.quantity) SEPARATOR ', ') AS cylinder_details
      FROM gas_request gr
      INNER JOIN business_consumer bc ON gr.consumer_id = bc.business_consumer_id
      INNER JOIN consumer c ON bc.business_consumer_id = c.consumer_id
      LEFT JOIN gas_request_details grd ON gr.request_id = grd.request_id
      LEFT JOIN cylinder_types ct ON grd.cylinder_type_id = ct.type_id
      WHERE gr.outlet_id = ?
      GROUP BY gr.request_id
      ORDER BY gr.request_date DESC`,
      [outlet_id]
    );
    console.log("Query Results:", rows);
    await connection.end();

    return NextResponse.json({ requests: rows });
  } catch (error) {
    console.error("Error fetching business consumer requests:", error);
    return NextResponse.json({ error: "Failed to fetch business consumer requests" }, { status: 500 });
  }
}

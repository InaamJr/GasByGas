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
    const requestId = searchParams.get("request_id");

    if (!requestId) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Fetch request and consumer details
    const [rows] = await connection.query(
      `SELECT 
         c.name AS consumer_name, 
         c.contact_no AS contact,
         c.nic AS nic,
         c.email AS email, 
         gr.expected_pickup_date,
         GROUP_CONCAT(CONCAT(ct.name, ' - ', grd.quantity) SEPARATOR ', ') AS cylinder_details,
         SUM(ct.price * grd.quantity) AS total_payment
       FROM gas_request gr
       INNER JOIN consumer c ON gr.consumer_id = c.consumer_id
       INNER JOIN gas_request_details grd ON gr.request_id = grd.request_id
       INNER JOIN cylinder_types ct ON grd.cylinder_type_id = ct.type_id
       WHERE gr.request_id = ?
       GROUP BY gr.request_id`,
      [requestId]
    );

    await connection.end();

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Gas request details not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching gas request details:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

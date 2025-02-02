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
    const outletId = searchParams.get("outlet_id");

    if (!outletId) {
      return NextResponse.json({ error: "Outlet ID is required" }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Fetch pending requests with gas details (type and quantity)
    const [pendingRequests] = await connection.query(
      `
      SELECT 
        gr.request_id, 
        gr.consumer_id,
        c.name AS consumer_name,
        c.contact_no AS contact,
        c.email AS email,
        gr.expected_pickup_date,
        GROUP_CONCAT(CONCAT(ct.name, ' - ', grd.quantity) SEPARATOR ', ') AS cylinder_details
      FROM gas_request gr
      INNER JOIN consumer c ON gr.consumer_id = c.consumer_id
      INNER JOIN gas_request_details grd ON gr.request_id = grd.request_id
      INNER JOIN cylinder_types ct ON grd.cylinder_type_id = ct.type_id
      WHERE gr.outlet_id = ? AND gr.status = 'pending'
      GROUP BY gr.request_id
      `,
      [outletId]
    );

    await connection.end();

    // Check if no pending requests are found
    if (pendingRequests.length === 0) {
      return NextResponse.json({ requests: [] }); // Empty array to avoid frontend errors
    }

    return NextResponse.json({ requests: pendingRequests }); // Wrap array in 'requests' key
  } catch (error) {
    console.error("Error fetching pending requests:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

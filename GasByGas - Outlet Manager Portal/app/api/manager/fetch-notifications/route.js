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
    const managerId = req.headers.get("manager-id");

    if (!managerId) {
      return NextResponse.json({ error: "Missing manager ID" }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Step 1: Fetch `outlet_id` using `manager_id`
    const [outletRows] = await connection.query(
      `SELECT outlet_id FROM outlet WHERE manager_id = ? AND status = 'active'`,
      [managerId]
    );

    if (outletRows.length === 0) {
      return NextResponse.json(
        { error: "No active outlet found for this manager" },
        { status: 404 }
      );
    }

    const outletId = outletRows[0].outlet_id;

    // Step 2: Fetch notifications for the `outlet_id`
    const [notifications] = await connection.query(
      `SELECT notification_id, message, created_at, is_read 
       FROM notifications 
       WHERE outlet_id = ? AND is_read = FALSE 
       ORDER BY created_at DESC`,
      [outletId]
    );

    await connection.end();

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { generateNotificationsForOutlet } from "../../../utils/generateNotifications";
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

    // Step 1: Fetch the outlet ID associated with the manager
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

    // Step 2: Generate notifications for the specific outlet
    await generateNotificationsForOutlet(outletId);

    await connection.end();

    return NextResponse.json({ message: "Notifications generated successfully" });
  } catch (error) {
    console.error("Error generating notifications:", error.message);
    return NextResponse.json({ error: "Failed to generate notifications" }, { status: 500 });
  }
}

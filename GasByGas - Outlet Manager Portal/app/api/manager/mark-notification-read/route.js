import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function POST(req) {
  try {
    const { notificationId } = await req.json();

    if (!notificationId) {
      return NextResponse.json({ error: "Missing notification ID" }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);
    await connection.query(
      `UPDATE notifications SET is_read = TRUE WHERE notification_id = ?`,
      [notificationId]
    );
    await connection.end();

    return NextResponse.json({ message: "Notification marked as read." });
  } catch (error) {
    console.error("Error marking notification as read:", error.message);
    return NextResponse.json({ error: "Failed to mark notification as read." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const SECRET_KEY = process.env.JWT_SECRET || "Ifi@2004_08_27";

export async function POST(req) {
  const { outlet_address, manager_name, nic, email, contact_no } = await req.json();
  const cookieHeader = req.headers.get("cookie");

  if (!cookieHeader) {
    return NextResponse.json({ error: "Unauthorized. No token found." }, { status: 401 });
  }

  const authToken = cookieHeader
    .split(";")
    .find((cookie) => cookie.trim().startsWith("authToken="))
    ?.split("=")[1];

  if (!authToken) {
    return NextResponse.json({ error: "Unauthorized. Token missing." }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(authToken, SECRET_KEY);

    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      "UPDATE outlet_manager SET outlet_address = ?, manager_name = ?, nic = ?, email = ?, contact_no = ? WHERE manager_id = ?",
      [outlet_address, manager_name, nic, email, contact_no, decoded.id]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Failed to update manager details." }, { status: 500 });
    }

    return NextResponse.json({ message: "Manager details updated successfully." });
  } catch (error) {
    console.error("Error updating manager details:", error.message);
    return NextResponse.json({ error: "Failed to update manager details." }, { status: 500 });
  }
}

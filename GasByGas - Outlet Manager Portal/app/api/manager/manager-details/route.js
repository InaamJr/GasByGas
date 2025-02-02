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

export async function GET(req) {
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

    const [rows] = await connection.execute(
      `SELECT 
        om.manager_id, 
        om.outlet_registration_id, 
        om.outlet_name, 
        om.outlet_address, 
        om.manager_name, 
        om.nic, 
        om.email, 
        om.contact_no,  
        o.outlet_id
      FROM outlet_manager om
      LEFT JOIN outlet o ON o.manager_id = om.manager_id
      WHERE om.manager_id = ?`,
      [decoded.id]
    );

    await connection.end();

    if (rows.length === 0) {
      return NextResponse.json({ error: "Manager not found." }, { status: 404 });
    }

    return NextResponse.json({ manager: rows[0] });
  } catch (error) {
    console.error("Error fetching manager details:", error.message);
    return NextResponse.json({ error: "Failed to fetch manager details." }, { status: 500 });
  }
}

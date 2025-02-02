import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query("SELECT * FROM cylinder_types");
    await connection.end();

    return NextResponse.json({ cylinders: rows });
  } catch (error) {
    console.error("Error fetching cylinders:", error);
    return NextResponse.json({ error: "Failed to fetch cylinders" }, { status: 500 });
  }
}

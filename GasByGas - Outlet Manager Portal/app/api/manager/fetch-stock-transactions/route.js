import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export async function GET(req) {
  const outletId = req.headers.get("outlet-id");
  const transactionType = req.headers.get("transaction-type"); // 'in' or 'out'

  if (!outletId || !transactionType) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query(
      `SELECT 
         st.cylinder_type_id, 
         ct.name AS cylinder_name, 
         st.quantity, 
         DATE_FORMAT(st.transaction_date, '%Y-%m-%d') AS transaction_date
       FROM stock_transaction st
       JOIN cylinder_types ct ON st.cylinder_type_id = ct.type_id
       WHERE st.outlet_id = ? AND st.transaction_type = ?
       ORDER BY st.transaction_date DESC`,
      [outletId, transactionType]
    );

    await connection.end();

    return NextResponse.json({ transactions: rows });
  } catch (error) {
    console.error("Error fetching stock transactions:", error);
    return NextResponse.json({ error: "Failed to fetch stock transactions" }, { status: 500 });
  }
}

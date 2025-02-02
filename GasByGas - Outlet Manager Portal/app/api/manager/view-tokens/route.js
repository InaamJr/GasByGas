import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function GET(req) {
  let connection;
  try {
    const { searchParams } = new URL(req.url);
    const outletId = searchParams.get("outlet_id");

    if (!outletId) {
      return NextResponse.json({ error: "Outlet ID is required" }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);

    // Fetch tokens and simultaneously update expired tokens
    const [tokens] = await connection.query(
      `
      SELECT 
        t.token_id,
        t.token_no,
        t.request_id,
        t.generated_by,
        t.generated_date,
        t.expiry_date,
        t.status,
        c.name AS consumer_name,
        c.email AS consumer_email
      FROM token t
      LEFT JOIN gas_request gr ON t.request_id = gr.request_id
      LEFT JOIN consumer c ON gr.consumer_id = c.consumer_id
      WHERE gr.outlet_id = ?
      `,
      [outletId]
    );

    const expiredTokens = tokens.filter(
      (token) => token.status === "valid" && new Date(token.expiry_date) < new Date()
    );

    if (expiredTokens.length > 0) {
      const expiredTokenIds = expiredTokens.map((token) => token.token_id);

      // Update token statuses to 'expired'
      await connection.query(
        `UPDATE token SET status = 'expired' WHERE token_id IN (?)`,
        [expiredTokenIds]
      );

      // Notify consumers of expired tokens
      for (const token of expiredTokens) {
        await transporter.sendMail({
          from: process.env.SMTP_USER,
          to: token.consumer_email,
          subject: "Token Expired",
          text: `Dear ${token.consumer_name},\n\nYour token (Token No: ${token.token_no}) has expired. Please contact us for further assistance.\n\nBest regards,\nGas By Gas Team`,
        });
      }
    }

    await connection.end();

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error("Error fetching tokens:", error.message);
    if (connection) await connection.end();
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

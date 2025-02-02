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

export async function POST(req) {
  let connection;
  try {
    const { token_id, otp } = await req.json();
    if (!token_id || !otp) {
      return NextResponse.json({ error: "Token ID and OTP are required" }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);
    await connection.execute(`SET time_zone = '+00:00';`);

    // Verify the OTP
    const [rows] = await connection.execute(
      `SELECT otp, expires_at FROM \`otp_verifications\` WHERE token_id = ? AND otp = ?`,
      [token_id, otp]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid OTP or Token ID" }, { status: 400 });
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    const otpExpiryDate = new Date(rows[0].expires_at).toISOString().slice(0, 19).replace("T", " ");

    if (new Date(currentDate).getTime() > new Date(otpExpiryDate).getTime()) {
      return NextResponse.json({ error: "Expired OTP" }, { status: 400 });
    }

    await connection.beginTransaction();

    // Fetch token details
    const [tokenDetails] = await connection.execute(
      `SELECT t.token_id, t.request_id, t.token_no, gr.outlet_id, grd.cylinder_type_id, grd.quantity, c.name, c.email
       FROM token t
       JOIN gas_request gr ON t.request_id = gr.request_id
       JOIN gas_request_details grd ON gr.request_id = grd.request_id
       JOIN consumer c ON gr.consumer_id = c.consumer_id
       WHERE t.token_id = ?`,
      [token_id]
    );

    if (tokenDetails.length === 0) {
      throw new Error("Token details not found.");
    }

    const { request_id, outlet_id, cylinder_type_id, quantity, name, email, token_no } =
      tokenDetails[0];

    // Mark the token as "used"
    await connection.execute(`UPDATE \`token\` SET status = 'used' WHERE token_id = ?`, [token_id]);

    // Update outlet stock and add a stock transaction
    await connection.execute(
      `INSERT INTO stock_transaction (outlet_id, cylinder_type_id, transaction_type, quantity, transaction_date, reference_request_id)
       VALUES (?, ?, 'out', ?, NOW(), ?)`,
      [outlet_id, cylinder_type_id, quantity, request_id]
    );

    await connection.execute(
      `UPDATE outlet_stock
       SET quantity = quantity - ?
       WHERE outlet_id = ? AND cylinder_type_id = ?`,
      [quantity, outlet_id, cylinder_type_id]
    );

    // Send notification email to the consumer
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Token Successfully Used",
      text: `Dear ${name},\n\nYour token (Token No: ${token_no}) has been successfully used. Thank you for your purchase.\n\nBest regards,\nGas By Gas Team`,
    });

    await connection.commit();

    return NextResponse.json({
      message: "Token marked as used successfully, stock updated, and consumer notified.",
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error in verify-otp API:", error.message);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

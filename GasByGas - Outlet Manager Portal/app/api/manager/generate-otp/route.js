import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dateStrings: ["DATETIME", "DATE"],
};

export async function POST(req) {
  let connection;
  try {
    const { token_id } = await req.json();

    if (!token_id) {
      return NextResponse.json(
        { error: "Token ID is required" },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    await connection.execute(`SET time_zone = '+00:00';`);

    const [tokenDetails] = await connection.execute(
      `SELECT t.request_id, t.reallocated_to, 
              (SELECT c.email FROM consumer c 
               JOIN gas_request gr ON gr.consumer_id = c.consumer_id 
               WHERE gr.request_id = IF(t.reallocated_to IS NOT NULL, t.reallocated_to, t.request_id)
              ) AS email
       FROM token t
       WHERE t.token_id = ?`,
      [token_id]
    );

    if (tokenDetails.length === 0) {
      return NextResponse.json({ error: "Invalid Token ID" }, { status: 400 });
    }

    const { email } = tokenDetails[0];

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 5 * 60000).toISOString().slice(0, 19).replace("T", " ");
    const currentTime = new Date().toISOString().slice(0, 19).replace("T", " ");

    await connection.execute(`DELETE FROM otp_verifications WHERE token_id = ?`, [token_id]);
    await connection.execute(
      `INSERT INTO otp_verifications (token_id, otp, expires_at, created_at) 
       VALUES (?, ?, ?, ?)`,
      [token_id, otp, expiryTime, currentTime]
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your OTP for Gas Token Verification",
      text: `Your OTP for token verification is ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in generate-otp API:", error.message);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

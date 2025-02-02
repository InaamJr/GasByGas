import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// SMTP Configuration
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
    const body = await req.json();
    const { requestId, status } = body;

    if (!requestId || !status) {
      return NextResponse.json(
        { error: "Request ID and status are required" },
        { status: 400 }
      );
    }

    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status provided" },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Fetch request details and consumer email
    const [requestRows] = await connection.query(
      `SELECT gr.request_id, c.email, c.name, gr.status, gr.expected_pickup_date
       FROM gas_request gr
       JOIN consumer c ON gr.consumer_id = c.consumer_id
       WHERE gr.request_id = ?`,
      [requestId]
    );

    if (requestRows.length === 0) {
      return NextResponse.json(
        { error: "Invalid Request ID" },
        { status: 404 }
      );
    }

    const consumer = requestRows[0];

    // Update request status
    const [result] = await connection.query(
      `UPDATE gas_request SET status = ? WHERE request_id = ?`,
      [status, requestId]
    );

    if (result.affectedRows > 0) {
      // Send email notification to the consumer
      const emailSubject =
        status === "accepted"
          ? "Gas Request Accepted"
          : "Gas Request Rejected";

      const emailBody =
        status === "accepted"
          ? `Dear ${consumer.name},\n\nYour gas request (ID: ${requestId}) has been accepted. Please ensure you pick up your cylinders by the expected pickup date.\n\nThank you!`
          : `Dear ${consumer.name},\n\nWe regret to inform you that your gas request (ID: ${requestId}) has been rejected. For further assistance, please contact us.\n\nThank you!`;

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: consumer.email,
        subject: emailSubject,
        text: emailBody,
      });

      await connection.end();

      return NextResponse.json({
        message: `Request successfully ${status} and consumer notified.`,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to update request status" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error updating request status:", error.message);
    if (connection) await connection.end();
    return NextResponse.json(
      { error: "Failed to update request status" },
      { status: 500 }
    );
  }
}

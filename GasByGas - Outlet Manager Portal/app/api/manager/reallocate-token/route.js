import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Configure the email transporter
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
    const { tokenId, originalRequestId, newRequestId, reallocatedBy } = body;

    if (!tokenId || !originalRequestId || !newRequestId || !reallocatedBy) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    // Validate newRequestId exists and is pending
    const [validateNewRequest] = await connection.query(
      `SELECT * FROM gas_request WHERE request_id = ? AND status = 'pending'`,
      [newRequestId]
    );
    if (validateNewRequest.length === 0) {
      throw new Error("Invalid or non-pending new request ID");
    }

    // Insert into request_reallocation table
    await connection.query(
      `INSERT INTO request_reallocation (original_request_id, new_request_id, reallocation_date, reason, reallocated_by)
       VALUES (?, ?, NOW(), ?, ?)`,
      [originalRequestId, newRequestId, "Reallocation initiated", reallocatedBy]
    );

    // Update token table with reallocated_to referencing the new_request_id
    await connection.query(
      `UPDATE token SET status = 'reallocated', reallocated_to = ? WHERE token_id = ?`,
      [newRequestId, tokenId]
    );

    // Update original gas request
    await connection.query(
      `UPDATE gas_request SET status = 'reallocated', reallocation_status = 'original' WHERE request_id = ?`,
      [originalRequestId]
    );

    // Update reallocated gas request
    await connection.query(
      `UPDATE gas_request SET status = 'accepted', reallocation_status = 'reallocated', reallocated_from_id = ? WHERE request_id = ?`,
      [originalRequestId, newRequestId]
    );

    // Fetch consumer details for original and new requests
    const [originalConsumer] = await connection.query(
      `SELECT c.name AS consumer_name, c.email AS consumer_email, gr.request_id
       FROM gas_request gr
       JOIN consumer c ON gr.consumer_id = c.consumer_id
       WHERE gr.request_id = ?`,
      [originalRequestId]
    );

    const [newConsumer] = await connection.query(
      `SELECT c.name AS consumer_name, c.email AS consumer_email, gr.request_id, gr.expected_pickup_date
       FROM gas_request gr
       JOIN consumer c ON gr.consumer_id = c.consumer_id
       WHERE gr.request_id = ?`,
      [newRequestId]
    );

    if (originalConsumer.length === 0 || newConsumer.length === 0) {
      throw new Error("Failed to fetch consumer details for notifications.");
    }

    const { consumer_name: originalName, consumer_email: originalEmail } = originalConsumer[0];
    const { consumer_name: newName, consumer_email: newEmail, expected_pickup_date: newPickupDate } = newConsumer[0];

    // Send email to the original consumer
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: originalEmail,
      subject: "Your Gas Request has been Reallocated",
      text: `Dear ${originalName},\n\nWe regret to inform you that your gas request (ID: ${originalRequestId}) has been reallocated to a different consumer. For further assistance, please contact us.\n\nBest regards,\nGas By Gas Team`,
    });

    // Send email to the new consumer
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: newEmail,
      subject: "Gas Token Reallocated to Your Request",
      text: `Dear ${newName},\n\nA gas token has been reallocated to your request (ID: ${newRequestId}). Please ensure you pick up your cylinders by ${new Date(newPickupDate).toLocaleDateString()}.\n\nBest regards,\nGas By Gas Team`,
    });

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Token reallocated successfully, consumers notified.",
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error in reallocate-token API:", error.message);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}

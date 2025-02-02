import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Function to generate a six-digit random number
const generateSixDigitNumber = () => {
  return Math.floor(100000 + Math.random() * 900000); // Ensures a six-digit number
};

export async function POST(req) {
  let connection
  try {
    const body = await req.json();
    const { requestId, managerId } = body;

    if (!requestId || !managerId) {
      return NextResponse.json(
        { error: "Request ID and Manager ID are required" },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    // Validate the request exists
    const [requestRows] = await connection.query(
      `SELECT * FROM gas_request WHERE request_id = ?`,
      [requestId]
    );

    if (requestRows.length === 0) {
      await connection.end();
      return NextResponse.json(
        { error: "Invalid Request ID" },
        { status: 400 }
      );
    }

    const expectedPickupDate = new Date(requestRows[0].expected_pickup_date);
    const expiryDate = new Date(expectedPickupDate);
    expiryDate.setDate(expectedPickupDate.getDate() + 14);

    let tokenNo;
    let isUnique = false;

    // Generate a unique token number
    while (!isUnique) {
      tokenNo = `GasTok_${generateSixDigitNumber()}`;
      const [existingToken] = await connection.query(
        `SELECT COUNT(*) AS count FROM token WHERE token_no = ?`,
        [tokenNo]
      );
      if (existingToken[0].count === 0) {
        isUnique = true; // Token is unique
      }
    }

    const generatedDate = new Date();

    // Save the token in the database
    console.log("Attempting to insert token into database...");
    const [insertResult] = await connection.query(
      `INSERT INTO token (request_id, token_no, generated_by, generated_date, expiry_date, status)
       VALUES (?, ?, ?, ?, ?, 'valid')`,
      [requestId, tokenNo, managerId, generatedDate, expiryDate]
    );

    if (insertResult.affectedRows === 0) {
      throw new Error("Failed to save token");
    }

    console.log("Token inserted successfully:", tokenNo);

    if (insertResult.affectedRows === 0) {
      await connection.end();
      return NextResponse.json(
        { error: "Failed to save token" },
        { status: 500 }
      );
    }

    // Update the gas request status to "accepted"
    await connection.query(
      `UPDATE gas_request SET status = 'accepted' WHERE request_id = ?`,
      [requestId]
    );

    await connection.commit();
    await connection.end();

    return NextResponse.json({
      message: "Token generated and request accepted successfully",
      token: { tokenNo, generatedDate, expiryDate },
    });
  } 
  catch (error) 
  {
    console.error("Error generating token:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } 
  finally 
  {
    if (connection) await connection.end();
  }
}

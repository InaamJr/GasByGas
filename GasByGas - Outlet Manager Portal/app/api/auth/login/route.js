import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const SECRET_KEY = process.env.JWT_SECRET || "Ifi@2004_08_27";

export async function POST(req) {
  try {
    const { Email, Password } = await req.json();

    // Log the incoming email for debugging
    console.log("Email:", Email);

    // Connect to the database
    const connection = await mysql.createConnection(dbConfig);

    //Fetch query to find Manager details by email 
    const [rows] = await connection.execute(
      "SELECT manager_id, manager_name, password, verification_status FROM outlet_manager WHERE email = ?",
      [Email]
    );

    // Close the database connection
    await connection.end();

    // Check if the email exists in the database
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No manager found with the given Email." },
        { status: 404 }
      );
    }

    const manager = rows[0];

    // Handle different verification statuses
    if (manager.verification_status === "pending") {
      return NextResponse.json(
        { error: "Your account is not approved yet. Please contact support." },
        { status: 403 }
      );
    }

    if (manager.verification_status === "rejected") {
      return NextResponse.json(
        { error: "Your request is rejected!" },
        { status: 403 }
      );
    }

    if (manager.verification_status !== "accepted") {
      return NextResponse.json(
        { error: "Invalid verification status. Please contact support." },
        { status: 403 }
      );
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(Password, manager.password);

    // Log the password validation result
    console.log("Is Password Valid:", isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: manager.manager_id, role: "manager", name: manager.manager_name},
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    // Log the generated token
    console.log("Generated Token:", token);

    // Set token as a cookie
    const response = NextResponse.json({ message: "Login successful!"});
    response.cookies.set("authToken", token, {
      httpOnly: true, // Prevent client-side access
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "lax", // CSRF protection
      path: "/", // Available across all routes
      maxAge: 2 * 60 * 60, // 2 hours
    });

    return response;
  } catch (error) {
    // Log the error for debugging
    console.error("Error during login:", error);

    return NextResponse.json(
      { error: "Failed to process the login request." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "Ifi@2004_08_27";

export async function GET(req) {
  const cookieHeader = req.headers.get("cookie");

  // Check if cookies exist
  if (!cookieHeader) {
    return NextResponse.json(
      { error: "Unauthorized Access." },
      { status: 401 }
    );
  }

  // Extract the authToken from cookies
  const authToken = cookieHeader
    .split(";")
    .find((cookie) => cookie.trim().startsWith("authToken="))
    ?.split("=")[1];

  if (!authToken) {
    return NextResponse.json(
      { error: "Unauthorized. Token missing." },
      { status: 401 }
    );
  }

  try {
    // Verify the token
    const decoded = jwt.verify(authToken, SECRET_KEY);

    // Return user details if verified successfully
    return NextResponse.json({
      message: "Authorized",
      user: {
        id: decoded.id,
        name: decoded.name,
        role: decoded.role,
      },
    });
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return NextResponse.json(
      { error: "Unauthorized. Invalid or expired token." },
      { status: 401 }
    );
  }
}

import { NextResponse } from "next/server";

export async function POST(req) {
  const response = NextResponse.json(
    { message: "Logged out successfully.", redirectTo: "/Main" }
  );

  // Clear the authToken cookie
  response.cookies.delete("authToken", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
}

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "Ifi@2004_08_27";

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const cookieHeader = req.headers.get("cookie");

  // Define protected routes
  const protectedRoutes = ["/ManagerProfile"];

  // Check if the current path matches any protected routes
  if (protectedRoutes.includes(pathname)) {
    const authToken = cookieHeader
      ?.split(";")
      .find((cookie) => cookie.trim().startsWith("authToken="))
      ?.split("=")[1];

    // Redirect if no token is found
    if (!authToken) {
      const url = req.nextUrl.clone();
      url.pathname = "/Main";
      url.searchParams.set(
        "error",
        "You must log in with a valid Outlet Name and Password."
      );
      return NextResponse.redirect(url);
    }

    try {
      // Verify the token
      jwt.verify(authToken, SECRET_KEY);
    } catch (error) {
      // Redirect if token verification fails
      const url = req.nextUrl.clone();
      url.pathname = "/Main";
      url.searchParams.set("error", "Session expired. Please log in again.");
      return NextResponse.redirect(url);
    }
  }

  // Allow access to non-protected routes
  return NextResponse.next();
}

// Define routes to apply the middleware
export const config = {
  matcher: ["/ManagerProfile"],
};

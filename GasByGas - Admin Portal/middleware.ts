import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Only super admins can access settings and add admin pages
    if ((path.startsWith('/settings') || path.startsWith('/add-admin')) && !token?.isSuperAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/add-admin/:path*',
    '/profile/:path*'
  ]
};

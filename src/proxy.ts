import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "admin_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE);

  // API routes under /api/admin (except login) — return 401 if no session cookie
  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/login")) {
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Admin sub-pages — redirect to /admin (login page) if no session cookie
  // /admin itself has the login form and should always be accessible
  if (pathname.startsWith("/admin/")) {
    if (!sessionCookie?.value) {
      const loginUrl = new URL("/admin", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";

// Protected routes requiring JWT authentication
const PROTECTED_PREFIXES = ["/api/user", "/api/admin"];
// Public endpoints within protected prefixes
const PUBLIC_ENDPOINTS = ["/api/admin/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public endpoints like login without auth
  if (PUBLIC_ENDPOINTS.some((pub) => pathname === pub || pathname.startsWith(`${pub}/`))) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired session. Please sign in again." },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/user/:path*", "/api/admin/:path*"],
};


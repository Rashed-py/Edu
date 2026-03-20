// src/middleware.ts
// Edge middleware — protects /admin/* routes by verifying the JWT cookie

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify }                 from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'fallback-secret-change-in-production'
);

const PROTECTED_PATHS = ['/admin'];
const LOGIN_PATH      = '/auth/login';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only apply to admin routes
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Read session cookie
  const token = req.cookies.get('lms_admin_session')?.value;

  if (!token) {
    return NextResponse.redirect(new URL(LOGIN_PATH, req.url));
  }

  // Verify JWT
  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    // Token invalid or expired — redirect to login
    const response = NextResponse.redirect(new URL(LOGIN_PATH, req.url));
    response.cookies.set('lms_admin_session', '', { maxAge: 0, path: '/' });
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};

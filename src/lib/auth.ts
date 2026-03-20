// src/lib/auth.ts
// JWT-based admin session utilities

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'fallback-secret-change-in-production'
);

const COOKIE_NAME = 'lms_admin_session';
const TOKEN_EXPIRY = '8h';

export interface AdminPayload {
  email: string;
  role:  'super_admin';
  iat?:  number;
  exp?:  number;
}

// ── Create signed JWT ──────────────────────────────────────────────────────
export async function signAdminToken(payload: Omit<AdminPayload, 'iat' | 'exp'>) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(SECRET);
}

// ── Verify JWT ────────────────────────────────────────────────────────────
export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

// ── Read session from HTTP-only cookie (server components / route handlers) ─
export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

// ── Cookie options ─────────────────────────────────────────────────────────
export const SESSION_COOKIE_OPTIONS = {
  name:     COOKIE_NAME,
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path:     '/',
  maxAge:   60 * 60 * 8, // 8 hours in seconds
};

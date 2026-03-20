// src/app/api/auth/admin-login/route.ts
// POST /api/auth/admin-login
// Validates admin credentials, issues signed JWT in HTTP-only cookie

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signAdminToken, SESSION_COOKIE_OPTIONS } from '@/lib/auth';
import { z } from 'zod';

// ── In-memory rate limiter (use Redis in production for multi-instance) ──
const ipAttempts = new Map<string, { count: number; until: number }>();
const MAX_PER_IP = 10;
const WINDOW_MS  = 15 * 60 * 1000; // 15 min

function isRateLimited(ip: string): boolean {
  const now  = Date.now();
  const entry = ipAttempts.get(ip);

  if (!entry || entry.until < now) {
    ipAttempts.set(ip, { count: 1, until: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_PER_IP) return true;

  entry.count++;
  return false;
}

// ── Input schema ─────────────────────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  // ── Rate limiting ─────────────────────────────────────────────────────
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: 'طلبات كثيرة جداً. حاول لاحقاً.' },
      { status: 429 }
    );
  }

  // ── Parse & validate body ─────────────────────────────────────────────
  let body: { email: string; password: string };
  try {
    body = loginSchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { success: false, error: 'بيانات الدخول غير صالحة.' },
      { status: 400 }
    );
  }

  // ── Check credentials ─────────────────────────────────────────────────
  const adminEmail    = process.env.ADMIN_EMAIL || '';
  const adminHashEnv  = process.env.ADMIN_PASSWORD_HASH || '';

  // Constant-time email comparison to prevent timing attacks
  const emailMatch = body.email.toLowerCase() === adminEmail.toLowerCase();

  // Always run bcrypt even if email is wrong (prevents timing oracle)
  const hashToCheck = emailMatch
    ? adminHashEnv
    : '$2b$12$invalidhashpaddingtomakeconstanttime00000000000000000000'; // dummy

  let passwordMatch = false;
  try {
    passwordMatch = await bcrypt.compare(body.password, hashToCheck);
  } catch {
    // bcrypt failure — treat as invalid
  }

  if (!emailMatch || !passwordMatch) {
    // Artificial delay to slow brute-force
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
    return NextResponse.json(
      { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' },
      { status: 401 }
    );
  }

  // ── Issue JWT ─────────────────────────────────────────────────────────
  const token = await signAdminToken({
    email: body.email,
    role:  'super_admin',
  });

  // ── Set HTTP-only cookie ──────────────────────────────────────────────
  const response = NextResponse.json(
    { success: true, message: 'تم تسجيل الدخول بنجاح.' },
    { status: 200 }
  );

  response.cookies.set(SESSION_COOKIE_OPTIONS.name, token, {
    httpOnly: SESSION_COOKIE_OPTIONS.httpOnly,
    secure:   SESSION_COOKIE_OPTIONS.secure,
    sameSite: SESSION_COOKIE_OPTIONS.sameSite,
    path:     SESSION_COOKIE_OPTIONS.path,
    maxAge:   SESSION_COOKIE_OPTIONS.maxAge,
  });

  return response;
}

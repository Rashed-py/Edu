// src/app/api/users/route.ts
// GET /api/users  — list all users
// POST /api/users — create a new user via Firebase Admin

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession }         from '@/lib/auth';
import { adminAuth, adminDb }      from '@/lib/firebase-admin';
import { z }                       from 'zod';

// ── GET — list users ──────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const snapshot = await adminDb.collection('users').orderBy('createdAt', 'desc').get();
    const users    = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ── POST — create user ────────────────────────────────────────────────────
const createSchema = z.object({
  displayName: z.string().min(2).max(100),
  email:       z.string().email(),
  role:        z.enum(['student', 'instructor', 'admin']).default('student'),
  groupIds:    z.array(z.string()).default([]),
  permissions: z.object({
    canUploadFiles:    z.boolean().default(false),
    canWatchVideos:    z.boolean().default(true),
    canAccessCodeLab:  z.boolean().default(false),
    canViewAnalytics:  z.boolean().default(false),
  }).default({}),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  let body: z.infer<typeof createSchema>;
  try {
    body = createSchema.parse(await req.json());
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.errors?.[0]?.message || 'Invalid data' }, { status: 400 });
  }

  try {
    // 1. Create Firebase Auth user (sends verification email automatically)
    const tempPassword = `Temp${Math.random().toString(36).slice(2)}!`;
    const authUser = await adminAuth.createUser({
      email:        body.email,
      displayName:  body.displayName,
      password:     tempPassword,
      emailVerified: false,
    });

    // 2. Set custom claims for role
    await adminAuth.setCustomUserClaims(authUser.uid, { role: body.role });

    // 3. Write Firestore document
    const userData = {
      uid:         authUser.uid,
      email:       body.email,
      displayName: body.displayName,
      role:        body.role,
      groupIds:    body.groupIds,
      permissions: body.permissions,
      isActive:    true,
      createdAt:   new Date().toISOString(),
    };
    await adminDb.collection('users').doc(authUser.uid).set(userData);

    // 4. Generate password reset link so user can set their own password
    const resetLink = await adminAuth.generatePasswordResetLink(body.email);

    return NextResponse.json({
      success: true,
      data:    { user: userData, resetLink },
      message: 'تم إنشاء المستخدم وإرسال رابط تعيين كلمة المرور',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

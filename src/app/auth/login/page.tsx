// src/app/auth/login/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Lock, Eye, EyeOff, AlertTriangle,
  Fingerprint, CheckCircle2, Loader2, GraduationCap,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Security: max attempts before lockout ────────────────────────────────
const MAX_ATTEMPTS  = 5;
const LOCKOUT_MS    = 10 * 60 * 1000; // 10 minutes

export default function AdminLoginPage() {
  const router        = useRouter();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [attempts, setAttempts]     = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockCounter, setLockCounter] = useState(0);
  const [phase, setPhase]           = useState<'idle' | 'verifying' | 'success'>('idle');
  const emailRef = useRef<HTMLInputElement>(null);

  // Focus email on mount
  useEffect(() => { emailRef.current?.focus(); }, []);

  // Countdown timer when locked
  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setAttempts(0);
        clearInterval(id);
      } else {
        setLockCounter(remaining);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const isLocked = !!lockedUntil;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLocked || loading) return;

    if (!email.trim() || !password.trim()) {
      toast.error('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    setPhase('verifying');

    try {
      const res = await fetch('/api/auth/admin-login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPhase('idle');

        if (newAttempts >= MAX_ATTEMPTS) {
          const lockEnd = Date.now() + LOCKOUT_MS;
          setLockedUntil(lockEnd);
          toast.error('تم تجاوز الحد الأقصى للمحاولات. الحساب مقفل لمدة 10 دقائق.');
        } else {
          toast.error(data.error || 'بيانات الدخول غير صحيحة');
        }
        return;
      }

      // Success
      setPhase('success');
      toast.success('مرحباً! جاري توجيهك إلى لوحة التحكم…');
      await new Promise((r) => setTimeout(r, 1200));
      router.push('/admin/dashboard');
    } catch {
      setPhase('idle');
      toast.error('خطأ في الشبكة. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--bg-primary)]">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 dark:bg-mesh-dark bg-mesh-light" />
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-emerald-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="glass-card p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-flex mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-glow-blue">
                {phase === 'success' ? (
                  <CheckCircle2 size={32} className="text-white" />
                ) : (
                  <Shield size={32} className="text-white" />
                )}
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[var(--bg-card)] flex items-center justify-center">
                <Lock size={10} className="text-white" />
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
              قبو الأمان
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">The Vault — Super Admin Access</p>
            <div className="flex items-center justify-center gap-2 mt-3 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Fingerprint size={14} className="text-amber-400" />
              <p className="text-xs text-amber-400">منطقة محمية · Restricted Area</p>
            </div>
          </div>

          {/* Lockout notice */}
          <AnimatePresence>
            {isLocked && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
              >
                <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-400">الحساب مقفل مؤقتاً</p>
                  <p className="text-xs text-red-400/70 mt-1">
                    يُفتح بعد {lockCounter} ثانية
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attempt counter */}
          {attempts > 0 && !isLocked && (
            <div className="mb-4 text-center">
              <p className="text-xs text-[var(--text-muted)]">
                المحاولات المتبقية:{' '}
                <span className="text-amber-400 font-semibold">{MAX_ATTEMPTS - attempts}</span>
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                البريد الإلكتروني
              </label>
              <input
                ref={emailRef}
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLocked || phase === 'success'}
                placeholder="admin@yourdomain.com"
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:ring-glow transition-all disabled:opacity-50"
                dir="ltr"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLocked || phase === 'success'}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:ring-glow transition-all disabled:opacity-50"
                  dir="ltr"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLocked || loading || phase === 'success'}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm shadow-glow-blue hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {phase === 'verifying' || loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  جاري التحقق…
                </>
              ) : phase === 'success' ? (
                <>
                  <CheckCircle2 size={16} />
                  تم التحقق بنجاح!
                </>
              ) : (
                <>
                  <Shield size={16} />
                  دخول آمن
                </>
              )}
            </button>
          </form>

          {/* Security notice */}
          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <p className="text-xs text-center text-[var(--text-muted)]">
              هذه الصفحة محمية بـ JWT + bcrypt + Rate Limiting
            </p>
            <div className="flex items-center justify-center gap-4 mt-3">
              {['HTTPS', 'JWT', 'bcrypt', 'CSP'].map((badge) => (
                <span key={badge} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
          <GraduationCap size={16} />
          <span>EduVault LMS · جامعة جنوب الوادي</span>
        </div>
      </motion.div>
    </div>
  );
}

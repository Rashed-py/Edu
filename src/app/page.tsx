// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import {
  BookOpen, Brain, Code2, FileUp, BarChart3,
  Shield, Sun, Moon, ArrowLeft, GraduationCap,
  Users, Sparkles, ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

// ── Animation helpers ────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
};

// ── Feature cards data ───────────────────────────────────────────────────
const features = [
  {
    icon:  Shield,
    color: 'blue',
    title: 'قبو الأمان',
    en:    'The Vault',
    desc:  'لوحة تحكم محمية بمصادقة ثلاثية الطبقات وجلسات JWT مشفرة.',
  },
  {
    icon:  Brain,
    color: 'purple',
    title: 'المحرك التربوي',
    en:    'Pedagogical Engine',
    desc:  'تحويل الأهداف التعليمية إلى أهداف سلوكية وفق نموذجَي Bloom و Mager.',
  },
  {
    icon:  Code2,
    color: 'emerald',
    title: 'مختبر الأكواد',
    en:    'Code Lab',
    desc:  'شروحات C++ و Python مع تنسيق وتلوين الكود احترافياً.',
  },
  {
    icon:  FileUp,
    color: 'amber',
    title: 'إدارة الملفات',
    en:    'File Manager',
    desc:  'رفع عروض PowerPoint والفيديوهات وتخزينها في Firebase Storage.',
  },
  {
    icon:  BarChart3,
    color: 'cyan',
    title: 'تحليل البيانات',
    en:    'Analytics',
    desc:  'مخططات تفاعلية لتتبع تقدم الطلاب وأداء المحتوى التعليمي.',
  },
  {
    icon:  Users,
    color: 'rose',
    title: 'إدارة المستخدمين',
    en:    'User Control',
    desc:  'توزيع الطلاب على مجموعات وضبط صلاحياتهم بدقة كاملة.',
  },
];

const colorMap: Record<string, string> = {
  blue:    'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
  purple:  'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
  emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
  amber:   'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400',
  cyan:    'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400',
  rose:    'from-rose-500/20 to-rose-600/5 border-rose-500/20 text-rose-400',
};

// ── Stat counters ─────────────────────────────────────────────────────────
const stats = [
  { value: '500+', label: 'طالب مسجّل',      en: 'Students'   },
  { value: '120+', label: 'درس تفاعلي',       en: 'Lessons'    },
  { value: '15+',  label: 'سنة من الخبرة',    en: 'Years Exp.' },
  { value: '98%',  label: 'رضا الطلاب',       en: 'Satisfaction' },
];

// ── Component ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] relative overflow-hidden">
      {/* ── Mesh background ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 dark:bg-mesh-dark bg-mesh-light opacity-60" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-[var(--text-primary)] leading-none">EduVault</p>
              <p className="text-[10px] text-[var(--text-muted)] leading-none mt-0.5">LMS Platform</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="تبديل المظهر"
              >
                {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}
            <Link
              href="/about"
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:block"
            >
              عن المنصة
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium shadow-glow-blue hover:opacity-90 transition-opacity"
            >
              <Shield size={14} />
              دخول الإدمن
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="space-y-6"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="flex justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-[var(--border)] text-sm text-[var(--text-secondary)]">
                <Sparkles size={14} className="text-yellow-400" />
                نظام إدارة التعلم الذكي • South Valley University
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-7xl font-display font-bold text-[var(--text-primary)] leading-tight">
              منصة{' '}
              <span className="gradient-text">EduVault</span>
              <br />
              للتعليم الذكي
            </motion.h1>

            {/* Sub */}
            <motion.p variants={fadeUp} className="max-w-2xl mx-auto text-lg text-[var(--text-secondary)] leading-relaxed">
              بيئة تعليمية متكاملة مبنية على أحدث تقنيات الويب، تجمع بين إدارة المحتوى الرقمي،
              تحليل أداء الطلاب، والمحرك التربوي المدعوم بمبادئ Bloom و Mager و Mayer.
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-glow-blue hover:shadow-none transition-all duration-300 hover:scale-95"
              >
                <Shield size={18} />
                الدخول إلى لوحة التحكم
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl glass border border-[var(--border)] text-[var(--text-primary)] font-semibold hover:border-blue-500/40 transition-all duration-300"
              >
                <BookOpen size={18} />
                تعرف على المنصة
                <ArrowLeft size={16} className="rotate-180" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <div className="mt-20 flex justify-center animate-bounce">
            <ChevronDown size={24} className="text-[var(--text-muted)]" />
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl font-display font-bold gradient-text">{s.value}</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">{s.label}</p>
                <p className="text-xs text-[var(--text-muted)] opacity-60">{s.en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ───────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-[var(--text-primary)]">
              مكوّنات المنصة
            </h2>
            <p className="text-[var(--text-secondary)] mt-3">
              ستة وحدات متكاملة لتجربة تعليمية شاملة
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              const cls  = colorMap[f.color];
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`glass-card p-6 bg-gradient-to-br ${cls} hover:scale-[1.02] transition-transform duration-300 cursor-default`}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cls} flex items-center justify-center mb-4`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-[var(--text-primary)]">{f.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] mb-2 font-mono">{f.en}</p>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Tech stack ──────────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-[var(--text-muted)] mb-6 uppercase tracking-widest">المكدس التقني</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS', 'Firebase', 'Firestore', 'Recharts', 'Framer Motion', 'Vercel'].map((t) => (
              <span key={t} className="px-4 py-2 rounded-full glass border border-[var(--border)] text-sm text-[var(--text-secondary)] font-mono">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-[var(--border)] text-center">
        <p className="text-sm text-[var(--text-muted)]">
          © {new Date().getFullYear()} EduVault LMS · جامعة جنوب الوادي · جميع الحقوق محفوظة
        </p>
      </footer>
    </div>
  );
}

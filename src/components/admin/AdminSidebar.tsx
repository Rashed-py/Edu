// src/components/admin/AdminSidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FolderOpen, Brain, Code2,
  BookOpen, BarChart3, Settings, LogOut, GraduationCap,
  ChevronRight, Shield, Menu, X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

interface NavItem {
  href:  string;
  label: string;
  en:    string;
  icon:  React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: '/admin/dashboard', label: 'لوحة التحكم',      en: 'Dashboard',      icon: LayoutDashboard },
  { href: '/admin/users',     label: 'المستخدمون',       en: 'Users',           icon: Users           },
  { href: '/admin/files',     label: 'إدارة الملفات',   en: 'File Manager',    icon: FolderOpen      },
  { href: '/admin/pedagogy',  label: 'المحرك التربوي',  en: 'Pedagogy Engine', icon: Brain           },
  { href: '/admin/codelab',   label: 'مختبر الأكواد',   en: 'Code Lab',        icon: Code2           },
];

interface Props { adminEmail: string; }

export default function AdminSidebar({ adminEmail }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('تم تسجيل الخروج بنجاح');
    router.push('/auth/login');
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-glow-blue">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-sm text-[var(--text-primary)]">EduVault</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Shield size={10} className="text-emerald-400" />
              <p className="text-[10px] text-emerald-400 font-mono">Super Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon    = item.icon;
          const active  = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative',
                active
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/25'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              <Icon size={18} className={active ? 'text-blue-400' : ''} />
              <div className="flex-1">
                <p className="text-sm font-medium leading-none">{item.label}</p>
                <p className="text-[10px] opacity-50 mt-0.5 font-mono">{item.en}</p>
              </div>
              {active && <ChevronRight size={14} className="text-blue-400" />}
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="mb-3 px-4 py-3 rounded-xl bg-[var(--bg-secondary)]">
          <p className="text-xs text-[var(--text-muted)] mb-0.5">مسجّل دخول كـ</p>
          <p className="text-sm text-[var(--text-primary)] font-mono truncate">{adminEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-red-500/10 hover:text-red-400 transition-all text-sm"
        >
          <LogOut size={16} />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 right-0 border-l border-[var(--border)] bg-[var(--bg-card)] z-40">
        <SidebarContent />
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 w-10 h-10 rounded-xl glass flex items-center justify-center text-[var(--text-primary)]"
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-72 z-50 bg-[var(--bg-card)] border-l border-[var(--border)] lg:hidden"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 left-4 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)]"
              >
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

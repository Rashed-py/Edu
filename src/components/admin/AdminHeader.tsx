// src/components/admin/AdminHeader.tsx
'use client';

import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Bell, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbMap: Record<string, string> = {
  '/admin/dashboard': 'لوحة التحكم',
  '/admin/users':     'إدارة المستخدمين',
  '/admin/files':     'إدارة الملفات',
  '/admin/pedagogy':  'المحرك التربوي',
  '/admin/codelab':   'مختبر الأكواد',
};

interface Props { adminEmail: string; }

export default function AdminHeader({ adminEmail }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  const pageTitle = breadcrumbMap[pathname] || 'لوحة التحكم';

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-sm flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30">
      {/* Page title */}
      <div>
        <h2 className="font-display font-semibold text-[var(--text-primary)] text-base">{pageTitle}</h2>
        <p className="text-xs text-[var(--text-muted)] font-mono">EduVault LMS · Admin Panel</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="تبديل المظهر"
          >
            {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}

        {/* Notifications */}
        <button className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold ml-1">
          {adminEmail.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

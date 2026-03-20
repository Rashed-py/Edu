// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'EduVault LMS — نظام إدارة التعلم الذكي',
    template: '%s | EduVault LMS',
  },
  description:
    'منصة تعليمية متكاملة لجامعة جنوب الوادي — إدارة المحتوى التعليمي وتحليل تقدم الطلاب بالذكاء الاصطناعي.',
  keywords: ['LMS', 'e-learning', 'تعليم إلكتروني', 'جنوب الوادي', 'data annotation'],
  authors: [{ name: 'EduVault LMS' }],
  robots: { index: false, follow: false },   // Keep private
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)',  color: '#060d1f' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-card)',
                color:      'var(--text-primary)',
                border:     '1px solid var(--border)',
                fontFamily: "'Cairo', 'DM Sans', system-ui",
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

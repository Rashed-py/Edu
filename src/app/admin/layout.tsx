// src/app/admin/layout.tsx
// Shared layout for all /admin/* pages — includes sidebar + auth gate

import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader  from '@/components/admin/AdminHeader';

export const metadata = { title: { default: 'لوحة التحكم', template: '%s | EduVault Admin' } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth guard
  const session = await getAdminSession();
  if (!session) redirect('/auth/login');

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">
      {/* Fixed sidebar */}
      <AdminSidebar adminEmail={session.email} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:mr-64">
        <AdminHeader adminEmail={session.email} />
        <main className="flex-1 p-6 lg:p-8 page-enter">
          {children}
        </main>
      </div>
    </div>
  );
}

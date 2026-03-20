// src/app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Search, Filter, MoreVertical, Shield,
  Upload, Eye, Trash2, CheckCircle, XCircle, Users,
  Mail, Calendar, Edit2, X, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import type { LMSUser, UserPermissions } from '@/types';

// ── Mock data (replace with Firestore collection) ────────────────────────
const MOCK_USERS: LMSUser[] = [
  {
    uid: '1', email: 'ahmed@example.com',  displayName: 'أحمد محمد السيد',
    role: 'student', groupIds: ['group-a'], isActive: true,
    permissions: { canUploadFiles: false, canWatchVideos: true, canAccessCodeLab: true, canViewAnalytics: false },
    createdAt: '2024-06-01T10:00:00Z', lastLoginAt: '2024-07-10T09:00:00Z',
  },
  {
    uid: '2', email: 'sara@example.com',   displayName: 'سارة علي إبراهيم',
    role: 'student', groupIds: ['group-a', 'group-b'], isActive: true,
    permissions: { canUploadFiles: true, canWatchVideos: true, canAccessCodeLab: true, canViewAnalytics: false },
    createdAt: '2024-06-05T10:00:00Z', lastLoginAt: '2024-07-09T14:00:00Z',
  },
  {
    uid: '3', email: 'mahmoud@example.com', displayName: 'محمود حسن عمر',
    role: 'student', groupIds: ['group-b'], isActive: false,
    permissions: { canUploadFiles: false, canWatchVideos: false, canAccessCodeLab: false, canViewAnalytics: false },
    createdAt: '2024-06-10T10:00:00Z',
  },
  {
    uid: '4', email: 'nour@example.com',   displayName: 'نور محمد أحمد',
    role: 'instructor', groupIds: [], isActive: true,
    permissions: { canUploadFiles: true, canWatchVideos: true, canAccessCodeLab: true, canViewAnalytics: true },
    createdAt: '2024-05-15T10:00:00Z', lastLoginAt: '2024-07-10T11:00:00Z',
  },
];

const GROUPS = [
  { id: 'group-a', name: 'المجموعة أ', color: '#3383f6' },
  { id: 'group-b', name: 'المجموعة ب', color: '#10b981' },
  { id: 'group-c', name: 'المجموعة ج', color: '#f59e0b' },
];

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  student:     { label: 'طالب',      color: 'bg-blue-500/15 text-blue-400' },
  instructor:  { label: 'مدرّس',     color: 'bg-emerald-500/15 text-emerald-400' },
  admin:       { label: 'مدير',      color: 'bg-amber-500/15 text-amber-400' },
  super_admin: { label: 'سوبر أدمن', color: 'bg-purple-500/15 text-purple-400' },
};

const PERM_KEYS: { key: keyof UserPermissions; label: string }[] = [
  { key: 'canUploadFiles',   label: 'رفع الملفات'    },
  { key: 'canWatchVideos',   label: 'مشاهدة الفيديوهات' },
  { key: 'canAccessCodeLab', label: 'مختبر الأكواد'  },
  { key: 'canViewAnalytics', label: 'عرض التحليلات'  },
];

// ── Add User Modal ──────────────────────────────────────────────────────
function AddUserModal({ onClose, onAdd }: { onClose: () => void; onAdd: (user: Partial<LMSUser>) => void }) {
  const [form, setForm] = useState({
    displayName: '', email: '', role: 'student' as LMSUser['role'],
    groupIds: [] as string[],
    permissions: { canUploadFiles: false, canWatchVideos: true, canAccessCodeLab: false, canViewAnalytics: false },
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    onAdd({ ...form, uid: Date.now().toString(), isActive: true, createdAt: new Date().toISOString() });
    toast.success('تم إضافة المستخدم بنجاح');
    setLoading(false);
    onClose();
  }

  const toggleGroup = (id: string) =>
    setForm((f) => ({
      ...f,
      groupIds: f.groupIds.includes(id) ? f.groupIds.filter((g) => g !== id) : [...f.groupIds, id],
    }));

  const togglePerm = (key: keyof UserPermissions) =>
    setForm((f) => ({ ...f, permissions: { ...f.permissions, [key]: !f.permissions[key] } }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-lg text-[var(--text-primary)]">إضافة مستخدم جديد</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">إدخال بيانات المستخدم وضبط صلاحياته</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1.5">الاسم الكامل *</label>
            <input
              value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              required placeholder="أحمد محمد السيد"
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-glow"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1.5">البريد الإلكتروني *</label>
            <input
              type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required placeholder="student@university.edu" dir="ltr"
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-glow"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1.5">الدور الوظيفي</label>
            <select
              value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as LMSUser['role'] }))}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:outline-none"
            >
              <option value="student">طالب</option>
              <option value="instructor">مدرّس</option>
              <option value="admin">مدير</option>
            </select>
          </div>

          {/* Groups */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">المجموعات</label>
            <div className="flex flex-wrap gap-2">
              {GROUPS.map((g) => (
                <button
                  type="button" key={g.id}
                  onClick={() => toggleGroup(g.id)}
                  style={{ borderColor: form.groupIds.includes(g.id) ? g.color : 'var(--border)', color: form.groupIds.includes(g.id) ? g.color : 'var(--text-muted)' }}
                  className="px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">الصلاحيات</label>
            <div className="space-y-2">
              {PERM_KEYS.map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] cursor-pointer hover:bg-[var(--border)] transition-colors">
                  <span className="text-sm text-[var(--text-primary)]">{label}</span>
                  <div
                    onClick={() => togglePerm(key)}
                    className={clsx(
                      'w-10 h-5 rounded-full relative transition-colors cursor-pointer',
                      form.permissions[key] ? 'bg-emerald-500' : 'bg-[var(--border)]'
                    )}
                  >
                    <div className={clsx(
                      'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                      form.permissions[key] ? 'translate-x-5' : 'translate-x-0.5'
                    )} />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors">
              إلغاء
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              {loading ? 'جاري الإضافة…' : 'إضافة المستخدم'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers]       = useState<LMSUser[]>(MOCK_USERS);
  const [search, setSearch]     = useState('');
  const [filterRole, setFilter] = useState('all');
  const [showAddModal, setShowAdd] = useState(false);

  const filtered = users.filter((u) => {
    const matchSearch = u.displayName.includes(search) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  function toggleActive(uid: string) {
    setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, isActive: !u.isActive } : u));
    toast.success('تم تحديث حالة المستخدم');
  }

  function deleteUser(uid: string) {
    setUsers((prev) => prev.filter((u) => u.uid !== uid));
    toast.success('تم حذف المستخدم');
  }

  function handleAdd(newUser: Partial<LMSUser>) {
    setUsers((prev) => [newUser as LMSUser, ...prev]);
  }

  const getGroupName = (id: string) => GROUPS.find((g) => g.id === id)?.name || id;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">إدارة المستخدمين</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{users.length} مستخدم إجمالاً</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium shadow-glow-blue hover:opacity-90 transition-opacity self-start sm:self-auto"
        >
          <UserPlus size={16} />
          إضافة مستخدم
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو البريد…"
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-glow"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none"
        >
          <option value="all">جميع الأدوار</option>
          <option value="student">طلاب</option>
          <option value="instructor">مدرسون</option>
          <option value="admin">مديرون</option>
        </select>
      </div>

      {/* Users table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['المستخدم', 'الدور', 'المجموعات', 'الصلاحيات', 'الحالة', 'إجراءات'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-right text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((user, i) => {
                const roleInfo = ROLE_LABELS[user.role];
                return (
                  <motion.tr
                    key={user.uid}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    {/* User info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-700/20 flex items-center justify-center text-blue-400 font-semibold text-sm">
                          {user.displayName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">{user.displayName}</p>
                          <p className="text-xs text-[var(--text-muted)] font-mono">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                    </td>

                    {/* Groups */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.groupIds.length > 0
                          ? user.groupIds.map((gid) => (
                            <span key={gid} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)]">
                              {getGroupName(gid)}
                            </span>
                          ))
                          : <span className="text-xs text-[var(--text-muted)]">—</span>
                        }
                      </div>
                    </td>

                    {/* Permissions */}
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5">
                        {PERM_KEYS.map(({ key, label }) => (
                          <span
                            key={key}
                            title={label}
                            className={clsx(
                              'w-5 h-5 rounded-md flex items-center justify-center',
                              user.permissions[key]
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                            )}
                          >
                            {user.permissions[key] ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleActive(user.uid)}
                        className={clsx(
                          'text-xs px-2.5 py-1 rounded-full font-medium transition-colors',
                          user.isActive
                            ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                            : 'bg-red-500/15 text-red-400 hover:bg-red-500/25'
                        )}
                      >
                        {user.isActive ? 'نشط' : 'موقوف'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => deleteUser(user.uid)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Users size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
              <p className="text-[var(--text-secondary)]">لا يوجد مستخدمون مطابقون</p>
            </div>
          )}
        </div>
      </div>

      {/* Add user modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddUserModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />
        )}
      </AnimatePresence>
    </div>
  );
}

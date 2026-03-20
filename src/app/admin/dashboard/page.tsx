// src/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Users, FileUp, BookOpen, HardDrive,
  TrendingUp, Activity, UserCheck, Clock,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { DashboardStats, ActivityItem } from '@/types';

// ── Mock data (replace with real Firestore queries) ────────────────────
const activityData = [
  { day: 'السبت',   students: 12, files: 4, courses: 2 },
  { day: 'الأحد',   students: 19, files: 7, courses: 3 },
  { day: 'الاثنين', students: 15, files: 5, courses: 1 },
  { day: 'الثلاثاء',students: 25, files: 9, courses: 4 },
  { day: 'الأربعاء',students: 22, files: 6, courses: 2 },
  { day: 'الخميس', students: 30, files: 12, courses: 5 },
  { day: 'الجمعة', students: 18, files: 8, courses: 3 },
];

const roleData = [
  { name: 'طلاب',       value: 420, color: '#3383f6' },
  { name: 'مدرسون',     value: 25,  color: '#10b981' },
  { name: 'مساعدون',    value: 12,  color: '#f59e0b' },
];

const recentActivity: ActivityItem[] = [
  { id: '1', type: 'user_joined',       userName: 'أحمد محمد',    detail: 'انضم إلى المجموعة أ',           createdAt: '2024-07-10T10:00:00Z' },
  { id: '2', type: 'file_uploaded',     userName: 'المدير',       detail: 'رُفع ملف: محاضرة_1.pptx',       createdAt: '2024-07-10T09:30:00Z' },
  { id: '3', type: 'course_started',    userName: 'سارة علي',     detail: 'بدأت دورة: مقدمة C++',          createdAt: '2024-07-10T08:45:00Z' },
  { id: '4', type: 'objective_created', userName: 'المدير',       detail: 'هدف تعليمي جديد أُضيف',         createdAt: '2024-07-10T08:00:00Z' },
  { id: '5', type: 'user_joined',       userName: 'محمود حسن',    detail: 'انضم إلى المجموعة ب',           createdAt: '2024-07-09T17:00:00Z' },
];

// ── Stat Card ─────────────────────────────────────────────────────────
interface StatCardProps {
  title:   string;
  value:   string | number;
  subtitle: string;
  icon:    React.ElementType;
  color:   string;
  trend?:  string;
  delay:   number;
}

function StatCard({ title, value, subtitle, icon: Icon, color, trend, delay }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue:    'from-blue-500/15 to-blue-600/5 border-blue-500/20',
    emerald: 'from-emerald-500/15 to-emerald-600/5 border-emerald-500/20',
    amber:   'from-amber-500/15 to-amber-600/5 border-amber-500/20',
    purple:  'from-purple-500/15 to-purple-600/5 border-purple-500/20',
  };
  const iconColors: Record<string, string> = {
    blue: 'text-blue-400', emerald: 'text-emerald-400', amber: 'text-amber-400', purple: 'text-purple-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={clsx('glass-card p-6 bg-gradient-to-br', colorClasses[color])}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br', colorClasses[color])}>
          <Icon size={20} className={iconColors[color]} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
            <TrendingUp size={10} />
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-display font-bold text-[var(--text-primary)]">{value}</p>
      <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">{title}</p>
      <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>
    </motion.div>
  );
}

// ── Activity type labels ───────────────────────────────────────────────
const activityLabels: Record<string, { label: string; color: string }> = {
  user_joined:       { label: 'انضمام',    color: 'bg-blue-500/20 text-blue-400' },
  file_uploaded:     { label: 'رفع ملف',   color: 'bg-amber-500/20 text-amber-400' },
  course_started:    { label: 'بدء دورة',  color: 'bg-emerald-500/20 text-emerald-400' },
  objective_created: { label: 'هدف جديد', color: 'bg-purple-500/20 text-purple-400' },
};

function formatRelative(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600)  return `${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} س`;
  return `${Math.floor(diff / 86400)} ي`;
}

// ── Tooltip styling for Recharts ───────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 text-sm">
      <p className="font-semibold text-[var(--text-primary)] mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────
export default function DashboardPage() {
  const [storageUsed] = useState(2.4); // GB

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">لوحة تحكم المالك</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">نظرة شاملة على أداء المنصة التعليمية</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="إجمالي الطلاب"   value="457"   subtitle="12 جديد هذا الأسبوع"
          icon={Users}    color="blue"    trend="+8%"   delay={0}
        />
        <StatCard
          title="الطلاب النشطون"  value="312"   subtitle="نشاط خلال 7 أيام"
          icon={UserCheck} color="emerald" trend="+5%"  delay={0.1}
        />
        <StatCard
          title="الملفات المرفوعة" value="1,240" subtitle="عروض وفيديوهات وملفات"
          icon={FileUp}   color="amber"   trend="+12%" delay={0.2}
        />
        <StatCard
          title="التخزين المستخدم" value={`${storageUsed} GB`} subtitle="من 10 GB المتاحة"
          icon={HardDrive} color="purple"              delay={0.3}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Area chart — weekly activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-2 glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-[var(--text-primary)]">النشاط الأسبوعي</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">طلاب · ملفات · دورات</p>
            </div>
            <Activity size={18} className="text-[var(--text-muted)]" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3383f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3383f6" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="students" name="طلاب"   stroke="#3383f6" strokeWidth={2} fill="url(#gBlue)"    />
              <Area type="monotone" dataKey="files"    name="ملفات"  stroke="#10b981" strokeWidth={2} fill="url(#gEmerald)" />
              <Area type="monotone" dataKey="courses"  name="دورات"  stroke="#f59e0b" strokeWidth={2} fill="none"           strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart — user roles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-[var(--text-primary)]">توزيع المستخدمين</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">حسب الدور الوظيفي</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={roleData}
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {roleData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="glass-card px-3 py-2 text-sm">
                      <p style={{ color: payload[0].payload.color }}>{payload[0].name}: {payload[0].value}</p>
                    </div>
                  ) : null
                }
              />
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-[var(--text-secondary)]">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom row: bar chart + activity feed */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Bar chart — daily uploads */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h3 className="font-display font-semibold text-[var(--text-primary)] mb-1">رفع الملفات اليومي</h3>
          <p className="text-xs text-[var(--text-muted)] mb-5">توزيع الملفات المرفوعة خلال الأسبوع</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="files" name="ملفات" fill="#3383f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6"
        >
          <h3 className="font-display font-semibold text-[var(--text-primary)] mb-1">آخر النشاطات</h3>
          <p className="text-xs text-[var(--text-muted)] mb-5">أحدث الأحداث على المنصة</p>
          <div className="space-y-3">
            {recentActivity.map((item) => {
              const meta = activityLabels[item.type];
              return (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--border)] transition-colors">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-medium whitespace-nowrap ${meta.color}`}>
                    {meta.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] truncate">{item.detail}</p>
                    {item.userName && (
                      <p className="text-xs text-[var(--text-muted)]">{item.userName}</p>
                    )}
                  </div>
                  <span className="text-xs text-[var(--text-muted)] whitespace-nowrap flex items-center gap-1">
                    <Clock size={10} />
                    {formatRelative(item.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

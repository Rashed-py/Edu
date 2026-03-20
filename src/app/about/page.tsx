// src/app/about/page.tsx
'use client';

import { motion } from 'framer-motion';
import {
  GraduationCap, Brain, Code2, Database, Award,
  MapPin, Mail, Calendar, BookOpen, Users, Star,
  ArrowLeft, ExternalLink, Github, Linkedin,
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

// ── Data ─────────────────────────────────────────────────────────────────
const skills = [
  { category: 'تكنولوجيا التعليم', items: ['LMS Design', 'Instructional Design', 'Bloom\'s Taxonomy', 'Mayer\'s Multimedia', 'ADDIE Model', 'E-Learning'], color: '#3383f6' },
  { category: 'تطوير الويب',        items: ['Next.js', 'React', 'TypeScript', 'Firebase', 'Tailwind CSS', 'Node.js'],            color: '#10b981' },
  { category: 'الذكاء الاصطناعي',   items: ['Data Annotation', 'NLP', 'Python', 'Machine Learning', 'LLM Evaluation'],          color: '#8b5cf6' },
  { category: 'التدريس والبحث',     items: ['University Teaching', 'Curriculum Design', 'Student Assessment', 'Research'],        color: '#f59e0b' },
];

const experience = [
  {
    role:     'أستاذ مساعد — تكنولوجيا التعليم',
    org:      'جامعة جنوب الوادي',
    period:   '2015 — الحاضر',
    location: 'قنا، مصر',
    color:    '#3383f6',
    points: [
      'تدريس مقررات تكنولوجيا التعليم والوسائط التعليمية المتعددة',
      'تصميم وتطوير مناهج رقمية للبيئات التعليمية الهجينة',
      'الإشراف على رسائل الماجستير في مجال التعلم الإلكتروني',
      'إدارة مختبر الحاسوب والبيئة التعليمية الرقمية بالجامعة',
    ],
  },
  {
    role:     'خبير Data Annotation & AI Evaluation',
    org:      'مشاريع دولية في الذكاء الاصطناعي',
    period:   '2020 — الحاضر',
    location: 'عن بُعد',
    color:    '#10b981',
    points: [
      'تقييم وتصنيف بيانات تدريب نماذج اللغة الكبيرة (LLMs)',
      'تصحيح ومراجعة مخرجات نماذج الذكاء الاصطناعي للغة العربية',
      'تقييم جودة الاستجابات التعليمية للمساعدين الذكيين',
      'العمل مع شركات تقنية رائدة في مجال الـ AI Research',
    ],
  },
];

const publications = [
  { title: 'أثر استخدام الوسائط المتعددة التفاعلية على التحصيل الدراسي', year: '2022', journal: 'المجلة العربية للتربية التقنية', color: '#3383f6' },
  { title: 'نموذج مقترح لتصميم بيئات التعلم الإلكتروني وفق مبادئ ماير', year: '2021', journal: 'دراسات في المناهج وطرق التدريس',   color: '#10b981' },
  { title: 'توظيف الذكاء الاصطناعي في التقييم التكويني الفوري',           year: '2023', journal: 'مجلة تكنولوجيا التعليم',         color: '#8b5cf6' },
];

const stats = [
  { value: '500+', label: 'طالب علّمهم',    icon: Users },
  { value: '15+',  label: 'سنة خبرة',       icon: Calendar },
  { value: '12+',  label: 'بحث منشور',      icon: BookOpen },
  { value: '5+',   label: 'جوائز أكاديمية', icon: Award },
];

// ── Fade animation ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

// ── Component ─────────────────────────────────────────────────────────────
export default function AboutPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted]       = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* ── Background ─────────────────────────────────────────────────── */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 dark:bg-mesh-dark bg-mesh-light opacity-50" />
        <div className="absolute inset-0 grid-bg opacity-20" />
      </div>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <ArrowLeft size={16} className="rotate-180" />
            الرئيسية
          </Link>
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6 max-w-5xl mx-auto space-y-20">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <motion.section initial="hidden" animate="show" variants={stagger} className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
          {/* Avatar */}
          <motion.div variants={fadeUp} className="lg:col-span-2 flex justify-center">
            <div className="relative">
              <div className="w-52 h-52 rounded-3xl bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-emerald-500/30 border border-[var(--border)] flex items-center justify-center shadow-glow-blue">
                <GraduationCap size={72} className="text-blue-400 opacity-80" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 glass px-4 py-2 rounded-2xl border border-[var(--border)] shadow-card-dark">
                <p className="text-xs font-mono text-emerald-400">Ph.D. Candidate</p>
                <p className="text-xs text-[var(--text-muted)]">EdTech Specialist</p>
              </div>
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-glow-blue">
                <Star size={14} className="text-white" />
              </div>
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div variants={fadeUp} className="lg:col-span-3 space-y-5">
            <div>
              <span className="text-xs uppercase tracking-widest text-blue-400 font-mono">Founder & Developer</span>
              <h1 className="text-4xl font-display font-bold text-[var(--text-primary)] mt-2 leading-tight">
                منشئ منصة<br />
                <span className="gradient-text">EduVault LMS</span>
              </h1>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              متخصص في تكنولوجيا التعليم ومطور ويب متكامل، أعمل في مجال تصميم البيئات التعليمية الرقمية وتطوير
              نظم إدارة التعلم منذ أكثر من 15 عاماً. أجمع بين الخلفية الأكاديمية في علوم التربية والكفاءة التقنية
              في تطوير تطبيقات الويب الحديثة.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-blue-400" /> قنا، مصر</span>
              <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-emerald-400" /> جامعة جنوب الوادي</span>
              <span className="flex items-center gap-1.5"><Brain size={14} className="text-purple-400" /> Data Annotation Expert</span>
            </div>
            <div className="flex gap-3">
              <a href="mailto:contact@eduvault.app" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium shadow-glow-blue hover:opacity-90 transition-opacity">
                <Mail size={14} /> تواصل معنا
              </a>
              <a href="#" className="flex items-center justify-center w-10 h-10 rounded-xl glass border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <Linkedin size={16} />
              </a>
              <a href="#" className="flex items-center justify-center w-10 h-10 rounded-xl glass border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                <Github size={16} />
              </a>
            </div>
          </motion.div>
        </motion.section>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <section>
          <div className="glass-card p-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <Icon size={20} className="text-blue-400 mx-auto mb-2" />
                  <p className="text-3xl font-display font-bold gradient-text">{s.value}</p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">{s.label}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Experience ───────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-8">الخبرة المهنية</h2>
          <div className="space-y-5">
            {experience.map((exp, i) => (
              <motion.div
                key={exp.role}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-6 border-r-4"
                style={{ borderRightColor: exp.color }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-[var(--text-primary)]">{exp.role}</h3>
                    <p className="text-sm font-medium mt-0.5" style={{ color: exp.color }}>{exp.org}</p>
                  </div>
                  <div className="text-left">
                    <span className="text-xs px-3 py-1 rounded-full glass border border-[var(--border)] text-[var(--text-muted)]">
                      {exp.period}
                    </span>
                    <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1 justify-end">
                      <MapPin size={10} /> {exp.location}
                    </p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {exp.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                      <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: exp.color }} />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Skills ───────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-8">المهارات والتخصصات</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {skills.map((group, i) => (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5"
              >
                <h3 className="text-sm font-semibold mb-4" style={{ color: group.color }}>{group.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="text-xs px-3 py-1.5 rounded-lg font-mono"
                      style={{ background: `${group.color}15`, color: group.color, border: `1px solid ${group.color}30` }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Publications ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-8">أبرز الأبحاث المنشورة</h2>
          <div className="space-y-3">
            {publications.map((pub, i) => (
              <motion.div
                key={pub.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 flex items-start gap-4 hover:border-blue-500/30 transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${pub.color}20`, border: `1px solid ${pub.color}40` }}>
                  <BookOpen size={16} style={{ color: pub.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-blue-400 transition-colors">{pub.title}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{pub.journal} · {pub.year}</p>
                </div>
                <ExternalLink size={14} className="text-[var(--text-muted)] group-hover:text-blue-400 transition-colors mt-1 shrink-0" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section className="text-center py-10">
          <div className="glass-card p-10 inline-block w-full">
            <h3 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-3">جاهز لتجربة المنصة؟</h3>
            <p className="text-[var(--text-secondary)] mb-6">ادخل إلى لوحة التحكم واستكشف جميع ميزات EduVault LMS</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-glow-blue hover:opacity-90 transition-opacity"
            >
              دخول لوحة التحكم
              <ArrowLeft size={16} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

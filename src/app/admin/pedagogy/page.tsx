// src/app/admin/pedagogy/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Sparkles, CheckCircle, XCircle, AlertTriangle,
  ChevronDown, RefreshCw, Copy, Loader2, Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import type { ObjectiveAnalysis, BloomLevel } from '@/types';

// ── Bloom taxonomy data ──────────────────────────────────────────────────
const BLOOM_LEVELS: { level: BloomLevel; arabic: string; color: string; verbs: string[] }[] = [
  { level: 'Remember',   arabic: 'التذكر',   color: '#ef4444', verbs: ['يذكر','يعرّف','يسرد','يحدد','يسمّي'] },
  { level: 'Understand', arabic: 'الفهم',    color: '#f97316', verbs: ['يشرح','يوضح','يلخص','يفسر','يترجم'] },
  { level: 'Apply',      arabic: 'التطبيق',  color: '#eab308', verbs: ['يطبق','يستخدم','يحل','ينفذ','يجري'] },
  { level: 'Analyze',    arabic: 'التحليل',  color: '#22c55e', verbs: ['يحلل','يميز','يفصل','يفحص','يقارن'] },
  { level: 'Evaluate',   arabic: 'التقييم',  color: '#3b82f6', verbs: ['يقيّم','يحكم','يختار','يدافع','يبرر'] },
  { level: 'Create',     arabic: 'الإنشاء',  color: '#8b5cf6', verbs: ['يصمم','ينشئ','يبتكر','يؤلف','يطور'] },
];

// ── Mayer principles ─────────────────────────────────────────────────────
const MAYER_PRINCIPLES = [
  'مبدأ الوسائط المتعددة',
  'مبدأ القرب المكاني',
  'مبدأ القرب الزمني',
  'مبدأ الاتساق',
  'مبدأ الإشارة',
  'مبدأ التكرار',
  'مبدأ التجزئة',
  'مبدأ الأسبقية',
  'مبدأ شخصية المعلم',
  'مبدأ الصوت',
  'مبدأ الصورة',
  'مبدأ الفروق الفردية',
];

// ── Analyze objective using the API ─────────────────────────────────────
async function analyzeObjective(text: string): Promise<ObjectiveAnalysis> {
  const res = await fetch('/api/pedagogy/analyze', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ objective: text }),
  });
  if (!res.ok) throw new Error('فشل تحليل الهدف');
  const data = await res.json();
  return data.data as ObjectiveAnalysis;
}

// ── Bloom pyramid visual ─────────────────────────────────────────────────
function BloomPyramid({ active }: { active: BloomLevel | null }) {
  return (
    <div className="space-y-1">
      {[...BLOOM_LEVELS].reverse().map((b) => {
        const isActive = b.level === active;
        const width = {
          Create: 'w-full', Evaluate: 'w-5/6', Analyze: 'w-4/6',
          Apply: 'w-3/5', Understand: 'w-1/2', Remember: 'w-2/5',
        }[b.level];
        return (
          <div key={b.level} className="flex justify-center">
            <div
              className={clsx(
                'mx-auto px-4 py-2 rounded-lg transition-all duration-500 text-center',
                width,
                isActive ? 'opacity-100 scale-105' : 'opacity-40'
              )}
              style={{ background: isActive ? `${b.color}30` : 'var(--bg-secondary)', border: `1px solid ${isActive ? b.color : 'var(--border)'}` }}
            >
              <p className="text-xs font-semibold" style={{ color: b.color }}>{b.arabic}</p>
              <p className="text-[10px] text-[var(--text-muted)] font-mono">{b.level}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Quality score ring ────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r   = 36;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={96} height={96} className="-rotate-90">
        <circle cx={48} cy={48} r={r} fill="none" stroke="var(--bg-secondary)" strokeWidth={8} />
        <circle
          cx={48} cy={48} r={r} fill="none"
          stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-bold font-display" style={{ color }}>{score}</p>
        <p className="text-[10px] text-[var(--text-muted)]">/ 100</p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function PedagogyPage() {
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<ObjectiveAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'bloom' | 'mager' | 'mayer'>('bloom');

  async function handleAnalyze() {
    if (!input.trim()) { toast.error('أدخل هدفاً تعليمياً أولاً'); return; }
    setLoading(true);
    setResult(null);
    try {
      const analysis = await analyzeObjective(input.trim());
      setResult(analysis);
    } catch (e: any) {
      toast.error(e.message || 'حدث خطأ أثناء التحليل');
    } finally {
      setLoading(false);
    }
  }

  function copyImproved() {
    if (!result) return;
    navigator.clipboard.writeText(result.improvedObjective);
    toast.success('تم النسخ!');
  }

  const examples = [
    'يفهم الطالب مفهوم البرمجة الكائنية',
    'أن يكون الطالب قادراً على حل مسائل خوارزميات الفرز باستخدام Python في وقت لا يتجاوز 30 دقيقة',
    'تعلم قواعد SQL',
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/30 to-purple-700/10 border border-purple-500/20 flex items-center justify-center">
          <Brain size={22} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">المحرك التربوي</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            تحليل الأهداف التعليمية وتحويلها إلى أهداف سلوكية وفق Bloom & Mager & Mayer
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Input panel */}
        <div className="xl:col-span-2 space-y-4">
          <div className="glass-card p-6">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
              الهدف التعليمي المُدخَل
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={5}
              placeholder="اكتب هدفك التعليمي هنا…&#10;مثال: يفهم الطالب مفهوم البرمجة الكائنية"
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-glow resize-none"
            />

            <button
              onClick={handleAnalyze}
              disabled={loading || !input.trim()}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? 'جاري التحليل…' : 'تحليل الهدف'}
            </button>
          </div>

          {/* Examples */}
          <div className="glass-card p-5">
            <p className="text-xs font-semibold text-[var(--text-muted)] mb-3 uppercase tracking-wide">أمثلة للتجربة</p>
            <div className="space-y-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setInput(ex)}
                  className="w-full text-right text-xs text-[var(--text-secondary)] p-3 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--border)] transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Bloom pyramid */}
          <div className="glass-card p-5">
            <p className="text-sm font-semibold text-[var(--text-secondary)] mb-4">هرم بلوم المعرفي</p>
            <BloomPyramid active={result?.bloomLevel || null} />
          </div>
        </div>

        {/* Results panel */}
        <div className="xl:col-span-3">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]"
              >
                <Brain size={52} className="text-[var(--text-muted)] mb-4 opacity-30" />
                <p className="text-[var(--text-secondary)] font-medium">أدخل هدفاً تعليمياً للتحليل</p>
                <p className="text-xs text-[var(--text-muted)] mt-2">سيتم تحليله وفق نماذج Bloom و Mager و Mayer</p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-12 flex flex-col items-center justify-center h-full min-h-[400px]"
              >
                <div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin mb-4" />
                <p className="text-[var(--text-secondary)]">جاري التحليل التربوي…</p>
              </motion.div>
            )}

            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Score + Bloom level */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] mb-1">جودة الهدف التعليمي</p>
                      <ScoreRing score={result.qualityScore} />
                    </div>
                    <div className="text-left space-y-3">
                      <div>
                        <p className="text-xs text-[var(--text-muted)]">مستوى بلوم</p>
                        {(() => {
                          const b = BLOOM_LEVELS.find((l) => l.level === result.bloomLevel)!;
                          return (
                            <span className="inline-block mt-1 px-3 py-1.5 rounded-xl text-sm font-semibold" style={{ background: `${b.color}20`, color: b.color, border: `1px solid ${b.color}40` }}>
                              {b.arabic} · {result.bloomLevel}
                            </span>
                          );
                        })()}
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-muted)]">الفعل السلوكي</p>
                        <p className="text-sm font-mono font-semibold text-[var(--text-primary)] mt-1">{result.behavioralVerb}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="glass-card overflow-hidden">
                  <div className="flex border-b border-[var(--border)]">
                    {(['bloom', 'mager', 'mayer'] as const).map((tab) => {
                      const labels = { bloom: 'تحليل بلوم', mager: 'نموذج ماجر', mayer: 'مبادئ ماير' };
                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={clsx(
                            'flex-1 py-3 text-sm font-medium transition-colors',
                            activeTab === tab
                              ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/5'
                              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                          )}
                        >
                          {labels[tab]}
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-5">
                    {/* Bloom tab */}
                    {activeTab === 'bloom' && (
                      <div className="space-y-3">
                        <p className="text-xs text-[var(--text-muted)] mb-4">
                          الهدف ينتمي إلى مستوى <strong className="text-[var(--text-primary)]">{BLOOM_LEVELS.find((l) => l.level === result.bloomLevel)?.arabic}</strong> في هرم بلوم المعرفي
                        </p>
                        {BLOOM_LEVELS.map((b) => (
                          <div key={b.level} className={clsx('p-3 rounded-xl border transition-all', b.level === result.bloomLevel ? 'border-current' : 'border-[var(--border)]')} style={b.level === result.bloomLevel ? { borderColor: b.color, background: `${b.color}10` } : {}}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ background: b.color }} />
                                <span className="text-sm font-medium text-[var(--text-primary)]">{b.arabic}</span>
                                <span className="text-xs text-[var(--text-muted)] font-mono">{b.level}</span>
                              </div>
                              {b.level === result.bloomLevel && <CheckCircle size={16} style={{ color: b.color }} />}
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mt-1.5">{b.verbs.join(' · ')}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mager tab */}
                    {activeTab === 'mager' && (
                      <div className="space-y-4">
                        <p className="text-xs text-[var(--text-muted)] mb-2">نموذج ماجر يتطلب 3 مكوّنات في الهدف السلوكي</p>
                        {[
                          { key: 'behavior',  label: 'السلوك (Behavior)',     icon: '🎯' },
                          { key: 'condition', label: 'الشرط (Condition)',     icon: '⚙️' },
                          { key: 'criterion', label: 'المعيار (Criterion)',   icon: '📏' },
                        ].map(({ key, label, icon }) => {
                          const value = result.magerComponents[key as keyof typeof result.magerComponents];
                          const present = !!value && value !== false;
                          return (
                            <div key={key} className={clsx('p-4 rounded-xl border', present ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20')}>
                              <div className="flex items-center gap-2 mb-2">
                                <span>{icon}</span>
                                <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
                                {present ? <CheckCircle size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-red-400" />}
                              </div>
                              <p className={clsx('text-sm', present ? 'text-[var(--text-secondary)]' : 'text-red-400/70')}>
                                {present ? String(value) : 'غير موجود في الهدف'}
                              </p>
                            </div>
                          );
                        })}

                        {/* Improved objective */}
                        <div className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-blue-400">الهدف المُحسَّن</p>
                            <button onClick={copyImproved} className="text-xs flex items-center gap-1 text-[var(--text-muted)] hover:text-blue-400 transition-colors">
                              <Copy size={12} /> نسخ
                            </button>
                          </div>
                          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{result.improvedObjective}</p>
                        </div>
                      </div>
                    )}

                    {/* Mayer tab */}
                    {activeTab === 'mayer' && (
                      <div className="space-y-2">
                        <p className="text-xs text-[var(--text-muted)] mb-3">مبادئ ماير للوسائط المتعددة في المحتوى التعليمي</p>
                        {result.mayerPrinciples.map((p, i) => (
                          <div key={i} className={clsx('p-3 rounded-xl border flex items-start gap-3', p.satisfied ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20')}>
                            {p.satisfied
                              ? <CheckCircle size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                              : <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                            }
                            <div>
                              <p className="text-sm font-medium text-[var(--text-primary)]">{p.principle}</p>
                              <p className="text-xs text-[var(--text-muted)] mt-0.5">{p.suggestion}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

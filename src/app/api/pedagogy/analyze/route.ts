// src/app/api/pedagogy/analyze/route.ts
// POST /api/pedagogy/analyze
// Uses Claude (or rule-based fallback) to analyze learning objectives

import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { z } from 'zod';
import type { ObjectiveAnalysis, BloomLevel, MayerAnalysis } from '@/types';

const schema = z.object({
  objective: z.string().min(5).max(1000),
});

// ── Bloom verb taxonomy (Arabic + English) ───────────────────────────────
const BLOOM_VERBS: Record<BloomLevel, string[]> = {
  Remember:   ['يذكر', 'يعرّف', 'يسرد', 'يحدد', 'يسمّي', 'يُعيد', 'يكرر', 'recall', 'define', 'list', 'name'],
  Understand: ['يشرح', 'يوضح', 'يلخص', 'يفسر', 'يترجم', 'يصف', 'يعبّر', 'explain', 'describe', 'summarize'],
  Apply:      ['يطبق', 'يستخدم', 'يحل', 'ينفذ', 'يجري', 'يوظف', 'يُطبق', 'apply', 'use', 'solve', 'execute'],
  Analyze:    ['يحلل', 'يميز', 'يفصل', 'يفحص', 'يقارن', 'يكشف', 'analyze', 'distinguish', 'compare', 'examine'],
  Evaluate:   ['يقيّم', 'يحكم', 'يختار', 'يدافع', 'يبرر', 'ينتقد', 'evaluate', 'judge', 'defend', 'justify'],
  Create:     ['يصمم', 'ينشئ', 'يبتكر', 'يؤلف', 'يطور', 'يبني', 'يخطط', 'create', 'design', 'build', 'compose'],
};

const BLOOM_ORDER: BloomLevel[] = ['Create', 'Evaluate', 'Analyze', 'Apply', 'Understand', 'Remember'];

const MAYER_PRINCIPLES: { name: string; check: (obj: string) => boolean; suggestion: string }[] = [
  { name: 'مبدأ الوسائط المتعددة',  check: (o) => /صورة|فيديو|رسم|مخطط|مرئي|visual|image|diagram/i.test(o), suggestion: 'أضف إشارة إلى وسيلة بصرية مرافقة للمحتوى' },
  { name: 'مبدأ القرب المكاني',     check: (o) => /بجانب|قريب|متجاور|adjacent|next to/i.test(o),             suggestion: 'تأكد من وضع النص والصورة بالقرب من بعضهما' },
  { name: 'مبدأ القرب الزمني',      check: (o) => /في نفس الوقت|متزامن|simultaneously|same time/i.test(o),   suggestion: 'اعرض المواد المرتبطة في نفس الوقت' },
  { name: 'مبدأ الاتساق',           check: (o) => !/زخرفة|إضافات|ترفيه|decoration/i.test(o),                 suggestion: 'تجنب إضافة مواد ترفيهية غير ذات صلة بالهدف' },
  { name: 'مبدأ الإشارة',           check: (o) => /يبرز|يُشير|يُلفت|highlight|signal|emphasize/i.test(o),     suggestion: 'أضف إشارات بصرية لتوجيه انتباه المتعلم' },
  { name: 'مبدأ التكرار',           check: (o) => /يكرر|يعيد|مرة أخرى|repeat|redundant/i.test(o),            suggestion: 'تجنب تكرار نفس المعلومات في وسيلتين' },
  { name: 'مبدأ التجزئة',          check: (o) => /خطوة|جزء|مرحلة|step|segment|chunk/i.test(o),              suggestion: 'قسّم المحتوى إلى وحدات صغيرة قابلة للهضم' },
  { name: 'مبدأ الفروق الفردية',    check: (o) => /مبتدئ|متقدم|مستوى|beginner|advanced|level/i.test(o),       suggestion: 'راعِ الفروق الفردية بين المتعلمين في التصميم' },
];

// ── Rule-based analyzer (fallback when no AI key configured) ─────────────
function analyzeRuleBased(objective: string): ObjectiveAnalysis {
  const words = objective.split(/\s+/);

  // Detect bloom level
  let detectedLevel: BloomLevel = 'Understand';
  let detectedVerb = 'يفهم';

  for (const level of BLOOM_ORDER) {
    for (const verb of BLOOM_VERBS[level]) {
      if (objective.includes(verb)) {
        detectedLevel = level;
        detectedVerb  = verb;
        break;
      }
    }
  }

  // Mager components
  const hasBehavior  = BLOOM_ORDER.some((l) => BLOOM_VERBS[l].some((v) => objective.includes(v)));
  const hasCondition = /باستخدام|بمساعدة|دون|مع|في|خلال|using|with|without|during/i.test(objective);
  const hasCriterion = /\d+|دقيقة|ساعة|بدقة|بصورة|نسبة|٪|%|minute|hour|accurately|correctly/i.test(objective);

  const magerComponents = {
    behavior:   hasBehavior  ? detectedVerb + ' ' + (words.slice(1, 5).join(' ')) : null,
    condition:  hasCondition ? objective.match(/(باستخدام|بمساعدة|دون|مع|في خلال)[^،.،]+/)?.[0] || null : null,
    criterion:  hasCriterion ? objective.match(/\d+[^،.]*|بدقة[^،.]*/)?.[0] || null : null,
    isComplete: hasBehavior && hasCondition && hasCriterion,
  };

  // Build improved objective
  const improveParts: string[] = [];
  if (!hasBehavior)  improveParts.push('أن [يضيف فعلاً سلوكياً قابلاً للقياس]');
  if (!hasCondition) improveParts.push('باستخدام [الأداة أو الشرط]');
  if (!hasCriterion) improveParts.push('في [مدة زمنية أو معيار دقيق]');

  const improvedObjective = magerComponents.isComplete
    ? objective
    : `${objective}${improveParts.length > 0 ? ' — اقتراح: ' + improveParts.join('، ') : ''}`;

  // Mayer analysis
  const mayerPrinciples: MayerAnalysis[] = MAYER_PRINCIPLES.map((p) => ({
    principle: p.name,
    satisfied: p.check(objective),
    suggestion: p.suggestion,
  }));

  const metMayer = mayerPrinciples.filter((m) => m.satisfied).length;

  // Quality score
  const bloomScore  = { Remember: 20, Understand: 35, Apply: 55, Analyze: 70, Evaluate: 85, Create: 100 }[detectedLevel];
  const magerScore  = [hasBehavior, hasCondition, hasCriterion].filter(Boolean).length * 15;
  const mayerScore  = Math.round((metMayer / MAYER_PRINCIPLES.length) * 25);
  const qualityScore = Math.min(100, Math.round(bloomScore * 0.4 + magerScore + mayerScore));

  return {
    original:          objective,
    bloomLevel:        detectedLevel,
    magerComponents,
    behavioralVerb:    detectedVerb,
    improvedObjective,
    mayerPrinciples,
    qualityScore,
  };
}

// ── Route handler ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Auth check
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, error: 'غير مصرّح' }, { status: 401 });

  let body: { objective: string };
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ success: false, error: 'بيانات غير صالحة' }, { status: 400 });
  }

  // Use rule-based analysis (you can swap with Anthropic/OpenAI API call here)
  const analysis = analyzeRuleBased(body.objective);

  return NextResponse.json({ success: true, data: analysis });
}

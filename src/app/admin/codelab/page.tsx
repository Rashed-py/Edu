// src/app/admin/codelab/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2, Copy, Check, ChevronDown, ChevronUp,
  BookOpen, Cpu, Search, Tag, Plus, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import type { CodeSnippet } from '@/types';

// ── Syntax highlighter (lightweight, no import issues) ───────────────────
function highlight(code: string, lang: 'cpp' | 'python') {
  const escHtml = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const keywords = lang === 'cpp'
    ? ['int','float','double','char','bool','void','string','if','else','for','while','do','return','class','struct','public','private','protected','namespace','include','using','std','cout','cin','endl','auto','const','static','new','delete','nullptr','true','false','template','typename']
    : ['def','class','if','else','elif','for','while','return','import','from','as','True','False','None','and','or','not','in','is','lambda','try','except','finally','with','yield','pass','break','continue','print','range','len','int','str','float','list','dict','tuple','set'];

  const lines = code.split('\n').map((line) => {
    let html = escHtml(line);
    // Comments
    if (lang === 'cpp') {
      html = html.replace(/(\/\/.*$)/g, '<span class="code-comment">$1</span>');
      html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>');
      html = html.replace(/(#include\s*&lt;.*?&gt;|#include\s*".*?")/g, '<span class="code-include">$1</span>');
    } else {
      html = html.replace(/(#.*$)/g, '<span class="code-comment">$1</span>');
    }
    // Strings
    html = html.replace(/(&quot;.*?&quot;|&#x27;.*?&#x27;)/g, '<span class="code-string">$1</span>');
    // Numbers
    html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="code-number">$1</span>');
    // Keywords
    keywords.forEach((kw) => {
      const re = new RegExp(`\\b(${kw})\\b`, 'g');
      html = html.replace(re, '<span class="code-keyword">$1</span>');
    });
    // Functions
    html = html.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, '<span class="code-function">$1</span>');
    return html;
  });

  return lines.join('\n');
}

// ── Sample snippets ──────────────────────────────────────────────────────
const SNIPPETS: CodeSnippet[] = [
  {
    id: '1',
    title: 'مرحباً بالعالم — C++',
    language: 'cpp',
    difficulty: 'beginner',
    tags: ['مقدمة', 'iostream', 'hello-world'],
    createdAt: '2024-07-01T00:00:00Z',
    explanation: 'أبسط برنامج في لغة C++. يتضمن مكتبة iostream للإدخال والإخراج، ثم يستخدم cout لطباعة رسالة ترحيبية على الشاشة.',
    code: `#include <iostream>
using namespace std;

int main() {
    cout << "مرحباً بالعالم!" << endl;
    cout << "Hello, World!" << endl;
    return 0;
}`,
  },
  {
    id: '2',
    title: 'فرز الفقاعات — C++',
    language: 'cpp',
    difficulty: 'intermediate',
    tags: ['خوارزميات', 'فرز', 'مصفوفات'],
    createdAt: '2024-07-02T00:00:00Z',
    explanation: 'خوارزمية فرز الفقاعات (Bubble Sort) — تتحرك خلال القائمة وتُقارن كل عنصرين متجاورين وتُبادل بينهما إذا كان الترتيب خاطئاً. التعقيد الزمني: O(n²).',
    code: `#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap elements
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

int main() {
    vector<int> data = {64, 34, 25, 12, 22, 11, 90};
    
    cout << "قبل الفرز: ";
    for (int x : data) cout << x << " ";
    cout << endl;
    
    bubbleSort(data);
    
    cout << "بعد الفرز: ";
    for (int x : data) cout << x << " ";
    cout << endl;
    
    return 0;
}`,
  },
  {
    id: '3',
    title: 'قوائم وتعامل مع البيانات — Python',
    language: 'python',
    difficulty: 'beginner',
    tags: ['قوائم', 'حلقات', 'list'],
    createdAt: '2024-07-03T00:00:00Z',
    explanation: 'مثال شامل على إنشاء القوائم واستخدام حلقات for والتعامل مع البيانات في Python بطريقة بسيطة وواضحة.',
    code: `# قائمة بدرجات الطلاب
grades = [85, 92, 78, 96, 61, 73, 88, 55, 90, 84]

# حساب المتوسط
average = sum(grades) / len(grades)
print(f"متوسط الدرجات: {average:.2f}")

# أعلى وأدنى درجة
print(f"أعلى درجة: {max(grades)}")
print(f"أدنى درجة: {min(grades)}")

# الطلاب الناجحون (أكثر من 60)
passing = [g for g in grades if g >= 60]
print(f"عدد الناجحين: {len(passing)} من {len(grades)}")

# تصنيف الدرجات
def get_grade(score):
    if score >= 90: return "ممتاز"
    elif score >= 80: return "جيد جداً"
    elif score >= 70: return "جيد"
    elif score >= 60: return "مقبول"
    else: return "راسب"

# طباعة تقرير
print("\\nتقرير الدرجات:")
for i, grade in enumerate(grades, 1):
    print(f"  الطالب {i:02d}: {grade} — {get_grade(grade)}")`,
  },
  {
    id: '4',
    title: 'برمجة كائنية — Python',
    language: 'python',
    difficulty: 'intermediate',
    tags: ['OOP', 'كلاسات', 'تغليف'],
    createdAt: '2024-07-04T00:00:00Z',
    explanation: 'مثال على البرمجة الكائنية التوجه (OOP) في Python — تعريف كلاس Student مع خصائص وطرق، ودالة بانية __init__ وطرق لحساب المتوسط وعرض المعلومات.',
    code: `class Student:
    """نموذج طالب في نظام LMS"""
    
    def __init__(self, name: str, student_id: str):
        self.name       = name
        self.student_id = student_id
        self.grades     = {}
        self.courses    = []
    
    def add_grade(self, subject: str, grade: float) -> None:
        """إضافة درجة لمادة معينة"""
        if not 0 <= grade <= 100:
            raise ValueError("الدرجة يجب أن تكون بين 0 و 100")
        self.grades[subject] = grade
    
    def enroll(self, course: str) -> None:
        """تسجيل في مقرر دراسي"""
        if course not in self.courses:
            self.courses.append(course)
            print(f"تم تسجيل {self.name} في {course}")
    
    @property
    def gpa(self) -> float:
        """حساب المعدل التراكمي"""
        if not self.grades:
            return 0.0
        return sum(self.grades.values()) / len(self.grades)
    
    def __str__(self) -> str:
        return (
            f"الطالب: {self.name} ({self.student_id})\\n"
            f"المقررات: {', '.join(self.courses) or 'لا يوجد'}\\n"
            f"المعدل: {self.gpa:.1f}"
        )

# الاستخدام
student = Student("أحمد محمد", "S2024001")
student.enroll("البرمجة بـ Python")
student.enroll("قواعد البيانات")
student.add_grade("البرمجة بـ Python", 92.5)
student.add_grade("قواعد البيانات", 87.0)

print(student)
print(f"\\nحالة النجاح: {'ناجح ✓' if student.gpa >= 60 else 'راسب ✗'}")`,
  },
];

const DIFF_LABELS: Record<string, { label: string; color: string }> = {
  beginner:     { label: 'مبتدئ',     color: 'bg-emerald-500/15 text-emerald-400' },
  intermediate: { label: 'متوسط',     color: 'bg-amber-500/15 text-amber-400'    },
  advanced:     { label: 'متقدم',     color: 'bg-red-500/15 text-red-400'        },
};

// ── Code block component ─────────────────────────────────────────────────
function CodeBlock({ snippet }: { snippet: CodeSnippet }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied]     = useState(false);

  function copy() {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    toast.success('تم نسخ الكود!');
    setTimeout(() => setCopied(false), 2000);
  }

  const highlighted = highlight(snippet.code, snippet.language as 'cpp' | 'python');
  const lines       = snippet.code.split('\n');
  const showLines   = expanded ? lines : lines.slice(0, 12);

  const langColors = { cpp: '#3383f6', python: '#10b981', javascript: '#f59e0b', typescript: '#8b5cf6' };
  const langColor  = langColors[snippet.language] || '#3383f6';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${langColor}20`, border: `1px solid ${langColor}40` }}>
            <Code2 size={16} style={{ color: langColor }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{snippet.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: `${langColor}20`, color: langColor }}>
                {snippet.language.toUpperCase()}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${DIFF_LABELS[snippet.difficulty].color}`}>
                {DIFF_LABELS[snippet.difficulty].label}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--bg-secondary)]"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          {copied ? 'تم النسخ' : 'نسخ'}
        </button>
      </div>

      {/* Explanation */}
      <div className="px-5 py-3 bg-[var(--bg-secondary)]/50 border-b border-[var(--border)]">
        <div className="flex items-start gap-2">
          <BookOpen size={13} className="text-[var(--text-muted)] mt-0.5 shrink-0" />
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{snippet.explanation}</p>
        </div>
      </div>

      {/* Code */}
      <div className="relative" dir="ltr">
        <div className="overflow-x-auto">
          <pre className="p-5 text-[13px] leading-6 font-mono">
            <code
              dangerouslySetInnerHTML={{
                __html: showLines.map((line, i) =>
                  `<span class="code-line-num">${String(i + 1).padStart(3, ' ')}</span>  ${highlight(line, snippet.language as 'cpp' | 'python')}`
                ).join('\n')
              }}
            />
            {!expanded && lines.length > 12 && (
              <span className="block text-[var(--text-muted)] text-xs mt-2">... {lines.length - 12} أسطر مخفية</span>
            )}
          </pre>
        </div>

        {/* Expand/collapse */}
        {lines.length > 12 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors bg-[var(--bg-card)] px-3 py-1 rounded-full border border-[var(--border)]"
          >
            {expanded ? <><ChevronUp size={12} /> طيّ الكود</> : <><ChevronDown size={12} /> عرض الكل ({lines.length} سطراً)</>}
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="px-5 py-3 border-t border-[var(--border)] flex flex-wrap gap-1.5">
        {snippet.tags.map((tag) => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)] flex items-center gap-1">
            <Tag size={8} />
            {tag}
          </span>
        ))}
      </div>

      <style jsx global>{`
        .code-line-num   { color: var(--text-muted); user-select: none; }
        .code-keyword    { color: #c792ea; font-weight: 600; }
        .code-string     { color: #c3e88d; }
        .code-number     { color: #f78c6c; }
        .code-comment    { color: #546e7a; font-style: italic; }
        .code-function   { color: #82aaff; }
        .code-include    { color: #89ddff; }
      `}</style>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function CodeLabPage() {
  const [snippets]                = useState<CodeSnippet[]>(SNIPPETS);
  const [search, setSearch]       = useState('');
  const [filterLang, setLang]     = useState('all');
  const [filterDiff, setDiff]     = useState('all');

  const filtered = snippets.filter((s) => {
    const matchSearch = s.title.includes(search) || s.tags.some((t) => t.includes(search));
    const matchLang   = filterLang === 'all' || s.language === filterLang;
    const matchDiff   = filterDiff === 'all' || s.difficulty === filterDiff;
    return matchSearch && matchLang && matchDiff;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-700/10 border border-emerald-500/20 flex items-center justify-center">
          <Code2 size={22} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">مختبر الأكواد</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">شروحات C++ و Python مع تلوين الكود وإمكانية النسخ الفوري</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في الأكواد…"
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-glow"
          />
        </div>
        <select value={filterLang} onChange={(e) => setLang(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none">
          <option value="all">كل اللغات</option>
          <option value="cpp">C++</option>
          <option value="python">Python</option>
        </select>
        <select value={filterDiff} onChange={(e) => setDiff(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none">
          <option value="all">كل المستويات</option>
          <option value="beginner">مبتدئ</option>
          <option value="intermediate">متوسط</option>
          <option value="advanced">متقدم</option>
        </select>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5"><Cpu size={12} className="text-blue-400" /> C++: {snippets.filter(s=>s.language==='cpp').length} أكواد</span>
        <span className="flex items-center gap-1.5"><Code2 size={12} className="text-emerald-400" /> Python: {snippets.filter(s=>s.language==='python').length} أكواد</span>
        <span className="mr-auto">{filtered.length} نتيجة</span>
      </div>

      {/* Snippets */}
      <div className="space-y-5">
        {filtered.map((s) => (
          <CodeBlock key={s.id} snippet={s} />
        ))}
        {filtered.length === 0 && (
          <div className="glass-card py-16 text-center">
            <Code2 size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
            <p className="text-[var(--text-secondary)]">لا توجد أكواد مطابقة للبحث</p>
          </div>
        )}
      </div>
    </div>
  );
}

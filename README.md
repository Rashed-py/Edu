# 🎓 EduVault LMS — نظام إدارة التعلم الذكي

> منصة تعليمية متكاملة مبنية بـ Next.js 14، Firebase، و Tailwind CSS  
> جامعة جنوب الوادي · South Valley University

## ✨ الميزات الرئيسية

| الوحدة | الوصف |
|--------|-------|
| 🔐 **The Vault** | نظام مصادقة آمن بـ JWT + bcrypt + Rate Limiting |
| 📊 **Dashboard** | لوحة تحكم بمخططات Recharts تفاعلية |
| 👥 **Users** | إدارة الطلاب والمجموعات والصلاحيات |
| 🧠 **Pedagogy Engine** | تحليل الأهداف وفق Bloom & Mager & Mayer |
| 💻 **Code Lab** | شروحات C++ و Python مع syntax highlighting |
| 📁 **File Manager** | رفع وإدارة الملفات عبر Firebase Storage |
| 👤 **About** | صفحة Portfolio للمؤسس |

## 🛠 المكدس التقني

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS + CSS Variables (Dark/Light Mode)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Backend**: Next.js API Routes (Serverless)
- **Database**: Firebase Firestore
- **Auth**: Firebase Auth + JWT (HTTP-only cookies)
- **Storage**: Firebase Storage
- **Security**: bcrypt, jose (JWT), Zod validation, CSP
- **Deployment**: Vercel

## 🚀 بدء التشغيل

```bash
# 1. استنساخ المشروع
git clone https://github.com/yourusername/eduvault-lms.git
cd eduvault-lms

# 2. تثبيت الاعتماديات
npm install

# 3. إعداد متغيرات البيئة
cp .env.example .env.local
# عدّل .env.local بقيمك الحقيقية

# 4. تشغيل بيئة التطوير
npm run dev

# 5. فتح المتصفح على
# http://localhost:3000
```

## 🔑 الصفحات

| المسار | الوصف |
|--------|-------|
| `/` | الصفحة الرئيسية |
| `/auth/login` | دخول الأدمن (The Vault) |
| `/about` | About the Founder |
| `/admin/dashboard` | لوحة التحكم |
| `/admin/users` | إدارة المستخدمين |
| `/admin/files` | إدارة الملفات |
| `/admin/pedagogy` | المحرك التربوي |
| `/admin/codelab` | مختبر الأكواد |

## 🔒 الأمان

- JWT في HTTP-only cookies (لا يمكن الوصول إليها من JavaScript)
- bcrypt لتشفير كلمة مرور الأدمن
- Rate limiting لمنع هجمات Brute Force
- Zod validation لجميع API inputs
- Edge Middleware لحماية المسارات
- Firebase Security Rules لحماية قاعدة البيانات

## 📦 النشر على Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

أضف متغيرات البيئة في Vercel Dashboard → Settings → Environment Variables

## 📚 مزيد من المعلومات

راجع ملف [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) للتعليمات التفصيلية الخطوة بخطوة.

---

**المطور**: EduVault LMS Team · جامعة جنوب الوادي  
**الترخيص**: MIT

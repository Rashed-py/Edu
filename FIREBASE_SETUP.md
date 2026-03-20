# 🔥 دليل إعداد Firebase — EduVault LMS

## الخطوة 1: إنشاء مشروع Firebase

1. اذهب إلى [https://console.firebase.google.com](https://console.firebase.google.com)
2. انقر **Add project** واختر اسم المشروع، مثلاً: `eduvault-lms`
3. فعّل أو أوقف Google Analytics حسب احتياجك
4. انتظر حتى ينتهي إنشاء المشروع

---

## الخطوة 2: إعداد Firebase Authentication

1. من القائمة الجانبية: **Build → Authentication**
2. انقر **Get started**
3. فعّل **Email/Password** provider:
   - انقر **Sign-in method**
   - اختر **Email/Password**
   - فعّل المفتاح الأول
   - احفظ

---

## الخطوة 3: إعداد Firestore Database

1. من القائمة الجانبية: **Build → Firestore Database**
2. انقر **Create database**
3. اختر **Start in production mode**
4. اختر أقرب **Cloud Firestore location** (مثلاً `europe-west1` لمنطقة MENA)
5. انقر **Done**

### قواعد الأمان (Firestore Rules)
انسخ هذه القواعد إلى **Firestore → Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection — only admin can write
    match /users/{userId} {
      allow read:  if request.auth != null && 
                      (request.auth.uid == userId || 
                       request.auth.token.role == 'admin' || 
                       request.auth.token.role == 'super_admin');
      allow write: if request.auth != null && 
                      (request.auth.token.role == 'admin' || 
                       request.auth.token.role == 'super_admin');
    }
    
    // Files collection
    match /files/{fileId} {
      allow read:  if request.auth != null;
      allow write: if request.auth != null && 
                      (request.auth.token.role == 'admin' || 
                       request.auth.token.role == 'super_admin' ||
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.permissions.canUploadFiles == true);
    }
    
    // Groups collection
    match /groups/{groupId} {
      allow read:  if request.auth != null;
      allow write: if request.auth != null && 
                      (request.auth.token.role == 'admin' || 
                       request.auth.token.role == 'super_admin');
    }
    
    // Courses and lessons
    match /courses/{courseId} {
      allow read:  if request.auth != null;
      allow write: if request.auth != null && 
                      (request.auth.token.role == 'admin' || 
                       request.auth.token.role == 'super_admin' ||
                       request.auth.token.role == 'instructor');
    }
  }
}
```

---

## الخطوة 4: إعداد Firebase Storage

1. من القائمة الجانبية: **Build → Storage**
2. انقر **Get started**
3. اختر **Start in production mode**
4. اختر نفس المنطقة المختارة في Firestore
5. انقر **Done**

### قواعد Storage:
انسخ في **Storage → Rules**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Public read for all authenticated users
    match /uploads/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      request.resource.size < 500 * 1024 * 1024 && // Max 500MB
                      (request.auth.token.role == 'admin' ||
                       request.auth.token.role == 'super_admin' ||
                       firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.permissions.canUploadFiles == true);
      allow delete: if request.auth != null && 
                       (request.auth.token.role == 'admin' ||
                        request.auth.token.role == 'super_admin');
    }
  }
}
```

---

## الخطوة 5: الحصول على مفاتيح Client SDK

1. اذهب إلى **Project Settings** (أيقونة الترس)
2. في قسم **Your apps**، انقر **Add app → Web** `</>`
3. أدخل اسم التطبيق واضغط **Register app**
4. انسخ الـ `firebaseConfig` object
5. الصق القيم في ملف `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## الخطوة 6: إنشاء Service Account (للـ Admin SDK)

1. اذهب إلى **Project Settings → Service accounts**
2. انقر **Generate new private key**
3. سيُنزَّل ملف JSON
4. افتح الملف وانسخ القيم التالية إلى `.env.local`:

```bash
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

> **تحذير**: لا تشارك هذا الملف أبداً ولا ترفعه على GitHub

---

## الخطوة 7: إعداد بيانات المدير (Admin Credentials)

### توليد bcrypt hash لكلمة مرور الأدمن:

```bash
# تثبيت bcryptjs مؤقتاً
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_STRONG_PASSWORD', 12).then(h => console.log(h));"
```

ثم في `.env.local`:
```bash
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD_HASH=$2b$12$GENERATED_HASH_HERE
ADMIN_JWT_SECRET=your-super-secret-key-at-least-32-characters-long
```

---

## الخطوة 8: النشر على Vercel

```bash
# 1. تثبيت Vercel CLI
npm i -g vercel

# 2. تسجيل الدخول
vercel login

# 3. الاتصال بمشروعك
cd lms
vercel

# 4. إضافة متغيرات البيئة
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add FIREBASE_ADMIN_PRIVATE_KEY
# ... أضف كل المتغيرات من .env.local

# 5. النشر النهائي
vercel --prod
```

أو استخدم واجهة Vercel:
1. ادفع الكود إلى GitHub
2. اربط المشروع في [vercel.com](https://vercel.com)
3. أضف متغيرات البيئة في **Settings → Environment Variables**
4. انشر تلقائياً عند كل push

---

## الخطوة 9: التشغيل المحلي

```bash
# نسخ ملف البيئة
cp .env.example .env.local

# تعديل القيم في .env.local بقيمك الحقيقية

# تثبيت الاعتماديات
npm install

# تشغيل بيئة التطوير
npm run dev
```

سيعمل المشروع على [http://localhost:3000](http://localhost:3000)

---

## بنية قواعد البيانات (Firestore Collections)

```
firestore/
├── users/
│   └── {uid}/
│       ├── uid: string
│       ├── email: string
│       ├── displayName: string
│       ├── role: 'student' | 'instructor' | 'admin'
│       ├── groupIds: string[]
│       ├── permissions: { canUploadFiles, canWatchVideos, ... }
│       ├── isActive: boolean
│       └── createdAt: string
│
├── files/
│   └── {fileId}/
│       ├── name: string
│       ├── type: 'video' | 'presentation' | 'document' | 'image'
│       ├── url: string (Firebase Storage URL)
│       ├── size: number
│       ├── uploadedBy: string (uid)
│       └── createdAt: string
│
├── groups/
│   └── {groupId}/
│       ├── name: string
│       ├── description: string
│       ├── color: string
│       ├── studentIds: string[]
│       └── courseIds: string[]
│
└── courses/
    └── {courseId}/
        ├── title: string
        ├── description: string
        ├── modules: Module[]
        └── groupIds: string[]
```

---

## هيكل الملفات النهائي

```
lms/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout + ThemeProvider
│   │   ├── page.tsx                # الصفحة الرئيسية
│   │   ├── globals.css             # CSS variables + utilities
│   │   ├── auth/login/page.tsx     # صفحة دخول الأدمن (The Vault)
│   │   ├── about/page.tsx          # صفحة About the Founder
│   │   ├── admin/
│   │   │   ├── layout.tsx          # Admin layout + auth guard
│   │   │   ├── dashboard/page.tsx  # لوحة التحكم مع الرسوم البيانية
│   │   │   ├── users/page.tsx      # إدارة المستخدمين
│   │   │   ├── files/page.tsx      # رفع وإدارة الملفات
│   │   │   ├── pedagogy/page.tsx   # المحرك التربوي
│   │   │   └── codelab/page.tsx    # مختبر الأكواد
│   │   └── api/
│   │       ├── auth/admin-login/route.ts
│   │       ├── auth/logout/route.ts
│   │       ├── users/route.ts
│   │       └── pedagogy/analyze/route.ts
│   ├── components/
│   │   └── admin/
│   │       ├── AdminSidebar.tsx
│   │       └── AdminHeader.tsx
│   ├── lib/
│   │   ├── firebase.ts             # Firebase Client SDK
│   │   ├── firebase-admin.ts       # Firebase Admin SDK (server only)
│   │   └── auth.ts                 # JWT utilities
│   ├── types/index.ts              # TypeScript types
│   └── middleware.ts               # Edge middleware (route protection)
├── .env.example                    # Template for environment variables
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

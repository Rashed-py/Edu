// src/types/index.ts
// Central type definitions for Intelligent LMS

// ── User & Auth ───────────────────────────────────────────────────────────
export type UserRole = 'student' | 'instructor' | 'admin' | 'super_admin';

export interface LMSUser {
  uid:          string;
  email:        string;
  displayName:  string;
  photoURL?:    string;
  role:         UserRole;
  groupIds:     string[];
  permissions:  UserPermissions;
  createdAt:    string;   // ISO date
  lastLoginAt?: string;
  isActive:     boolean;
}

export interface UserPermissions {
  canUploadFiles:    boolean;
  canWatchVideos:    boolean;
  canAccessCodeLab:  boolean;
  canViewAnalytics:  boolean;
}

// ── Groups ────────────────────────────────────────────────────────────────
export interface Group {
  id:          string;
  name:        string;
  description: string;
  color:       string;
  studentIds:  string[];
  courseIds:   string[];
  createdAt:   string;
}

// ── Courses & Content ─────────────────────────────────────────────────────
export interface Course {
  id:          string;
  title:       string;
  description: string;
  coverImage?: string;
  modules:     Module[];
  groupIds:    string[];
  createdAt:   string;
  updatedAt:   string;
}

export interface Module {
  id:       string;
  title:    string;
  lessons:  Lesson[];
  order:    number;
}

export interface Lesson {
  id:          string;
  title:       string;
  type:        'video' | 'document' | 'code' | 'quiz';
  content:     string;   // Firestore doc or Storage URL
  duration?:   number;   // minutes
  order:       number;
  isPublished: boolean;
}

// ── Files & Storage ───────────────────────────────────────────────────────
export interface UploadedFile {
  id:           string;
  name:         string;
  originalName: string;
  type:         'video' | 'presentation' | 'document' | 'image' | 'other';
  mimeType:     string;
  size:         number;   // bytes
  url:          string;
  storagePath:  string;
  uploadedBy:   string;
  groupIds:     string[];
  createdAt:    string;
}

// ── Pedagogy Engine ───────────────────────────────────────────────────────
export interface ObjectiveAnalysis {
  original:          string;
  bloomLevel:        BloomLevel;
  magerComponents:   MagerComponents;
  behavioralVerb:    string;
  improvedObjective: string;
  mayerPrinciples:   MayerAnalysis[];
  qualityScore:      number;   // 0–100
}

export type BloomLevel =
  | 'Remember'
  | 'Understand'
  | 'Apply'
  | 'Analyze'
  | 'Evaluate'
  | 'Create';

export interface MagerComponents {
  behavior:  string | null;
  condition: string | null;
  criterion: string | null;
  isComplete: boolean;
}

export interface MayerAnalysis {
  principle:   string;
  satisfied:   boolean;
  suggestion:  string;
}

// ── Analytics ─────────────────────────────────────────────────────────────
export interface StudentProgress {
  userId:          string;
  courseId:        string;
  completedLessons: string[];
  quizScores:      Record<string, number>;
  timeSpent:       number;   // minutes
  lastAccessedAt:  string;
  progressPercent: number;
}

export interface DashboardStats {
  totalStudents:    number;
  activeStudents:   number;
  totalFiles:       number;
  totalCourses:     number;
  storageUsed:      number;   // bytes
  recentActivity:   ActivityItem[];
}

export interface ActivityItem {
  id:        string;
  type:      'user_joined' | 'file_uploaded' | 'course_started' | 'objective_created';
  userId?:   string;
  userName?: string;
  detail:    string;
  createdAt: string;
}

// ── Code Lab ──────────────────────────────────────────────────────────────
export interface CodeSnippet {
  id:          string;
  title:       string;
  language:    'cpp' | 'python' | 'javascript' | 'typescript';
  code:        string;
  explanation: string;
  tags:        string[];
  difficulty:  'beginner' | 'intermediate' | 'advanced';
  createdAt:   string;
}

// ── API Responses ─────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?:   T;
  error?:  string;
  message?: string;
}

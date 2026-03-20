// src/app/admin/files/page.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FolderOpen, FileVideo, FileText, Image,
  Trash2, Download, Copy, Search, Filter, Cloud,
  CheckCircle, Loader2, X, Eye, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import type { UploadedFile } from '@/types';

// ── File type helpers ────────────────────────────────────────────────────
function getFileType(mime: string): UploadedFile['type'] {
  if (mime.startsWith('video/'))       return 'video';
  if (mime.includes('presentation') || mime.includes('powerpoint') || mime.endsWith('.pptx')) return 'presentation';
  if (mime.startsWith('image/'))       return 'image';
  if (mime.startsWith('application/') || mime.startsWith('text/')) return 'document';
  return 'other';
}

const FILE_ICONS: Record<UploadedFile['type'], { Icon: React.ElementType; color: string; bg: string }> = {
  video:        { Icon: FileVideo, color: 'text-blue-400',   bg: 'bg-blue-500/15 border-blue-500/20' },
  presentation: { Icon: FileText,  color: 'text-amber-400',  bg: 'bg-amber-500/15 border-amber-500/20' },
  document:     { Icon: FileText,  color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/20' },
  image:        { Icon: Image,     color: 'text-emerald-400',bg: 'bg-emerald-500/15 border-emerald-500/20' },
  other:        { Icon: FolderOpen,color: 'text-gray-400',   bg: 'bg-gray-500/15 border-gray-500/20' },
};

function formatBytes(bytes: number) {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1048576)    return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Upload progress item ─────────────────────────────────────────────────
interface UploadJob {
  id:       string;
  name:     string;
  progress: number;
  status:   'uploading' | 'done' | 'error';
}

// ── Mock initial files (replace with Firestore fetch) ────────────────────
const MOCK_FILES: UploadedFile[] = [
  { id: 'f1', name: 'محاضرة_01.pptx',    originalName: 'محاضرة_01.pptx',    type: 'presentation', mimeType: 'application/vnd.ms-powerpoint', size: 3145728,  url: '#', storagePath: 'uploads/f1.pptx', uploadedBy: 'admin', groupIds: ['group-a'], createdAt: '2024-07-01T10:00:00Z' },
  { id: 'f2', name: 'شرح_C++.mp4',       originalName: 'شرح_C++.mp4',       type: 'video',        mimeType: 'video/mp4',                     size: 524288000, url: '#', storagePath: 'uploads/f2.mp4',  uploadedBy: 'admin', groupIds: ['group-a','group-b'], createdAt: '2024-07-03T14:00:00Z' },
  { id: 'f3', name: 'دليل_Python.pdf',   originalName: 'دليل_Python.pdf',   type: 'document',     mimeType: 'application/pdf',                size: 2097152,  url: '#', storagePath: 'uploads/f3.pdf',  uploadedBy: 'admin', groupIds: [],           createdAt: '2024-07-05T08:00:00Z' },
  { id: 'f4', name: 'مخطط_الخوارزميات.png',originalName: 'مخطط.png',       type: 'image',        mimeType: 'image/png',                     size: 512000,   url: '#', storagePath: 'uploads/f4.png',  uploadedBy: 'admin', groupIds: ['group-b'], createdAt: '2024-07-06T11:00:00Z' },
];

// ── Main component ────────────────────────────────────────────────────────
export default function FilesPage() {
  const [files, setFiles]         = useState<UploadedFile[]>(MOCK_FILES);
  const [jobs, setJobs]           = useState<UploadJob[]>([]);
  const [search, setSearch]       = useState('');
  const [filterType, setFilter]   = useState('all');
  const [dragging, setDragging]   = useState(false);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  const filtered = files.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchType   = filterType === 'all' || f.type === filterType;
    return matchSearch && matchType;
  });

  // ── Upload logic ─────────────────────────────────────────────────────
  async function uploadFile(file: File) {
    const jobId   = Date.now().toString();
    const jobName = file.name;

    setJobs((prev) => [...prev, { id: jobId, name: jobName, progress: 0, status: 'uploading' }]);

    try {
      const storagePath = `uploads/${Date.now()}_${file.name}`;
      const storageRef  = ref(storage, storagePath);
      const uploadTask  = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snap) => {
            const progress = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
            setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, progress } : j));
          },
          (error) => {
            setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status: 'error' } : j));
            reject(error);
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);

            // Save to Firestore
            const docRef = await addDoc(collection(db, 'files'), {
              name:        file.name,
              originalName: file.name,
              type:        getFileType(file.type),
              mimeType:    file.type,
              size:        file.size,
              url,
              storagePath,
              uploadedBy:  'admin',
              groupIds:    [],
              createdAt:   new Date().toISOString(),
            });

            const newFile: UploadedFile = {
              id: docRef.id, name: file.name, originalName: file.name,
              type: getFileType(file.type), mimeType: file.type,
              size: file.size, url, storagePath, uploadedBy: 'admin',
              groupIds: [], createdAt: new Date().toISOString(),
            };

            setFiles((prev) => [newFile, ...prev]);
            setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status: 'done', progress: 100 } : j));
            toast.success(`تم رفع "${file.name}" بنجاح`);
            setTimeout(() => setJobs((prev) => prev.filter((j) => j.id !== jobId)), 3000);
            resolve();
          }
        );
      });
    } catch (error: any) {
      toast.error(`فشل رفع "${file.name}": ${error.message}`);
    }
  }

  function handleFiles(fileList: FileList) {
    Array.from(fileList).forEach(uploadFile);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  }, []);

  async function deleteFile(file: UploadedFile) {
    try {
      const storageRef = ref(storage, file.storagePath);
      await deleteObject(storageRef);
      await deleteDoc(doc(db, 'files', file.id));
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      toast.success('تم حذف الملف');
    } catch {
      // In demo mode, just remove from state
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      toast.success('تم حذف الملف');
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    toast.success('تم نسخ الرابط');
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-700/10 border border-amber-500/20 flex items-center justify-center">
            <Cloud size={22} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">إدارة الملفات</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {files.length} ملف · {formatBytes(totalSize)} مستخدم
            </p>
          </div>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-medium shadow-glow-emerald hover:opacity-90 transition-opacity self-start"
        >
          <Upload size={16} />
          رفع ملفات
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="video/*,.ppt,.pptx,.pdf,.doc,.docx,image/*"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={clsx(
          'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all',
          dragging
            ? 'border-amber-500 bg-amber-500/10'
            : 'border-[var(--border)] hover:border-amber-500/50 hover:bg-amber-500/5'
        )}
      >
        <Upload size={36} className={clsx('mx-auto mb-3', dragging ? 'text-amber-400' : 'text-[var(--text-muted)]')} />
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          {dragging ? 'أفلت الملفات هنا' : 'اسحب وأفلت الملفات هنا أو انقر للاختيار'}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">يدعم: فيديو · PowerPoint · PDF · صور</p>
      </div>

      {/* Upload jobs */}
      <AnimatePresence>
        {jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-4 space-y-2"
          >
            <p className="text-xs font-semibold text-[var(--text-muted)] mb-3">جاري الرفع</p>
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center gap-3">
                {job.status === 'uploading' && <Loader2 size={14} className="text-amber-400 animate-spin shrink-0" />}
                {job.status === 'done'      && <CheckCircle size={14} className="text-emerald-400 shrink-0" />}
                {job.status === 'error'     && <AlertCircle size={14} className="text-red-400 shrink-0" />}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-[var(--text-primary)] truncate max-w-xs">{job.name}</p>
                    <span className="text-[10px] text-[var(--text-muted)]">{job.progress}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full transition-all', job.status === 'done' ? 'bg-emerald-500' : job.status === 'error' ? 'bg-red-500' : 'bg-amber-500')}
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في الملفات…"
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-glow"
          />
        </div>
        <select value={filterType} onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none">
          <option value="all">جميع الأنواع</option>
          <option value="video">فيديوهات</option>
          <option value="presentation">عروض تقديمية</option>
          <option value="document">مستندات</option>
          <option value="image">صور</option>
        </select>
      </div>

      {/* Files grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((file, i) => {
          const { Icon, color, bg } = FILE_ICONS[file.type];
          return (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 hover:border-[var(--accent-blue)]/30 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center border shrink-0', bg)}>
                  <Icon size={20} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{file.name}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatBytes(file.size)}</p>
                  <p className="text-xs text-[var(--text-muted)]">{formatDate(file.createdAt)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => copyUrl(file.url)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <Copy size={12} /> نسخ الرابط
                </button>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-blue-400 transition-colors"
                >
                  <Eye size={14} />
                </a>
                <button
                  onClick={() => deleteFile(file)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card py-16 text-center">
          <FolderOpen size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-[var(--text-secondary)]">لا توجد ملفات مطابقة</p>
        </div>
      )}
    </div>
  );
}

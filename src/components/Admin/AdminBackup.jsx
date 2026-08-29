import React, { useState } from 'react';
import { 
  Download, HardDrive, Database, Cloud, 
  CheckCircle2, AlertCircle, Loader2, Calendar,
  Shield, Archive, RefreshCw
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

const WORKER_URL = 'https://shunnyo-backend.mail-cde.workers.dev';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function AdminBackup({ adminUser }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'done' | 'error'
  const [backupType, setBackupType] = useState(null);
  const [message, setMessage] = useState('');
  const [backupHistory, setBackupHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shunnyo_backup_history') || '[]');
    } catch { return []; }
  });

  const doBackup = async (type) => {
    sounds.playClick();
    setBackupType(type);
    setStatus('loading');
    setMessage('');

    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminUser?.token || 'admin'
      };

      if (type === 'd1_download') {
        // Fetch all D1 data as JSON
        const res = await fetch(`${WORKER_URL}/api/admin/backup/d1`, { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shunnyo-d1-backup-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        const entry = { type: 'D1 ডেটাবেজ', size: blob.size, date: new Date().toISOString(), status: 'সম্পন্ন' };
        saveHistory(entry);
        setMessage('✅ D1 ডেটাবেজ ডাউনলোড সফল হয়েছে!');
        setStatus('done');
      } else if (type === 'r2_save') {
        // Save backup to R2
        const res = await fetch(`${WORKER_URL}/api/admin/backup/r2/save`, {
          method: 'POST',
          headers
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const entry = { type: 'R2 ক্লাউড ব্যাকআপ', size: data.size || 0, date: new Date().toISOString(), status: 'সম্পন্ন', key: data.key };
        saveHistory(entry);
        setMessage(`✅ R2-তে ব্যাকআপ সেভ হয়েছে: ${data.key}`);
        setStatus('done');
      } else if (type === 'local_export') {
        // Export all localStorage data
        const allData = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith('shunnyo_')) {
            try { allData[key] = JSON.parse(localStorage.getItem(key)); } catch { allData[key] = localStorage.getItem(key); }
          }
        }
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shunnyo-local-backup-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        const entry = { type: 'লোকাল স্টোরেজ', size: blob.size, date: new Date().toISOString(), status: 'সম্পন্ন' };
        saveHistory(entry);
        setMessage('✅ লোকাল ডেটা ডাউনলোড সফল!');
        setStatus('done');
      }
    } catch (err) {
      console.error('Backup error:', err);
      setMessage(`❌ ব্যাকআপ ব্যর্থ: ${err.message}`);
      setStatus('error');
    }

    setTimeout(() => setStatus('idle'), 3000);
  };

  const saveHistory = (entry) => {
    const next = [entry, ...backupHistory].slice(0, 20);
    setBackupHistory(next);
    try { localStorage.setItem('shunnyo_backup_history', JSON.stringify(next)); } catch {}
  };

  const backupOptions = [
    {
      id: 'd1_download',
      icon: Database,
      color: 'text-brand-400',
      bg: 'from-brand-600/20 to-indigo-600/20 border-brand-500/30',
      title: 'D1 ডেটাবেজ ব্যাকআপ',
      desc: 'Cloudflare D1 থেকে সকল ইউজার, মেসেজ ও কনফিগারেশন ডেটা JSON আকারে ডাউনলোড করুন',
      btnLabel: 'ডাউনলোড করুন',
      btnClass: 'bg-brand-500/20 hover:bg-brand-500/40 text-brand-300 border-brand-500/30'
    },
    {
      id: 'r2_save',
      icon: Cloud,
      color: 'text-cyan-400',
      bg: 'from-cyan-600/20 to-sky-600/20 border-cyan-500/30',
      title: 'R2 ক্লাউড ব্যাকআপ',
      desc: 'Cloudflare R2 স্টোরেজে স্বয়ংক্রিয়ভাবে ব্যাকআপ স্ন্যাপশট সেভ করুন',
      btnLabel: 'R2-তে সেভ করুন',
      btnClass: 'bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border-cyan-500/30'
    },
    {
      id: 'local_export',
      icon: HardDrive,
      color: 'text-amber-400',
      bg: 'from-amber-600/20 to-orange-600/20 border-amber-500/30',
      title: 'লোকাল স্টোরেজ এক্সপোর্ট',
      desc: 'ব্রাউজারে সংরক্ষিত কল লগ, ব্লক লিস্ট ও প্রোফাইল ডেটা ডাউনলোড করুন',
      btnLabel: 'এক্সপোর্ট করুন',
      btnClass: 'bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border-amber-500/30'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-2 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
          <Archive className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">ব্যাকআপ ও রিস্টোর সিস্টেম</h3>
          <p className="text-[11px] text-slate-400">Shunnyo ডেটা সুরক্ষিতভাবে এক্সপোর্ট ও ব্যাকআপ করুন</p>
        </div>
      </div>

      {/* Status Banner */}
      {status !== 'idle' && (
        <div className={`flex items-center space-x-2.5 px-4 py-3 rounded-2xl text-sm font-medium border ${
          status === 'loading' ? 'bg-brand-500/10 border-brand-500/30 text-brand-300' :
          status === 'done' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' :
          'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
          {status === 'done' && <CheckCircle2 className="w-4 h-4" />}
          {status === 'error' && <AlertCircle className="w-4 h-4" />}
          <span className="text-xs">{status === 'loading' ? 'ব্যাকআপ প্রক্রিয়া চলছে...' : message}</span>
        </div>
      )}

      {/* Backup Options */}
      <div className="grid grid-cols-1 gap-3">
        {backupOptions.map((opt) => {
          const Icon = opt.icon;
          const isLoading = status === 'loading' && backupType === opt.id;
          return (
            <div
              key={opt.id}
              className={`p-4 rounded-2xl bg-gradient-to-br border ${opt.bg} flex items-center justify-between gap-4`}
            >
              <div className="flex items-start space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-900/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className={`w-4.5 h-4.5 ${opt.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">{opt.title}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{opt.desc}</p>
                </div>
              </div>
              <button
                onClick={() => doBackup(opt.id)}
                disabled={status === 'loading'}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-1.5 flex-shrink-0 ${opt.btnClass}`}
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{opt.btnLabel}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Backup History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            ব্যাকআপ ইতিহাস
          </h4>
          {backupHistory.length > 0 && (
            <button
              onClick={() => { setBackupHistory([]); localStorage.removeItem('shunnyo_backup_history'); }}
              className="text-[10px] text-slate-500 hover:text-rose-400 transition-colors"
            >
              সব মুছুন
            </button>
          )}
        </div>

        {backupHistory.length === 0 ? (
          <div className="py-8 text-center text-slate-600 text-xs flex flex-col items-center space-y-2">
            <RefreshCw className="w-8 h-8 text-slate-700" />
            <p>এখনো কোনো ব্যাকআপ নেওয়া হয়নি</p>
          </div>
        ) : (
          <div className="space-y-2">
            {backupHistory.map((entry, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs">
                <div className="flex items-center space-x-2.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="text-slate-200 font-medium">{entry.type}</span>
                    {entry.size > 0 && (
                      <span className="ml-2 text-slate-500">{formatBytes(entry.size)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="text-emerald-400 text-[10px]">{entry.status}</span>
                  <span className="text-slate-600 text-[10px]">
                    {new Date(entry.date).toLocaleDateString('bn-BD')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

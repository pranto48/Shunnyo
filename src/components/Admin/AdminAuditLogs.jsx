/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Trash2, 
  ShieldAlert, 
  Filter, 
  RefreshCw,
  Clock,
  User,
  Key,
  Smartphone
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

const INITIAL_AUDIT_LOGS = [
  {
    id: 'log-101',
    event: 'User Role Promotion',
    category: 'auth',
    actor: 'mail@arifmahmud.com',
    target: '@mahir48',
    ip: '103.112.54.21',
    details: 'User role changed from member to moderator',
    status: 'success',
    timestamp: Date.now() - 120000
  },
  {
    id: 'log-102',
    event: 'Cloudflare D1 Backup Snapshot',
    category: 'system',
    actor: 'Admin System Engine',
    target: 'shunnyo-db',
    ip: 'Cloudflare Worker Core',
    details: 'Encrypted JSON vault snapshot exported to Cloudflare R2',
    status: 'success',
    timestamp: Date.now() - 900000
  },
  {
    id: 'log-103',
    event: 'E2EE RSA Key Exchange',
    category: 'crypto',
    actor: '@demo',
    target: '@arif',
    ip: '103.205.71.18',
    details: 'RSA-OAEP 2048-bit Public Key Handshake verified',
    status: 'success',
    timestamp: Date.now() - 3600000
  },
  {
    id: 'log-104',
    event: 'WebRTC P2P Call Session',
    category: 'media',
    actor: '@arif',
    target: '@tanvir',
    ip: '103.112.54.21',
    details: 'Video call connected via Google STUN (stun.l.google.com:19302)',
    status: 'success',
    timestamp: Date.now() - 7200000
  },
  {
    id: 'log-105',
    event: 'Unauthorized Admin Attempt',
    category: 'security',
    actor: 'Unknown IP',
    target: '/api/admin/system',
    ip: '185.220.101.5',
    details: 'Failed admin auth token challenge (Dropped by Worker)',
    status: 'blocked',
    timestamp: Date.now() - 18000000
  }
];

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState(INITIAL_AUDIT_LOGS);
  const [filterCategory, setFilterCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleClearLogs = () => {
    if (window.confirm('আপনি কি নিশ্চিতভাবে অডিট লগ হিস্ট্রি মুছে ফেলতে চান?')) {
      sounds.playClick();
      setLogs([]);
    }
  };

  const handleExportJSON = () => {
    sounds.playClick();
    setIsExporting(true);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `shunnyo_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setTimeout(() => setIsExporting(false), 800);
  };

  const filteredLogs = logs.filter((log) => {
    const matchCat = filterCategory === 'all' || log.category === filterCategory;
    const matchSearch = log.event.toLowerCase().includes(search.toLowerCase()) ||
                        log.actor.toLowerCase().includes(search.toLowerCase()) ||
                        log.details.toLowerCase().includes(search.toLowerCase()) ||
                        log.ip.includes(search);
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-4 animate-fade-in text-slate-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-glow-indigo">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">সিস্টেম অ্যাক্টিভিটি ও সিকিউরিটি অডিট লগ (Audit Logs)</h2>
            <p className="text-xs text-slate-400">রিয়েলটাইম অ্যাক্সেস ট্রেইল, ক্রিপ্টোগ্রাফিক কি এক্সচেঞ্জ ও ইভেন্ট হিস্ট্রি</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleExportJSON}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>লগ ডাউনলোড (JSON)</span>
          </button>

          <button
            onClick={handleClearLogs}
            className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all"
            title="লগ ক্লিয়ার করুন"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ইভেন্ট, ইউজার বা IP অ্যাড্রেস খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'auth', 'crypto', 'media', 'system', 'security'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sounds.playClick();
                setFilterCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterCategory === cat
                  ? 'bg-brand-600 text-white shadow-glow-brand'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">ইভেন্ট ও ক্যাটাগরি</th>
                <th className="py-3 px-4">অ্যাক্টর / টার্গেট</th>
                <th className="py-3 px-4">IP ও ডিভাইস</th>
                <th className="py-3 px-4">বিস্তারিত তথ্য</th>
                <th className="py-3 px-4 text-right">টাইমস্ট্যাম্প</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    কোনো অডিট লগ পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Event & Category */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{log.event}</span>
                        {log.status === 'blocked' && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-mono text-[9px] border border-rose-500/30">
                            BLOCKED
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-brand-400 font-mono uppercase">
                        [{log.category}]
                      </span>
                    </td>

                    {/* Actor / Target */}
                    <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                      <div>{log.actor}</div>
                      <div className="text-slate-500 text-[10px]">➜ {log.target}</div>
                    </td>

                    {/* IP Address */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {log.ip}
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4 text-slate-300 text-xs max-w-xs truncate">
                      {log.details}
                    </td>

                    {/* Time */}
                    <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

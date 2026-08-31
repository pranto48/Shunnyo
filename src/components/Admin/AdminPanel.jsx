/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Users, 
  HardDrive, 
  Activity, 
  Settings, 
  LogOut, 
  X,
  Lock,
  Radio,
  Server
} from 'lucide-react';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminStorage from './AdminStorage';
import AdminTelemetry from './AdminTelemetry';
import AdminBackup from './AdminBackup';
import { sounds } from '../../utils/soundEffects';

export default function AdminPanel({ isOpen, onClose, adminUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  const tabs = [
    { id: 'overview', label: 'ড্যাশবোর্ড ওভারভিউ', icon: LayoutDashboard },
    { id: 'users', label: 'ইউজার ম্যানেজমেন্ট', icon: Users },
    { id: 'storage', label: 'R2 স্টোরেজ ভল্ট', icon: HardDrive },
    { id: 'telemetry', label: 'WebRTC টেলিমেট্রি', icon: Activity },
    { id: 'backup', label: 'ব্যাকআপ সিস্টেম', icon: Server }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fade-in select-none">
      <div className="w-full max-w-6xl h-[90vh] rounded-3xl glass-dropdown border border-slate-700/80 shadow-2xl flex flex-col md:flex-row overflow-hidden animate-scale-in relative">
        
        {/* Admin Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col justify-between">
          <div>
            {/* Logo / Header */}
            <div className="flex items-center space-x-3 px-2 py-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center text-white shadow-glow-brand">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight">Shunnyo Admin</h1>
                <div className="flex items-center gap-1.5 text-[10px] text-brand-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                  <span>{adminUser?.role || 'Super Admin'}</span>
                </div>
              </div>
            </div>

            {/* Admin Tabs */}
            <nav className="space-y-1.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      sounds.playClick();
                      setActiveTab(tab.id);
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-glow-brand'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Admin User Info & Logout */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="text-[11px] text-slate-400">লগইনকৃত অ্যাকাউন্ট:</div>
              <div className="font-semibold text-white truncate font-mono text-[11px]">
                {adminUser?.email || 'mail@arifmahmud.com'}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  onLogout();
                }}
                className="flex-1 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>লগআউট</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                title="প্যানেল বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Admin Main Workspace View */}
        <main className="flex-1 bg-background-deep p-4 sm:p-6 overflow-y-auto custom-scrollbar">
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'storage' && <AdminStorage />}
          {activeTab === 'telemetry' && <AdminTelemetry />}
          {activeTab === 'backup' && <AdminBackup adminUser={adminUser} />}
        </main>
      </div>
    </div>
  );
}

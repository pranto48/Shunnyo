/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useCall } from '../../context/CallContext';
import Avatar from '../Shared/Avatar';
import { 
  MessageSquarePlus, 
  Search, 
  MoreVertical, 
  Settings, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  User, 
  Plus, 
  Check, 
  Edit3,
  Phone
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function SidebarHeader() {
  const { 
    currentUser, 
    openAdminPortal, 
    setShowSecurityModal, 
    setShowProfileModal, 
    setShowCreateGroupModal, 
    updateUserProfile 
  } = useChat();
  const { missedCallCount, setShowCallHistory } = useCall();
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const statusOptions = [
    { key: 'online', label: 'Online (অনলাইন)', color: 'bg-emerald-500' },
    { key: 'busy', label: 'Do Not Disturb (ব্যস্ত)', color: 'bg-rose-500' },
    { key: 'away', label: 'Away (অনুপস্থিত)', color: 'bg-amber-500' },
    { key: 'offline', label: 'Invisible (অদৃশ্য)', color: 'bg-slate-500' }
  ];

  const handleStatusChange = (statusKey) => {
    sounds.playClick();
    updateUserProfile({ status: statusKey });
    setShowStatusMenu(false);
  };

  return (
    <div className="p-4 border-b border-slate-800/80 bg-background-surface/80 backdrop-blur-xl relative z-20">
      {/* Top row: Brand & Profile */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="relative group cursor-pointer"
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            title="ইউজার প্রোফাইল ও স্ট্যাটাস মেনু"
          >
            <Avatar 
              src={currentUser.avatar} 
              name={currentUser.name} 
              status={currentUser.status} 
              size="md" 
              ring={true}
            />
            <div className="absolute -bottom-1 -right-1 bg-background-deep rounded-full p-0.5 border border-white/20">
              <Sparkles className="w-2.5 h-2.5 text-brand-400 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>

          <div
            className="flex flex-col cursor-pointer"
            onClick={() => {
              sounds.playClick();
              setShowProfileModal(true);
            }}
            title="প্রোফাইল ওপেন করতে ক্লিক করুন"
          >
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base text-slate-100 tracking-tight flex items-center gap-1.5 hover:text-brand-300 transition-colors">
                Shunnyo <span className="text-xs px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30 font-mono">শূন্য</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 hover:text-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {currentUser.name}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1">
          {/* Create Group Button */}
          <button 
            title="নতুন গ্রুপ চ্যাট তৈরি করুন (Create Group)"
            onClick={() => {
              sounds.playClick();
              setShowCreateGroupModal(true);
            }}
            className="p-2 rounded-xl text-cyan-400 hover:text-white hover:bg-cyan-500/20 active:scale-95 transition-all duration-200"
          >
            <Users className="w-5 h-5" />
          </button>

          {/* Call History Button */}
          <button
            title="কল হিস্ট্রি দেখুন (Call History)"
            onClick={() => {
              sounds.playClick();
              setShowCallHistory(true);
            }}
            className="p-2 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-500/20 active:scale-95 transition-all duration-200 relative"
          >
            <Phone className="w-5 h-5" />
            {missedCallCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border border-slate-900">
                {missedCallCount > 9 ? '9+' : missedCallCount}
              </span>
            )}
          </button>

          {/* Admin Portal Button */}
          <button 
            title="এডমিন প্যানেল কনসোল (Admin Console)"
            onClick={openAdminPortal}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600/30 to-indigo-600/30 hover:from-brand-600 hover:to-indigo-600 text-brand-300 hover:text-white border border-brand-500/40 shadow-sm active:scale-95 transition-all duration-200 group relative"
          >
            <ShieldCheck className="w-4 h-4 text-brand-400 group-hover:text-white transition-colors" />
            <span className="text-[11px] font-bold tracking-tight hidden lg:inline">Admin</span>
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse group-hover:bg-white" />
          </button>

          {/* E2EE Security Modal Button */}
          <button 
            title="E2EE Security & Key Identity"
            onClick={() => {
              sounds.playClick();
              setShowSecurityModal(true);
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 active:scale-95 transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User Status Dropdown Menu */}
      {showStatusMenu && (
        <>
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setShowStatusMenu(false)} 
          />
          <div className="absolute left-4 top-16 w-60 rounded-2xl glass-dropdown p-2 shadow-2xl z-40 animate-scale-in border border-slate-700/80">
            <div className="px-3 py-2 border-b border-slate-700/50 mb-1 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">{currentUser.username}</p>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowStatusMenu(false);
                  setShowProfileModal(true);
                }}
                className="p-1.5 rounded-lg bg-brand-500/20 text-brand-300 hover:bg-brand-500/40 text-xs flex items-center gap-1"
                title="প্রোফাইল এডিট করুন"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 mb-1">
              {statusOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleStatusChange(opt.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    currentUser.status === opt.key 
                      ? 'bg-brand-600/30 text-brand-300 border border-brand-500/30' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${opt.color}`} />
                    <span>{opt.label}</span>
                  </div>
                  {currentUser.status === opt.key && <Check className="w-3.5 h-3.5 text-brand-400" />}
                </button>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-1">
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowStatusMenu(false);
                  setShowProfileModal(true);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-all font-semibold"
              >
                <User className="w-4 h-4 text-brand-400" />
                <span>প্রোফাইল ও বায়ো পরিবর্তন</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

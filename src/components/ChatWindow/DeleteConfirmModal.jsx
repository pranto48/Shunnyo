/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React from 'react';
import { Trash2, Users, User, X, AlertTriangle } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function DeleteConfirmModal({ isOpen, message, isSentByMe, onClose, onDelete }) {
  if (!isOpen || !message) return null;

  const handleDeleteForEveryone = () => {
    sounds.playClick();
    onDelete(message.id, true);
    onClose();
  };

  const handleDeleteForMe = () => {
    sounds.playClick();
    onDelete(message.id, false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm rounded-3xl glass-dropdown border border-slate-700/80 p-6 shadow-2xl relative overflow-hidden animate-scale-in">
        {/* Glow ambient */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800 relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">মেসেজ ডিলিট করুন</h3>
              <p className="text-[11px] text-slate-400">ডিলিট করার অপশন নির্বাচন করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="relative z-10 space-y-2.5">
          {/* Delete for everyone (Only available for own sent messages) */}
          {isSentByMe && (
            <button
              onClick={handleDeleteForEveryone}
              className="w-full flex items-center space-x-3 p-3 rounded-2xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 hover:text-rose-200 transition-all text-left group active:scale-95"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-500/30 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-rose-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">সবার জন্য ডিলিট করুন (Delete for Everyone)</div>
                <div className="text-[10px] text-rose-300/80 truncate">উভয় প্রান্ত থেকে মুছে ফেলা হবে</div>
              </div>
            </button>
          )}

          {/* Delete for Me */}
          <button
            onClick={handleDeleteForMe}
            className="w-full flex items-center space-x-3 p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-left group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">শুধু আমার জন্য মুছুন (Delete for Me)</div>
              <div className="text-[10px] text-slate-500 truncate">আপনার স্ক্রিন থেকে অদৃশ্য হবে</div>
            </div>
          </button>

          {/* Cancel button */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              বাতিল
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

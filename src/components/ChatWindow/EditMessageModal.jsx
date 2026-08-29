import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Check, X, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function EditMessageModal({ isOpen, message, onClose, onSave }) {
  const [editText, setEditText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && message) {
      setEditText(message.content || '');
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, message]);

  if (!isOpen || !message) return null;

  const handleSave = () => {
    if (!editText.trim()) return;
    onSave(message.id, editText.trim());
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md rounded-3xl glass-dropdown border border-slate-700/80 p-6 shadow-2xl relative overflow-hidden animate-scale-in">
        {/* Glow ambient */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800 relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">মেসেজ সম্পাদনা (Edit Message)</h3>
              <p className="text-[11px] text-slate-400">মেসেজটি সবার কাছে পরিবর্তিত হবে</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Text Input Area */}
        <div className="relative z-10 space-y-4">
          <textarea
            ref={inputRef}
            rows={3}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500/70 focus:ring-1 focus:ring-brand-500/50 resize-none font-sans"
            placeholder="সম্পাদিত মেসেজ লিখুন..."
          />

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!editText.trim() || editText.trim() === message.content}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-brand flex items-center space-x-1.5 active:scale-95 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>সংরক্ষণ করুন (Save Edit)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

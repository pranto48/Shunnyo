/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import Avatar from '../Shared/Avatar';
import { 
  Users, 
  UserPlus, 
  LogOut, 
  ShieldCheck, 
  X, 
  Crown, 
  Check, 
  Trash2,
  Lock
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function GroupDetailsModal({ isOpen, onClose }) {
  const { 
    activeContact, 
    contacts, 
    currentUser, 
    updateGroupMembers, 
    selectContact, 
    setContacts 
  } = useChat();

  const [isAddMemberMode, setIsAddMemberMode] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState([]);

  if (!isOpen || !activeContact || !activeContact.isGroup) return null;

  const currentMembers = activeContact.members || contacts.filter((c) => !c.isGroup).slice(0, 5);

  const availableToAdd = contacts.filter(
    (c) => !c.isGroup && !currentMembers.some((m) => m.id === c.id)
  );

  const handleToggleAdd = (id) => {
    sounds.playClick();
    setSelectedToAdd((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleSaveNewMembers = () => {
    sounds.playClick();
    const addedContacts = contacts.filter((c) => selectedToAdd.includes(c.id));
    const newMemberList = [...currentMembers, ...addedContacts];

    updateGroupMembers(activeContact.id, newMemberList);
    setIsAddMemberMode(false);
    setSelectedToAdd([]);
  };

  const handleLeaveGroup = () => {
    sounds.playClick();
    setContacts((prev) => prev.filter((c) => c.id !== activeContact.id));
    const remaining = contacts.filter((c) => c.id !== activeContact.id);
    if (remaining.length > 0) {
      selectContact(remaining[0].id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md rounded-3xl glass-dropdown border border-slate-700/80 p-6 sm:p-7 shadow-2xl relative overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800 relative z-10">
          <div className="flex items-center space-x-2.5">
            <Users className="w-5 h-5 text-accent-cyan" />
            <h3 className="text-sm font-bold text-white">গ্রুপের তথ্য ও সদস্য তালিকা</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group Banner */}
        <div className="relative z-10 flex flex-col items-center text-center p-4 rounded-2xl bg-slate-950/70 border border-slate-800 mb-4">
          <img
            src={activeContact.avatar}
            alt={activeContact.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-glow-cyan mb-2"
          />
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            {activeContact.name}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {activeContact.description || 'এন্ড-টু-এন্ড এনক্রিপ্টেড গ্রুপ আলোচনা'}
          </p>
          <div className="mt-2 flex items-center space-x-2 text-[11px] text-accent-cyan font-mono bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
            <Lock className="w-3 h-3" />
            <span>E2EE Group Protocol Active</span>
          </div>
        </div>

        {/* Members List Section */}
        <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
          <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-300">
            <span>সদস্যবৃন্দ ({currentMembers.length + 1} জন)</span>
            <button
              onClick={() => setIsAddMemberMode(!isAddMemberMode)}
              className="text-accent-cyan hover:text-cyan-300 flex items-center gap-1 text-[11px] font-bold"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isAddMemberMode ? 'বাতিল' : 'নতুন সদস্য যোগ'}</span>
            </button>
          </div>

          {/* Add Members Picker */}
          {isAddMemberMode ? (
            <div className="p-3 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-2">
              <span className="text-[11px] text-slate-400 font-bold block">কন্টাক্ট নির্বাচন করুন:</span>
              {availableToAdd.length === 0 ? (
                <p className="text-xs text-slate-500 py-2 text-center">আর কোনো কন্টাক্ট বাকি নেই</p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                  {availableToAdd.map((c) => {
                    const isSelected = selectedToAdd.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => handleToggleAdd(c.id)}
                        className={`flex items-center justify-between p-1.5 rounded-xl cursor-pointer text-xs ${
                          isSelected ? 'bg-cyan-500/20 text-white' : 'hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <Avatar src={c.avatar} name={c.name} size="sm" />
                          <span className="truncate">{c.name}</span>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-cyan-500 border-cyan-400 text-black' : 'border-slate-700'}`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {availableToAdd.length > 0 && (
                <button
                  type="button"
                  onClick={handleSaveNewMembers}
                  disabled={selectedToAdd.length === 0}
                  className="w-full py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all disabled:opacity-50"
                >
                  যোগ করুন ({selectedToAdd.length})
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              {/* Creator / You */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" status="online" />
                  <div>
                    <span className="text-xs font-bold text-white block">{currentUser.name} (আপনি)</span>
                    <span className="text-[10px] text-slate-500">{currentUser.role || 'গ্রুপ অ্যাডমিন'}</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center gap-1 font-mono">
                  <Crown className="w-3 h-3 text-amber-400" /> অ্যাডমিন
                </span>
              </div>

              {/* Other Members */}
              {currentMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/30 border border-slate-800/60"
                >
                  <div className="flex items-center space-x-2.5">
                    <Avatar src={member.avatar} name={member.name} size="sm" status={member.status} />
                    <div>
                      <span className="text-xs font-medium text-slate-200 block">{member.name}</span>
                      <span className="text-[10px] text-slate-500">{member.role || member.username}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">সদস্য</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leave Group Action Footer */}
        <div className="pt-4 mt-2 border-t border-slate-800 relative z-10 flex items-center justify-between">
          <button
            type="button"
            onClick={handleLeaveGroup}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>গ্রুপ ত্যাগ করুন (Leave Group)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

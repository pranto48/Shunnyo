import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useCall } from '../../context/CallContext';
import { MessageSquare, PhoneCall, ShieldCheck, Shield, Users, User } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function MobileBottomNav() {
  const { 
    filter, 
    setFilter, 
    setShowSecurityModal, 
    setShowProfileModal,
    setShowCreateGroupModal,
    openAdminPortal,
    onlinePeerCount
  } = useChat();

  const handleNav = (tab) => {
    sounds.playClick();
    if (tab === 'chats') {
      setFilter('all');
    } else if (tab === 'groups') {
      setFilter('groups');
    } else if (tab === 'online') {
      setFilter('online');
    } else if (tab === 'profile') {
      setShowProfileModal(true);
    } else if (tab === 'admin') {
      openAdminPortal();
    }
  };

  return (
    <div className="md:hidden flex items-center justify-around py-2.5 px-2 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-2xl safe-bottom z-30 select-none">
      {/* 1. Chats Tab */}
      <button
        onClick={() => handleNav('chats')}
        className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-2xl transition-all ${
          filter === 'all'
            ? 'text-brand-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5" />
          {filter === 'all' && <span className="w-1.5 h-1.5 rounded-full bg-brand-400 absolute -top-0.5 -right-0.5" />}
        </div>
        <span className="text-[10px]">চ্যাট</span>
      </button>

      {/* 2. Groups Tab */}
      <button
        onClick={() => handleNav('groups')}
        className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-2xl transition-all ${
          filter === 'groups'
            ? 'text-cyan-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Users className="w-5 h-5" />
          {filter === 'groups' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute -top-0.5 -right-0.5" />}
        </div>
        <span className="text-[10px]">গ্রুপ</span>
      </button>

      {/* 3. Online & Calls Tab */}
      <button
        onClick={() => handleNav('online')}
        className={`flex flex-col items-center space-y-1 py-1 px-2 rounded-2xl transition-all relative ${
          filter === 'online'
            ? 'text-emerald-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <PhoneCall className="w-5 h-5" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-pulse" />
        </div>
        <span className="text-[10px]">অনলাইন ({onlinePeerCount > 1 ? onlinePeerCount : 4})</span>
      </button>

      {/* 4. Profile Tab */}
      <button
        onClick={() => handleNav('profile')}
        className="flex flex-col items-center space-y-1 py-1 px-2 rounded-2xl text-slate-400 hover:text-white transition-all"
      >
        <User className="w-5 h-5" />
        <span className="text-[10px]">প্রোফাইল</span>
      </button>

      {/* 5. Admin Portal Tab */}
      <button
        onClick={() => handleNav('admin')}
        className="flex flex-col items-center space-y-1 py-1 px-2 rounded-2xl text-slate-400 hover:text-purple-300 transition-all"
      >
        <ShieldCheck className="w-5 h-5 text-brand-400" />
        <span className="text-[10px]">অ্যাডমিন</span>
      </button>
    </div>
  );
}

/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useCall } from '../../context/CallContext';
import SidebarHeader from './SidebarHeader';
import ContactList from './ContactList';
import MobileBottomNav from './MobileBottomNav';
import { PhoneIncoming, Video, Radio, Shield, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function Sidebar() {
  const { isMobileSidebarOpen, contacts } = useChat();
  const { receiveCall, callState } = useCall();

  const handleSimulateIncomingCall = (type = 'video') => {
    sounds.playClick();
    const caller = contacts[0] || {
      id: 'c-test',
      name: 'Nafis Chowdhury',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'online',
      role: 'Lead Architect'
    };
    receiveCall(caller, type);
  };

  return (
    <aside
      className={`w-full md:w-80 lg:w-96 flex flex-col h-[100dvh] bg-background border-r border-slate-800/80 transition-all duration-300 z-30 select-none ${
        isMobileSidebarOpen ? 'flex' : 'hidden md:flex'
      }`}
    >
      {/* Sidebar Top Header with safe area support */}
      <div className="safe-top">
        <SidebarHeader />
      </div>

      {/* Main Contact List */}
      <ContactList />

      {/* Clean Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-background-surface/70 backdrop-blur-md hidden md:block">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium text-[11px]">এনক্রিপ্টেড নেটওয়ার্ক</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <Shield className="w-3 h-3 text-emerald-400" /> E2EE
          </span>
        </div>
      </div>

      {/* Mobile-Only Bottom Navigation Bar */}
      <MobileBottomNav />
    </aside>
  );
}

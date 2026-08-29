import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useCall } from '../../context/CallContext';
import SidebarHeader from './SidebarHeader';
import ContactList from './ContactList';
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
      className={`w-full md:w-80 lg:w-96 flex flex-col h-full bg-background border-r border-slate-800/80 transition-all duration-300 z-30 ${
        isMobileSidebarOpen ? 'flex' : 'hidden md:flex'
      }`}
    >
      {/* Sidebar Header */}
      <SidebarHeader />

      {/* Main Contact List */}
      <ContactList />

      {/* Interactive Simulation & PWA Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-background-surface/70 backdrop-blur-md">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => handleSimulateIncomingCall('video')}
            disabled={callState !== 'idle'}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-brand-600/30 to-indigo-600/30 hover:from-brand-600/50 hover:to-indigo-600/50 border border-brand-500/30 text-brand-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            title="Simulate an incoming video call to test the call modal"
          >
            <Video className="w-3.5 h-3.5 text-brand-400" />
            <span>Test Video Call</span>
          </button>

          <button
            onClick={() => handleSimulateIncomingCall('audio')}
            disabled={callState !== 'idle'}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            title="Simulate an incoming audio call to test the audio visualizer"
          >
            <PhoneIncoming className="w-3.5 h-3.5 text-accent-emerald" />
            <span>Test Audio Call</span>
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/40 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-accent-emerald" /> E2E Encrypted
          </span>
          <span className="font-mono text-slate-600">v1.0.0-PWA</span>
        </div>
      </div>
    </aside>
  );
}

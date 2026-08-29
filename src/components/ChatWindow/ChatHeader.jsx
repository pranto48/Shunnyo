import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useCall } from '../../context/CallContext';
import Avatar from '../Shared/Avatar';
import { 
  Phone, 
  Video, 
  MoreVertical, 
  ChevronLeft, 
  ShieldCheck, 
  Info, 
  Bell, 
  Trash2, 
  Lock,
  Radio
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function ChatHeader() {
  const { 
    activeContact, 
    setIsMobileSidebarOpen, 
    setShowSecurityModal,
    isLiveConnected,
    typingUsers
  } = useChat();
  const { startCall, callState } = useCall();
  const [showMenu, setShowMenu] = useState(false);

  if (!activeContact) return null;

  const isContactTyping = activeContact.isTyping || (typingUsers && typingUsers[activeContact.id]);

  const handleAudioCall = () => {
    sounds.playClick();
    startCall(activeContact, 'audio');
  };

  const handleVideoCall = () => {
    sounds.playClick();
    startCall(activeContact, 'video');
  };

  const handleOpenSecurity = () => {
    sounds.playClick();
    setShowSecurityModal(true);
    setShowMenu(false);
  };

  return (
    <div className="h-16 px-3 sm:px-4 border-b border-slate-800/80 bg-background-surface/80 backdrop-blur-xl flex items-center justify-between relative z-20 safe-top">
      <div className="flex items-center space-x-3 min-w-0">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <Avatar
          src={activeContact.avatar}
          name={activeContact.name}
          status={activeContact.isGroup ? null : activeContact.status}
          size="md"
          ring={true}
        />

        <div className="flex flex-col min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm md:text-base font-bold text-slate-100 truncate flex items-center gap-1.5">
              {activeContact.name}
              {!activeContact.isGroup && (
                <button
                  onClick={handleOpenSecurity}
                  title="Click to view E2EE Fingerprint & Encryption Details"
                  className="hover:scale-110 transition-transform"
                >
                  <ShieldCheck className="w-4 h-4 text-accent-cyan cursor-pointer" />
                </button>
              )}
            </h3>

            {/* Live WebSocket Connection Pill */}
            {isLiveConnected && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-medium animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live WS</span>
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 truncate flex items-center gap-1.5 font-medium">
            {isContactTyping ? (
              <span className="text-brand-400 flex items-center gap-1 font-semibold animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" />
                টাইপ করছেন...
              </span>
            ) : activeContact.isGroup ? (
              <span>{activeContact.membersCount || 5} জন সদস্য • সক্রিয়</span>
            ) : (
              <span className="flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    activeContact.status === 'online'
                      ? 'bg-emerald-400 shadow-glow-emerald'
                      : activeContact.status === 'busy'
                      ? 'bg-rose-400'
                      : activeContact.status === 'away'
                      ? 'bg-amber-400'
                      : 'bg-slate-500'
                  }`}
                />
                <span className="capitalize">{activeContact.status}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">{activeContact.lastSeen || 'সক্রিয়'}</span>
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2">
        <button
          onClick={handleAudioCall}
          disabled={callState !== 'idle'}
          title="Start Audio Call"
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-brand-600/30 text-slate-300 hover:text-brand-300 border border-slate-700/60 hover:border-brand-500/40 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
        >
          <Phone className="w-4 h-4" />
        </button>

        <button
          onClick={handleVideoCall}
          disabled={callState !== 'idle'}
          title="Start Video Call"
          className="p-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-glow-brand active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          <Video className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => {
              sounds.playClick();
              setShowMenu(!showMenu);
            }}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 active:scale-95 transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-12 w-52 rounded-2xl glass-dropdown p-1.5 shadow-2xl z-40 animate-scale-in text-xs">
                <button
                  onClick={handleOpenSecurity}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-200 hover:bg-white/5 hover:text-white transition-all font-medium"
                >
                  <Lock className="w-4 h-4 text-accent-cyan" />
                  <span>Verify E2EE Fingerprint</span>
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                >
                  <Info className="w-4 h-4 text-slate-400" />
                  <span>Contact Details</span>
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                >
                  <Bell className="w-4 h-4 text-slate-400" />
                  <span>Mute Notifications</span>
                </button>
                <div className="h-px bg-slate-800 my-1" />
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Conversation</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

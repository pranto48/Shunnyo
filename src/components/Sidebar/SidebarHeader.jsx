import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import Avatar from '../Shared/Avatar';
import { 
  MessageSquarePlus, 
  Search, 
  MoreVertical, 
  Settings, 
  ShieldCheck, 
  Sparkles,
  PhoneCall,
  UserCheck,
  Check
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function SidebarHeader() {
  const { currentUser, openAdminPortal, setShowSecurityModal } = useChat();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [myStatus, setMyStatus] = useState(currentUser.status);

  const statusOptions = [
    { key: 'online', label: 'Online', color: 'bg-emerald-500' },
    { key: 'busy', label: 'Do Not Disturb', color: 'bg-rose-500' },
    { key: 'away', label: 'Away', color: 'bg-amber-500' },
    { key: 'offline', label: 'Invisible', color: 'bg-slate-500' }
  ];

  const handleStatusChange = (statusKey) => {
    sounds.playClick();
    setMyStatus(statusKey);
    setShowStatusMenu(false);
  };

  return (
    <div className="p-4 border-b border-slate-800/80 bg-background-surface/80 backdrop-blur-xl relative z-20">
      {/* Top row: Brand & Profile */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative group cursor-pointer" onClick={() => setShowStatusMenu(!showStatusMenu)}>
            <Avatar 
              src={currentUser.avatar} 
              name={currentUser.name} 
              status={myStatus} 
              size="md" 
              ring={true}
            />
            <div className="absolute -bottom-1 -right-1 bg-background-deep rounded-full p-0.5 border border-white/20">
              <Sparkles className="w-2.5 h-2.5 text-brand-400 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base text-slate-100 tracking-tight flex items-center gap-1.5">
                Shunnyo <span className="text-xs px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30 font-mono">শূন্য</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {currentUser.name}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1">
          {/* Admin Portal Button */}
          <button 
            title="Admin Console (mail@arifmahmud.com)"
            onClick={openAdminPortal}
            className="p-2 rounded-xl text-brand-400 hover:text-white hover:bg-brand-500/20 active:scale-95 transition-all duration-200 relative group"
          >
            <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-400" />
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
          <div className="absolute left-4 top-16 w-56 rounded-2xl glass-dropdown p-2 shadow-2xl z-40 animate-scale-in">
            <div className="px-3 py-2 border-b border-slate-700/50 mb-1">
              <p className="text-xs font-semibold text-slate-300">Set Presence Status</p>
              <p className="text-[11px] text-slate-500 font-mono">{currentUser.username}</p>
            </div>
            <div className="space-y-1">
              {statusOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleStatusChange(opt.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    myStatus === opt.key 
                      ? 'bg-brand-600/30 text-brand-300 border border-brand-500/30' 
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${opt.color}`} />
                    <span>{opt.label}</span>
                  </div>
                  {myStatus === opt.key && <Check className="w-3.5 h-3.5 text-brand-400" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

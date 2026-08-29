import React from 'react';
import { useCall } from '../../context/CallContext';
import Avatar from '../Shared/Avatar';
import { Phone, PhoneOff, Video, ShieldCheck } from 'lucide-react';

export default function IncomingCallDialog() {
  const { callState, callType, callTarget, acceptCall, declineCall } = useCall();

  if (callState !== 'incoming') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl glass-dropdown border border-brand-500/30 p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden animate-scale-in">
        {/* Glowing aura */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />

        {/* Top badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-brand-300 font-medium mb-4">
          {callType === 'video' ? (
            <Video className="w-3.5 h-3.5 text-brand-400" />
          ) : (
            <Phone className="w-3.5 h-3.5 text-accent-emerald" />
          )}
          <span>ইনকামিং {callType === 'video' ? 'ভিডিও' : 'অডিও'} কল...</span>
        </div>

        {/* Pulsing Avatar */}
        <div className="relative mb-4">
          <Avatar
            src={callTarget?.avatar}
            name={callTarget?.name}
            size="2xl"
            ring={true}
            showStatus={false}
            className="shadow-glow-brand"
          />
          <div className="absolute inset-0 rounded-full border-2 border-brand-400 animate-ping opacity-50" />
        </div>

        {/* Caller Info */}
        <h3 className="text-xl font-bold text-white mb-1">{callTarget?.name}</h3>
        <p className="text-xs text-slate-400 font-mono mb-6">{callTarget?.role || callTarget?.username}</p>

        {/* Answer / Decline Action Buttons */}
        <div className="flex items-center justify-center space-x-8 w-full">
          {/* Decline Button */}
          <div className="flex flex-col items-center space-y-1.5">
            <button
              onClick={declineCall}
              title="Decline Call"
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-glow-rose active:scale-95 transition-all"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <span className="text-xs text-rose-400 font-medium">প্রত্যাখ্যান</span>
          </div>

          {/* Accept Button */}
          <div className="flex flex-col items-center space-y-1.5">
            <button
              onClick={acceptCall}
              title="Accept Call"
              className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-glow-emerald animate-bounce active:scale-95 transition-all"
            >
              {callType === 'video' ? (
                <Video className="w-6 h-6" />
              ) : (
                <Phone className="w-6 h-6" />
              )}
            </button>
            <span className="text-xs text-emerald-400 font-medium">রিসিভ</span>
          </div>
        </div>
      </div>
    </div>
  );
}

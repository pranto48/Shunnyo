/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React from 'react';
import { useCall } from '../../context/CallContext';
import Avatar from '../Shared/Avatar';
import { ShieldCheck, Mic, MicOff, Users, Sparkles, Volume2 } from 'lucide-react';

export default function AudioCallView() {
  const { 
    callTarget, 
    callDuration, 
    formatDuration, 
    callState, 
    isMuted, 
    isGroupCall, 
    groupCallParticipants 
  } = useCall();

  // 1. Group Audio Conference Call View
  if (isGroupCall) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/95 via-background-surface/95 to-slate-950/95">
        {/* Top Bar */}
        <div className="relative z-10 w-full flex items-center justify-between">
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl glass-card text-xs text-slate-200">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold">{callTarget?.name} (গ্রুপ কনফারেন্স)</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
              {formatDuration(callDuration)}
            </span>
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl glass-card text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{groupCallParticipants.length} জন যুক্ত</span>
            </div>
          </div>
        </div>

        {/* Group Participants Grid */}
        <div className="relative z-10 w-full flex-1 flex items-center justify-center my-auto py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl w-full">
            {groupCallParticipants.map((member) => (
              <div
                key={member.id}
                className={`relative flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-300 ${
                  member.isSpeaking
                    ? 'bg-gradient-to-b from-emerald-950/40 to-slate-900/80 border-2 border-emerald-500/70 shadow-glow-emerald scale-105'
                    : 'bg-slate-950/60 border border-slate-800'
                }`}
              >
                {/* Avatar with Speaking Ring */}
                <div className="relative mb-2.5">
                  <Avatar
                    src={member.avatar}
                    name={member.name}
                    size="xl"
                    ring={false}
                    showStatus={false}
                    className={`transition-transform duration-300 ${
                      member.isSpeaking ? 'ring-4 ring-emerald-400 scale-105' : 'ring-2 ring-slate-700'
                    }`}
                  />
                  {member.isSpeaking && (
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-slate-950 shadow-sm animate-bounce">
                      <Volume2 className="w-3 h-3" />
                    </div>
                  )}
                  {member.isMuted && (
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-rose-500 text-white shadow-sm">
                      <MicOff className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <h4 className="text-xs font-bold text-white text-center truncate max-w-full">
                  {member.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono truncate max-w-full">
                  {member.isSpeaking ? (
                    <span className="text-emerald-400 font-semibold animate-pulse">কথা বলছেন...</span>
                  ) : (
                    member.role
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Voice Waves */}
        <div className="relative z-10 flex items-center justify-center space-x-1 h-8">
          {[20, 50, 80, 40, 70, 95, 60, 85, 30, 75, 90, 45, 65, 30].map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%`, animationDuration: `${0.7 + (i % 4) * 0.2}s` }}
              className="w-1 rounded-full bg-gradient-to-t from-cyan-500 to-emerald-400 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // 2. One-on-One Audio Call View
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-background-surface/90 to-slate-950/90">
      {/* Top Bar: Metas */}
      <div className="relative z-10 w-full flex items-center justify-between">
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl glass-card text-xs text-slate-200">
          <ShieldCheck className="w-4 h-4 text-accent-cyan" />
          <span>Shunnyo Encrypted Audio</span>
        </div>

        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl glass-card text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{callState === 'calling' ? 'Ringing...' : 'Connected'}</span>
        </div>
      </div>

      {/* Center: Pulsing Avatar & Audio Waveform */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6 my-auto">
        {/* Pulsing Avatar with Radar Rings */}
        <div className="relative flex items-center justify-center">
          <Avatar
            src={callTarget?.avatar}
            name={callTarget?.name}
            size="2xl"
            ring={true}
            showStatus={false}
            className="shadow-glow-brand z-10 ring-4 ring-brand-500/50"
          />

          {/* Animated Glow Rings */}
          <div className="absolute w-44 h-44 rounded-full border border-brand-500/30 animate-ping opacity-30 pointer-events-none" />
          <div
            className="absolute w-56 h-56 rounded-full border border-indigo-500/20 animate-ping opacity-20 pointer-events-none"
            style={{ animationDelay: '0.4s' }}
          />
          <div
            className="absolute w-72 h-72 rounded-full border border-accent-cyan/15 animate-ping opacity-15 pointer-events-none"
            style={{ animationDelay: '0.8s' }}
          />
        </div>

        {/* Remote User Details */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {callTarget?.name}
          </h2>
          <p className="text-sm text-slate-400 font-mono">
            {callTarget?.role || callTarget?.username}
          </p>
          <div className="pt-2">
            <span className="px-4 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-sm font-mono font-bold tracking-widest inline-block shadow-sm">
              {formatDuration(callDuration)}
            </span>
          </div>
        </div>

        {/* Live Audio Waveform Bars Simulation */}
        <div className="flex items-center justify-center space-x-1.5 h-12 pt-2">
          {[30, 60, 95, 45, 80, 100, 50, 70, 85, 40, 90, 65, 35, 75, 95, 55, 30].map(
            (height, idx) => (
              <div
                key={idx}
                style={{
                  height: callState === 'connected' ? `${height}%` : '20%',
                  animationDuration: `${0.8 + (idx % 5) * 0.2}s`
                }}
                className={`w-1.5 rounded-full bg-gradient-to-t from-brand-600 via-indigo-400 to-accent-cyan transition-all duration-300 ${
                  callState === 'connected' ? 'animate-pulse' : 'opacity-40'
                }`}
              />
            )
          )}
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  );
}

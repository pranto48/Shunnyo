import React from 'react';
import { useCall } from '../../context/CallContext';
import Avatar from '../Shared/Avatar';
import { ShieldCheck, Mic, Sparkles } from 'lucide-react';

export default function AudioCallView() {
  const { callTarget, callDuration, formatDuration, callState, isMuted } = useCall();

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

      {/* Bottom spacer for CallControls layout */}
      <div className="h-4" />
    </div>
  );
}

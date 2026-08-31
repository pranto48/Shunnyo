/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React from 'react';
import { useCall } from '../../context/CallContext';
import VideoCallView from './VideoCallView';
import AudioCallView from './AudioCallView';
import CallControls from './CallControls';
import IncomingCallDialog from './IncomingCallDialog';
import Avatar from '../Shared/Avatar';
import { Maximize2, PhoneOff } from 'lucide-react';

export default function CallOverlay() {
  const {
    callState,
    callType,
    callTarget,
    isMinimized,
    toggleMinimize,
    callDuration,
    formatDuration,
    endCall
  } = useCall();

  // If idle, only render incoming dialog if active
  if (callState === 'idle') {
    return <IncomingCallDialog />;
  }

  if (callState === 'incoming') {
    return <IncomingCallDialog />;
  }

  // Minimized Floating Widget Mode
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-72 sm:w-80 rounded-3xl glass-dropdown border border-brand-500/40 p-3 shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2.5 min-w-0">
            <Avatar
              src={callTarget?.avatar}
              name={callTarget?.name}
              size="sm"
              showStatus={false}
              ring={true}
            />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">{callTarget?.name}</h4>
              <p className="text-[10px] font-mono text-emerald-400">
                {callState === 'calling' ? 'Ringing...' : formatDuration(callDuration)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={toggleMinimize}
              title="Expand"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={endCall}
              title="End Call"
              className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/20"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mini Status Visualizer */}
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-accent-cyan animate-pulse" />
        </div>
      </div>
    );
  }

  // Full Screen Active Call Overlay
  return (
    <div className="fixed inset-0 z-50 bg-background-deep/95 backdrop-blur-2xl flex flex-col items-center justify-between p-3 sm:p-6 animate-fade-in">
      {/* Main Call Stage */}
      <div className="relative w-full flex-1 max-w-5xl max-h-[85vh] rounded-3xl overflow-hidden glass-panel shadow-2xl">
        {callType === 'video' ? <VideoCallView /> : <AudioCallView />}
      </div>

      {/* Floating Call Controls Dock */}
      <div className="relative z-20 mt-4 mb-2">
        <CallControls />
      </div>
    </div>
  );
}

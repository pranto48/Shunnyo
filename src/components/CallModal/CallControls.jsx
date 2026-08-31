/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React from 'react';
import { useCall } from '../../context/CallContext';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  MonitorUp, 
  Volume2, 
  VolumeX, 
  Minimize2, 
  Maximize2 
} from 'lucide-react';

export default function CallControls() {
  const {
    callType,
    isMuted,
    isVideoOff,
    isScreenSharing,
    isSpeakerMuted,
    isMinimized,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
    toggleSpeaker,
    toggleMinimize,
    endCall
  } = useCall();

  return (
    <div className="flex items-center justify-center space-x-3 sm:space-x-4 p-4 rounded-3xl glass-dropdown border border-white/10 shadow-2xl backdrop-blur-2xl">
      {/* Mute Mic Button */}
      <button
        onClick={toggleMute}
        title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-200 active:scale-95 ${
          isMuted
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-glow-rose'
            : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700/90 border border-slate-700'
        }`}
      >
        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {/* Camera Toggle Button (For video calls) */}
      {callType === 'video' && (
        <button
          onClick={toggleVideo}
          title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
          className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-200 active:scale-95 ${
            isVideoOff
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-glow-rose'
              : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700/90 border border-slate-700'
          }`}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>
      )}

      {/* Screen Share Button */}
      <button
        onClick={toggleScreenShare}
        title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
        className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-200 active:scale-95 ${
          isScreenSharing
            ? 'bg-accent-cyan/20 text-accent-cyan border border-cyan-500/40 shadow-glow-cyan'
            : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700/90 border border-slate-700'
        }`}
      >
        <MonitorUp className="w-5 h-5" />
      </button>

      {/* Speaker Mute Button */}
      <button
        onClick={toggleSpeaker}
        title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
        className={`p-3.5 sm:p-4 rounded-2xl transition-all duration-200 active:scale-95 ${
          isSpeakerMuted
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700/90 border border-slate-700'
        }`}
      >
        {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* Minimize / Floating window button */}
      <button
        onClick={toggleMinimize}
        title={isMinimized ? 'Expand Call Window' : 'Minimize to Floating PiP'}
        className="p-3.5 sm:p-4 rounded-2xl bg-slate-800/90 text-slate-200 hover:bg-slate-700/90 border border-slate-700 transition-all duration-200 active:scale-95 hidden sm:flex"
      >
        {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
      </button>

      {/* End Call Button */}
      <button
        onClick={endCall}
        title="End Call"
        className="p-3.5 sm:p-4 px-6 sm:px-7 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-glow-rose border border-rose-500/50 active:scale-95 transition-all duration-200"
      >
        <PhoneOff className="w-5 h-5" />
      </button>
    </div>
  );
}

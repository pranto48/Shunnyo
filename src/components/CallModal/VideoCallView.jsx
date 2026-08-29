import React, { useRef, useEffect } from 'react';
import { useCall } from '../../context/CallContext';
import { useChat } from '../../context/ChatContext';
import Avatar from '../Shared/Avatar';
import { 
  ShieldCheck, 
  User, 
  SignalHigh, 
  Radio
} from 'lucide-react';

export default function VideoCallView() {
  const { 
    callTarget, 
    callDuration, 
    formatDuration, 
    isVideoOff, 
    callState, 
    localStream, 
    remoteStream,
    webrtcStatus 
  } = useCall();
  const { currentUser } = useChat();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Attach local media stream to local video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoOff]);

  // Attach remote stream to remote video element if available
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden rounded-3xl bg-slate-950/80">
      {/* Remote Video Stream Stage */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-background-deep to-slate-950" />

        {/* Real Remote WebRTC Video Stream or Ambient Visuals */}
        {remoteStream && remoteStream.getVideoTracks().length > 0 ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative">
            <img
              src={callTarget?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=80'}
              alt="Remote Stream"
              className="w-full h-full object-cover filter blur-sm scale-110 opacity-30"
            />

            <div className="absolute flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <Avatar
                  src={callTarget?.avatar}
                  name={callTarget?.name}
                  size="2xl"
                  ring={true}
                  showStatus={false}
                  className="shadow-2xl ring-4 ring-brand-500/40"
                />
                <div className="absolute inset-0 rounded-full border-2 border-brand-400 animate-ripple pointer-events-none" />
              </div>

              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {callTarget?.name}
                </h2>
                <p className="text-xs sm:text-sm text-brand-300 font-mono mt-1">
                  {callState === 'calling' ? 'সংযোগ করা হচ্ছে (Google STUN)...' : `P2P WebRTC HD • ${formatDuration(callDuration)}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Bar: Connection Metas, STUN NAT Traversal & Encryption */}
      <div className="relative z-10 w-full flex items-center justify-between">
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl glass-card text-xs text-slate-200">
          <ShieldCheck className="w-4 h-4 text-accent-cyan" />
          <span className="font-semibold">{callTarget?.name}</span>
          <span className="text-slate-500">|</span>
          <span className="font-mono text-brand-400 font-bold">{formatDuration(callDuration)}</span>
        </div>

        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl glass-card text-[11px] font-mono text-slate-300">
          <Radio className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
          <span className="hidden sm:inline">STUN: stun.l.google.com:19302</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
            P2P Direct
          </span>
        </div>
      </div>

      {/* Picture-in-Picture Local Self Camera Preview with Live WebRTC Video Tag */}
      <div className="relative z-10 w-full flex justify-end">
        <div className="w-28 h-40 sm:w-40 sm:h-52 rounded-2xl overflow-hidden glass-card border border-white/20 shadow-2xl relative group transition-transform hover:scale-105 duration-300 bg-slate-900">
          {isVideoOff ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-slate-500">
              <User className="w-8 h-8 text-slate-600 mb-1" />
              <span className="text-[10px] font-medium">ক্যামেরা অফ</span>
            </div>
          ) : localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100" // Mirror local camera view
            />
          ) : (
            <div className="w-full h-full relative">
              <img
                src={currentUser.avatar}
                alt="Self View"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          {/* Self View Overlay Badge */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-medium text-white pointer-events-none drop-shadow">
            <span className="truncate">You (Self)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

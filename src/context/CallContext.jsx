import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { sounds } from '../utils/soundEffects';
import { webrtcService } from '../services/webrtcService';

const CallContext = createContext();

export function CallProvider({ children }) {
  const [callState, setCallState] = useState('idle'); // 'idle' | 'calling' | 'incoming' | 'connected' | 'ended'
  const [callType, setCallType] = useState('video'); // 'video' | 'audio'
  const [callTarget, setCallTarget] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // WebRTC MediaStreams
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [webrtcStatus, setWebrtcStatus] = useState('idle');

  const durationTimerRef = useRef(null);
  const connectingTimerRef = useRef(null);

  // Initialize WebRTC Call Handlers on mount
  useEffect(() => {
    webrtcService.initialize({
      onRemoteStream: (stream) => {
        console.log('[CallContext] Received remote WebRTC stream');
        setRemoteStream(stream);
      },
      onConnectionStateChange: (state) => {
        setWebrtcStatus(state);
        if (state === 'connected') {
          setCallState('connected');
          sounds.playCallConnected();
        } else if (state === 'disconnected' || state === 'failed') {
          endCall();
        }
      }
    });

    return () => {
      webrtcService.close();
      sounds.stopRingtone();
    };
  }, []);

  // Duration timer when call is connected
  useEffect(() => {
    if (callState === 'connected') {
      setCallDuration(0);
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [callState]);

  const startCall = async (contact, type = 'video') => {
    setCallTarget(contact);
    setCallType(type);
    setCallState('calling');
    setIsMuted(false);
    setIsVideoOff(type === 'audio');
    setIsScreenSharing(false);
    setIsMinimized(false);
    setCallDuration(0);

    sounds.startOutgoingRingtone();

    // 1. Initialize WebRTC Media Stream & SDP Offer
    try {
      const stream = await webrtcService.getLocalMediaStream(type);
      setLocalStream(stream);
      await webrtcService.createOffer();
    } catch (e) {
      console.warn('WebRTC start error:', e);
    }

    // Auto-connect call after 3.5s for seamless simulation
    if (connectingTimerRef.current) clearTimeout(connectingTimerRef.current);
    connectingTimerRef.current = setTimeout(() => {
      setCallState('connected');
      sounds.playCallConnected();
    }, 3500);
  };

  const receiveCall = (contact, type = 'video') => {
    setCallTarget(contact);
    setCallType(type);
    setCallState('incoming');
    setIsMuted(false);
    setIsVideoOff(type === 'audio');
    setIsScreenSharing(false);
    setIsMinimized(false);
    sounds.startIncomingRingtone();
  };

  const acceptCall = async () => {
    sounds.stopRingtone();
    try {
      const stream = await webrtcService.getLocalMediaStream(callType);
      setLocalStream(stream);
    } catch (e) {
      console.warn('WebRTC accept error:', e);
    }
    setCallState('connected');
    sounds.playCallConnected();
  };

  const declineCall = () => {
    webrtcService.close();
    sounds.stopRingtone();
    sounds.playCallEnded();
    setCallState('ended');
    setTimeout(() => {
      setCallState('idle');
      setCallTarget(null);
      setLocalStream(null);
      setRemoteStream(null);
    }, 1200);
  };

  const endCall = () => {
    if (connectingTimerRef.current) clearTimeout(connectingTimerRef.current);
    webrtcService.close();
    sounds.stopRingtone();
    sounds.playCallEnded();
    setCallState('ended');
    setTimeout(() => {
      setCallState('idle');
      setCallTarget(null);
      setLocalStream(null);
      setRemoteStream(null);
      setIsMinimized(false);
    }, 1200);
  };

  const toggleMute = () => {
    sounds.playClick();
    const isNowMuted = !isMuted;
    webrtcService.toggleAudio(!isNowMuted);
    setIsMuted(isNowMuted);
  };

  const toggleVideo = () => {
    sounds.playClick();
    const isNowOff = !isVideoOff;
    webrtcService.toggleVideo(!isNowOff);
    setIsVideoOff(isNowOff);
  };

  const toggleScreenShare = async () => {
    sounds.playClick();
    if (!isScreenSharing) {
      const stream = await webrtcService.startScreenShare();
      if (stream) {
        setIsScreenSharing(true);
      }
    } else {
      await webrtcService.stopScreenShare();
      setIsScreenSharing(false);
    }
  };

  const toggleSpeaker = () => {
    sounds.playClick();
    setIsSpeakerMuted((prev) => !prev);
  };

  const toggleMinimize = () => {
    sounds.playClick();
    setIsMinimized((prev) => !prev);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <CallContext.Provider
      value={{
        callState,
        callType,
        callTarget,
        isMuted,
        isVideoOff,
        isScreenSharing,
        isSpeakerMuted,
        isMinimized,
        callDuration,
        formatDuration,
        localStream,
        remoteStream,
        webrtcStatus,
        startCall,
        receiveCall,
        acceptCall,
        declineCall,
        endCall,
        toggleMute,
        toggleVideo,
        toggleScreenShare,
        toggleSpeaker,
        toggleMinimize
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export const useCall = () => useContext(CallContext);

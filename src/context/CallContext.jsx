import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { sounds } from '../utils/soundEffects';
import { webrtcService } from '../services/webrtcService';
import { liveChatService } from '../services/liveChatService';
import { currentUser } from '../data/mockData';

const CallContext = createContext();

export function CallProvider({ children }) {
  const [callState, setCallState] = useState('idle'); // 'idle' | 'calling' | 'incoming' | 'connected' | 'ended'
  const [callType, setCallType] = useState('audio'); // 'audio' | 'video'
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
  const simulationTimerRef = useRef(null);

  // 1. Initialize WebRTC Media Handlers & WebSocket Call Signaling
  useEffect(() => {
    webrtcService.initialize({
      onRemoteStream: (stream) => {
        console.log('[WebRTC Call] Received remote audio/video stream');
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

    // Listen for incoming call signals over WebSocket
    const unsubOffer = liveChatService.on('offer', (data) => {
      console.log('[WebRTC Call] Incoming call offer received:', data);
      if (callState === 'idle') {
        const callerContact = {
          id: data.fromPeerId || data.callerId || 'peer_caller',
          name: data.callerName || 'Online Peer',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          status: 'online',
          role: 'Audio Caller'
        };
        receiveCall(callerContact, data.callType || 'audio');
      }
    });

    const unsubAnswer = liveChatService.on('answer', async (data) => {
      console.log('[WebRTC Call] Remote call answer received');
      sounds.stopRingtone();
      setCallState('connected');
      sounds.playCallConnected();
    });

    const unsubHangup = liveChatService.on('hangup', () => {
      console.log('[WebRTC Call] Remote peer hung up');
      endCall();
    });

    return () => {
      unsubOffer();
      unsubAnswer();
      unsubHangup();
      webrtcService.close();
      sounds.stopRingtone();
    };
  }, [callState]);

  // Duration timer when connected
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
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [callState]);

  /**
   * Start Outgoing Audio/Video Call to an Online User
   */
  const startCall = async (contact, type = 'audio') => {
    setCallTarget(contact);
    setCallType(type);
    setCallState('calling');
    setIsMuted(false);
    setIsVideoOff(type === 'audio');
    setIsScreenSharing(false);
    setIsMinimized(false);
    setCallDuration(0);

    sounds.startOutgoingRingtone();

    // 1. Acquire Local Audio/Video Media Stream
    try {
      const stream = await webrtcService.getLocalMediaStream(type);
      setLocalStream(stream);

      // 2. Generate SDP Offer
      const offer = await webrtcService.createOffer();

      // 3. Broadcast Offer over Cloudflare WebSocket to peer
      liveChatService.sendPayload('offer', {
        sdp: offer?.sdp,
        callType: type,
        callerId: currentUser.id,
        callerName: currentUser.name,
        calleeId: contact.id
      });
    } catch (e) {
      console.warn('[WebRTC Audio] Stream init warning:', e);
    }

    // Auto-connect fallback simulation after 3.2s if peer is demo or offline
    if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
    if (contact.id.startsWith('c-')) {
      simulationTimerRef.current = setTimeout(() => {
        sounds.stopRingtone();
        setCallState('connected');
        sounds.playCallConnected();
      }, 3200);
    }
  };

  /**
   * Receive Incoming Call
   */
  const receiveCall = (contact, type = 'audio') => {
    setCallTarget(contact);
    setCallType(type);
    setCallState('incoming');
    setIsMuted(false);
    setIsVideoOff(type === 'audio');
    setIsScreenSharing(false);
    setIsMinimized(false);
    sounds.startIncomingRingtone();
  };

  /**
   * Accept Incoming Call
   */
  const acceptCall = async () => {
    sounds.stopRingtone();
    try {
      const stream = await webrtcService.getLocalMediaStream(callType);
      setLocalStream(stream);

      const answer = await webrtcService.createAnswer();
      liveChatService.sendPayload('answer', {
        sdp: answer?.sdp,
        fromPeerId: currentUser.id,
        calleeId: callTarget?.id
      });
    } catch (e) {
      console.warn('WebRTC accept error:', e);
    }
    setCallState('connected');
    sounds.playCallConnected();
  };

  /**
   * Decline Incoming Call
   */
  const declineCall = () => {
    liveChatService.sendPayload('hangup', { fromPeerId: currentUser.id });
    webrtcService.close();
    sounds.stopRingtone();
    sounds.playCallEnded();
    setCallState('ended');
    setTimeout(() => {
      setCallState('idle');
      setCallTarget(null);
      setLocalStream(null);
      setRemoteStream(null);
    }, 1000);
  };

  /**
   * End Active Call
   */
  const endCall = () => {
    if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
    liveChatService.sendPayload('hangup', { fromPeerId: currentUser.id });
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
    }, 1000);
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
      const screenStream = await webrtcService.startScreenShare();
      if (screenStream) {
        setLocalStream(screenStream);
        setIsScreenSharing(true);
      }
    } else {
      const origStream = await webrtcService.stopScreenShare(callType);
      if (origStream) {
        setLocalStream(origStream);
        setIsScreenSharing(false);
      }
    }
  };

  const toggleSpeaker = () => {
    sounds.playClick();
    setIsSpeakerMuted(!isSpeakerMuted);
  };

  const toggleMinimize = () => {
    sounds.playClick();
    setIsMinimized(!isMinimized);
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
        toggleMinimize,
        formatDuration
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export const useCall = () => useContext(CallContext);

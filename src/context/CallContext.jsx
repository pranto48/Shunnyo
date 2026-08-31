/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

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
  const [isGroupCall, setIsGroupCall] = useState(false);
  const [groupCallParticipants, setGroupCallParticipants] = useState([]);
  const [activeGroupCalls, setActiveGroupCalls] = useState({}); // { [groupId]: { groupName, callerName, count, startedAt } }

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Call History
  const [callHistory, setCallHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('shunnyo_call_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [showCallHistory, setShowCallHistory] = useState(false);

  // WebRTC MediaStreams
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [webrtcStatus, setWebrtcStatus] = useState('idle');

  const durationTimerRef = useRef(null);
  const simulationTimerRef = useRef(null);
  const speakingIntervalRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const callTargetRef = useRef(null);
  const callTypeRef = useRef('audio');
  const callDirectionRef = useRef('outgoing'); // 'outgoing' | 'incoming'

  // Save a call log entry
  const saveCallLog = (status, durationSecs = 0, contactOverride = null) => {
    const contact = contactOverride || callTargetRef.current;
    if (!contact) return;
    const entry = {
      id: `call-${Date.now()}`,
      contactId: contact.id,
      contactName: contact.name,
      contactAvatar: contact.avatar || '',
      callType: callTypeRef.current,
      direction: callDirectionRef.current,
      status, // 'completed' | 'missed' | 'rejected' | 'cancelled'
      duration: durationSecs,
      timestamp: new Date().toISOString(),
      isGroup: false
    };
    setCallHistory((prev) => {
      const next = [entry, ...prev].slice(0, 100); // keep last 100
      try { localStorage.setItem('shunnyo_call_history', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const missedCallCount = callHistory.filter(
    (c) => c.status === 'missed' && !c.seen
  ).length;

  const clearMissedBadge = () => {
    setCallHistory((prev) => {
      const next = prev.map((c) => ({ ...c, seen: true }));
      try { localStorage.setItem('shunnyo_call_history', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const clearCallHistory = () => {
    setCallHistory([]);
    try { localStorage.removeItem('shunnyo_call_history'); } catch {}
  };

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

    // Listen for incoming 1-on-1 call signals over WebSocket
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

    // Listen for Group Audio Call Announcements
    const unsubGroupStart = liveChatService.on('group_call:start', (data) => {
      console.log('[Group Call] Group call started:', data);
      setActiveGroupCalls((prev) => ({
        ...prev,
        [data.groupId]: {
          groupId: data.groupId,
          groupName: data.groupName,
          callerName: data.callerName,
          callerId: data.callerId,
          participantsCount: 2,
          startedAt: Date.now()
        }
      }));
    });

    const unsubGroupLeave = liveChatService.on('group_call:leave', (data) => {
      if (data.groupId && activeGroupCalls[data.groupId]) {
        setActiveGroupCalls((prev) => {
          const next = { ...prev };
          delete next[data.groupId];
          return next;
        });
      }
    });

    return () => {
      unsubOffer();
      unsubAnswer();
      unsubHangup();
      unsubGroupStart();
      unsubGroupLeave();
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

  // Speaking indicator cycle simulation for group participants
  useEffect(() => {
    if (callState === 'connected' && isGroupCall && groupCallParticipants.length > 0) {
      speakingIntervalRef.current = setInterval(() => {
        setGroupCallParticipants((prev) =>
          prev.map((p) => ({
            ...p,
            isSpeaking: Math.random() > 0.65
          }))
        );
      }, 2000);
    } else {
      if (speakingIntervalRef.current) {
        clearInterval(speakingIntervalRef.current);
        speakingIntervalRef.current = null;
      }
    }

    return () => {
      if (speakingIntervalRef.current) clearInterval(speakingIntervalRef.current);
    };
  }, [callState, isGroupCall]);

  /**
   * Start 1-on-1 Audio/Video Call
   */
  const startCall = async (contact, type = 'audio') => {
    setIsGroupCall(false);
    setGroupCallParticipants([]);
    setCallTarget(contact);
    callTargetRef.current = contact;
    callTypeRef.current = type;
    callDirectionRef.current = 'outgoing';
    callStartTimeRef.current = Date.now();
    setCallType(type);
    setCallState('calling');
    setIsMuted(false);
    setIsVideoOff(type === 'audio');
    setIsScreenSharing(false);
    setIsMinimized(false);
    setCallDuration(0);

    sounds.startOutgoingRingtone();

    try {
      const stream = await webrtcService.getLocalMediaStream(type);
      setLocalStream(stream);

      const offer = await webrtcService.createOffer();
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

    if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
    if (contact.id.startsWith('c-')) {
      simulationTimerRef.current = setTimeout(() => {
        sounds.stopRingtone();
        setCallState('connected');
        callStartTimeRef.current = Date.now();
        sounds.playCallConnected();
      }, 3200);
    }
  };

  /**
   * Start Multi-User Group Audio Conference Call
   */
  const startGroupAudioCall = async (groupContact) => {
    sounds.playClick();
    setIsGroupCall(true);
    setCallTarget(groupContact);
    setCallType('audio');
    setIsMuted(false);
    setIsVideoOff(true);
    setIsScreenSharing(false);
    setIsMinimized(false);
    setCallDuration(0);

    // Initial group participants list
    const members = groupContact.members || [
      { id: 'c-1', name: 'Nafis Ahmed', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', role: 'Security' },
      { id: 'c-2', name: 'Zarin Tasnim', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', role: 'Frontend' },
      { id: 'c-3', name: 'Tahmid Hasan', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'DevOps' }
    ];

    const participants = [
      {
        id: currentUser.id,
        name: `${currentUser.name} (আপনি)`,
        avatar: currentUser.avatar,
        role: 'Call Host',
        isMuted: false,
        isSpeaking: false
      },
      ...members.map((m) => ({
        id: m.id,
        name: m.name,
        avatar: m.avatar,
        role: m.role || 'Member',
        isMuted: false,
        isSpeaking: true
      }))
    ];

    setGroupCallParticipants(participants);

    try {
      const stream = await webrtcService.getLocalMediaStream('audio');
      setLocalStream(stream);
    } catch (e) {
      console.warn('Group audio stream fallback:', e);
    }

    // Broadcast group call started over WebSocket
    liveChatService.sendPayload('group_call:start', {
      groupId: groupContact.id,
      groupName: groupContact.name
    });

    setCallState('connected');
    sounds.playCallConnected();
  };

  /**
   * Join an ongoing Group Audio Conference Call
   */
  const joinGroupCall = async (groupContact) => {
    startGroupAudioCall(groupContact);
    liveChatService.sendPayload('group_call:join', {
      groupId: groupContact.id
    });
  };

  /**
   * Receive Incoming Call
   */
  const receiveCall = (contact, type = 'audio') => {
    setIsGroupCall(false);
    setCallTarget(contact);
    callTargetRef.current = contact;
    callTypeRef.current = type;
    callDirectionRef.current = 'incoming';
    callStartTimeRef.current = null;
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
    callStartTimeRef.current = Date.now();
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
    saveCallLog('rejected', 0);
    liveChatService.sendPayload('hangup', { fromPeerId: currentUser.id });
    webrtcService.close();
    sounds.stopRingtone();
    sounds.playCallEnded();
    setCallState('ended');
    setTimeout(() => {
      setCallState('idle');
      setCallTarget(null);
      callTargetRef.current = null;
      setLocalStream(null);
      setRemoteStream(null);
    }, 1000);
  };

  /**
   * End Active Call
   */
  const endCall = () => {
    if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
    // Save completed call log
    const durationSecs = callStartTimeRef.current
      ? Math.round((Date.now() - callStartTimeRef.current) / 1000)
      : 0;
    const wasConnected = callState === 'connected';
    const wasCalling = callState === 'calling';
    if (wasConnected) {
      saveCallLog('completed', durationSecs);
    } else if (wasCalling) {
      saveCallLog('cancelled', 0);
    } else if (callState === 'incoming') {
      saveCallLog('missed', 0);
    }
    callStartTimeRef.current = null;
    callTargetRef.current = null;

    if (isGroupCall && callTarget) {
      liveChatService.sendPayload('group_call:leave', { groupId: callTarget.id });
    } else {
      liveChatService.sendPayload('hangup', { fromPeerId: currentUser.id });
    }
    webrtcService.close();
    sounds.stopRingtone();
    sounds.playCallEnded();
    setCallState('ended');
    setTimeout(() => {
      setCallState('idle');
      setCallTarget(null);
      setIsGroupCall(false);
      setGroupCallParticipants([]);
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

    if (isGroupCall) {
      setGroupCallParticipants((prev) =>
        prev.map((p) => (p.id === currentUser.id ? { ...p, isMuted: isNowMuted } : p))
      );
    }
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
        isGroupCall,
        groupCallParticipants,
        activeGroupCalls,
        isMuted,
        isVideoOff,
        isScreenSharing,
        isSpeakerMuted,
        isMinimized,
        callDuration,
        localStream,
        remoteStream,
        webrtcStatus,
        callHistory,
        missedCallCount,
        showCallHistory,
        setShowCallHistory,
        clearMissedBadge,
        clearCallHistory,
        startCall,
        startGroupAudioCall,
        joinGroupCall,
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

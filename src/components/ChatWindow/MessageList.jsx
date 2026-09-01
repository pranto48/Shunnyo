/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import MessageBubble from './MessageBubble';
import Avatar from '../Shared/Avatar';
import { Lock, Shield, Sparkles, Radio, Zap, ArrowDown, Search } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function MessageList() {
  const { activeMessages, activeContact, activeContactId, liveTextStreams, messageSearchQuery } = useChat();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const liveStream = liveTextStreams && liveTextStreams[activeContactId];

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isFarFromBottom);
  };

  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom();
    }
  }, [activeMessages, activeContact?.isTyping, liveStream?.text]);

  const displayedMessages = activeMessages.filter((msg) => {
    if (!msg || !msg.content) return false;
    if (msg.content.includes('Decryption Error') || msg.content.includes('corrupted ciphertext')) return false;
    if (!messageSearchQuery?.trim()) return true;
    return msg.content?.toLowerCase().includes(messageSearchQuery.toLowerCase());
  });

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 relative bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.08),rgba(255,255,255,0))]"
    >
      {/* End to end encryption notice header */}
      <div className="flex justify-center my-4">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 backdrop-blur-md shadow-sm">
          <Lock className="w-3 h-3 text-accent-cyan" />
          <span>মেসেজ ও কলসমূহ এন্ড-টু-এন্ড এনক্রিপ্টেড ও সম্পূর্ণ নিরাপদ।</span>
        </div>
      </div>

      {messageSearchQuery && (
        <div className="flex justify-center my-2">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-xl bg-brand-500/20 border border-brand-500/40 text-xs text-brand-300">
            <Search className="w-3.5 h-3.5" />
            <span>"{messageSearchQuery}" এর জন্য {displayedMessages.length} টি ফলাফল পাওয়া গেছে</span>
          </div>
        </div>
      )}

      {/* Date Divider */}
      <div className="flex items-center justify-center my-4">
        <span className="px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700/40 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          আজকের কথোপকথন
        </span>
      </div>

      {/* Message items */}
      {displayedMessages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isGroup={activeContact?.isGroup}
        />
      ))}

      {/* Real-Time Live Keystroke Text Streaming Bubble */}
      {liveStream && liveStream.text && (
        <div className="flex items-end space-x-2 mb-3 animate-fade-in max-w-[85%] sm:max-w-[70%]">
          <Avatar
            src={activeContact?.avatar}
            name={activeContact?.name}
            size="sm"
            showStatus={false}
          />
          <div className="px-4 py-2.5 rounded-2xl rounded-bl-xs bg-slate-900/90 border border-brand-500/60 shadow-glow-brand backdrop-blur-xl transition-all">
            <div className="flex items-center space-x-1.5 mb-1">
              <Zap className="w-3 h-3 text-brand-400 animate-pulse" />
              <span className="text-[10px] font-bold text-brand-300 font-mono">
                {liveStream.senderName || activeContact?.name || 'Peer'} লাইভ লিখছেন:
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-100 font-sans break-words whitespace-pre-wrap">
              {liveStream.text}
              <span className="inline-block w-1.5 h-3.5 bg-brand-400 ml-1 animate-ping" />
            </p>
          </div>
        </div>
      )}

      {/* Typing indicator bubble (when typing but no live text stream) */}
      {activeContact?.isTyping && (!liveStream || !liveStream.text) && (
        <div className="flex items-end space-x-2 mb-3 animate-fade-in">
          <Avatar
            src={activeContact.avatar}
            name={activeContact.name}
            size="sm"
            showStatus={false}
          />
          <div className="px-4 py-3 rounded-2xl rounded-bl-xs bg-background-card/90 border border-slate-700/60 flex items-center space-x-1.5 shadow-md">
            <span
              className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
              style={{ animationDuration: '0.9s' }}
            />
            <span
              className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
              style={{ animationDuration: '0.9s', animationDelay: '0.2s' }}
            />
            <span
              className="w-2 h-2 rounded-full bg-brand-400 animate-bounce"
              style={{ animationDuration: '0.9s', animationDelay: '0.4s' }}
            />
          </div>
        </div>
      )}

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => {
            sounds.playClick();
            scrollToBottom(true);
            setShowScrollBottom(false);
          }}
          className="fixed bottom-24 right-6 sm:right-10 p-2.5 rounded-full bg-brand-600 text-white shadow-glow-brand hover:bg-brand-500 active:scale-95 transition-all z-20 animate-scale-in"
          title="নতুন মেসেজে যান"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}

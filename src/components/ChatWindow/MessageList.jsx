import React, { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import MessageBubble from './MessageBubble';
import Avatar from '../Shared/Avatar';
import { Lock, Shield, Sparkles } from 'lucide-react';

export default function MessageList() {
  const { activeMessages, activeContact } = useChat();
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, activeContact?.isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 relative bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.08),rgba(255,255,255,0))]">
      {/* End to end encryption notice header */}
      <div className="flex justify-center my-4">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 backdrop-blur-md shadow-sm">
          <Lock className="w-3 h-3 text-accent-cyan" />
          <span>Messages & calls are end-to-end encrypted with zero-knowledge protocol.</span>
        </div>
      </div>

      {/* Date Divider */}
      <div className="flex items-center justify-center my-4">
        <span className="px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700/40 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          আজকের কথোপকথন
        </span>
      </div>

      {/* Message items */}
      {activeMessages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isGroup={activeContact?.isGroup}
        />
      ))}

      {/* Typing indicator bubble */}
      {activeContact?.isTyping && (
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

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}

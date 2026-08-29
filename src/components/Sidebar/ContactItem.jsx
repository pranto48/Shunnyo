import React from 'react';
import { useChat } from '../../context/ChatContext';
import Avatar from '../Shared/Avatar';
import Badge from '../Shared/Badge';
import { Pin, Users, CheckCheck, Check, Volume2, Image as ImageIcon } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function ContactItem({ contact }) {
  const { activeContactId, selectContact, activeMessages, messages } = useChat();
  const isActive = activeContactId === contact.id;

  // Get last message for this contact
  const contactMessages = messages[contact.id] || [];
  const lastMsg = contactMessages[contactMessages.length - 1];

  const handleClick = () => {
    sounds.playClick();
    selectContact(contact.id);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left p-3 rounded-2xl flex items-center space-x-3 transition-all duration-200 relative group select-none ${
        isActive
          ? 'bg-gradient-to-r from-brand-600/20 via-indigo-900/30 to-background-card border border-brand-500/40 shadow-glow-brand'
          : 'hover:bg-slate-800/40 hover:border-slate-700/40 border border-transparent'
      }`}
    >
      {/* Contact Avatar */}
      <Avatar
        src={contact.avatar}
        name={contact.name}
        status={contact.isGroup ? null : contact.status}
        size="md"
        ring={isActive}
      />

      {/* Center Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4
            className={`text-sm font-semibold truncate flex items-center gap-1.5 ${
              isActive ? 'text-white font-bold' : 'text-slate-200 group-hover:text-white'
            }`}
          >
            {contact.name}
            {contact.isGroup && (
              <Users className="w-3.5 h-3.5 text-accent-cyan flex-shrink-0" />
            )}
          </h4>
          {lastMsg && (
            <span
              className={`text-[11px] font-mono flex-shrink-0 ${
                contact.unreadCount > 0 ? 'text-brand-400 font-semibold' : 'text-slate-500'
              }`}
            >
              {lastMsg.timestamp}
            </span>
          )}
        </div>

        {/* Message preview or typing status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 min-w-0 pr-2">
            {contact.isTyping ? (
              <span className="text-xs text-brand-400 font-medium flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"></span>
                <span
                  className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                ></span>
                <span
                  className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                ></span>
                টাইপ করছেন...
              </span>
            ) : lastMsg ? (
              <p
                className={`text-xs truncate flex items-center gap-1 ${
                  contact.unreadCount > 0
                    ? 'text-slate-200 font-medium'
                    : 'text-slate-400 group-hover:text-slate-300'
                }`}
              >
                {lastMsg.senderId === 'user-me' && (
                  <span className="text-slate-500">
                    {lastMsg.status === 'read' ? (
                      <CheckCheck className="w-3.5 h-3.5 text-accent-cyan inline" />
                    ) : (
                      <Check className="w-3.5 h-3.5 inline" />
                    )}
                  </span>
                )}
                {lastMsg.attachment && (
                  <span className="inline-flex items-center text-accent-cyan gap-0.5">
                    <ImageIcon className="w-3 h-3" /> [ছবি]
                  </span>
                )}
                {lastMsg.audioDuration && (
                  <span className="inline-flex items-center text-accent-emerald gap-0.5">
                    <Volume2 className="w-3 h-3" /> ভয়েস নোট
                  </span>
                )}
                <span>{lastMsg.content || ''}</span>
              </p>
            ) : (
              <p className="text-xs text-slate-500 truncate">{contact.customStatus}</p>
            )}
          </div>

          {/* Right badges (Pin / Unread count) */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {contact.pinned && (
              <Pin className="w-3 h-3 text-slate-500 group-hover:text-slate-400" />
            )}
            {contact.unreadCount > 0 && (
              <Badge count={contact.unreadCount} variant="primary" />
            )}
          </div>
        </div>
      </div>

      {/* Active Left Indicator Bar */}
      {isActive && (
        <div className="absolute left-0 top-3 bottom-3 w-1 bg-brand-500 rounded-r-full shadow-glow-brand" />
      )}
    </button>
  );
}

/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useCall } from '../../context/CallContext';
import EmojiPicker from './EmojiPicker';
import AttachmentModal from './AttachmentModal';
import VoiceRecorderBar from './VoiceRecorderBar';
import { audioRecorderEngine } from '../../utils/audioRecorder';
import { 
  Send, 
  Smile, 
  Paperclip, 
  Mic, 
  Image as ImageIcon, 
  X, 
  Reply,
  Type,
  Palette,
  Check,
  UserX
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function ChatInput() {
  const { 
    sendMessage, 
    activeContact, 
    sendLiveTyping, 
    broadcastLiveText,
    replyingToMessage, 
    setReplyingToMessage,
    isBlocked,
    unblockUser
  } = useChat();
  const { startCall, callState } = useCall();

  const [text, setText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  // Text Styling State
  const [textColor, setTextColor] = useState('');
  const [textSize, setTextSize] = useState('normal'); // 'sm' | 'normal' | 'lg' | 'xl'

  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Auto-resize textarea height dynamically based on content on mobile and desktop
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const newHeight = Math.min(el.scrollHeight, 140);
    el.style.height = `${Math.max(newHeight, 42)}px`;
  }, [text]);

  const colorSwatches = [
    { label: 'ডিফল্ট', value: '', color: 'bg-slate-200 border-white/40' },
    { label: 'সায়ান', value: '#06b6d4', color: 'bg-cyan-400 border-cyan-300' },
    { label: 'সবুজ', value: '#10b981', color: 'bg-emerald-400 border-emerald-300' },
    { label: 'গোল্ডেন', value: '#fbbf24', color: 'bg-amber-400 border-amber-300' },
    { label: 'গোলাপী', value: '#f43f5e', color: 'bg-rose-400 border-rose-300' },
    { label: 'ভায়োলেট', value: '#c084fc', color: 'bg-purple-400 border-purple-300' },
    { label: 'কমলা', value: '#fb923c', color: 'bg-orange-400 border-orange-300' },
    { label: 'পিঙ্ক', value: '#f472b6', color: 'bg-pink-400 border-pink-300' }
  ];

  const sizeOptions = [
    { key: 'sm', label: 'ছোট (Small)', sizeClass: 'text-xs' },
    { key: 'normal', label: 'স্বাভাবিক (Normal)', sizeClass: 'text-sm' },
    { key: 'lg', label: 'বড় (Large)', sizeClass: 'text-base font-medium' },
    { key: 'xl', label: 'অতিরিক্ত বড় (Extra Large)', sizeClass: 'text-lg font-bold' }
  ];

  const handleInputChange = (e) => {
    const val = e.target.value;
    setText(val);

    if (broadcastLiveText) {
      broadcastLiveText(val);
    }

    if (sendLiveTyping) {
      sendLiveTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        sendLiveTyping(false);
      }, 2500);
    }
  };

  const handleSend = () => {
    if (!text.trim() && !pendingAttachment) return;

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (sendLiveTyping) sendLiveTyping(false);
    if (broadcastLiveText) broadcastLiveText('');

    const stylePayload = textColor || textSize !== 'normal' ? { textColor, textSize } : null;
    sendMessage(text.trim(), pendingAttachment, null, stylePayload);

    setText('');
    setPendingAttachment(null);
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);

    if (inputRef.current) {
      inputRef.current.style.height = '42px';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectEmoji = (emoji) => {
    sounds.playClick();
    setText((prev) => prev + emoji);
  };

  const startVoiceRecording = async () => {
    sounds.playClick();
    try {
      await audioRecorderEngine.start();
      setIsRecordingVoice(true);
      sounds.playMessageSent();
    } catch (err) {
      console.warn('Microphone permission denied:', err);
      setIsRecordingVoice(true);
    }
  };

  const handleSendVoiceNote = (audioAttachment) => {
    setIsRecordingVoice(false);
    sendMessage('', audioAttachment);
  };

  const currentSizeClass = 
    textSize === 'sm' ? 'text-xs' :
    textSize === 'lg' ? 'text-base font-medium' :
    textSize === 'xl' ? 'text-lg font-bold' : 'text-sm';

  return (
    <div className="p-3 sm:p-4 bg-background-surface/90 border-t border-slate-800/80 backdrop-blur-xl relative z-20 safe-bottom">
      {/* BLOCKED USER BANNER */}
      {activeContact && isBlocked(activeContact.id) && (
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-orange-950/60 border border-orange-500/30">
          <div className="flex items-center space-x-2.5">
            <UserX className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-orange-300">আপনি {activeContact.name} কে ব্লক করেছেন</p>
              <p className="text-[10px] text-orange-400/70">মেসেজ পাঠানো বা পাওয়া যাবে না</p>
            </div>
          </div>
          <button
            onClick={() => unblockUser(activeContact.id)}
            className="px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/40 text-orange-300 hover:text-white text-xs font-semibold border border-orange-500/30 transition-all active:scale-95"
          >
            আনব্লক করুন
          </button>
        </div>
      )}
      {/* Replying To Message Banner */}
      {replyingToMessage && (
        <div className="mb-2 flex items-center justify-between p-2.5 rounded-xl bg-slate-900/95 border-l-4 border-l-brand-500 border border-slate-800 text-xs animate-slide-up shadow-lg">
          <div className="flex items-center space-x-2.5 truncate min-w-0 pr-2">
            <Reply className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <div className="truncate min-w-0">
              <span className="font-bold text-brand-300 block text-[11px]">
                রিপ্লাই দিচ্ছেন: {replyingToMessage.senderName || 'ব্যবহারকারী'}
              </span>
              <span className="text-slate-300 text-xs truncate block opacity-90">
                {replyingToMessage.content || (replyingToMessage.attachment ? `[${replyingToMessage.attachment.type || 'Attachment'}]` : 'মেসেজ')}
              </span>
            </div>
          </div>
          <button
            onClick={() => setReplyingToMessage(null)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            title="রিপ্লাই বাতিল করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pending Attachment Preview Bar */}
      {pendingAttachment && (
        <div className="mb-2 flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-brand-500/40 text-xs animate-slide-up">
          <div className="flex items-center space-x-2 truncate">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="font-semibold text-white truncate block">{pendingAttachment.name || pendingAttachment.caption || 'Attachment'}</span>
              <span className="text-[10px] text-brand-300 font-mono">Cloudflare R2 E2EE Attached</span>
            </div>
          </div>
          <button
            onClick={() => setPendingAttachment(null)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Full Feature Emoji Picker Popover */}
      {showEmojiPicker && (
        <EmojiPicker
          onSelectEmoji={handleSelectEmoji}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* Text Styling (Color & Size) Popover */}
      {showStyleMenu && (
        <>
          <div 
            className="fixed inset-0 z-30" 
            onClick={() => setShowStyleMenu(false)} 
          />
          <div className="absolute left-4 bottom-20 w-72 rounded-3xl glass-dropdown p-4 shadow-2xl z-40 border border-slate-700/80 animate-scale-in select-none">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Palette className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">টেক্সট কালার ও সাইজ</span>
              </div>
              <button
                onClick={() => setShowStyleMenu(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Color Swatches */}
            <div className="mb-3">
              <label className="block text-[11px] font-semibold text-slate-300 mb-2">রং নির্বাচন করুন:</label>
              <div className="grid grid-cols-4 gap-2">
                {colorSwatches.map((swatch, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setTextColor(swatch.value);
                    }}
                    className={`h-7 rounded-xl flex items-center justify-center border transition-all ${swatch.color} ${
                      textColor === swatch.value ? 'ring-2 ring-white scale-110 shadow-lg' : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    title={swatch.label}
                  >
                    {textColor === swatch.value && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">ফন্ট সাইজ:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {sizeOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setTextSize(opt.key);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                      textSize === opt.key
                        ? 'bg-brand-500/25 border-brand-500/60 text-brand-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {textSize === opt.key && <Check className="w-3 h-3 text-brand-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Attachment Modal */}
      <AttachmentModal
        isOpen={showAttachmentMenu}
        onClose={() => setShowAttachmentMenu(false)}
        onSelectAttachment={(att) => setPendingAttachment(att)}
      />

      {/* When Active Voice Recording is Running: Messenger Voice Bar */}
      {isRecordingVoice ? (
        <VoiceRecorderBar
          onSendAudio={handleSendVoiceNote}
          onCancel={() => setIsRecordingVoice(false)}
        />
      ) : (
        /* Normal Chat Input Control Bar */
        <div className="flex items-end space-x-1 sm:space-x-2">
          {/* Quick Action Group (Facebook Messenger Style) */}
          <div className="flex items-center space-x-0.5 sm:space-x-1 flex-shrink-0">
            {/* 1. Quick One-Tap Photos & Gallery Share (Facebook Messenger Style) */}
            <input
              id="chat-file-input-quick"
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                sounds.playClick();
                const localUrl = URL.createObjectURL(file);
                setPendingAttachment({
                  type: file.type.startsWith('video/') ? 'video' : 'image',
                  url: localUrl,
                  localUrl: localUrl,
                  name: file.name,
                  caption: file.name,
                  size: file.size,
                  file: file
                });
                // Async upload to R2
                try {
                  const arrayBuffer = await file.arrayBuffer();
                  const blob = new Blob([arrayBuffer], { type: file.type });
                  const res = await cloudflareApi.uploadEncryptedFile(blob, file.name, file.type, activeContact?.id || 'anon');
                  if (res?.downloadUrl) {
                    setPendingAttachment((prev) => prev ? { ...prev, url: res.downloadUrl, fileKey: res.fileKey } : prev);
                  }
                } catch (r2Err) {
                  console.debug('Direct R2 attachment upload fallback:', r2Err);
                }
              }}
            />
            <button
              onClick={() => {
                sounds.playClick();
                document.getElementById('chat-file-input-quick')?.click();
              }}
              title="ছবি বা গ্যালারি শেয়ার করুন (Photos & Media)"
              className="p-2 sm:p-2.5 rounded-2xl text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 active:scale-90 transition-all duration-200"
            >
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-accent-cyan" />
            </button>

            {/* 2. Full Attachment Menu (Documents, Audio, Location) */}
            <button
              onClick={() => {
                sounds.playClick();
                setShowAttachmentMenu(!showAttachmentMenu);
              }}
              title="ফাইল ও ডকুমেন্ট সংযুক্ত করুন (Attach Files & More)"
              className={`p-2 sm:p-2.5 rounded-2xl text-slate-400 hover:text-brand-300 hover:bg-brand-500/10 active:scale-90 transition-all duration-200 border ${
                showAttachmentMenu ? 'bg-brand-500/20 border-brand-500/40 text-brand-300' : 'border-transparent'
              }`}
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* 3. Text Style (Color & Size) Button */}
            <button
              onClick={() => {
                sounds.playClick();
                setShowStyleMenu(!showStyleMenu);
              }}
              title="টেক্সট কালার ও সাইজ পরিবর্তন"
              className={`p-2 sm:p-2.5 rounded-2xl transition-all duration-200 border hidden xs:flex items-center justify-center ${
                textColor || textSize !== 'normal' || showStyleMenu
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 border-transparent'
              }`}
            >
              <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* 4. Emoji Popover Button */}
            <button
              onClick={() => {
                sounds.playClick();
                setShowEmojiPicker(!showEmojiPicker);
              }}
              title="Insert Emoji"
              className="p-2 sm:p-2.5 rounded-2xl text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 active:scale-90 transition-all duration-200 flex items-center justify-center"
            >
              <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Smart Text Input with Dynamic Auto-resize and Mobile Friendly Padding */}
          <div className="flex-1 min-w-0 relative rounded-2xl bg-slate-950/80 border border-slate-700/80 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500/60 transition-all flex items-center shadow-inner overflow-hidden">
            <textarea
              ref={inputRef}
              rows={1}
              value={text}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`${activeContact?.name ? activeContact.name + ' কে লিখুন...' : 'মেসেজ লিখুন...'}`}
              style={{ 
                minHeight: '42px',
                color: textColor || undefined
              }}
              className={`w-full px-3.5 py-2.5 sm:px-4 sm:py-2.5 bg-transparent placeholder-slate-500 focus:outline-none resize-none max-h-36 custom-scrollbar font-sans leading-relaxed text-sm sm:text-base ${currentSizeClass}`}
            />
          </div>

          {/* Action Group: Voice Mic or Send Button (Adaptive for Mobile) */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            {text.trim() || pendingAttachment ? (
              /* Active Send Action Button */
              <button
                onClick={() => {
                  sounds.playClick();
                  handleSend();
                }}
                title="মেসেজ পাঠান (Send)"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-glow-brand active:scale-95 transition-all duration-200 flex items-center justify-center"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            ) : (
              /* Voice Record Button when text is empty */
              <button
                onClick={startVoiceRecording}
                title="ভয়েস রেকর্ড করুন (Hold/Click to Record)"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-800/80 hover:bg-purple-600/30 text-slate-300 hover:text-purple-300 border border-slate-700 hover:border-purple-500/40 transition-all duration-200 active:scale-90 flex items-center justify-center"
              >
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

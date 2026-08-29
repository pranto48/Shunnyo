import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useCall } from '../../context/CallContext';
import AttachmentModal from './AttachmentModal';
import VoiceRecorderBar from './VoiceRecorderBar';
import { audioRecorderEngine } from '../../utils/audioRecorder';
import { 
  Paperclip, 
  Send, 
  Smile, 
  Mic, 
  Image as ImageIcon, 
  X, 
  Sparkles
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function ChatInput() {
  const { sendMessage, activeContact, sendLiveTyping } = useChat();
  const { startCall, callState } = useCall();

  const [text, setText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);

  const popularEmojis = [
    '😀', '😂', '😍', '🔥', '👍', '❤️', '🎉', '🚀',
    '✨', '💯', '🙌', '😎', '💡', '⚡', '🤖', '🔒'
  ];

  const handleInputChange = (e) => {
    const val = e.target.value;
    setText(val);

    if (sendLiveTyping) {
      sendLiveTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        sendLiveTyping(false);
      }, 1800);
    }
  };

  const handleSend = () => {
    if (!text.trim() && !pendingAttachment) return;

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (sendLiveTyping) sendLiveTyping(false);

    sendMessage(text.trim(), pendingAttachment);

    setText('');
    setPendingAttachment(null);
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
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
      // Fallback: Show voice recording simulation
      setIsRecordingVoice(true);
    }
  };

  const handleSendVoiceNote = (audioAttachment) => {
    setIsRecordingVoice(false);
    sendMessage('', audioAttachment);
  };

  return (
    <div className="p-3 sm:p-4 bg-background-surface/90 border-t border-slate-800/80 backdrop-blur-xl relative z-20">
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

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowEmojiPicker(false)}
          />
          <div className="absolute bottom-20 left-4 sm:left-14 w-68 rounded-2xl glass-dropdown p-3 shadow-2xl z-40 border border-slate-700/80 animate-scale-in">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
              <span>Quick Reactions</span>
              <button onClick={() => setShowEmojiPicker(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-xl">
              {popularEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSelectEmoji(emoji)}
                  className="p-2 rounded-xl hover:bg-white/10 hover:scale-125 transition-all text-center"
                >
                  {emoji}
                </button>
              ))}
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
        <div className="flex items-end space-x-2">
          {/* Attachment Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setShowAttachmentMenu(!showAttachmentMenu);
            }}
            title="Attach Files / Photos / Location (R2)"
            className={`p-2.5 rounded-2xl text-slate-400 hover:text-brand-300 hover:bg-brand-500/10 active:scale-95 transition-all duration-200 border ${
              showAttachmentMenu ? 'bg-brand-500/20 border-brand-500/40 text-brand-300' : 'border-transparent'
            }`}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Emoji Popover Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setShowEmojiPicker(!showEmojiPicker);
            }}
            title="Insert Emoji"
            className="p-2.5 rounded-2xl text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 active:scale-95 transition-all duration-200"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Smart Text Input */}
          <div className="flex-1 relative rounded-2xl bg-slate-950/70 border border-slate-800/80 focus-within:border-brand-500/80 focus-within:ring-1 focus-within:ring-brand-500/50 transition-all flex items-center shadow-inner overflow-hidden">
            <textarea
              ref={inputRef}
              rows={1}
              value={text}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`${activeContact?.name || 'চ্যাটে'} মেসেজ লিখুন...`}
              className="w-full px-4 py-2.5 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none max-h-32 custom-scrollbar font-sans"
              style={{ minHeight: '44px' }}
            />
          </div>

          {/* Messenger Style Audio Voice Record Button */}
          <button
            onClick={startVoiceRecording}
            title="ভয়েস মেসেজ রেকর্ড করুন (Record Voice Message)"
            className="p-2.5 rounded-2xl text-slate-400 hover:text-purple-300 hover:bg-purple-500/15 border border-transparent hover:border-purple-500/30 transition-all duration-200 active:scale-95"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Send Action Button */}
          <button
            onClick={() => {
              sounds.playClick();
              handleSend();
            }}
            disabled={!text.trim() && !pendingAttachment}
            title="Send Encrypted Message (Enter)"
            className={`p-2.5 rounded-2xl transition-all duration-200 flex items-center justify-center ${
              text.trim() || pendingAttachment
                ? 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-glow-brand active:scale-95'
                : 'bg-slate-800/60 text-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

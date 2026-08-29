import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useCall } from '../../context/CallContext';
import AttachmentModal from './AttachmentModal';
import { 
  Paperclip, 
  Send, 
  Smile, 
  Mic, 
  Square, 
  Image as ImageIcon, 
  X, 
  Phone, 
  Video,
  Sparkles
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function ChatInput() {
  const { sendMessage, activeContact } = useChat();
  const { startCall, callState } = useCall();

  const [text, setText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const inputRef = useRef(null);
  const recordTimerRef = useRef(null);

  const popularEmojis = [
    '😀', '😂', '😍', '🔥', '👍', '❤️', '🎉', '🚀',
    '✨', '💯', '🙌', '😎', '💡', '⚡', '🤖', '🔒'
  ];

  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingTime(0);
      recordTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [isRecordingVoice]);

  const handleSend = () => {
    if (!text.trim() && !pendingAttachment) return;

    sendMessage({
      text: text.trim(),
      attachment: pendingAttachment
    });

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

  const toggleVoiceRecording = () => {
    sounds.playClick();
    if (isRecordingVoice) {
      // Finish recording and send voice note
      const durationStr = `0:${recordingTime < 10 ? '0' + recordingTime : recordingTime}`;
      setIsRecordingVoice(false);
      sendMessage({
        text: '',
        audioDuration: recordingTime > 0 ? durationStr : '0:07'
      });
    } else {
      setIsRecordingVoice(true);
    }
  };

  const cancelRecording = () => {
    sounds.playClick();
    setIsRecordingVoice(false);
    setRecordingTime(0);
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
              <p className="font-semibold text-slate-200 truncate">
                {pendingAttachment.caption || 'Attached File'}
              </p>
              <p className="text-[10px] text-slate-400">Ready to transmit</p>
            </div>
          </div>
          <button
            onClick={() => setPendingAttachment(null)}
            className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attachment Popover Modal */}
      <AttachmentModal
        isOpen={showAttachmentMenu}
        onClose={() => setShowAttachmentMenu(false)}
        onSelectAttachment={(att) => {
          if (att.type === 'audio') {
            sendMessage({ text: '', audioDuration: att.audioDuration });
          } else {
            setPendingAttachment(att);
          }
        }}
      />

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowEmojiPicker(false)}
          />
          <div className="absolute bottom-20 right-16 sm:right-24 w-64 p-3 rounded-2xl glass-dropdown shadow-2xl z-40 border border-slate-700/80 animate-scale-in">
            <div className="text-xs font-semibold text-slate-400 mb-2 px-1">
              Quick Emojis
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {popularEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSelectEmoji(emoji)}
                  className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-lg hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main Input Control Bar */}
      <div className="flex items-center space-x-2">
        {/* Attachment Toggle Button */}
        <button
          onClick={() => {
            sounds.playClick();
            setShowAttachmentMenu(!showAttachmentMenu);
          }}
          title="Attach media or files"
          className="p-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-transparent hover:border-slate-700 active:scale-95 transition-all flex-shrink-0"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Dynamic Voice Recording Bar or Text Input */}
        {isRecordingVoice ? (
          <div className="flex-1 flex items-center justify-between bg-rose-500/10 border border-rose-500/30 rounded-2xl px-4 py-2.5 animate-pulse">
            <div className="flex items-center space-x-2 text-rose-400 text-xs font-mono font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>রেকর্ডিং হচ্ছে... 0:{recordingTime < 10 ? '0' + recordingTime : recordingTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={cancelRecording}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
              >
                বাতিল
              </button>
              <button
                onClick={toggleVoiceRecording}
                className="px-3 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold shadow-glow-rose hover:bg-rose-600"
              >
                পাঠান
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 relative flex items-center">
            <textarea
              ref={inputRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${activeContact?.name || ''}...`}
              className="w-full pl-4 pr-10 py-2.5 text-sm bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500/70 focus:ring-1 focus:ring-brand-500/50 resize-none max-h-32 transition-all"
            />
            {/* Emoji Button inside Input */}
            <button
              onClick={() => {
                sounds.playClick();
                setShowEmojiPicker(!showEmojiPicker);
              }}
              title="Add Emoji"
              className="absolute right-3 p-1 text-slate-400 hover:text-amber-400 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Voice Note Button (if empty text) or Send Button */}
        {!text.trim() && !pendingAttachment && !isRecordingVoice ? (
          <button
            onClick={toggleVoiceRecording}
            title="Record Voice Note"
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 active:scale-95 transition-all flex-shrink-0"
          >
            <Mic className="w-5 h-5" />
          </button>
        ) : !isRecordingVoice ? (
          <button
            onClick={handleSend}
            title="Send Message"
            className="p-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-glow-brand active:scale-95 transition-all flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : null}

        {/* Direct Call Shortcut Buttons in Input Area */}
        <div className="hidden lg:flex items-center space-x-1 border-l border-slate-800 pl-2">
          <button
            onClick={() => {
              sounds.playClick();
              startCall(activeContact, 'audio');
            }}
            disabled={callState !== 'idle'}
            title="Quick Audio Call"
            className="p-2 rounded-xl text-slate-400 hover:text-accent-emerald hover:bg-emerald-500/10 active:scale-95 transition-all disabled:opacity-40"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              startCall(activeContact, 'video');
            }}
            disabled={callState !== 'idle'}
            title="Quick Video Call"
            className="p-2 rounded-xl text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 active:scale-95 transition-all disabled:opacity-40"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

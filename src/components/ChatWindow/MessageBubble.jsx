import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { 
  CheckCheck, 
  Check, 
  Play, 
  Pause, 
  Smile, 
  Trash2, 
  MoreHorizontal, 
  Download,
  Volume2
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function MessageBubble({ message, isGroup = false }) {
  const { currentUser, addReaction, deleteMessage } = useChat();
  const isSentByMe = message.senderId === currentUser.id;

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const availableReactions = ['❤️', '👍', '🔥', '😂', '😮', '🚀'];

  const toggleAudioPlay = () => {
    sounds.playClick();
    setIsPlayingAudio(!isPlayingAudio);
  };

  const handleReact = (emoji) => {
    addReaction(message.id, emoji);
    setShowReactionPicker(false);
  };

  return (
    <div
      className={`flex flex-col mb-3.5 group relative ${
        isSentByMe ? 'items-end' : 'items-start'
      }`}
    >
      {/* Group Sender Name */}
      {isGroup && !isSentByMe && message.senderName && (
        <span className="text-[11px] font-bold text-accent-cyan mb-1 ml-1 font-mono">
          {message.senderName}
        </span>
      )}

      <div className="relative max-w-[85%] sm:max-w-[70%] md:max-w-[60%] flex items-end gap-1.5">
        {/* Hover Quick Action Toolbar */}
        <div
          className={`absolute top-0 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center bg-slate-900/95 border border-slate-700/80 rounded-full px-1.5 py-0.5 shadow-xl z-10 ${
            isSentByMe ? 'right-0' : 'left-0'
          }`}
        >
          {/* Reaction Picker Button */}
          <div className="relative">
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
              title="React"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>

            {/* Reaction Popover */}
            {showReactionPicker && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowReactionPicker(false)}
                />
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex items-center bg-slate-900 border border-slate-700 rounded-full p-1 shadow-2xl z-40 gap-1 animate-scale-in">
                  {availableReactions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReact(emoji)}
                      className="w-7 h-7 flex items-center justify-center hover:scale-125 transition-transform text-sm"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Delete Message Button */}
          <button
            onClick={() => deleteMessage(message.id)}
            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
            title="Delete Message"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* The Message Bubble Container */}
        <div
          className={`px-4 py-2.5 rounded-2xl relative shadow-md transition-all ${
            isSentByMe
              ? 'bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 text-white rounded-br-xs shadow-glow-brand'
              : 'bg-background-card/90 text-slate-100 rounded-bl-xs border border-slate-700/60 backdrop-blur-md'
          }`}
        >
          {/* Image Attachment Preview */}
          {message.attachment && message.attachment.type === 'image' && (
            <div className="mb-2 -mx-2 -mt-1 rounded-xl overflow-hidden relative group/img">
              <img
                src={message.attachment.url}
                alt="Attachment"
                onClick={() => setIsImageZoomed(true)}
                className="w-full max-h-60 object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-300 rounded-xl"
              />
              {message.attachment.caption && (
                <p className="text-xs mt-1.5 px-2 text-slate-300 font-medium">
                  {message.attachment.caption}
                </p>
              )}
            </div>
          )}

          {/* Voice Note Audio Bubble */}
          {message.audioDuration && (
            <div className="flex items-center space-x-3 py-1 min-w-[200px] sm:min-w-[240px]">
              <button
                onClick={toggleAudioPlay}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isSentByMe
                    ? 'bg-white text-brand-600 shadow-md hover:scale-105'
                    : 'bg-brand-500 text-white shadow-glow-brand hover:scale-105'
                }`}
              >
                {isPlayingAudio ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              {/* Animated Waveform Visualizer */}
              <div className="flex-1 flex items-center gap-0.5 h-6">
                {[40, 65, 85, 30, 90, 50, 75, 100, 45, 60, 80, 35, 70, 95, 55, 40, 85, 60, 30].map(
                  (height, i) => (
                    <div
                      key={i}
                      style={{ height: `${height}%` }}
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isPlayingAudio
                          ? 'bg-accent-emerald animate-pulse'
                          : isSentByMe
                          ? 'bg-white/60'
                          : 'bg-slate-500'
                      }`}
                    />
                  )
                )}
              </div>

              <span className="text-[11px] font-mono opacity-80 whitespace-nowrap">
                {message.audioDuration}
              </span>
            </div>
          )}

          {/* Text Content */}
          {message.content && (
            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {/* Bottom Metas (Timestamp + Receipts) */}
          <div
            className={`flex items-center justify-end space-x-1 mt-1 text-[10px] font-mono select-none ${
              isSentByMe ? 'text-indigo-100/80' : 'text-slate-400'
            }`}
          >
            <span>{message.timestamp}</span>
            {isSentByMe && (
              <span title={`Status: ${message.status}`}>
                {message.status === 'read' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-accent-cyan inline" />
                ) : message.status === 'delivered' ? (
                  <CheckCheck className="w-3.5 h-3.5 text-white/80 inline" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-white/60 inline" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Emoji Reactions Tray */}
      {message.reactions && message.reactions.length > 0 && (
        <div
          className={`flex items-center gap-1 mt-1 ${
            isSentByMe ? 'mr-1' : 'ml-1'
          }`}
        >
          {message.reactions.map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => addReaction(message.id, emoji)}
              className="px-1.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs shadow-sm hover:scale-110 active:scale-95 transition-all flex items-center gap-1"
            >
              <span>{emoji}</span>
              <span className="text-[10px] text-slate-400 font-mono">1</span>
            </button>
          ))}
        </div>
      )}

      {/* Zoom Image Lightbox Modal */}
      {isImageZoomed && message.attachment && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setIsImageZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img
              src={message.attachment.url}
              alt="Zoomed"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl"
            />
            {message.attachment.caption && (
              <p className="mt-3 text-slate-200 text-sm font-medium">
                {message.attachment.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

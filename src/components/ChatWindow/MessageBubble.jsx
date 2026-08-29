import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { 
  CheckCheck, 
  Check, 
  Smile, 
  Trash2, 
  Download, 
  FileText, 
  Video, 
  X, 
  ExternalLink, 
  Maximize2, 
  MapPin, 
  Navigation, 
  Radio, 
  Compass,
  Plus
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import EmojiPicker from './EmojiPicker';

export default function MessageBubble({ message, isGroup = false }) {
  const { currentUser, addReaction, deleteMessage } = useChat();
  const isSentByMe = message.senderId === currentUser.id;

  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showFullEmojiReactionPicker, setShowFullEmojiReactionPicker] = useState(false);
  const [isMediaZoomed, setIsMediaZoomed] = useState(false);

  const availableReactions = ['❤️', '👍', '🔥', '😂', '😮', '🚀', '🎉', '💯'];

  const handleReact = (emoji) => {
    sounds.playClick();
    addReaction(message.id, emoji);
    setShowReactionPicker(false);
    setShowFullEmojiReactionPicker(false);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'File';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Detect if message is solely 1 to 3 emojis
  const isOnlyEmojiMessage = (text) => {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.trim();
    if (trimmed.length > 14) return false;
    const emojiRegex = /^(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\s)+$/u;
    return emojiRegex.test(trimmed);
  };

  const isSoloEmoji = isOnlyEmojiMessage(message.content) && !message.attachment && !message.audioDuration;
  const attachment = message.attachment;
  const isAudio = attachment?.type === 'audio' || message.audioDuration;

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
                  <button
                    onClick={() => {
                      setShowReactionPicker(false);
                      setShowFullEmojiReactionPicker(true);
                    }}
                    className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                    title="More Emojis"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Delete Message */}
          <button
            onClick={() => deleteMessage(message.id)}
            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
            title="Delete Message"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Full Emoji Picker Popover for Reactions */}
        {showFullEmojiReactionPicker && (
          <EmojiPicker
            onSelectEmoji={handleReact}
            onClose={() => setShowFullEmojiReactionPicker(false)}
          />
        )}

        {/* Message Bubble Container */}
        <div
          className={`px-4 py-2.5 rounded-2xl relative shadow-md transition-all ${
            isSoloEmoji
              ? 'bg-transparent shadow-none px-1 py-1'
              : isSentByMe
              ? 'bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 text-white rounded-br-sm shadow-glow-brand'
              : 'bg-background-card/90 text-slate-100 rounded-bl-sm border border-slate-700/60 backdrop-blur-md'
          }`}
        >
          {/* 1. Image Attachment Preview */}
          {attachment && attachment.type === 'image' && (
            <div className="mb-2 -mx-2 -mt-1 rounded-xl overflow-hidden relative group/img bg-slate-950/50">
              <img
                src={attachment.url || attachment.localUrl}
                alt={attachment.name || 'Image'}
                onClick={() => setIsMediaZoomed(true)}
                className="w-full max-h-72 object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-300 rounded-xl"
              />
              <button
                onClick={() => setIsMediaZoomed(true)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-sm"
                title="Zoom Image"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              {attachment.caption && (
                <p className="text-xs mt-1.5 px-2 text-slate-200 font-medium">
                  {attachment.caption}
                </p>
              )}
            </div>
          )}

          {/* 2. Video Attachment Preview & Player */}
          {attachment && attachment.type === 'video' && (
            <div className="mb-2 -mx-2 -mt-1 rounded-xl overflow-hidden relative bg-slate-950/80 border border-slate-800">
              <video
                src={attachment.url || attachment.localUrl}
                controls
                className="w-full max-h-72 rounded-xl object-contain bg-black"
                preload="metadata"
              />
              <div className="p-2 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center space-x-1.5 truncate">
                  <Video className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="truncate font-semibold text-[11px]">{attachment.name || 'Video Clip'}</span>
                </div>
                {attachment.size && (
                  <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 ml-2">
                    {formatFileSize(attachment.size)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 3. Document / Generic File Card */}
          {attachment && (attachment.type === 'document' || attachment.type === 'file') && (
            <div className="mb-2 -mx-1 -mt-0.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-3 truncate">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center flex-shrink-0 border border-brand-500/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-100 truncate">{attachment.name || 'Document'}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {formatFileSize(attachment.size)} • E2EE Protected
                  </p>
                </div>
              </div>

              {attachment.url && (
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={attachment.name}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex-shrink-0"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          {/* 4. GPS & Live Location Sharing Card */}
          {attachment && attachment.type === 'location' && (
            <div className="mb-2 -mx-2 -mt-1 rounded-2xl overflow-hidden bg-slate-950/80 border border-slate-800 shadow-xl">
              <div className="h-32 w-full bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 relative flex items-center justify-center overflow-hidden border-b border-slate-800/80">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:16px_16px]" />
                
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/30 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-glow-emerald z-10">
                    <MapPin className="w-5 h-5 fill-emerald-400" />
                  </div>
                  <div className="absolute w-20 h-20 rounded-full border border-emerald-500/40 animate-ping opacity-40 pointer-events-none" />
                  <div className="absolute w-32 h-32 rounded-full border border-cyan-500/30 animate-ping opacity-20 pointer-events-none" style={{ animationDelay: '0.6s' }} />
                </div>

                {attachment.isLive && (
                  <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold animate-pulse">
                    <Radio className="w-3 h-3 text-rose-400 animate-spin" />
                    <span>লাইভ লোকেশন ({attachment.liveDuration || '15m'})</span>
                  </div>
                )}
              </div>

              <div className="p-3 space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{attachment.isLive ? 'রিয়েল-টাইম লাইভ লোকেশন' : 'বর্তমান অবস্থান (Shared Location)'}</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                    {attachment.address || `Lat: ${attachment.latitude?.toFixed(4)}, Long: ${attachment.longitude?.toFixed(4)}`}
                  </p>
                </div>

                <div className="pt-1 flex items-center space-x-2">
                  <a
                    href={attachment.externalMapUrl || `https://www.google.com/maps?q=${attachment.latitude},${attachment.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-all active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>গুগল ম্যাপে দেখুন</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${attachment.latitude},${attachment.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center justify-center space-x-1 transition-all active:scale-95"
                    title="ডাইরেকশন পান"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>ডাইরেকশন</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 5. Messenger-Style Native Voice Note Audio Player */}
          {isAudio && (
            <VoiceMessagePlayer
              audioUrl={attachment?.url || attachment?.localUrl}
              duration={attachment?.duration || message.audioDuration || '0:15'}
              isSentByMe={isSentByMe}
            />
          )}

          {/* 6. Text Content or Solo Large Emojis */}
          {message.content && (
            <p
              className={`leading-relaxed whitespace-pre-wrap select-text break-words ${
                isSoloEmoji
                  ? 'text-4xl sm:text-5xl py-1 text-center select-none hover:scale-110 transition-transform cursor-default'
                  : 'text-xs sm:text-sm'
              }`}
            >
              {message.content}
            </p>
          )}

          {/* Metadata & Status Footer */}
          {!isSoloEmoji && (
            <div
              className={`flex items-center justify-end space-x-1 mt-1 text-[10px] select-none ${
                isSentByMe ? 'text-brand-100/70' : 'text-slate-400'
              }`}
            >
              <span>{message.timestamp}</span>

              {isSentByMe && (
                <span className="ml-0.5">
                  {message.status === 'read' ? (
                    <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                  ) : message.status === 'delivered' ? (
                    <CheckCheck className="w-3.5 h-3.5 opacity-60" />
                  ) : (
                    <Check className="w-3.5 h-3.5 opacity-60" />
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Emoji Reactions List */}
      {message.reactions && message.reactions.length > 0 && (
        <div
          className={`flex items-center gap-1 mt-1 ${
            isSentByMe ? 'mr-2' : 'ml-2'
          }`}
        >
          {message.reactions.map((emoji, index) => (
            <span
              key={index}
              className="text-xs px-1.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/60 shadow-sm animate-scale-in"
            >
              {emoji}
            </span>
          ))}
        </div>
      )}

      {/* Lightbox Media Modal for Full Screen Image */}
      {isMediaZoomed && attachment && attachment.type === 'image' && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsMediaZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setIsMediaZoomed(false)}
              className="absolute -top-12 right-0 p-2 text-slate-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={attachment.url || attachment.localUrl}
              alt={attachment.name || 'Fullscreen Image'}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-slate-800"
            />
            {attachment.name && (
              <div className="mt-3 flex items-center space-x-3 text-xs text-slate-300">
                <span>{attachment.name}</span>
                {attachment.url && (
                  <a
                    href={attachment.url}
                    download={attachment.name}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

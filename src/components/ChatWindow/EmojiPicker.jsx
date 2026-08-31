/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React, { useState, useMemo } from 'react';
import { EMOJI_CATEGORIES, EMOJI_DATA } from '../../data/emojiDataset';
import { Search, X, Clock, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function EmojiPicker({ onSelectEmoji, onClose }) {
  const [activeCategory, setActiveCategory] = useState('smileys');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentEmojis, setRecentEmojis] = useState(() => {
    try {
      const saved = localStorage.getItem('shunnyo_recent_emojis');
      return saved ? JSON.parse(saved) : ['😀', '😂', '😍', '🔥', '👍', '❤️', '🎉', '🚀'];
    } catch {
      return ['😀', '😂', '😍', '🔥', '👍', '❤️', '🎉', '🚀'];
    }
  });

  const handleEmojiClick = (emoji) => {
    sounds.playClick();
    onSelectEmoji(emoji);

    // Save to recents
    setRecentEmojis((prev) => {
      const filtered = prev.filter((e) => e !== emoji);
      const updated = [emoji, ...filtered].slice(0, 16);
      try {
        localStorage.setItem('shunnyo_recent_emojis', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Filter emojis based on search query
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;

    const results = [];
    Object.values(EMOJI_DATA).forEach((categoryList) => {
      categoryList.forEach((emoji) => {
        const matchesName = emoji.name.toLowerCase().includes(query);
        const matchesKeyword = emoji.keywords.some((k) => k.toLowerCase().includes(query));
        if (matchesName || matchesKeyword) {
          results.push(emoji);
        }
      });
    });
    return results;
  }, [searchQuery]);

  const currentEmojis = EMOJI_DATA[activeCategory] || [];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

      {/* Popover / Mobile Sheet */}
      <div className="absolute bottom-20 left-2 sm:left-12 w-[calc(100vw-16px)] sm:w-96 rounded-3xl glass-dropdown p-3.5 shadow-2xl z-40 border border-slate-700/80 animate-scale-in max-h-[460px] flex flex-col select-none">
        {/* Search Header */}
        <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-800">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ইমোজি খুঁজুন (যেমন: fire, heart, smile)..."
              className="w-full pl-9 pr-7 py-1.5 text-xs rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/50"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 p-1 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        {!searchQuery && (
          <div className="flex items-center space-x-1 py-2 overflow-x-auto no-scrollbar border-b border-slate-800/60">
            {EMOJI_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveCategory(cat.id);
                }}
                title={cat.name}
                className={`p-1.5 rounded-xl text-base transition-all flex-shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-brand-500/20 text-brand-300 scale-110 shadow-sm border border-brand-500/40'
                    : 'text-slate-400 hover:bg-white/5 opacity-70 hover:opacity-100'
                }`}
              >
                {cat.icon}
              </button>
            ))}
          </div>
        )}

        {/* Emoji Grid Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-2 space-y-3 max-h-[300px]">
          {/* 1. Search Results */}
          {searchQuery ? (
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-2 px-1">
                অনুসন্ধানের ফলাফল ({searchResults.length})
              </div>
              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  কোনো ইমোজি পাওয়া যায়নি
                </div>
              ) : (
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                  {searchResults.map((e, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEmojiClick(e.char)}
                      title={e.name}
                      className="h-10 rounded-xl hover:bg-white/10 hover:scale-125 transition-all text-2xl flex items-center justify-center"
                    >
                      {e.char}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* 2. Recently Used Emojis */}
              {recentEmojis.length > 0 && (
                <div className="mb-2">
                  <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-400 mb-1.5 px-1">
                    <Clock className="w-3 h-3 text-brand-400" />
                    <span>সম্প্রতি ব্যবহৃত (Recent)</span>
                  </div>
                  <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                    {recentEmojis.map((char, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleEmojiClick(char)}
                        className="h-10 rounded-xl hover:bg-white/10 hover:scale-125 transition-all text-2xl flex items-center justify-center"
                      >
                        {char}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Category Active Emojis */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 mb-1.5 px-1">
                  {EMOJI_CATEGORIES.find((c) => c.id === activeCategory)?.name || 'Emojis'}
                </div>
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                  {currentEmojis.map((e, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEmojiClick(e.char)}
                      title={e.name}
                      className="h-10 rounded-xl hover:bg-white/10 hover:scale-125 transition-all text-2xl flex items-center justify-center"
                    >
                      {e.char}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

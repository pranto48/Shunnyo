import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import ContactItem from './ContactItem';
import Avatar from '../Shared/Avatar';
import { Search, X, MessageSquare, Flame, Radio, UserPlus, Globe, Loader2, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

const WORKER_URL = 'https://shunnyo-backend.mail-cde.workers.dev';

export default function ContactList() {
  const {
    filteredContacts,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    onlinePeerCount,
    selectContact,
    contacts,
    setContacts,
    currentUser
  } = useChat();

  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

  // Debounced Global User Directory Search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setGlobalSearchResults([]);
      setIsSearchingGlobal(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingGlobal(true);
        const res = await fetch(`${WORKER_URL}/api/users/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.users)) {
            // Filter out current logged in user
            const filtered = data.users.filter(u => u.id !== currentUser.id && u.username !== currentUser.username);
            setGlobalSearchResults(filtered);
          }
        }
      } catch (err) {
        console.warn('Global user search failed:', err);
      } finally {
        setIsSearchingGlobal(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUser]);

  const handleStartChatWithUser = (user) => {
    sounds.playConnected();
    // Check if already in contacts
    const existing = contacts.find(c => c.id === user.id || c.username === user.username);
    if (existing) {
      selectContact(existing.id);
    } else {
      const newContact = {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        status: user.status || 'online',
        role: user.role || 'member',
        unreadCount: 0,
        isGroup: false,
        pinned: false,
        lastSeen: 'Just now'
      };
      setContacts(prev => [newContact, ...prev]);
      selectContact(newContact.id);
    }
    setSearchQuery('');
    setGlobalSearchResults([]);
  };

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'online', label: `Online (${onlinePeerCount > 1 ? onlinePeerCount : 4})` },
    { key: 'direct', label: 'Direct' },
    { key: 'groups', label: 'Groups' },
    { key: 'unread', label: 'Unread' }
  ];

  const processedContacts = filteredContacts.filter((c) => {
    if (filter === 'online') return c.status === 'online';
    return true;
  });

  const pinnedContacts = processedContacts.filter((c) => c.pinned);
  const otherContacts = processedContacts.filter((c) => !c.pinned);

  const handleFilterClick = (key) => {
    sounds.playClick();
    setFilter(key);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background-surface/40">
      {/* Search Input Bar */}
      <div className="p-3.5 pb-2">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ইউজার খুঁজুন ও সরাসরি চ্যাট শুরু করুন..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/50 transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setGlobalSearchResults([]);
              }}
              className="absolute right-2.5 p-1 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 mt-2.5 overflow-x-auto no-scrollbar py-0.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleFilterClick(tab.key)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap flex items-center gap-1 ${
                filter === tab.key
                  ? 'bg-brand-500 text-white shadow-glow-brand'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/50'
              }`}
            >
              {tab.key === 'online' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Scrollable List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 custom-scrollbar">
        {/* Global Search Results Dropdown / Header */}
        {searchQuery.trim().length >= 2 && (
          <div className="mb-3 p-2 rounded-2xl bg-slate-950/90 border border-brand-500/30 shadow-xl">
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800 mb-1.5">
              <span className="text-[11px] font-bold text-brand-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>নেটওয়ার্ক ইউজার সার্চ ফলাফল</span>
              </span>
              {isSearchingGlobal && <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin" />}
            </div>

            {globalSearchResults.length > 0 ? (
              <div className="space-y-1">
                {globalSearchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleStartChatWithUser(user)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-brand-500/15 border border-transparent hover:border-brand-500/30 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Avatar src={user.avatar} name={user.name} status={user.status} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{user.username}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-bold flex items-center space-x-1 shadow-sm flex-shrink-0"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>চ্যাট</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : !isSearchingGlobal ? (
              <p className="text-[11px] text-slate-500 py-1 text-center">নেটওয়ার্কে কোনো নতুন ইউজার পাওয়া যায়নি</p>
            ) : null}
          </div>
        )}
        {processedContacts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-600" />
            <p className="text-sm font-medium">কোনো অনলাইন ইউজার পাওয়া যায়নি</p>
            <p className="text-xs text-slate-600">অন্য কোনো ফিল্টার বা সার্চ চেষ্টা করুন</p>
          </div>
        ) : (
          <>
            {/* Pinned Section */}
            {pinnedContacts.length > 0 && (
              <div className="mb-2">
                <div className="px-2 py-1 flex items-center space-x-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <Flame className="w-3 h-3 text-brand-400" />
                  <span>PINNED CHATS</span>
                </div>
                <div className="space-y-1">
                  {pinnedContacts.map((contact) => (
                    <ContactItem key={contact.id} contact={contact} />
                  ))}
                </div>
              </div>
            )}

            {/* All Messages / Online List */}
            <div>
              {pinnedContacts.length > 0 && otherContacts.length > 0 && (
                <div className="px-2 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>{filter === 'online' ? 'ONLINE USERS (AVAILABLE FOR AUDIO CALL)' : 'ALL MESSAGES'}</span>
                </div>
              )}
              <div className="space-y-1">
                {otherContacts.map((contact) => (
                  <ContactItem key={contact.id} contact={contact} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

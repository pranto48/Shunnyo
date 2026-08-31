import React from 'react';
import { useChat } from '../../context/ChatContext';
import ContactItem from './ContactItem';
import { Search, X, MessageSquare, Flame, Radio } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function ContactList() {
  const {
    filteredContacts,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    onlinePeerCount
  } = useChat();

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
            placeholder="কন্টাক্ট বা ইউজার খুঁজুন..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-1 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
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
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
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

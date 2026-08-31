import React from 'react';
import { useChat } from '../../context/ChatContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { MessageSquareDashed, UserPlus, Check, X, ShieldAlert } from 'lucide-react';
import Avatar from '../Shared/Avatar';

export default function ChatWindow() {
  const { 
    activeContact, 
    isMobileSidebarOpen, 
    chatRequests, 
    acceptChatRequest, 
    declineChatRequest, 
    sendChatRequest 
  } = useChat();

  const isPending = activeContact && chatRequests[activeContact.id] === 'pending_received';
  const isDeclined = activeContact && chatRequests[activeContact.id] === 'declined';

  return (
    <main
      className={`flex-1 flex flex-col h-full bg-background relative overflow-hidden transition-all duration-300 ${
        isMobileSidebarOpen ? 'hidden md:flex' : 'flex'
      }`}
    >
      {!activeContact ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background text-slate-500">
          <MessageSquareDashed className="w-16 h-16 text-slate-700 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-slate-300">কোনো চ্যাট সিলেক্ট করা নেই</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            কথা বলা শুরু করতে বাম পাশের সাইডবার থেকে যেকোনো কন্টাক্ট নির্বাচন করুন।
          </p>
        </div>
      ) : (
        <>
          <ChatHeader />
          
          {/* Chat Request Pending Banner */}
          {isPending ? (
            <div className="p-4 bg-slate-900/90 border-b border-brand-500/30 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-slide-down">
              <div className="flex items-center space-x-3 text-left">
                <Avatar src={activeContact.avatar} name={activeContact.name} size="md" />
                <div>
                  <p className="text-xs font-bold text-white">
                    {activeContact.name} আপনার সাথে চ্যাট করার অনুরোধ পাঠিয়েছেন
                  </p>
                  <p className="text-[11px] text-slate-400">
                    অনুরোধ গ্রহণ না করা পর্যন্ত আপনি সম্পূর্ণ নিরাপদ থাকবেন।
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={() => declineChatRequest(activeContact.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>প্রত্যাখ্যান</span>
                </button>
                <button
                  onClick={() => acceptChatRequest(activeContact.id)}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-1 shadow-glow-brand transition-all active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>গ্রহণ করুন</span>
                </button>
              </div>
            </div>
          ) : isDeclined ? (
            <div className="p-3 bg-rose-950/60 border-b border-rose-500/30 text-center">
              <p className="text-xs text-rose-300">
                আপনি এই চ্যাট অনুরোধটি প্রত্যাখ্যান করেছেন।
              </p>
            </div>
          ) : null}

          <MessageList />
          <ChatInput />
        </>
      )}
    </main>
  );
}

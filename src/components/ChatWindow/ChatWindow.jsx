import React from 'react';
import { useChat } from '../../context/ChatContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { MessageSquareDashed } from 'lucide-react';

export default function ChatWindow() {
  const { activeContact, isMobileSidebarOpen } = useChat();

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
          <MessageList />
          <ChatInput />
        </>
      )}
    </main>
  );
}

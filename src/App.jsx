import React from 'react';
import { ChatProvider } from './context/ChatContext';
import { CallProvider } from './context/CallContext';
import Sidebar from './components/Sidebar/Sidebar';
import ChatWindow from './components/ChatWindow/ChatWindow';
import CallOverlay from './components/CallModal/CallOverlay';
import InstallPrompt from './components/PWA/InstallPrompt';
import SecurityModal from './components/Shared/SecurityModal';
import ErrorBoundary from './components/Shared/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <ChatProvider>
        <CallProvider>
          <div className="h-screen w-screen overflow-hidden flex bg-background-deep text-slate-100 font-sans relative">
            {/* Subtle Ambient Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />

            {/* Contacts Sidebar (Responsive) */}
            <Sidebar />

            {/* Main Chat Window */}
            <ChatWindow />

            {/* Active Audio / Video Call Modal Overlay */}
            <CallOverlay />

            {/* PWA Install Banner */}
            <InstallPrompt />

            {/* E2EE Cryptographic Security Modal */}
            <SecurityModal />
          </div>
        </CallProvider>
      </ChatProvider>
    </ErrorBoundary>
  );
}

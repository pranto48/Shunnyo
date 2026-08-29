import React, { useEffect } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import { CallProvider } from './context/CallContext';
import Sidebar from './components/Sidebar/Sidebar';
import ChatWindow from './components/ChatWindow/ChatWindow';
import CallOverlay from './components/CallModal/CallOverlay';
import InstallPrompt from './components/PWA/InstallPrompt';
import SecurityModal from './components/Shared/SecurityModal';
import AdminLoginModal from './components/Admin/AdminLoginModal';
import AdminPanel from './components/Admin/AdminPanel';
import UserProfileModal from './components/Profile/UserProfileModal';
import CreateGroupModal from './components/Group/CreateGroupModal';
import GroupDetailsModal from './components/Group/GroupDetailsModal';
import ErrorBoundary from './components/Shared/ErrorBoundary';
import CallHistoryModal from './components/CallModal/CallHistoryModal';

function MainAppLayout() {
  const { 
    showAdminModal, 
    setShowAdminModal, 
    showAdminPanel, 
    setShowAdminPanel, 
    showProfileModal,
    setShowProfileModal,
    showCreateGroupModal,
    setShowCreateGroupModal,
    showGroupDetailsModal,
    setShowGroupDetailsModal,
    adminUser, 
    handleAdminLogin, 
    handleAdminLogout,
    openAdminPortal
  } = useChat();

  // Support direct ?admin=true URL query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || window.location.pathname === '/admin') {
        openAdminPortal();
      }
    }
  }, []);

  return (
    <div className="h-screen h-[100dvh] w-screen overflow-hidden flex bg-background-deep text-slate-100 font-sans relative">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl pointer-events-none" />

      {/* Contacts Sidebar (Responsive) */}
      <Sidebar />

      {/* Main Chat Window */}
      <ChatWindow />

      {/* Active Audio / Video Call Modal Overlay */}
      <CallOverlay />

      {/* Call History Log Modal */}
      <CallHistoryModal />

      {/* PWA Install Banner */}
      <InstallPrompt />

      {/* E2EE Cryptographic Security Modal */}
      <SecurityModal />

      {/* User Profile & Customization Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Create Encrypted Group Chat Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
      />

      {/* Group Details & Member Management Modal */}
      <GroupDetailsModal
        isOpen={showGroupDetailsModal}
        onClose={() => setShowGroupDetailsModal(false)}
      />

      {/* Admin Authentication Login Modal */}
      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onLoginSuccess={handleAdminLogin}
      />

      {/* Admin Full-Featured Management Hub */}
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        adminUser={adminUser}
        onLogout={handleAdminLogout}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ChatProvider>
        <CallProvider>
          <MainAppLayout />
        </CallProvider>
      </ChatProvider>
    </ErrorBoundary>
  );
}

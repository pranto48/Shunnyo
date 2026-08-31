import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialContacts, initialMessages, currentUser, simulatedReplies } from '../data/mockData';
import { sounds } from '../utils/soundEffects';
import { 
  getOrCreateLocalKeyPair, 
  encryptPayload, 
  decryptPayload, 
  generateUserKeyPair 
} from '../utils/cryptoUtils';
import { cloudflareApi } from '../services/cloudflareApi';
import { liveChatService } from '../services/liveChatService';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [activeContactId, setActiveContactId] = useState(initialContacts[0]?.id || 'c-1');
  const [messages, setMessages] = useState(initialMessages);
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('chats');

  // E2EE Cryptographic State
  const [userKeyPair, setUserKeyPair] = useState(null);
  const [isE2EEInitialized, setIsE2EEInitialized] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // Live WebSocket Real-time State
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [onlinePeerCount, setOnlinePeerCount] = useState(1);
  const [typingUsers, setTypingUsers] = useState({}); // { [userId]: boolean }
  const [liveTextStreams, setLiveTextStreams] = useState({}); // { [contactId]: { text, senderName, senderId } }

  // Current User Profile State
  const [currentUserProfile, setCurrentUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('shunnyo_user_profile');
      return saved ? JSON.parse(saved) : currentUser;
    } catch {
      return currentUser;
    }
  });

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false);

  // Admin Portal State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Block/Unblock User System
  const [blockedUsers, setBlockedUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('shunnyo_blocked_users');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const openAdminPortal = () => {
    sounds.playClick();
    if (isAdminLoggedIn) {
      setShowAdminPanel(true);
    } else {
      setShowAdminModal(true);
    }
  };

  const handleAdminLogin = (adminData) => {
    setIsAdminLoggedIn(true);
    setAdminUser(adminData);
    setShowAdminModal(false);
    setShowAdminPanel(true);
    sounds.playConnected();
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    setShowAdminPanel(false);
    sounds.playDisconnected();
  };

  const blockUser = (userId) => {
    sounds.playClick();
    setBlockedUsers((prev) => {
      const next = new Set(prev);
      next.add(userId);
      try { localStorage.setItem('shunnyo_blocked_users', JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const unblockUser = (userId) => {
    sounds.playClick();
    setBlockedUsers((prev) => {
      const next = new Set(prev);
      next.delete(userId);
      try { localStorage.setItem('shunnyo_blocked_users', JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const isBlocked = (userId) => blockedUsers.has(userId);

  // 1. Initialize Native Web Crypto Keys & Register with D1
  useEffect(() => {
    async function initCrypto() {
      try {
        const keyPair = await getOrCreateLocalKeyPair();
        setUserKeyPair(keyPair);
        setIsE2EEInitialized(true);
        console.log('Shunnyo E2EE Initialized. Local Fingerprint:', keyPair.fingerprint);

        // Register Public Key in Cloudflare D1
        await cloudflareApi.registerPublicKey(currentUser, keyPair.publicKeyJwk, keyPair.fingerprint);
      } catch (err) {
        console.error('Failed to initialize Web Crypto E2EE:', err);
      }
    }
    initCrypto();
  }, []);

  // 2. Connect to Cloudflare Live WebSocket & Setup Event Listeners
  useEffect(() => {
    // Connect to WebSocket
    liveChatService.connect(currentUser.id, currentUser.name);

    const unsubConnection = liveChatService.on('connection', (status) => {
      setIsLiveConnected(status.status === 'connected');
    });

    // Handle Incoming Live Messages from WebSocket
    const unsubMessage = liveChatService.on('message', async (incoming) => {
      // If user is blocked, silently ignore incoming message
      if (blockedUsers.has(incoming.senderId)) {
        console.log('[LiveChat] Message dropped from blocked user:', incoming.senderId);
        return;
      }

      console.log('[LiveChat] Incoming live message received:', incoming);

      const targetConversationId = incoming.recipientId === currentUser.id ? incoming.senderId : (incoming.contactId || incoming.senderId);

      // Decrypt incoming E2EE payload locally if encrypted
      let decryptedText = incoming.content;
      if (incoming.encryptedEnvelope && userKeyPair?.privateKeyJwk) {
        try {
          decryptedText = await decryptPayload(incoming.encryptedEnvelope, userKeyPair.privateKeyJwk);
        } catch (decErr) {
          console.warn('[LiveChat] Decryption warning:', decErr);
        }
      }

      const formattedMsg = {
        id: incoming.id || `m-live-${Date.now()}`,
        senderId: incoming.senderId,
        senderName: incoming.senderName,
        content: decryptedText,
        timestamp: incoming.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
        isEncrypted: !!incoming.encryptedEnvelope,
        encryptedEnvelope: incoming.encryptedEnvelope,
        reactions: incoming.reactions || [],
        attachment: incoming.attachment || null
      };

      sounds.playMessageReceived();

      setMessages((prev) => ({
        ...prev,
        [targetConversationId]: [...(prev[targetConversationId] || []), formattedMsg]
      }));

      // If sender is not already in contacts, dynamically add them!
      setContacts((prev) => {
        const exists = prev.some((c) => c.id === incoming.senderId);
        if (!exists) {
          return [
            {
              id: incoming.senderId,
              name: incoming.senderName || 'Anonymous Peer',
              username: `@peer_${incoming.senderId.slice(-4)}`,
              avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
              status: 'online',
              unreadCount: 1,
              isGroup: false
            },
            ...prev
          ];
        }
        return prev;
      });
    });

    // Handle Live Typing Indicators
    const unsubTyping = liveChatService.on('typing', (data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.senderId]: data.isTyping
      }));

      setContacts((prev) =>
        prev.map((c) =>
          c.id === data.senderId ? { ...c, isTyping: data.isTyping } : c
        )
      );
    });

    // Handle Live Emoji Reactions
    const unsubReaction = liveChatService.on('reaction', (data) => {
      setMessages((prev) => {
        const conversationId = data.contactId || activeContactId;
        const currentList = prev[conversationId] || [];
        const updated = currentList.map((msg) => {
          if (msg.id !== data.messageId) return msg;
          const currentReactions = msg.reactions || [];
          const exists = currentReactions.includes(data.emoji);
          return {
            ...msg,
            reactions: exists
              ? currentReactions.filter((e) => e !== data.emoji)
              : [...currentReactions, data.emoji]
          };
        });
        return { ...prev, [conversationId]: updated };
      });
    });

    // Handle Live Message Edits
    const unsubEdit = liveChatService.on('edit', (data) => {
      setMessages((prev) => {
        const conversationId = data.contactId || activeContactId;
        const currentList = prev[conversationId] || [];
        const updated = currentList.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, content: data.newContent, isEdited: true, editedAt: data.editedAt }
            : msg
        );
        return { ...prev, [conversationId]: updated };
      });
    });

    // Handle Live Message Deletions
    const unsubDelete = liveChatService.on('delete', (data) => {
      setMessages((prev) => {
        const conversationId = data.contactId || activeContactId;
        const currentList = prev[conversationId] || [];
        if (data.forEveryone) {
          const updated = currentList.map((msg) =>
            msg.id === data.messageId
              ? { ...msg, isDeleted: true, content: 'এই মেসেজটি মুছে ফেলা হয়েছে', attachment: null, audioDuration: null }
              : msg
          );
          return { ...prev, [conversationId]: updated };
        } else {
          return {
            ...prev,
            [conversationId]: currentList.filter((m) => m.id !== data.messageId)
          };
        }
      });
    });

    // Handle Real-Time Keystroke Live Text Streaming
    const unsubLiveText = liveChatService.on('live_text', (data) => {
      const convoId = data.contactId || data.senderId;
      setLiveTextStreams((prev) => ({
        ...prev,
        [convoId]: data.text ? {
          text: data.text,
          senderName: data.senderName,
          senderId: data.senderId,
          updatedAt: Date.now()
        } : null
      }));
    });

    // Handle Presence Updates
    const unsubPresence = liveChatService.on('presence', (data) => {
      if (data.totalPeers) {
        setOnlinePeerCount(data.totalPeers);
      }
    });

    return () => {
      unsubConnection();
      unsubMessage();
      unsubTyping();
      unsubReaction();
      unsubEdit();
      unsubDelete();
      unsubLiveText();
      unsubPresence();
    };
  }, [userKeyPair, activeContactId]);

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];
  const activeMessages = (messages && messages[activeContactId]) || [];

  const filteredContacts = contacts.filter((c) => {
    if (filter === 'unread') return c.unreadCount > 0;
    if (filter === 'groups') return c.isGroup;
    if (filter === 'direct') return !c.isGroup;
    return true;
  }).filter((c) => {
    if (!searchQuery) return true;
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const selectContact = (contactId) => {
    sounds.playClick();
    setActiveContactId(contactId);
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, unreadCount: 0 } : c))
    );
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(false);
    }
  };

  /**
   * Broadcast real-time typing state to peer
   */
  const sendLiveTyping = (isTyping) => {
    if (activeContactId) {
      liveChatService.sendTyping(activeContactId, isTyping);
    }
  };

  /**
   * Send Message (with optional attachment, reply-to metadata, and custom text style)
   */
  const sendMessage = async (text, attachment = null, explicitReplyTo = null, style = null) => {
    if (!text?.trim() && !attachment) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessageId = `m-${Date.now()}`;
    const activeReply = explicitReplyTo || replyingToMessage;

    // Generate E2EE envelope
    let encryptedEnvelope = null;
    if (userKeyPair?.publicKeyJwk) {
      try {
        encryptedEnvelope = await encryptPayload(text || attachment?.name || 'Encrypted File', userKeyPair.publicKeyJwk);
      } catch (err) {
        console.debug('E2EE envelope generation:', err);
      }
    }

    const replyMetadata = activeReply ? {
      id: activeReply.id,
      senderName: activeReply.senderName || (activeReply.senderId === currentUser.id ? 'আপনি' : 'User'),
      content: activeReply.content || (activeReply.attachment ? `[${activeReply.attachment.type || 'Attachment'}]` : 'Message'),
      attachmentType: activeReply.attachment?.type || null
    } : null;

    const newMessage = {
      id: newMessageId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      recipientId: activeContactId,
      contactId: activeContactId,
      content: text,
      timestamp: timeString,
      status: 'sent',
      isEncrypted: true,
      attachment,
      encryptedEnvelope,
      reactions: [],
      replyTo: replyMetadata,
      style: style || null
    };

    sounds.playMessageSent();
    setReplyingToMessage(null);

    // 1. Update local conversation state immediately
    setMessages((prev) => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMessage]
    }));

    // 2. Broadcast message over Cloudflare WebSocket
    liveChatService.sendMessage({
      id: newMessageId,
      recipientId: activeContactId,
      contactId: activeContactId,
      content: text,
      attachment,
      encryptedEnvelope,
      timestamp: timeString,
      replyTo: replyMetadata,
      style: style || null
    });

    // 3. Mark delivery receipts
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeContactId]: (prev[activeContactId] || []).map((m) =>
          m.id === newMessageId ? { ...m, status: 'delivered' } : m
        )
      }));
    }, 400);

    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeContactId]: (prev[activeContactId] || []).map((m) =>
          m.id === newMessageId ? { ...m, status: 'read' } : m
        )
      }));
    }, 1200);

    // Fallback simulated reply for demo contacts if peer is offline
    if (activeContactId.startsWith('c-')) {
      triggerSimulatedResponse(activeContactId);
    }
  };

  const triggerSimulatedResponse = (contactId) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact || contact.isGroup) return;

    setTimeout(() => {
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, isTyping: true } : c))
      );
    }, 1200);

    setTimeout(async () => {
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, isTyping: false } : c))
      );

      const randomReply =
        simulatedReplies[Math.floor(Math.random() * simulatedReplies.length)];
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let replyEnvelope = null;
      if (userKeyPair?.publicKeyJwk) {
        try {
          replyEnvelope = await encryptPayload(randomReply, userKeyPair.publicKeyJwk);
        } catch (err) {
          console.debug('Error in simulated incoming envelope:', err);
        }
      }

      const replyMsg = {
        id: `m-reply-${Date.now()}`,
        senderId: contactId,
        senderName: contact.name,
        content: randomReply,
        timestamp: timeString,
        status: 'read',
        isEncrypted: true,
        encryptedEnvelope: replyEnvelope,
        reactions: []
      };

      sounds.playMessageReceived();

      setMessages((prev) => ({
        ...prev,
        [contactId]: [...(prev[contactId] || []), replyMsg]
      }));
    }, 3200);
  };

  const addReaction = (messageId, emoji) => {
    sounds.playClick();

    // Broadcast reaction over WebSocket
    liveChatService.sendReaction(messageId, emoji, activeContactId);

    setMessages((prev) => {
      const currentList = prev[activeContactId] || [];
      const updated = currentList.map((msg) => {
        if (msg.id !== messageId) return msg;
        const currentReactions = msg.reactions || [];
        const exists = currentReactions.includes(emoji);
        return {
          ...msg,
          reactions: exists
            ? currentReactions.filter((e) => e !== emoji)
            : [...currentReactions, emoji]
        };
      });
      return { ...prev, [activeContactId]: updated };
    });
  };

  const updateMessage = (messageId, newContent) => {
    sounds.playClick();
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Broadcast edit over WebSocket
    liveChatService.sendEditMessage(messageId, newContent, activeContactId);

    // 2. Update local state
    setMessages((prev) => {
      const currentList = prev[activeContactId] || [];
      const updated = currentList.map((m) =>
        m.id === messageId
          ? { ...m, content: newContent, isEdited: true, editedAt: timeString }
          : m
      );
      return { ...prev, [activeContactId]: updated };
    });

    setEditingMessage(null);
  };

  const deleteMessage = (messageId, forEveryone = true) => {
    sounds.playClick();

    // 1. Broadcast delete over WebSocket
    liveChatService.sendDeleteMessage(messageId, activeContactId, forEveryone);

    // 2. Update local state
    setMessages((prev) => {
      const currentList = prev[activeContactId] || [];
      if (forEveryone) {
        const updated = currentList.map((m) =>
          m.id === messageId
            ? { ...m, isDeleted: true, content: 'এই মেসেজটি মুছে ফেলা হয়েছে', attachment: null, audioDuration: null }
            : m
        );
        return { ...prev, [activeContactId]: updated };
      } else {
        return {
          ...prev,
          [activeContactId]: currentList.filter((m) => m.id !== messageId)
        };
      }
    });
  };

  const broadcastLiveText = (text) => {
    liveChatService.sendLiveTextStream(text, activeContactId, activeContactId);
  };

  /**
   * Update User Profile (Photo, Name, Bio, Role, Status)
   */
  const updateUserProfile = (updatedData) => {
    sounds.playConnected();
    const newProfile = { ...currentUserProfile, ...updatedData };
    setCurrentUserProfile(newProfile);
    try {
      localStorage.setItem('shunnyo_user_profile', JSON.stringify(newProfile));
    } catch {}
  };

  /**
   * Create Encrypted Group Chat
   */
  const createGroup = ({ name, description, avatar, memberIds }) => {
    sounds.playCallConnected();
    const newGroupId = `g-${Date.now()}`;
    const selectedMembers = contacts.filter((c) => memberIds.includes(c.id));

    const newGroup = {
      id: newGroupId,
      name,
      description,
      avatar: avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      isGroup: true,
      membersCount: selectedMembers.length + 1,
      members: selectedMembers,
      unreadCount: 0,
      status: 'online'
    };

    setContacts((prev) => [newGroup, ...prev]);
    setActiveContactId(newGroupId);

    // Initial group system welcome message
    const welcomeMsg = {
      id: `m-grp-init-${Date.now()}`,
      senderId: 'system',
      senderName: 'Shunnyo Protocol',
      recipientId: newGroupId,
      contactId: newGroupId,
      content: `🔒 "${name}" গ্রুপটি সফলভাবে তৈরি হয়েছে। সদস্য সংখ্যা: ${selectedMembers.length + 1} জন। গ্রুপে এন্ড-টু-এন্ড এনক্রিপশন সক্রিয়।`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
      isEncrypted: true,
      reactions: []
    };

    setMessages((prev) => ({
      ...prev,
      [newGroupId]: [welcomeMsg]
    }));
  };

  /**
   * Update Group Members
   */
  const updateGroupMembers = (groupId, newMemberList) => {
    sounds.playClick();
    setContacts((prev) =>
      prev.map((c) =>
        c.id === groupId
          ? { ...c, members: newMemberList, membersCount: newMemberList.length + 1 }
          : c
      )
    );
  };

  const regenerateKeys = async () => {
    sounds.playClick();
    const newKeyPair = await generateUserKeyPair();
    setUserKeyPair(newKeyPair);
    return newKeyPair;
  };

  return (
    <ChatContext.Provider
      value={{
        currentUser: currentUserProfile,
        currentUserProfile,
        updateUserProfile,
        contacts,
        setContacts,
        createGroup,
        updateGroupMembers,
        activeContact,
        activeContactId,
        messages,
        setMessages,
        activeMessages,
        filteredContacts,
        filter,
        setFilter,
        searchQuery,
        setSearchQuery,
        messageSearchQuery,
        setMessageSearchQuery,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        activeTab,
        setActiveTab,
        selectContact,
        replyingToMessage,
        setReplyingToMessage,
        editingMessage,
        setEditingMessage,
        updateMessage,
        sendMessage,
        sendLiveTyping,
        broadcastLiveText,
        liveTextStreams,
        addReaction,
        deleteMessage,
        triggerSimulatedResponse,
        userKeyPair,
        isE2EEInitialized,
        showProfileModal,
        setShowProfileModal,
        showCreateGroupModal,
        setShowCreateGroupModal,
        showGroupDetailsModal,
        setShowGroupDetailsModal,
        showSecurityModal,
        setShowSecurityModal,
        regenerateKeys,
        isLiveConnected,
        onlinePeerCount,
        typingUsers,
        isAdminLoggedIn,
        adminUser,
        showAdminModal,
        setShowAdminModal,
        showAdminPanel,
        setShowAdminPanel,
        openAdminPortal,
        handleAdminLogin,
        handleAdminLogout,
        blockedUsers,
        blockUser,
        unblockUser,
        isBlocked
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);

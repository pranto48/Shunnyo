import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialContacts, initialMessages, currentUser, simulatedReplies } from '../data/mockData';
import { sounds } from '../utils/soundEffects';
import { 
  getOrCreateLocalKeyPair, 
  encryptPayload, 
  decryptPayload, 
  generateUserKeyPair 
} from '../utils/cryptoUtils';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [activeContactId, setActiveContactId] = useState('c-1');
  const [messages, setMessages] = useState(initialMessages);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('chats');

  // E2EE Cryptographic State
  const [userKeyPair, setUserKeyPair] = useState(null);
  const [isE2EEInitialized, setIsE2EEInitialized] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // Initialize Native Web Crypto RSA/AES-GCM Keys on startup
  useEffect(() => {
    async function initCrypto() {
      try {
        const keyPair = await getOrCreateLocalKeyPair();
        setUserKeyPair(keyPair);
        setIsE2EEInitialized(true);
        console.log('Shunnyo E2EE Initialized. Local Fingerprint:', keyPair.fingerprint);
      } catch (err) {
        console.error('Failed to initialize Web Crypto E2EE:', err);
      }
    }
    initCrypto();
  }, []);

  const activeContact = contacts.find((c) => c.id === activeContactId) || contacts[0];
  const activeMessages = messages[activeContactId] || [];

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.username.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'unread') return contact.unreadCount > 0;
    if (filter === 'groups') return contact.isGroup;
    if (filter === 'direct') return !contact.isGroup;
    return true;
  });

  const selectContact = (contactId) => {
    setActiveContactId(contactId);
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, unreadCount: 0 } : c))
    );
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(false);
    }
  };

  /**
   * Send Message with Native Web Crypto E2EE Encryption
   */
  const sendMessage = async ({ text, attachment = null, audioDuration = null }) => {
    if (!text && !attachment && !audioDuration) return;

    const newMessageId = `m-${Date.now()}`;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let encryptedEnvelope = null;

    // Encrypt payload if E2EE is active
    if (userKeyPair && userKeyPair.publicKeyJwk) {
      try {
        const payloadToEncrypt = text || (attachment ? JSON.stringify(attachment) : `[Voice Note: ${audioDuration}]`);
        // Encrypt with recipient's public key (using user's local keypair for local simulation)
        encryptedEnvelope = await encryptPayload(
          payloadToEncrypt,
          userKeyPair.publicKeyJwk,
          attachment ? { type: attachment.type, name: attachment.caption || 'file' } : null
        );
      } catch (e) {
        console.warn('Encryption step error:', e);
      }
    }

    const newMessage = {
      id: newMessageId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: text,
      timestamp: timeString,
      status: 'sent',
      attachment,
      audioDuration,
      isEncrypted: true,
      encryptedEnvelope,
      reactions: []
    };

    sounds.playMessageSent();

    setMessages((prev) => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMessage]
    }));

    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeContactId]: (prev[activeContactId] || []).map((m) =>
          m.id === newMessageId ? { ...m, status: 'delivered' } : m
        )
      }));
    }, 600);

    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeContactId]: (prev[activeContactId] || []).map((m) =>
          m.id === newMessageId ? { ...m, status: 'read' } : m
        )
      }));
    }, 1500);

    triggerSimulatedResponse(activeContactId);
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

      // Simulated E2EE decryption
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

  const deleteMessage = (messageId) => {
    sounds.playClick();
    setMessages((prev) => ({
      ...prev,
      [activeContactId]: (prev[activeContactId] || []).filter((m) => m.id !== messageId)
    }));
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
        currentUser,
        contacts,
        activeContact,
        activeContactId,
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
        sendMessage,
        addReaction,
        deleteMessage,
        triggerSimulatedResponse,
        userKeyPair,
        isE2EEInitialized,
        showSecurityModal,
        setShowSecurityModal,
        regenerateKeys
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);

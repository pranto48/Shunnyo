/**
 * Shunnyo Offline Vault — Native IndexedDB Storage Engine
 * High-speed, high-capacity client-side persistence for encrypted messages and conversations.
 */

const DB_NAME = 'shunnyo_offline_vault';
const DB_VERSION = 1;
const STORE_MESSAGES = 'messages';
const STORE_SETTINGS = 'settings';

class IndexedDbStore {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  async init() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('[IndexedDB] IndexedDB not available in current environment');
      return null;
    }

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_MESSAGES)) {
          const messageStore = db.createObjectStore(STORE_MESSAGES, { keyPath: 'conversationId' });
          messageStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('[IndexedDB] Shunnyo offline vault successfully opened');
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('[IndexedDB] Open error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getDb() {
    if (!this.db) {
      await this.initPromise;
    }
    return this.db;
  }

  /**
   * 1. Save all messages for a specific conversation
   */
  async saveConversationMessages(conversationId, messageList) {
    try {
      const db = await this.getDb();
      if (!db) return false;

      return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_MESSAGES], 'readwrite');
        const store = tx.objectStore(STORE_MESSAGES);
        const item = {
          conversationId,
          messages: messageList,
          updatedAt: Date.now()
        };
        const req = store.put(item);
        req.onsuccess = () => resolve(true);
        req.onerror = (e) => reject(e.target.error);
      });
    } catch (err) {
      console.warn(`[IndexedDB] Failed to save conversation ${conversationId}:`, err);
      return false;
    }
  }

  /**
   * 2. Load all conversations and their message history
   */
  async getAllConversations() {
    try {
      const db = await this.getDb();
      if (!db) return {};

      return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_MESSAGES], 'readonly');
        const store = tx.objectStore(STORE_MESSAGES);
        const req = store.getAll();

        req.onsuccess = () => {
          const result = {};
          (req.result || []).forEach(row => {
            result[row.conversationId] = row.messages;
          });
          resolve(result);
        };
        req.onerror = (e) => reject(e.target.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Failed to load messages:', err);
      return {};
    }
  }

  /**
   * 3. Clear stored messages
   */
  async clearAll() {
    try {
      const db = await this.getDb();
      if (!db) return false;
      const tx = db.transaction([STORE_MESSAGES], 'readwrite');
      tx.objectStore(STORE_MESSAGES).clear();
      return true;
    } catch {
      return false;
    }
  }
}

export const indexedDbVault = new IndexedDbStore();

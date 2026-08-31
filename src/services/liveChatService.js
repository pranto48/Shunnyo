/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

/**
 * Live Chat WebSocket Client for Shunnyo
 * Connects to Cloudflare Durable Objects (SignalingRoom) for real-time messaging,
 * typing indicators, reactions, and presence synchronization.
 */

import { CLOUDFLARE_WS_ENDPOINT } from './webrtcService';

class LiveChatService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.heartbeatTimer = null;
    this.currentUserId = null;
    this.currentUsername = null;
  }

  /**
   * Connect to Cloudflare WebSocket Room
   */
  connect(userId = 'usr_anon', username = 'User') {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.currentUserId = userId;
    this.currentUsername = username;

    try {
      const wsUrl = `${CLOUDFLARE_WS_ENDPOINT}/general-room?userId=${encodeURIComponent(userId)}&username=${encodeURIComponent(username)}`;
      console.log('[LiveChat] Connecting to Cloudflare WebSocket:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[LiveChat] WebSocket Connected Successfully ⚡');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connection', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { type, data } = payload;

          switch (type) {
            case 'chat:message':
              this.emit('message', data);
              break;

            case 'chat:typing':
              this.emit('typing', data);
              break;

            case 'chat:reaction':
              this.emit('reaction', data);
              break;

            case 'presence:joined':
            case 'presence:left':
            case 'connection:ack':
              this.emit('presence', { type, ...data });
              break;

            case 'pong':
              // Heartbeat acknowledged
              break;

            default:
              this.emit(type, data);
          }
        } catch (err) {
          console.warn('[LiveChat] Error parsing message:', err);
        }
      };

      this.ws.onclose = () => {
        console.log('[LiveChat] WebSocket Disconnected');
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('connection', { status: 'disconnected' });
        this.attemptReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[LiveChat] WebSocket Error:', err);
        this.emit('connection', { status: 'error', error: err });
      };
    } catch (e) {
      console.warn('[LiveChat] WebSocket init failed:', e);
    }
  }

  /**
   * Send a live chat message over WebSocket
   */
  sendMessage(messageData) {
    this.sendPayload('chat:message', messageData);
  }

  /**
   * Broadcast typing indicator
   */
  sendTyping(recipientId, isTyping) {
    this.sendPayload('chat:typing', { recipientId, isTyping });
  }

  /**
   * Broadcast real-time keystroke text stream
   */
  sendLiveTextStream(text, recipientId, contactId) {
    this.sendPayload('chat:live_text', { text, recipientId, contactId });
  }

  /**
   * Broadcast emoji reaction
   */
  sendReaction(messageId, emoji, contactId) {
    this.sendPayload('chat:reaction', { messageId, emoji, contactId });
  }

  /**
   * Broadcast message edit
   */
  sendEditMessage(messageId, newContent, contactId) {
    this.sendPayload('chat:edit', { messageId, newContent, contactId });
  }

  /**
   * Broadcast message delete
   */
  sendDeleteMessage(messageId, contactId, forEveryone = true) {
    this.sendPayload('chat:delete', { messageId, contactId, forEveryone });
  }

  /**
   * Internal helper to send JSON message
   */
  sendPayload(type, data) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[LiveChat] Cannot send, WebSocket not open. Type:', type);
      return false;
    }

    try {
      this.ws.send(JSON.stringify({ type, data, timestamp: Date.now() }));
      return true;
    } catch (err) {
      console.error('[LiveChat] Send error:', err);
      return false;
    }
  }

  /**
   * Heartbeat keep-alive every 25 seconds
   */
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Auto-reconnection with exponential backoff
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[LiveChat] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 15000);
    console.log(`[LiveChat] Reconnecting in ${Math.round(delay / 1000)}s (Attempt ${this.reconnectAttempts})...`);

    setTimeout(() => {
      if (this.currentUserId) {
        this.connect(this.currentUserId, this.currentUsername);
      }
    }, delay);
  }

  /**
   * Event Listener Subscriptions
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        try {
          callback(data);
        } catch (e) {
          console.error(`[LiveChat] Event handler error for ${event}:`, e);
        }
      }
    }
  }
}

export const liveChatService = new LiveChatService();

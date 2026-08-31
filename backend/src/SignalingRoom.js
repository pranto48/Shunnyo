/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

/**
 * Cloudflare Durable Object: SignalingRoom
 * Real-time WebSocket Transport for:
 * 1. Live Chat Messaging & E2EE Payloads
 * 2. Live Typing Indicators & Read Receipts
 * 3. Live Presence & Status Synchronization
 * 4. WebRTC P2P Audio/Video/Screen Signaling
 */
export class SignalingRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map(); // webSocket -> { peerId, username, userId, connectedAt }
  }

  async fetch(request) {
    const url = new URL(request.url);

    // WebSocket upgrade request
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      const peerId = url.searchParams.get('peerId') || url.searchParams.get('userId') || `peer_${Date.now()}`;
      const username = url.searchParams.get('username') || 'Anonymous';
      const userId = url.searchParams.get('userId') || peerId;

      await this.handleSession(server, peerId, username, userId);

      return new Response(null, {
        status: 101,
        webSocket: client
      });
    }

    // HTTP Endpoint: Query Active Room Peers
    if (url.pathname.endsWith('/peers')) {
      const activePeers = Array.from(this.sessions.values());
      return new Response(JSON.stringify({ activePeers, count: activePeers.length }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }

  async handleSession(webSocket, peerId, username, userId) {
    webSocket.accept();
    this.sessions.set(webSocket, { peerId, username, userId, connectedAt: Date.now() });

    console.log(`[SignalingRoom] Live Peer Connected: ${peerId} (User: ${userId}, Name: ${username}). Total: ${this.sessions.size}`);

    // Broadcast user presence joined
    this.broadcast(webSocket, {
      type: 'presence:joined',
      data: { peerId, username, userId, totalPeers: this.sessions.size }
    });

    // Send connection ACK with current online peers
    const onlineUsers = Array.from(this.sessions.values()).map(s => ({ userId: s.userId, username: s.username }));
    webSocket.send(JSON.stringify({
      type: 'connection:ack',
      data: { peerId, userId, onlineUsers, totalPeers: this.sessions.size }
    }));

    // Auto-flush pending offline messages from D1 for this user
    if (this.env?.DB) {
      try {
        const pending = await this.env.DB.prepare(
          `SELECT id, recipient_id, sender_id, sender_name, encrypted_envelope, attachment, style, reply_to, timestamp, created_at
           FROM offline_messages WHERE recipient_id = ? AND status = 'pending' ORDER BY created_at ASC`
        ).bind(userId).all();

        if (pending?.results && pending.results.length > 0) {
          console.log(`[SignalingRoom] Flushing ${pending.results.length} offline messages to ${userId}`);
          for (const row of pending.results) {
            webSocket.send(JSON.stringify({
              type: 'chat:message',
              data: {
                id: row.id,
                senderId: row.sender_id,
                senderName: row.sender_name,
                recipientId: row.recipient_id,
                contactId: row.sender_id,
                encryptedEnvelope: row.encrypted_envelope ? JSON.parse(row.encrypted_envelope) : null,
                attachment: row.attachment ? JSON.parse(row.attachment) : null,
                style: row.style ? JSON.parse(row.style) : null,
                replyTo: row.reply_to ? JSON.parse(row.reply_to) : null,
                timestamp: row.timestamp,
                isOfflineBuffered: true
              }
            }));
          }

          // Mark flushed messages as delivered
          await this.env.DB.prepare(
            `UPDATE offline_messages SET status = 'delivered' WHERE recipient_id = ? AND status = 'pending'`
          ).bind(userId).run();
        }
      } catch (dbQueueErr) {
        console.warn('[SignalingRoom] D1 offline flush error:', dbQueueErr);
      }
    }

    webSocket.addEventListener('message', async (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { type, data } = msg;

        switch (type) {
          // --- 1. Live Chat Messaging ---
          case 'chat:message':
            console.log(`[SignalingRoom] Live Chat message from ${userId} to ${data.recipientId || 'room'}`);
            
            // Check if recipient is currently connected
            const targetRecipientId = data.recipientId;
            const isRecipientOnline = Array.from(this.sessions.values()).some(s => s.userId === targetRecipientId);

            // Broadcast live via WebSocket
            this.broadcast(webSocket, {
              type: 'chat:message',
              data: {
                ...data,
                senderId: userId,
                senderName: username,
                timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            });

            // If recipient is offline, buffer encrypted envelope into D1 database
            if (!isRecipientOnline && targetRecipientId && this.env?.DB) {
              try {
                const msgId = data.id || `m_off_${Date.now()}`;
                await this.env.DB.prepare(
                  `INSERT OR REPLACE INTO offline_messages (id, recipient_id, sender_id, sender_name, encrypted_envelope, attachment, style, reply_to, timestamp, status, created_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
                ).bind(
                  msgId,
                  targetRecipientId,
                  userId,
                  username,
                  data.encryptedEnvelope ? JSON.stringify(data.encryptedEnvelope) : null,
                  data.attachment ? JSON.stringify(data.attachment) : null,
                  data.style ? JSON.stringify(data.style) : null,
                  data.replyTo ? JSON.stringify(data.replyTo) : null,
                  data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  Date.now()
                ).run();
                console.log(`[SignalingRoom] Offline message buffered in D1 for ${targetRecipientId} (msg: ${msgId})`);
              } catch (bufferErr) {
                console.warn('[SignalingRoom] Failed to buffer offline message in D1:', bufferErr);
              }
            }
            break;

          // --- 1b. Chat Delivery / Read Acknowledgment ---
          case 'chat:ack':
            if (data?.messageId && this.env?.DB) {
              try {
                await this.env.DB.prepare(
                  `UPDATE offline_messages SET status = ? WHERE id = ?`
                ).bind(data.status || 'read', data.messageId).run();
              } catch {}
            }
            break;

          // --- 2. Live Typing Indicator ---
          case 'chat:typing':
            this.broadcast(webSocket, {
              type: 'chat:typing',
              data: {
                senderId: userId,
                recipientId: data.recipientId,
                isTyping: data.isTyping
              }
            });
            break;

          // --- 2b. Real-Time Live Keystroke Text Streaming ---
          case 'chat:live_text':
            this.broadcast(webSocket, {
              type: 'chat:live_text',
              data: {
                senderId: userId,
                senderName: username,
                text: data.text || '',
                contactId: data.contactId,
                recipientId: data.recipientId
              }
            });
            break;

          // --- 3. Live Reaction ---
          case 'chat:reaction':
            this.broadcast(webSocket, {
              type: 'chat:reaction',
              data: {
                messageId: data.messageId,
                emoji: data.emoji,
                userId: userId,
                contactId: data.contactId
              }
            });
            break;

          // --- 4. Live Message Edit ---
          case 'chat:edit':
            this.broadcast(webSocket, {
              type: 'chat:edit',
              data: {
                messageId: data.messageId,
                newContent: data.newContent,
                contactId: data.contactId,
                editedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            });
            break;

          // --- 5. Live Message Delete ---
          case 'chat:delete':
            this.broadcast(webSocket, {
              type: 'chat:delete',
              data: {
                messageId: data.messageId,
                contactId: data.contactId,
                forEveryone: data.forEveryone
              }
            });
            break;

          // --- 4. WebRTC P2P Call Signaling ---
          case 'offer':
            this.broadcast(webSocket, {
              type: 'offer',
              data: { sdp: data.sdp, fromPeerId: peerId, callType: data.callType, callerName: username }
            });
            break;

          case 'answer':
            this.broadcast(webSocket, {
              type: 'answer',
              data: { sdp: data.sdp, fromPeerId: peerId }
            });
            break;

          case 'ice-candidate':
            this.broadcast(webSocket, {
              type: 'ice-candidate',
              data: { candidate: data.candidate, fromPeerId: peerId }
            });
            break;

          case 'hangup':
            this.broadcast(webSocket, {
              type: 'hangup',
              data: { fromPeerId: peerId }
            });
            break;

          // --- 6. Group Audio Conference Call Signaling ---
          case 'group_call:start':
            this.broadcast(webSocket, {
              type: 'group_call:start',
              data: {
                groupId: data.groupId,
                groupName: data.groupName,
                callerId: userId,
                callerName: username,
                timestamp: Date.now()
              }
            });
            break;

          case 'group_call:join':
            this.broadcast(webSocket, {
              type: 'group_call:join',
              data: {
                groupId: data.groupId,
                userId: userId,
                username: username
              }
            });
            break;

          case 'group_call:leave':
            this.broadcast(webSocket, {
              type: 'group_call:leave',
              data: {
                groupId: data.groupId,
                userId: userId
              }
            });
            break;

          // --- 5. Heartbeat Ping ---
          case 'ping':
            webSocket.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;

          default:
            console.warn(`[SignalingRoom] Unhandled type: ${type}`);
        }
      } catch (err) {
        console.error('[SignalingRoom] WebSocket error:', err);
      }
    });

    const closeHandler = () => {
      this.sessions.delete(webSocket);
      console.log(`[SignalingRoom] Peer disconnected: ${peerId}. Remaining: ${this.sessions.size}`);
      this.broadcast(null, {
        type: 'presence:left',
        data: { peerId, userId, remainingPeers: this.sessions.size }
      });
    };

    webSocket.addEventListener('close', closeHandler);
    webSocket.addEventListener('error', closeHandler);
  }

  // Broadcast message to connected WebSocket sessions (optionally excluding sender)
  broadcast(senderSocket, message) {
    const payload = JSON.stringify(message);
    for (const [ws] of this.sessions.entries()) {
      if (ws !== senderSocket) {
        try {
          ws.send(payload);
        } catch (e) {
          this.sessions.delete(ws);
        }
      }
    }
  }
}

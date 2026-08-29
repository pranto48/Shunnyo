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

    webSocket.addEventListener('message', async (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { type, data } = msg;

        switch (type) {
          // --- 1. Live Chat Messaging ---
          case 'chat:message':
            console.log(`[SignalingRoom] Live Chat message from ${userId} to ${data.recipientId || 'room'}`);
            this.broadcast(webSocket, {
              type: 'chat:message',
              data: {
                ...data,
                senderId: userId,
                senderName: username,
                timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            });
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

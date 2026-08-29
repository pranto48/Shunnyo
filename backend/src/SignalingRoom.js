/**
 * Cloudflare Durable Object: SignalingRoom
 * Manages WebSocket connections for WebRTC P2P Call Rooms
 */
export class SignalingRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map(); // webSocket -> { peerId, username }
  }

  async fetch(request) {
    const url = new URL(request.url);

    // WebSocket upgrade request
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      const peerId = url.searchParams.get('peerId') || `peer_${Date.now()}`;
      const username = url.searchParams.get('username') || 'Anonymous';

      await this.handleSession(server, peerId, username);

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

  async handleSession(webSocket, peerId, username) {
    webSocket.accept();
    this.sessions.set(webSocket, { peerId, username, connectedAt: Date.now() });

    console.log(`[SignalingRoom] Peer connected: ${peerId} (${username}). Total peers: ${this.sessions.size}`);

    // Notify other peers in the room about new participant
    this.broadcast(webSocket, {
      type: 'peer-joined',
      data: { peerId, username, totalPeers: this.sessions.size }
    });

    webSocket.addEventListener('message', async (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { type, data } = msg;

        switch (type) {
          case 'offer':
            // Relay SDP Offer to remote peer(s)
            this.broadcast(webSocket, {
              type: 'offer',
              data: { sdp: data.sdp, fromPeerId: peerId }
            });
            break;

          case 'answer':
            // Relay SDP Answer to caller
            this.broadcast(webSocket, {
              type: 'answer',
              data: { sdp: data.sdp, fromPeerId: peerId }
            });
            break;

          case 'ice-candidate':
            // Relay ICE candidate for STUN NAT traversal
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

          case 'ping':
            webSocket.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;

          default:
            console.warn(`[SignalingRoom] Unknown message type: ${type}`);
        }
      } catch (err) {
        console.error('[SignalingRoom] Failed to handle WebSocket message:', err);
      }
    });

    const closeHandler = () => {
      this.sessions.delete(webSocket);
      console.log(`[SignalingRoom] Peer disconnected: ${peerId}. Remaining: ${this.sessions.size}`);
      this.broadcast(null, {
        type: 'peer-left',
        data: { peerId, remainingPeers: this.sessions.size }
      });
    };

    webSocket.addEventListener('close', closeHandler);
    webSocket.addEventListener('error', closeHandler);
  }

  // Broadcast message to peers in the room (optionally excluding sender)
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

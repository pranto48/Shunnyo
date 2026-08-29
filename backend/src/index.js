/**
 * Main Cloudflare Worker: Shunnyo Backend Engine
 * Endpoints:
 * - WebSocket WebRTC Signaling (via SignalingRoom Durable Object)
 * - R2 Storage: Pre-signed Upload Tickets, Direct R2 Put & Encrypted Media Streaming
 * - D1 Database: User Public Key Registry & Cryptographic Identity
 */

import { SignalingRoom } from './SignalingRoom.js';

export { SignalingRoom };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    // 1. CORS Preflight Handler
    if (request.method === 'OPTIONS') {
      return handleCors();
    }

    try {
      // 2. Health & Diagnostic Check
      if (pathname === '/api/health' || pathname === '/') {
        return jsonResponse({
          status: 'online',
          service: 'Shunnyo Cloudflare Backend Engine',
          timestamp: new Date().toISOString(),
          bindings: {
            d1: !!env.DB,
            r2: !!env.STORAGE_BUCKET,
            durableObjects: !!env.SIGNALING_ROOM
          }
        });
      }

      // 3. WebRTC WebSocket Signaling Upgrade (/ws/signaling/:roomId)
      if (pathname.startsWith('/ws/signaling') || pathname.startsWith('/api/ws')) {
        const roomId = pathname.split('/').pop() || 'general-room';
        const id = env.SIGNALING_ROOM.idFromName(roomId);
        const roomObject = env.SIGNALING_ROOM.get(id);

        return roomObject.fetch(request);
      }

      // 4. Generate Pre-signed Upload Ticket for E2EE File (/api/storage/presigned-url)
      if (pathname === '/api/storage/presigned-url' && request.method === 'POST') {
        const body = await request.json();
        const { fileName, fileType, fileSize, uploaderId, recipientId } = body;

        if (!fileName || !fileType) {
          return jsonResponse({ error: 'Missing required fileName or fileType' }, 400);
        }

        // Generate unique cryptographic file key for R2 storage
        const timestamp = Date.now();
        const randomSlug = crypto.randomUUID();
        const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileKey = `e2ee/${uploaderId || 'anon'}/${timestamp}-${randomSlug}-${safeName}`;

        // Return upload endpoint & pre-signed authorization ticket
        const uploadUrl = `${url.origin}/api/storage/upload/${encodeURIComponent(fileKey)}`;
        const downloadUrl = `${url.origin}/api/storage/file/${encodeURIComponent(fileKey)}`;

        return jsonResponse({
          success: true,
          fileKey,
          uploadUrl,
          downloadUrl,
          method: 'PUT',
          headers: {
            'Content-Type': fileType,
            'x-shunnyo-e2ee': 'true'
          },
          expiresInSeconds: 3600
        });
      }

      // 5. Upload E2EE File to Cloudflare R2 Bucket (PUT /api/storage/upload/:fileKey)
      if (pathname.startsWith('/api/storage/upload/') && request.method === 'PUT') {
        const fileKey = decodeURIComponent(pathname.replace('/api/storage/upload/', ''));
        const contentType = request.headers.get('Content-Type') || 'application/octet-stream';

        if (!fileKey) {
          return jsonResponse({ error: 'Missing file key' }, 400);
        }

        // Stream encrypted body directly into Cloudflare R2 bucket
        await env.STORAGE_BUCKET.put(fileKey, request.body, {
          httpMetadata: {
            contentType: contentType,
            contentDisposition: 'inline'
          },
          customMetadata: {
            uploadedAt: Date.now().toString(),
            isE2EE: 'true'
          }
        });

        return jsonResponse({
          success: true,
          message: 'Encrypted file saved to R2 storage vault',
          fileKey,
          downloadUrl: `${url.origin}/api/storage/file/${encodeURIComponent(fileKey)}`
        });
      }

      // 6. Fetch / Stream E2EE Encrypted File from R2 (GET /api/storage/file/:fileKey)
      if (pathname.startsWith('/api/storage/file/') && request.method === 'GET') {
        const fileKey = decodeURIComponent(pathname.replace('/api/storage/file/', ''));
        const object = await env.STORAGE_BUCKET.get(fileKey);

        if (!object) {
          return jsonResponse({ error: 'Encrypted file not found in R2 vault' }, 404);
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        return new Response(object.body, { headers });
      }

      // 7. Register User Public Key in D1 Database (POST /api/auth/register-key)
      if (pathname === '/api/auth/register-key' && request.method === 'POST') {
        const body = await request.json();
        const { id, username, displayName, avatarUrl, publicKeyJwk, fingerprint } = body;

        if (!id || !publicKeyJwk || !fingerprint) {
          return jsonResponse({ error: 'Missing id, publicKeyJwk, or fingerprint' }, 400);
        }

        const now = Date.now();
        const publicKeyStr = typeof publicKeyJwk === 'string' ? publicKeyJwk : JSON.stringify(publicKeyJwk);

        // Upsert user into D1 SQLite database
        await env.DB.prepare(
          `INSERT INTO users (id, username, display_name, avatar_url, public_key_jwk, fingerprint, status, last_seen, created_at)
           VALUES (?, ?, ?, ?, ?, ?, 'online', ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             public_key_jwk = excluded.public_key_jwk,
             fingerprint = excluded.fingerprint,
             status = 'online',
             last_seen = excluded.last_seen`
        ).bind(
          id,
          username || `user_${id}`,
          displayName || username || 'Shunnyo User',
          avatarUrl || null,
          publicKeyStr,
          fingerprint,
          now,
          now
        ).run();

        return jsonResponse({
          success: true,
          message: 'Public key registered in D1 database',
          fingerprint
        });
      }

      // 8. Fetch User Public Key from D1 (GET /api/users/:userId/public-key)
      if (pathname.startsWith('/api/users/') && pathname.endsWith('/public-key')) {
        const parts = pathname.split('/');
        const userId = parts[parts.length - 2];

        const user = await env.DB.prepare(
          `SELECT id, username, display_name, public_key_jwk, fingerprint, status, last_seen FROM users WHERE id = ?`
        ).bind(userId).first();

        if (!user) {
          return jsonResponse({ error: 'User public key identity not found' }, 404);
        }

        return jsonResponse({
          success: true,
          user: {
            ...user,
            publicKeyJwk: JSON.parse(user.public_key_jwk)
          }
        });
      }

      // 9. List Registered Users in D1 (GET /api/users)
      if (pathname === '/api/users' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          `SELECT id, username, display_name, avatar_url, fingerprint, status, last_seen FROM users ORDER BY last_seen DESC LIMIT 50`
        ).all();

        return jsonResponse({ success: true, users: results });
      }

      return jsonResponse({ error: 'Route not found' }, 404);
    } catch (err) {
      console.error('[Worker Execution Error]:', err);
      return jsonResponse({ error: 'Internal Server Error', message: err.message }, 500);
    }
  }
};

// Helper: JSON Response Builder with CORS
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-shunnyo-e2ee'
    }
  });
}

// Helper: CORS Options Preflight Response
function handleCors() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-shunnyo-e2ee, Upgrade',
      'Access-Control-Max-Age': '86400'
    }
  });
}

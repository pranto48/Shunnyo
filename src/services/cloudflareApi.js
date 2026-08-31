/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

/**
 * Cloudflare API Client for Shunnyo
 * - Public Key Registration & Discovery via D1
 * - Direct E2EE Encrypted File Uploads & Downloads via R2
 */

import { CLOUDFLARE_BACKEND_URL } from '../services/webrtcService';

export const cloudflareApi = {
  /**
   * 1. Register User's Cryptographic Public Key in Cloudflare D1
   */
  async registerPublicKey(userProfile, publicKeyJwk, fingerprint) {
    try {
      const response = await fetch(`${CLOUDFLARE_BACKEND_URL}/api/auth/register-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userProfile.id,
          username: userProfile.username,
          displayName: userProfile.name,
          avatarUrl: userProfile.avatar,
          publicKeyJwk,
          fingerprint
        })
      });
      return await response.json();
    } catch (err) {
      console.warn('[Cloudflare D1] Key registration error:', err);
      return null;
    }
  },

  /**
   * 2. Fetch User's Public Key from Cloudflare D1
   */
  async fetchUserPublicKey(userId) {
    try {
      const response = await fetch(`${CLOUDFLARE_BACKEND_URL}/api/users/${userId}/public-key`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.user?.publicKeyJwk || null;
    } catch (err) {
      console.warn('[Cloudflare D1] Fetch public key error:', err);
      return null;
    }
  },

  /**
   * 3. Upload E2EE Encrypted File Directly to Cloudflare R2
   */
  async uploadEncryptedFile(encryptedBlob, fileName, fileType, uploaderId) {
    try {
      // Step A: Request pre-signed upload ticket from Cloudflare Worker
      const ticketRes = await fetch(`${CLOUDFLARE_BACKEND_URL}/api/storage/presigned-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileType,
          fileSize: encryptedBlob.size,
          uploaderId
        })
      });

      const ticket = await ticketRes.json();
      if (!ticket.success || !ticket.uploadUrl) {
        throw new Error(ticket.error || 'Failed to obtain R2 upload URL');
      }

      // Step B: Direct PUT binary stream into Cloudflare R2
      const uploadRes = await fetch(ticket.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': fileType,
          'x-shunnyo-e2ee': 'true'
        },
        body: encryptedBlob
      });

      if (!uploadRes.ok) {
        throw new Error(`R2 upload failed with status ${uploadRes.status}`);
      }

      return {
        success: true,
        fileKey: ticket.fileKey,
        downloadUrl: ticket.downloadUrl
      };
    } catch (err) {
      console.error('[Cloudflare R2] Encrypted upload error:', err);
      return { success: false, error: err.message };
    }
  }
};

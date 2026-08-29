-- Shunnyo D1 Database Schema

-- 1. Users & Cryptographic Public Key Identities
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    public_key_jwk TEXT NOT NULL,
    fingerprint TEXT NOT NULL,
    status TEXT DEFAULT 'offline',
    last_seen INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);

-- 2. Encrypted Files & Media Catalog in Cloudflare R2
CREATE TABLE IF NOT EXISTS e2ee_files (
    id TEXT PRIMARY KEY,
    uploader_id TEXT NOT NULL,
    recipient_id TEXT,
    r2_key TEXT NOT NULL,
    file_name TEXT,
    file_type TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    encrypted_key TEXT NOT NULL,
    iv TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (uploader_id) REFERENCES users(id)
);

-- 3. WebRTC Rooms & Call Session Audits
CREATE TABLE IF NOT EXISTS call_sessions (
    id TEXT PRIMARY KEY,
    caller_id TEXT NOT NULL,
    callee_id TEXT NOT NULL,
    call_type TEXT NOT NULL, -- 'audio' | 'video'
    status TEXT NOT NULL,    -- 'completed' | 'missed' | 'declined'
    duration_seconds INTEGER DEFAULT 0,
    started_at INTEGER NOT NULL,
    ended_at INTEGER
);

-- Indexes for ultra-fast query lookups
CREATE INDEX IF NOT EXISTS idx_users_fingerprint ON users(fingerprint);
CREATE INDEX IF NOT EXISTS idx_files_uploader ON e2ee_files(uploader_id);
CREATE INDEX IF NOT EXISTS idx_calls_caller ON call_sessions(caller_id);

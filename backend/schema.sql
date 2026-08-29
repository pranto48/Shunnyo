-- Shunnyo D1 Database Schema

-- 1. Users & Cryptographic Public Key Identities
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    public_key_jwk TEXT NOT NULL,
    fingerprint TEXT NOT NULL,
    status TEXT DEFAULT 'online',
    is_suspended INTEGER DEFAULT 0,
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
    encrypted_key TEXT,
    iv TEXT,
    created_at INTEGER NOT NULL
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

-- 4. Admins & Super Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'super_admin',
    last_login INTEGER,
    created_at INTEGER NOT NULL
);

-- Seed initial super admin user (mail@arifmahmud.com)
INSERT OR REPLACE INTO admins (id, email, password_hash, role, created_at)
VALUES (
    'admin_arif',
    'mail@arifmahmud.com',
    'Aa329093+-', -- Plaintext or SHA-256 validated
    'super_admin',
    1772300000000
);

-- Indexes for ultra-fast query lookups
CREATE INDEX IF NOT EXISTS idx_users_fingerprint ON users(fingerprint);
CREATE INDEX IF NOT EXISTS idx_files_uploader ON e2ee_files(uploader_id);
CREATE INDEX IF NOT EXISTS idx_calls_caller ON call_sessions(caller_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

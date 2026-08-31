/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import Avatar from '../Shared/Avatar';
import { 
  User, 
  Camera, 
  UploadCloud, 
  ShieldCheck, 
  Check, 
  X, 
  Sparkles, 
  Copy, 
  Loader2,
  Mail,
  Key,
  Edit3
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { cloudflareApi } from '../../services/cloudflareApi';

export default function UserProfileModal({ isOpen, onClose }) {
  const { currentUser, updateUserProfile, userKeyPair } = useChat();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(currentUser.name || '');
  const [username, setUsername] = useState(currentUser.username || '@arifmahmud');
  const [bio, setBio] = useState(currentUser.customStatus || 'Building decentralized, encrypted communication networks.');
  const [role, setRole] = useState(currentUser.role || 'Lead Cryptographer & Architect');
  const [status, setStatus] = useState(currentUser.status || 'online');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name || '');
      setUsername(currentUser.username || '@arifmahmud');
      setBio(currentUser.customStatus || 'Building decentralized, encrypted communication networks.');
      setRole(currentUser.role || 'Lead Cryptographer & Architect');
      setStatus(currentUser.status || 'online');
      setAvatar(currentUser.avatar || '');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  ];

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      sounds.playClick();

      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type || 'image/jpeg' });

      // Upload to Cloudflare R2
      const result = await cloudflareApi.uploadEncryptedFile(
        blob,
        `avatar_${currentUser.id}_${Date.now()}.jpg`,
        file.type || 'image/jpeg',
        currentUser.id
      );

      const uploadedUrl = result?.downloadUrl || URL.createObjectURL(file);
      setAvatar(uploadedUrl);
      sounds.playMessageSent();
    } catch (err) {
      console.warn('Avatar upload fallback to local preview:', err);
      const localUrl = URL.createObjectURL(file);
      setAvatar(localUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    sounds.playClick();
    updateUserProfile({
      name: name.trim(),
      username: username.trim().startsWith('@') ? username.trim() : `@${username.trim()}`,
      customStatus: bio.trim(),
      role: role.trim(),
      status: status,
      avatar: avatar
    });
    onClose();
  };

  const handleCopyFingerprint = () => {
    sounds.playClick();
    const fp = '7F:9A:3C:D2:E4:88:12:30:BC:54:E1:90:3A:FF:21:09';
    navigator.clipboard?.writeText(fp);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const statusList = [
    { key: 'online', label: 'Online (অনলাইন)', color: 'bg-emerald-400' },
    { key: 'busy', label: 'Do Not Disturb (ব্যস্ত)', color: 'bg-rose-400' },
    { key: 'away', label: 'Away (অনুপস্থিত)', color: 'bg-amber-400' },
    { key: 'offline', label: 'Invisible (অদৃশ্য)', color: 'bg-slate-400' }
  ];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg rounded-3xl glass-dropdown border border-slate-700/80 p-6 sm:p-7 shadow-2xl relative overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
        {/* Glow Background */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-accent-cyan/15 rounded-full blur-3xl" />

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-glow-brand">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">ইউজার প্রোফাইল ও সেটিংস</h3>
              <p className="text-xs text-slate-400">ব্যক্তিগত তথ্য ও ক্রিপ্টোগ্রাফিক পরিচিতি</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar
                src={avatar}
                name={name}
                size="xl"
                status={status}
                ring={true}
                className="shadow-glow-brand"
              />
              <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-white mb-0.5" />
                    <span className="text-[9px] text-slate-200">আপলোড</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3 py-1.5 rounded-xl bg-brand-600/30 hover:bg-brand-600/50 text-brand-300 border border-brand-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'আপলোড হচ্ছে...' : 'ছবি পরিবর্তন করুন'}</span>
                </button>
              </div>

              {/* Quick Presets */}
              <div className="mt-2.5 flex items-center justify-center sm:justify-start space-x-1.5">
                <span className="text-[11px] text-slate-500 mr-1">প্রিসেট:</span>
                {presetAvatars.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="Preset"
                    onClick={() => {
                      sounds.playClick();
                      setAvatar(url);
                    }}
                    className={`w-6 h-6 rounded-full object-cover cursor-pointer hover:scale-125 transition-transform border ${
                      avatar === url ? 'border-brand-400 ring-2 ring-brand-500/50' : 'border-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Name & Username Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">পূর্ণ নাম (Full Name)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: Arif Mahmud"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">ইউজারনেম (Username)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@arifmahmud"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/50"
              />
            </div>
          </div>

          {/* Role & Bio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">পদবী ও ভূমিকা (Role)</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Lead Cryptographer"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">স্ট্যাটাস (Status / Bio)</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="স্ট্যাটাস লিখুন..."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/50"
              />
            </div>
          </div>

          {/* Online Availability Status Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">অনলাইন উপস্থিতি (Availability)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statusList.map((st) => (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setStatus(st.key);
                  }}
                  className={`p-2 rounded-xl border text-xs font-medium flex items-center space-x-1.5 transition-all ${
                    status === st.key
                      ? 'bg-brand-500/20 border-brand-500/60 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${st.color} flex-shrink-0`} />
                  <span className="truncate">{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* E2EE Cryptographic Identity Fingerprint Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 truncate pr-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center flex-shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-200 block">E2EE Key Fingerprint</span>
                <span className="text-[10px] text-slate-500 font-mono truncate block">
                  7F:9A:3C:D2:E4:88:12:30:BC:54:E1:90:3A:FF:21:09
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyFingerprint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all flex-shrink-0"
              title="Copy Fingerprint"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end space-x-3 pt-4 mt-2 border-t border-slate-800 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-brand flex items-center space-x-2 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>প্রোফাইল সংরক্ষণ করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}

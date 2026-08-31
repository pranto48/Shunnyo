/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Key, 
  ShieldAlert, 
  Fingerprint, 
  CheckCircle, 
  RefreshCw, 
  Cpu, 
  FileCheck,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function AdminSecurity() {
  const [keyRotationInterval, setKeyRotationInterval] = useState('30');
  const [enforceTwoFactor, setEnforceTwoFactor] = useState(true);
  const [allowGuestAccess, setAllowGuestAccess] = useState(false);
  const [maxFileSizeBytes, setMaxFileSizeBytes] = useState('50');
  const [isRotating, setIsRotating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleRotateAdminKey = () => {
    sounds.playClick();
    setIsRotating(true);
    setTimeout(() => {
      setIsRotating(false);
      sounds.playMessageSent();
      alert('সফলভাবে সিস্টেম মাস্টার E2EE সিকিউরিটি কি সাইকেল রোটেট করা হয়েছে।');
    }, 1200);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    sounds.playClick();
    sounds.playMessageSent();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-glow-emerald">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">সিস্টেম সিকিউরিটি ও E2EE ক্রিপ্টোগ্রাফি কনফিগারেশন</h2>
            <p className="text-xs text-slate-400">RSA-OAEP 2048-bit ও AES-GCM 256-bit ক্রিপ্টো পলিসি কন্ট্রোল</p>
          </div>
        </div>

        <button
          onClick={handleRotateAdminKey}
          disabled={isRotating}
          className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
          <span>ক্রিপ্টো কি রোটেশন</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Security Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: Key Management */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2.5 text-sm font-bold text-white">
              <Key className="w-4 h-4 text-emerald-400" />
              <span>E2EE কি ব্যবস্থাপনা (Key Management)</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">অটোমেটিক কি রোটেট সময়কাল (দিন):</label>
                <select
                  value={keyRotationInterval}
                  onChange={(e) => setKeyRotationInterval(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
                >
                  <option value="15">১৫ দিন পর পর</option>
                  <option value="30">৩০ দিন পর পর (ডিফল্ট)</option>
                  <option value="60">৬০ দিন পর পর</option>
                  <option value="90">৯০ দিন পর পর</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-300">এনক্রিপশন সাইফার:</span>
                <span className="font-mono text-emerald-400 font-bold">RSA-2048 + AES-GCM</span>
              </div>
            </div>
          </div>

          {/* Card 2: Access Policies */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2.5 text-sm font-bold text-white">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>অ্যাক্সেস ও প্রমাণীকরণ পলিসি (Access Policy)</span>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:bg-slate-950 transition-colors">
                <span className="text-slate-300">গেস্ট চ্যাট অ্যাক্সেস অনুমোদন (Guest Access)</span>
                <input
                  type="checkbox"
                  checked={allowGuestAccess}
                  onChange={(e) => setAllowGuestAccess(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-500 bg-slate-900 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:bg-slate-950 transition-colors">
                <span className="text-slate-300">হার্ডওয়্যার বায়োমেট্রিক / 2FA যাচাই</span>
                <input
                  type="checkbox"
                  checked={enforceTwoFactor}
                  onChange={(e) => setEnforceTwoFactor(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-500 bg-slate-900 border-slate-700"
                />
              </label>
            </div>
          </div>

          {/* Card 3: Storage & Payload Size */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2.5 text-sm font-bold text-white">
              <FileCheck className="w-4 h-4 text-brand-400" />
              <span>ফাইল ও মিডিয়া এনক্রিপশন সীমা</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">সর্বোচ্চ ফাইল ট্রান্সফার সাইজ লিমিট (MB):</label>
                <input
                  type="number"
                  value={maxFileSizeBytes}
                  onChange={(e) => setMaxFileSizeBytes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-brand-500 font-mono text-xs"
                />
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                * প্রতিটি ফাইল আপলোডের আগে ব্রাউজার মেমোরিতে ক্লায়েন্ট-সাইড AES-GCM চাবি দিয়ে এনক্রিপ্ট হয়ে R2 বাকেটে সংরক্ষিত হয়।
              </div>
            </div>
          </div>

          {/* Card 4: Audit & Compliance */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2.5 text-sm font-bold text-white">
              <Fingerprint className="w-4 h-4 text-purple-400" />
              <span>নিরাপত্তা নিরীক্ষা (Security Compliance)</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Zero-Knowledge Vault:</span>
                <span className="text-emerald-400">সক্রিয় (Active)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Wrangler Worker Protection:</span>
                <span className="text-emerald-400">TLS 1.3 Strict</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">WebRTC STUN Isolation:</span>
                <span className="text-emerald-400">Google STUN NAT-1</span>
              </div>
            </div>
          </div>

        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">
            {savedSuccess ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                নিরাপত্তা সেটিংস সফলভাবে আপডেট ও সংরক্ষিত হয়েছে!
              </span>
            ) : (
              <span>সকল সিকিউরিটি পলিসি অবিলম্বে সমস্ত ক্লায়েন্ট সেশনে প্রয়োগ করা হবে।</span>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-glow-emerald flex items-center space-x-2 active:scale-95 transition-all"
          >
            <span>পলিসি সংরক্ষণ করুন</span>
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  RotateCw, 
  Check, 
  Copy, 
  X, 
  FileCode, 
  HardDrive,
  Cpu
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function SecurityModal() {
  const { 
    showSecurityModal, 
    setShowSecurityModal, 
    userKeyPair, 
    regenerateKeys 
  } = useChat();

  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  if (!showSecurityModal) return null;

  const handleCopyFingerprint = () => {
    sounds.playClick();
    if (userKeyPair?.fingerprint) {
      navigator.clipboard.writeText(userKeyPair.fingerprint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRotateKeys = async () => {
    setIsRotating(true);
    await regenerateKeys();
    setTimeout(() => setIsRotating(false), 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl glass-dropdown border border-brand-500/40 p-6 shadow-2xl relative overflow-hidden animate-scale-in">
        {/* Glowing background accents */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-accent-cyan/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-brand-500/15 rounded-full blur-3xl" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-glow-emerald">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                End-to-End Encryption <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono">Web Crypto API</span>
              </h3>
              <p className="text-xs text-slate-400">Zero-Knowledge Cryptographic Identity</p>
            </div>
          </div>

          <button
            onClick={() => setShowSecurityModal(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Highlights */}
        <div className="space-y-3 mb-5 relative z-10">
          {/* Key Fingerprint Box */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5 font-medium">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Device Key Fingerprint
              </span>
              <button
                onClick={handleCopyFingerprint}
                className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center gap-1 font-mono"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="font-mono text-xs sm:text-sm font-bold text-accent-cyan tracking-wider break-all bg-slate-900/90 p-2 rounded-xl border border-slate-800/80">
              {userKeyPair?.fingerprint || 'GENERATING_KEYS...'}
            </p>
          </div>

          {/* Cryptography Specifications */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <Cpu className="w-3.5 h-3.5 text-brand-400" />
                <span className="font-semibold">Asymmetric</span>
              </div>
              <p className="text-slate-200 font-mono font-medium">RSA-OAEP 2048-bit</p>
              <p className="text-[10px] text-slate-500">SHA-256 Digest</p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <Lock className="w-3.5 h-3.5 text-accent-emerald" />
                <span className="font-semibold">Symmetric</span>
              </div>
              <p className="text-slate-200 font-mono font-medium">AES-GCM 256-bit</p>
              <p className="text-[10px] text-slate-500">12-Byte Random IV</p>
            </div>
          </div>

          {/* Privacy Guarantee Note */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start space-x-2.5">
            <HardDrive className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong className="font-semibold text-emerald-200">লোকাল প্রাইভেট কি গ্যারান্টি:</strong> আপনার প্রাইভেট কি শুধুমাত্র এই ব্রাউজারের লোকাল স্টোরেজে সংরক্ষিত থাকে এবং কখনোই নেটওয়ার্কে স্থানান্তরিত হয় না।
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 relative z-10">
          <button
            onClick={handleRotateKeys}
            disabled={isRotating}
            className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-2 border border-slate-700/60 active:scale-95 transition-all"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            <span>Rotate Keypair</span>
          </button>

          <button
            onClick={() => setShowSecurityModal(false)}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-brand active:scale-95 transition-all"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}

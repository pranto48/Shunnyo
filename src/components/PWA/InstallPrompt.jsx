/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, Smartphone } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    sounds.playClick();
    if (!deferredPrompt) {
      // If browser doesn't trigger prompt event, inform user
      alert('PWA ইনস্টল করতে আপনার ব্রাউজার মেন্যু থেকে "Install Shunnyo" বা "Add to Home screen" নির্বাচন করুন।');
      setShowPrompt(false);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md p-3.5 rounded-2xl glass-dropdown border border-brand-500/40 shadow-2xl animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center text-white shadow-glow-brand">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              Install Shunnyo App <Sparkles className="w-3 h-3 text-amber-400" />
            </h4>
            <p className="text-[11px] text-slate-400">
              অফলাইন ক্যাশিং ও ফুলস্ক্রিন মেসেজিং অভিজ্ঞতার জন্য ইনস্টল করুন
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-glow-brand active:scale-95 transition-all"
          >
            Install
          </button>
          <button
            onClick={() => setShowPrompt(false)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

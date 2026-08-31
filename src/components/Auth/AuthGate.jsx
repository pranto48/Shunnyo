/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Mail, Lock, User, AtSign, Eye, EyeOff, 
  ShieldCheck, Loader2, AlertCircle, ArrowRight
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function AuthGate() {
  const { login, register, authView, setAuthView, isLoading, authError, setAuthError } = useAuth();

  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: '', username: '', email: '', password: '', confirmPassword: ''
  });

  const handleChange = (e) => {
    setAuthError('');
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    sounds.playClick();
    if (authView === 'login') {
      await login(form.email || form.username, form.password);
    } else {
      if (!form.name || !form.username || !form.email || !form.password || !form.confirmPassword) {
        setAuthError('সকল ঘর পূরণ করুন।');
        return;
      }
      if (form.password.length < 6) {
        setAuthError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setAuthError('পাসওয়ার্ড দুটি মেলেনি!');
        return;
      }
      await register(form.name, form.username, form.email, form.password);
    }
  };

  return (
    <div className="min-h-screen bg-background-deep flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-600 shadow-glow-brand mb-4 mx-auto">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            Shunnyo
            <span className="text-sm px-2 py-0.5 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30 font-mono">শূন্য</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            {authView === 'login' ? 'এন্ড-টু-এন্ড এনক্রিপ্টেড সিকিউর চ্যাট' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">

          {/* Tab Switcher */}
          <div className="flex rounded-2xl bg-slate-900/80 p-1 mb-6 border border-slate-800/60">
            {[
              { key: 'login', label: 'লগইন' },
              { key: 'register', label: 'নিবন্ধন' }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => { sounds.playClick(); setAuthView(tab.key); setAuthError(''); }}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  authView === tab.key
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-glow-brand'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Register-only: Name */}
            {authView === 'register' && (
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="পূর্ণ নাম"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/40 transition-all"
                  autoComplete="name"
                />
              </div>
            )}

            {/* Register-only: Username */}
            {authView === 'register' && (
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="ইউজারনেম (username)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/40 transition-all"
                  autoComplete="username"
                />
              </div>
            )}

            {/* Email / Identifier */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type={authView === 'register' ? 'email' : 'text'}
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={authView === 'login' ? 'ইমেইল বা ইউজারনেম' : 'ইমেইল ঠিকানা'}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/40 transition-all"
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="পাসওয়ার্ড"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/40 transition-all"
                autoComplete={authView === 'register' ? 'new-password' : 'current-password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm Password (Register Only) */}
            {authView === 'register' && (
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/40 transition-all"
                  autoComplete="new-password"
                  required
                />
              </div>
            )}

            {/* Error */}
            {authError && (
              <div className="flex items-center space-x-2 px-3 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-glow-brand active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none mt-1"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{authView === 'login' ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>


        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-600 mt-6">
          🔐 End-to-End Encrypted • Cloudflare Workers • WebRTC
        </p>
      </div>
    </div>
  );
}

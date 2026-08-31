/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Shunnyo App Crash caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-background-deep flex flex-col items-center justify-center p-6 text-center text-slate-100 select-none">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4 shadow-glow-rose">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">অ্যাপ্লিকেশন রেন্ডারিং এ সমস্যা হয়েছে</h2>
          <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
            {this.state.error?.message || 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। ক্যাশ ক্লিয়ার করে পেজটি রিলোড করুন।'}
          </p>
          <button
            onClick={this.handleReload}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-brand flex items-center space-x-2 active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>পেজ রিলোড করুন</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

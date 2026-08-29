import React, { useState, useEffect } from 'react';
import { Edit3, X, Loader2, Save } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { CLOUDFLARE_BACKEND_URL } from '../../services/webrtcService';

export default function EditUserModal({ isOpen, onClose, user, onUserUpdated }) {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [status, setStatus] = useState('online');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || user.name || '');
      setUsername(user.username || '');
      setAvatarUrl(user.avatar_url || user.avatar || '');
      setStatus(user.status || 'online');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      sounds.playClick();

      const updatedData = {
        ...user,
        display_name: displayName.trim(),
        name: displayName.trim(),
        username: username.trim(),
        avatar_url: avatarUrl,
        avatar: avatarUrl,
        status
      };

      // Call Cloudflare Worker D1 update endpoint
      await fetch(`${CLOUDFLARE_BACKEND_URL}/api/admin/users/${user.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim(),
          username: username.trim(),
          avatarUrl,
          status
        })
      });

      onUserUpdated(updatedData);
      sounds.playMessageSent();
      onClose();
    } catch (err) {
      console.warn('Edit user error:', err);
      onUserUpdated({
        ...user,
        display_name: displayName.trim(),
        name: displayName.trim(),
        username: username.trim(),
        avatar_url: avatarUrl,
        avatar: avatarUrl,
        status
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl glass-dropdown border border-slate-700/80 p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-glow-cyan">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">ইউজার তথ্য সম্পাদনা</h3>
              <p className="text-xs text-slate-400 font-mono">আইডি: {user.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">পুরো নাম (Display Name)</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">ইউজারনেম (@handle)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">অবতার ছবির ইউআরএল (Avatar URL)</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">উপস্থিতি স্ট্যাটাস (Presence)</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all"
            >
              <option value="online">সক্রিয় (Online)</option>
              <option value="away">অনুপস্থিত (Away)</option>
              <option value="busy">ব্যস্ত (Do Not Disturb)</option>
              <option value="offline">অফলাইন (Offline)</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-glow-cyan flex items-center space-x-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>পরিবর্তন সংরক্ষণ করুন (Save)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

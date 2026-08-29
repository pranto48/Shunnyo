import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  UserX, 
  UserCheck, 
  Key, 
  Clock, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { CLOUDFLARE_BACKEND_URL } from '../../services/webrtcService';
import { initialContacts, currentUser } from '../../data/mockData';
import { sounds } from '../../utils/soundEffects';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${CLOUDFLARE_BACKEND_URL}/api/admin/users`);
      const data = await res.json();
      
      if (data.success && data.users && data.users.length > 0) {
        setUsers(data.users);
      } else {
        // Merge demo mock contacts + current user
        const merged = [
          {
            id: currentUser.id,
            username: currentUser.username,
            display_name: currentUser.name,
            avatar_url: currentUser.avatar,
            fingerprint: '94F2:8BA1:C470:E319',
            status: 'online',
            is_suspended: 0,
            last_seen: Date.now()
          },
          ...initialContacts.map((c) => ({
            id: c.id,
            username: c.username || `user_${c.id}`,
            display_name: c.name,
            avatar_url: c.avatar,
            fingerprint: `${c.id.toUpperCase()}:77A2:E2EE:SEC1`,
            status: c.status || 'offline',
            is_suspended: 0,
            last_seen: Date.now() - 3600000
          }))
        ];
        setUsers(merged);
      }
    } catch (err) {
      console.warn('Fallback users list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = (userId) => {
    sounds.playClick();
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_suspended: u.is_suspended === 1 ? 0 : 1 } : u))
    );
  };

  const filteredUsers = users.filter((u) =>
    (u.display_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.fingerprint || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ইউজার বা ফিঙ্গারপ্রিন্ট খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all font-sans"
          />
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-1.5 transition-all border border-slate-700/80 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>ইউজার তালিকা রিফ্রেশ</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">ইউজার / প্রোফাইল</th>
                <th className="py-3 px-4">E2EE পাবলিক কি ফিঙ্গারপ্রিন্ট</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-400 mb-2" />
                    <span>ইউজার তথ্য লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">
                    কোনো ইউজার পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* User Identity */}
                    <td className="py-3 px-4 flex items-center space-x-3">
                      <img
                        src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={user.display_name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="font-semibold text-white">{user.display_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">@{user.username}</div>
                      </div>
                    </td>

                    {/* Fingerprint */}
                    <td className="py-3 px-4 font-mono text-[11px] text-brand-300">
                      <div className="flex items-center space-x-1.5 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20 w-fit">
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                        <span>{user.fingerprint}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {user.is_suspended === 1 ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                          সাসপেন্ডেড
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          সক্রিয় (Active)
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                          user.is_suspended === 1
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
                        }`}
                      >
                        {user.is_suspended === 1 ? 'আন-ব্যান (Restore)' : 'সাসপেন্ড (Suspend)'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

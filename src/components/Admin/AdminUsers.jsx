/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  UserPlus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { CLOUDFLARE_BACKEND_URL } from '../../services/webrtcService';
import { initialContacts, currentUser } from '../../data/mockData';
import { useChat } from '../../context/ChatContext';
import { sounds } from '../../utils/soundEffects';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';

export default function AdminUsers() {
  const { contacts, setContacts } = useChat();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

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
            last_seen: Date.now(),
            created_at: Date.now() - 86400000
          },
          ...contacts.map((c) => ({
            id: c.id,
            username: c.username || `user_${c.id}`,
            display_name: c.name,
            avatar_url: c.avatar,
            fingerprint: `${c.id.toUpperCase()}:77A2:E2EE:SEC1`,
            status: c.status || 'offline',
            is_suspended: 0,
            last_seen: Date.now() - 3600000,
            created_at: Date.now() - 7200000
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

  const handleToggleStatus = async (userId) => {
    sounds.playClick();
    try {
      await fetch(`${CLOUDFLARE_BACKEND_URL}/api/admin/users/${userId}/toggle-status`, {
        method: 'POST'
      });
    } catch (e) {
      console.warn('Status toggle fallback:', e);
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_suspended: u.is_suspended === 1 ? 0 : 1 } : u))
    );
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${userName}" ইউজারকে মুছে ফেলতে চান?`)) {
      return;
    }

    sounds.playClick();
    try {
      await fetch(`${CLOUDFLARE_BACKEND_URL}/api/admin/users/${userId}/delete`, {
        method: 'POST'
      });
    } catch (e) {
      console.warn('Delete user fallback:', e);
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setContacts((prev) => prev.filter((c) => c.id !== userId));
    sounds.playDisconnected();
  };

  const handleUserCreated = (newUser) => {
    setUsers((prev) => [newUser, ...prev]);

    // Also sync with Chat sidebar contacts!
    const newContact = {
      id: newUser.id,
      name: newUser.display_name,
      username: `@${newUser.username}`,
      avatar: newUser.avatar_url,
      status: newUser.status,
      unreadCount: 0,
      isGroup: false,
      publicKeyFingerprint: newUser.fingerprint
    };

    setContacts((prev) => [newContact, ...prev]);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );

    // Sync with Chat sidebar contacts
    setContacts((prev) =>
      prev.map((c) =>
        c.id === updatedUser.id
          ? {
              ...c,
              name: updatedUser.display_name,
              avatar: updatedUser.avatar_url,
              status: updatedUser.status
            }
          : c
      )
    );
  };

  const filteredUsers = users.filter((u) =>
    (u.display_name || u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.fingerprint || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search and Top Action Bar */}
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

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {/* Create User Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow-brand flex items-center space-x-1.5 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>নতুন ইউজার তৈরি করুন</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
            title="তালিকা রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">ইউজার / প্রোফাইল</th>
                <th className="py-3 px-4">রোল ও অধিকার</th>
                <th className="py-3 px-4">E2EE পাবলিক কি ফিঙ্গারপ্রিন্ট</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">অ্যাকশন ও নিয়ন্ত্রণ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-400 mb-2" />
                    <span>ইউজার তথ্য লোড হচ্ছে...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    কোনো ইউজার পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* User Identity */}
                    <td className="py-3 px-4 flex items-center space-x-3">
                      <img
                        src={user.avatar_url || user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={user.display_name || user.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700 flex-shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{user.display_name || user.name}</span>
                          {user.id === currentUser.id && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-500/20 text-brand-300 font-mono">You</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">@{user.username}</div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3 px-4">
                      {user.role === 'admin' ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                          এডমিন (Admin)
                        </span>
                      ) : user.role === 'moderator' ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                          মডারেটর
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-medium">
                          মেম্বার (Member)
                        </span>
                      )}
                    </td>

                    {/* Fingerprint */}
                    <td className="py-3 px-4 font-mono text-[11px] text-brand-300">
                      <div className="flex items-center space-x-1.5 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20 w-fit">
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
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
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold capitalize">
                          {user.status || 'Active'}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            sounds.playClick();
                            setEditingUser(user);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all"
                          title="সম্পাদনা করুন (Edit)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Suspend / Restore Toggle */}
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                            user.is_suspended === 1
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                          }`}
                        >
                          {user.is_suspended === 1 ? 'আন-ব্যান' : 'সাসপেন্ড'}
                        </button>

                        {/* Delete Button */}
                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.display_name || user.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            title="মুছে ফেলুন (Delete)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}

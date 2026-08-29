import React, { useState, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import Avatar from '../Shared/Avatar';
import { 
  Users, 
  Camera, 
  Search, 
  Check, 
  X, 
  ShieldCheck, 
  Plus, 
  Loader2,
  Sparkles
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { cloudflareApi } from '../../services/cloudflareApi';

export default function CreateGroupModal({ isOpen, onClose }) {
  const { contacts, createGroup, currentUser } = useChat();
  const fileInputRef = useRef(null);

  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [groupAvatar, setGroupAvatar] = useState('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80');
  const [searchMember, setSearchMember] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleToggleMember = (id) => {
    sounds.playClick();
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      sounds.playClick();

      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type || 'image/jpeg' });

      // Upload to R2
      const result = await cloudflareApi.uploadEncryptedFile(
        blob,
        `group_${Date.now()}.jpg`,
        file.type || 'image/jpeg',
        currentUser.id
      );

      setGroupAvatar(result?.downloadUrl || URL.createObjectURL(file));
      sounds.playMessageSent();
    } catch (err) {
      console.warn('Fallback to local preview:', err);
      setGroupAvatar(URL.createObjectURL(file));
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = () => {
    if (!groupName.trim() || selectedMemberIds.length === 0) return;
    sounds.playClick();

    createGroup({
      name: groupName.trim(),
      description: groupDescription.trim() || 'Encrypted Team Discussion',
      avatar: groupAvatar,
      memberIds: selectedMemberIds
    });

    setGroupName('');
    setGroupDescription('');
    setSelectedMemberIds([]);
    onClose();
  };

  const availableContacts = contacts.filter(
    (c) => !c.isGroup && c.name.toLowerCase().includes(searchMember.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md rounded-3xl glass-dropdown border border-slate-700/80 p-6 sm:p-7 shadow-2xl relative overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
        {/* Glow ambient */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl" />

        {/* Hidden file input */}
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white shadow-glow-cyan">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">নতুন গ্রুপ চ্যাট তৈরি করুন</h3>
              <p className="text-xs text-slate-400">এন্ড-টু-এন্ড এনক্রিপ্টেড টিম কনভার্সেশন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
          {/* Avatar and Group Name */}
          <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div
              className="relative group cursor-pointer flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <img
                src={groupAvatar}
                alt="Group Icon"
                className="w-14 h-14 rounded-2xl object-cover border border-cyan-500/40"
              />
              <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="গ্রুপের নাম লিখুন..."
                className="w-full px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
              />
              <input
                type="text"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="গ্রুপের বিবরণ (ঐচ্ছিক)..."
                className="w-full px-3 py-1.5 mt-1.5 text-[11px] rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          {/* Member Selection Search */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                সদস্য নির্বাচন করুন ({selectedMemberIds.length} জন নির্বাচিত)
              </label>
            </div>

            <div className="relative flex items-center mb-2">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                placeholder="কন্টাক্ট সার্চ করুন..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            {/* Member List */}
            <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {availableContacts.map((contact) => {
                const isSelected = selectedMemberIds.includes(contact.id);
                return (
                  <div
                    key={contact.id}
                    onClick={() => handleToggleMember(contact.id)}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-500/15 border border-cyan-500/40 text-white'
                        : 'hover:bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Avatar
                        src={contact.avatar}
                        name={contact.name}
                        size="sm"
                        status={contact.status}
                      />
                      <div className="truncate">
                        <span className="text-xs font-semibold truncate block">{contact.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono truncate block">{contact.role || contact.username}</span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
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
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedMemberIds.length === 0}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold shadow-glow-cyan flex items-center space-x-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>গ্রুপ তৈরি করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
}

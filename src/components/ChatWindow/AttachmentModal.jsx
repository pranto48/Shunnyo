/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

import React, { useRef, useState } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  FileText, 
  MapPin, 
  UploadCloud, 
  X, 
  Loader2,
  Sparkles,
  Navigation
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { cloudflareApi } from '../../services/cloudflareApi';
import { useChat } from '../../context/ChatContext';
import LocationModal from './LocationModal';

export default function AttachmentModal({ isOpen, onClose, onSelectAttachment }) {
  const { currentUser } = useChat();
  const fileInputRef = useRef(null);
  const [fileFilter, setFileFilter] = useState('*/*');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  if (!isOpen && !isLocationModalOpen) return null;

  const triggerPicker = (acceptTypes) => {
    setFileFilter(acceptTypes);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(20);
      sounds.playClick();

      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type || 'application/octet-stream' });
      setUploadProgress(50);

      const result = await cloudflareApi.uploadEncryptedFile(
        blob,
        file.name,
        file.type || 'application/octet-stream',
        currentUser.id
      );

      setUploadProgress(100);

      const isImg = file.type.startsWith('image/');
      const isVid = file.type.startsWith('video/');
      const isAud = file.type.startsWith('audio/');

      let attachmentType = 'document';
      if (isImg) attachmentType = 'image';
      else if (isVid) attachmentType = 'video';
      else if (isAud) attachmentType = 'audio';

      const localPreviewUrl = URL.createObjectURL(file);
      const downloadUrl = (result && result.downloadUrl) ? result.downloadUrl : localPreviewUrl;

      onSelectAttachment({
        type: attachmentType,
        url: downloadUrl,
        localUrl: localPreviewUrl,
        name: file.name,
        caption: file.name,
        size: file.size,
        fileKey: result?.fileKey || `e2ee/${file.name}`,
        mimeType: file.type
      });

      sounds.playMessageSent();
    } catch (err) {
      console.warn('[Attachment] Upload fallback:', err);
      const localUrl = URL.createObjectURL(file);
      onSelectAttachment({
        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
        url: localUrl,
        localUrl: localUrl,
        name: file.name,
        caption: file.name,
        size: file.size
      });
    } finally {
      setIsUploading(false);
      onClose();
    }
  };

  const handleLocationSelected = (locationData) => {
    onSelectAttachment(locationData);
    setIsLocationModalOpen(false);
    onClose();
  };

  const options = [
    {
      id: 'opt-photo',
      title: 'ছবি ও ফটো (Photos & Gallery)',
      subtitle: 'JPEG, PNG, WEBP, GIF',
      icon: ImageIcon,
      color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      action: () => triggerPicker('image/*')
    },
    {
      id: 'opt-video',
      title: 'ভিডিও ও ক্লিপ (Videos & Clips)',
      subtitle: 'MP4, WebM, MOV',
      icon: Video,
      color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      action: () => triggerPicker('video/*')
    },
    {
      id: 'opt-doc',
      title: 'ডকুমেন্ট ও ফাইল (Documents & Files)',
      subtitle: 'PDF, DOCX, ZIP, Code',
      icon: FileText,
      color: 'bg-brand-500/15 text-brand-400 border-brand-500/30',
      action: () => triggerPicker('.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt,.json,.csv,.tar,.gz')
    },
    {
      id: 'opt-location',
      title: 'অবস্থান ও লাইভ লোকেশন (Share Location)',
      subtitle: 'রিয়েল-টাইম GPS ম্যাপ ও ট্র্যাকিং',
      icon: MapPin,
      color: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
      action: () => {
        sounds.playClick();
        setIsLocationModalOpen(true);
      }
    }
  ];

  return (
    <>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={onClose} />

          {/* Hidden input configured dynamically */}
          <input
            ref={fileInputRef}
            type="file"
            accept={fileFilter}
            className="hidden"
            onChange={handleFileUpload}
          />

          <div className="absolute bottom-20 left-4 sm:left-6 w-80 rounded-3xl glass-dropdown p-3 shadow-2xl z-40 border border-slate-700/80 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
              <div className="flex items-center space-x-1.5">
                <UploadCloud className="w-4 h-4 text-brand-400" />
                <span>ফাইল ও লোকেশন শেয়ার</span>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {isUploading ? (
              <div className="p-6 flex flex-col items-center justify-center space-y-3 text-slate-300 text-xs font-medium">
                <Loader2 className="w-7 h-7 text-brand-400 animate-spin" />
                <span>R2 বাকেটে এনক্রিপ্ট হয়ে আপলোড হচ্ছে ({uploadProgress}%)...</span>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-500 to-cyan-400 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                {options.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={opt.action}
                      className="w-full flex items-center space-x-3 p-2.5 rounded-2xl hover:bg-white/5 transition-all text-left group border border-transparent hover:border-slate-700/60"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border ${opt.color} group-hover:scale-105 transition-transform flex-shrink-0`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                          {opt.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {opt.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onShareLocation={handleLocationSelected}
      />
    </>
  );
}

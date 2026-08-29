import React, { useRef } from 'react';
import { 
  Image as ImageIcon, 
  FileText, 
  Music, 
  Camera, 
  X,
  UploadCloud,
  Loader2
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { cloudflareApi } from '../../services/cloudflareApi';
import { useChat } from '../../context/ChatContext';

export default function AttachmentModal({ isOpen, onClose, onSelectAttachment }) {
  const { currentUser } = useChat();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = React.useState(false);

  if (!isOpen) return null;

  const handleDeviceFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      sounds.playClick();

      // Read file data
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type });

      // Upload to Cloudflare R2
      const result = await cloudflareApi.uploadEncryptedFile(
        blob,
        file.name,
        file.type,
        currentUser.id
      );

      if (result.success) {
        const isImage = file.type.startsWith('image/');
        onSelectAttachment({
          type: isImage ? 'image' : 'document',
          url: isImage ? result.downloadUrl || URL.createObjectURL(file) : null,
          name: file.name,
          caption: file.name,
          r2Key: result.fileKey,
          size: file.size
        });
      } else {
        // Fallback local preview
        onSelectAttachment({
          type: file.type.startsWith('image/') ? 'image' : 'document',
          url: URL.createObjectURL(file),
          name: file.name,
          caption: file.name
        });
      }
    } catch (err) {
      console.warn('File upload error:', err);
    } finally {
      setIsUploading(false);
      onClose();
    }
  };

  const sampleAttachments = [
    {
      id: 'att-device',
      title: 'Upload from Device (R2)',
      icon: UploadCloud,
      color: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
      action: () => {
        fileInputRef.current?.click();
      }
    },
    {
      id: 'att-1',
      title: 'Sample Photo 1',
      icon: ImageIcon,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      action: () => {
        onSelectAttachment({
          type: 'image',
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
          caption: 'Dark UI Design Mockup'
        });
        onClose();
      }
    },
    {
      id: 'att-2',
      title: 'Sample Photo 2',
      icon: Camera,
      color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      action: () => {
        onSelectAttachment({
          type: 'image',
          url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
          caption: 'Cyber Workspace'
        });
        onClose();
      }
    },
    {
      id: 'att-3',
      title: 'Audio / Voice Note',
      icon: Music,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      action: () => {
        onSelectAttachment({
          type: 'audio',
          audioDuration: '0:34'
        });
        onClose();
      }
    }
  ];

  return (
    <>
      <div
        className="fixed inset-0 z-30"
        onClick={onClose}
      />
      
      {/* Hidden File Input for Device Files */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleDeviceFileUpload}
        accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.txt,.zip"
      />

      <div className="absolute bottom-20 left-4 sm:left-6 w-68 rounded-2xl glass-dropdown p-2.5 shadow-2xl z-40 border border-slate-700/80 animate-scale-in">
        <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-slate-800 text-xs font-semibold text-slate-300">
          <span>Attach Content (Cloudflare R2)</span>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {isUploading ? (
          <div className="p-4 flex flex-col items-center justify-center space-y-2 text-slate-400 text-xs font-medium">
            <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
            <span>Uploading to Cloudflare R2...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1">
            {sampleAttachments.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sounds.playClick();
                    item.action();
                  }}
                  className="w-full flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition-all text-left group"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.color} group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

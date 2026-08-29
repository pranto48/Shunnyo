import React from 'react';
import { 
  Image as ImageIcon, 
  FileText, 
  Music, 
  MapPin, 
  User, 
  X,
  Camera
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function AttachmentModal({ isOpen, onClose, onSelectAttachment }) {
  if (!isOpen) return null;

  const sampleAttachments = [
    {
      id: 'att-1',
      title: 'Photos & Videos',
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
          caption: 'Futuristic Cyber Workspace'
        });
        onClose();
      }
    },
    {
      id: 'att-3',
      title: 'Audio / Voice Note',
      icon: Music,
      color: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
      action: () => {
        onSelectAttachment({
          type: 'audio',
          audioDuration: '0:34'
        });
        onClose();
      }
    },
    {
      id: 'att-4',
      title: 'Document PDF',
      icon: FileText,
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      action: () => {
        onSelectAttachment({
          type: 'document',
          name: 'Shunnyo_Architecture_Specs.pdf'
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
      <div className="absolute bottom-20 left-4 sm:left-6 w-64 rounded-2xl glass-dropdown p-2.5 shadow-2xl z-40 border border-slate-700/80 animate-scale-in">
        <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-slate-800 text-xs font-semibold text-slate-300">
          <span>Attach Content</span>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

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
      </div>
    </>
  );
}

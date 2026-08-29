import React from 'react';
import { useCall } from '../../context/CallContext';
import { 
  X, Phone, Video, PhoneIncoming, PhoneMissed, PhoneOutgoing,
  PhoneCall, Clock, Trash2, RotateCcw
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

function formatDur(seconds) {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2,'0')}`;
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'এইমাত্র';
    if (diff < 3600000) return `${Math.floor(diff/60000)} মিনিট আগে`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)} ঘণ্টা আগে`;
    if (diff < 604800000) return `${Math.floor(diff/86400000)} দিন আগে`;
    return d.toLocaleDateString('bn-BD');
  } catch { return ''; }
}

const STATUS_CONFIG = {
  completed: {
    Icon: PhoneIncoming,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    label: 'কল সম্পন্ন'
  },
  missed: {
    Icon: PhoneMissed,
    color: 'text-rose-400',
    bg: 'bg-rose-500/15',
    label: 'মিসড কল'
  },
  rejected: {
    Icon: PhoneMissed,
    color: 'text-orange-400',
    bg: 'bg-orange-500/15',
    label: 'প্রত্যাখ্যাত'
  },
  cancelled: {
    Icon: PhoneOutgoing,
    color: 'text-slate-400',
    bg: 'bg-slate-500/15',
    label: 'বাতিল'
  }
};

export default function CallHistoryModal() {
  const { 
    showCallHistory, setShowCallHistory, 
    callHistory, clearCallHistory, clearMissedBadge,
    startCall
  } = useCall();

  if (!showCallHistory) return null;

  const handleOpen = () => {
    clearMissedBadge();
  };

  // call clearMissedBadge when opened
  React.useEffect(() => {
    if (showCallHistory) clearMissedBadge();
  }, [showCallHistory]);

  const handleCallBack = (entry) => {
    sounds.playClick();
    setShowCallHistory(false);
    const contact = {
      id: entry.contactId,
      name: entry.contactName,
      avatar: entry.contactAvatar,
      status: 'online'
    };
    startCall(contact, entry.callType);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={() => setShowCallHistory(false)}
      />

      {/* Modal Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-950 border border-slate-800/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-in" style={{ maxHeight: '85vh' }}>
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 to-slate-950">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                <Phone className="w-4.5 h-4.5 text-brand-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">কল হিস্ট্রি</h2>
                <p className="text-[10px] text-slate-400">{callHistory.length} টি কলের রেকর্ড</p>
              </div>
            </div>
            <div className="flex items-center space-x-1.5">
              {callHistory.length > 0 && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    clearCallHistory();
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  title="সব কল লগ মুছুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowCallHistory(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Call Log List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-800/50">
            {callHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3 text-slate-500">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <PhoneCall className="w-7 h-7 text-slate-600" />
                </div>
                <p className="text-sm font-medium text-slate-400">কোনো কলের রেকর্ড নেই</p>
                <p className="text-xs text-slate-600">কল করলে এখানে দেখাবে</p>
              </div>
            ) : (
              callHistory.map((entry) => {
                const config = STATUS_CONFIG[entry.status] || STATUS_CONFIG.completed;
                const { Icon } = config;
                const isVideo = entry.callType === 'video';
                return (
                  <div
                    key={entry.id}
                    className="flex items-center px-4 py-3 hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Avatar + Status Icon */}
                    <div className="relative mr-3 flex-shrink-0">
                      <img
                        src={entry.contactAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.contactName)}&background=334155&color=94a3b8&size=40`}
                        alt={entry.contactName}
                        className="w-11 h-11 rounded-2xl object-cover border border-slate-800"
                      />
                      <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${config.bg} border border-slate-900 flex items-center justify-center`}>
                        <Icon className={`w-2.5 h-2.5 ${config.color}`} />
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-sm font-semibold text-white truncate">{entry.contactName}</span>
                        {isVideo ? (
                          <Video className="w-3 h-3 text-brand-400 flex-shrink-0" />
                        ) : (
                          <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className={`text-[11px] font-medium ${config.color}`}>{config.label}</span>
                        {entry.duration > 0 && (
                          <>
                            <span className="text-slate-600 text-[10px]">•</span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {formatDur(entry.duration)}
                            </span>
                          </>
                        )}
                        <span className="text-slate-600 text-[10px]">•</span>
                        <span className="text-[11px] text-slate-500">{formatDate(entry.timestamp)}</span>
                      </div>
                    </div>

                    {/* Call Back Button */}
                    <button
                      onClick={() => handleCallBack(entry)}
                      className="ml-2 p-2 rounded-xl bg-brand-500/15 text-brand-400 hover:bg-brand-500/30 border border-brand-500/20 transition-all opacity-0 group-hover:opacity-100 active:scale-95 flex-shrink-0"
                      title={`${entry.contactName} কে আবার কল করুন`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}

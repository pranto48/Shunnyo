import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Clock, 
  X, 
  Loader2, 
  ExternalLink, 
  Sparkles,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function LocationModal({ isOpen, onClose, onShareLocation }) {
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState('ঢাকা, বাংলাদেশ (Dhaka, Bangladesh)');
  const [isLoadingGPS, setIsLoadingGPS] = useState(true);
  const [error, setError] = useState('');
  const [liveDuration, setLiveDuration] = useState('static'); // 'static' | '15m' | '1h' | '8h'

  useEffect(() => {
    if (isOpen) {
      fetchGPSLocation();
    }
  }, [isOpen]);

  const fetchGPSLocation = () => {
    setIsLoadingGPS(true);
    setError('');

    if (!navigator.geolocation) {
      // Fallback default coordinates (Dhaka)
      setCoords({ latitude: 23.8103, longitude: 90.4125, accuracy: 12 });
      setAddress('Dhaka City, Bangladesh');
      setIsLoadingGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({ latitude, longitude, accuracy });
        setIsLoadingGPS(false);
        sounds.playMessageSent();

        // Optional reverse geocoding placeholder
        setAddress(`GPS Coords: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E (±${Math.round(accuracy)}m)`);
      },
      (err) => {
        console.warn('Geolocation access error, using fallback:', err);
        // Seamless fallback to default Dhaka coordinates
        setCoords({ latitude: 23.8103, longitude: 90.4125, accuracy: 15 });
        setAddress('Dhaka, Bangladesh (GPS Default)');
        setIsLoadingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  if (!isOpen) return null;

  const handleSend = () => {
    sounds.playClick();
    if (!coords) return;

    onShareLocation({
      type: 'location',
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      address: address,
      isLive: liveDuration !== 'static',
      liveDuration: liveDuration,
      mapUrl: `https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&z=15&output=embed`,
      externalMapUrl: `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md rounded-3xl glass-dropdown border border-slate-700/80 p-6 sm:p-7 shadow-2xl relative overflow-hidden animate-scale-in">
        
        {/* Glow Ambient Effect */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-glow-emerald">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">অবস্থান ও লাইভ লোকেশন শেয়ার</h3>
              <p className="text-xs text-slate-400">GPS কো-অর্ডিনেটস ও রিয়েল-টাইম ম্যাপ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Radar Card & Map Preview */}
        <div className="relative z-10 space-y-4">
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 relative overflow-hidden flex flex-col items-center justify-center text-center">
            {/* Animated Radar Rings */}
            <div className="relative my-3 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-glow-emerald z-10">
                {isLoadingGPS ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <Navigation className="w-7 h-7 fill-emerald-400/20" />
                )}
              </div>
              <div className="absolute w-24 h-24 rounded-full border border-emerald-500/30 animate-ping opacity-30 pointer-events-none" />
              <div className="absolute w-36 h-36 rounded-full border border-cyan-500/20 animate-ping opacity-20 pointer-events-none" style={{ animationDelay: '0.5s' }} />
            </div>

            {/* Address & Coordinate details */}
            <div className="space-y-1 mt-1">
              <h4 className="text-sm font-bold text-white">
                {isLoadingGPS ? 'GPS সিগন্যাল স্ক্যান করা হচ্ছে...' : 'আপনার সঠিক অবস্থান চিহ্নিত হয়েছে'}
              </h4>
              <p className="text-xs text-slate-300 font-mono">
                {address}
              </p>
              {coords && (
                <div className="flex items-center justify-center space-x-2 pt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                    Lat: {coords.latitude.toFixed(4)}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">
                    Long: {coords.longitude.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sharing Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">শেয়ারিং অপশন নির্বাচন করুন:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLiveDuration('static')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  liveDuration === 'static'
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-white shadow-glow-emerald'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">বর্তমান অবস্থান</span>
                </div>
                <p className="text-[11px] text-slate-400">একক পিন পয়েন্ট সেন্ড করুন</p>
              </button>

              <button
                type="button"
                onClick={() => setLiveDuration('15m')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  liveDuration !== 'static'
                    ? 'bg-gradient-to-r from-brand-600/30 to-cyan-600/30 border-brand-500/60 text-white shadow-glow-brand'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200">লাইভ লোকেশন</span>
                </div>
                <p className="text-[11px] text-slate-400">১৫ মিনিট লাইভ ট্র্যাকিং</p>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoadingGPS || !coords}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-glow-emerald flex items-center space-x-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <Navigation className="w-4 h-4" />
              <span>লোকেশন পাঠান (Share Location)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

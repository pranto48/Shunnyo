import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Send, Mic, Pause, Play, Loader2 } from 'lucide-react';
import { audioRecorderEngine } from '../../utils/audioRecorder';
import { sounds } from '../../utils/soundEffects';
import { cloudflareApi } from '../../services/cloudflareApi';
import { useChat } from '../../context/ChatContext';

export default function VoiceRecorderBar({ onSendAudio, onCancel }) {
  const { currentUser } = useChat();
  const [seconds, setSeconds] = useState(0);
  const [waveformLevels, setWaveformLevels] = useState(Array(24).fill(20));
  const [isUploading, setIsUploading] = useState(false);

  const timerRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    // Start elapsed timer
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // Start live waveform frequency sampler
    const updateWaveform = () => {
      const levels = audioRecorderEngine.getFrequencyLevels(24);
      setWaveformLevels(levels);
      animFrameRef.current = requestAnimationFrame(updateWaveform);
    };
    animFrameRef.current = requestAnimationFrame(updateWaveform);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const handleCancel = () => {
    sounds.playClick();
    audioRecorderEngine.cancel();
    sounds.playDisconnected();
    onCancel();
  };

  const handleFinishAndSend = async () => {
    sounds.playClick();
    setIsUploading(true);

    try {
      const audioResult = await audioRecorderEngine.stop();
      if (!audioResult || !audioResult.blob) {
        onCancel();
        return;
      }

      const fileName = `voice_${Date.now()}.${audioResult.mimeType.includes('ogg') ? 'ogg' : audioResult.mimeType.includes('mp4') ? 'm4a' : 'webm'}`;

      // Upload audio to Cloudflare R2
      const r2Upload = await cloudflareApi.uploadEncryptedFile(
        audioResult.blob,
        fileName,
        audioResult.mimeType,
        currentUser.id
      );

      const downloadUrl = (r2Upload && r2Upload.downloadUrl) ? r2Upload.downloadUrl : audioResult.url;

      onSendAudio({
        type: 'audio',
        url: downloadUrl,
        localUrl: audioResult.url,
        duration: formatTime(audioResult.duration),
        durationSeconds: audioResult.duration,
        name: 'Voice Message',
        fileKey: r2Upload?.fileKey || `e2ee/${fileName}`
      });

      sounds.playMessageSent();
    } catch (err) {
      console.warn('Voice send fallback:', err);
      onCancel();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-950/90 rounded-2xl border border-rose-500/40 shadow-glow-rose animate-scale-in">
      {/* 1. Left: Recording Time Counter */}
      <div className="flex items-center space-x-2.5 min-w-[90px]">
        <div className="relative flex items-center justify-center">
          <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute" />
        </div>
        <span className="text-xs font-mono font-bold text-white tracking-wider">
          {formatTime(seconds)}
        </span>
      </div>

      {/* 2. Center: Real-time Dynamic Waveform Animation */}
      <div className="flex-1 flex items-center justify-center space-x-1 h-8 px-3 overflow-hidden max-w-sm">
        {waveformLevels.map((height, idx) => (
          <div
            key={idx}
            style={{
              height: `${height}%`,
              transition: 'height 80ms ease-out'
            }}
            className="w-1 rounded-full bg-gradient-to-t from-rose-500 via-brand-400 to-accent-cyan opacity-90"
          />
        ))}
      </div>

      {/* 3. Right: Action Buttons (Cancel / Send) */}
      <div className="flex items-center space-x-2 min-w-[90px] justify-end">
        {/* Cancel / Trash Can */}
        <button
          type="button"
          onClick={handleCancel}
          disabled={isUploading}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all"
          title="বাতিল করুন (Cancel)"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Send Voice Note */}
        <button
          type="button"
          onClick={handleFinishAndSend}
          disabled={isUploading}
          className="p-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-glow-brand active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
          title="পাঠান (Send Voice Note)"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

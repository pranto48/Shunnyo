import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, FastForward } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export default function VoiceMessagePlayer({ audioUrl, duration = '0:15', isSentByMe = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const audioRef = useRef(null);
  const waveHeights = [25, 45, 75, 30, 90, 60, 85, 100, 40, 70, 95, 50, 30, 80, 90, 65, 40, 85, 55, 30];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    sounds.playClick();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch((err) => {
        console.warn('Audio playback error:', err);
      });
      setIsPlaying(true);
    }
  };

  const handleSpeedToggle = (e) => {
    e.stopPropagation();
    sounds.playClick();
    const speeds = [1, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleWaveClick = (idx) => {
    const audio = audioRef.current;
    if (!audio || !totalDuration) return;
    const targetPercent = idx / waveHeights.length;
    audio.currentTime = targetPercent * totalDuration;
    setCurrentTime(audio.currentTime);
  };

  const formatSeconds = (secs) => {
    if (!secs || isNaN(secs)) return duration || '0:15';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : isPlaying ? 50 : 0;

  return (
    <div className="flex items-center space-x-2.5 py-1 min-w-[210px] sm:min-w-[260px] select-none">
      {/* Hidden Native Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
        />
      )}

      {/* Play / Pause Toggle Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 active:scale-90 ${
          isSentByMe
            ? 'bg-white text-brand-600 shadow-md hover:scale-105'
            : 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-glow-brand hover:scale-105'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      {/* Interactive Scrubbable Waveform Bars */}
      <div className="flex-1 flex items-center gap-0.5 h-7 cursor-pointer" title="Seek Audio">
        {waveHeights.map((height, i) => {
          const barPercent = (i / waveHeights.length) * 100;
          const isPlayed = barPercent <= progressPercent;

          return (
            <div
              key={i}
              onClick={() => handleWaveClick(i)}
              style={{ height: `${height}%` }}
              className={`w-1 rounded-full transition-all duration-150 ${
                isPlayed
                  ? isSentByMe
                    ? 'bg-white shadow-sm'
                    : 'bg-accent-emerald'
                  : isSentByMe
                  ? 'bg-white/40'
                  : 'bg-slate-600'
              }`}
            />
          );
        })}
      </div>

      {/* Duration & Speed Multiplier */}
      <div className="flex items-center space-x-1 flex-shrink-0 text-[11px] font-mono">
        <span className={isSentByMe ? 'text-white/90' : 'text-slate-300'}>
          {isPlaying ? formatSeconds(currentTime) : formatSeconds(totalDuration || 15)}
        </span>

        {/* 1x / 1.5x / 2x Speed Button */}
        <button
          type="button"
          onClick={handleSpeedToggle}
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
            isSentByMe
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Playback Speed"
        >
          {playbackSpeed}x
        </button>
      </div>
    </div>
  );
}

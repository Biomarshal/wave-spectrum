'use client';

import { memo } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import {
  Play, Pause, SkipBack, SkipForward, X,
  Volume2, VolumeX, Shuffle, Repeat, Repeat1, Square,
} from 'lucide-react';
import AppLogo from '../ui/AppLogo';

interface MiniPlayerProps {
  onExpand: () => void;
}

function MiniPlayer({ onExpand }: MiniPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    pause,
    resume,
    next,
    previous,
    stop,
    volume,
    setVolume,
    currentTime,
    duration,
    seek,
    isShuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
  } = usePlayerStore();

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (t: number) => {
    if (isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  return (
    <div
      className="fixed left-0 right-0 z-50"
      style={{
        bottom: 0,
        height: 'var(--player-height)',
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#0d1017]/95 backdrop-blur-md border-t border-white/[0.06]" />

      {/* Progress bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-white/[0.06] cursor-pointer group z-10"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          seek(Math.max(0, Math.min(pct * duration, duration)));
        }}
      >
        <div
          className="h-full bg-[#e05297] transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}
        />
      </div>

      <div className="relative flex items-center h-full px-3 md:px-6 z-10">
        {/* Left — Track info (clickable to expand) */}
        <button
          onClick={onExpand}
          className="flex items-center gap-3 min-w-0 flex-shrink text-left group w-[140px] sm:w-[180px] md:w-[260px]"
        >
          <div className="w-12 h-12 flex items-center justify-center rounded-lg overflow-hidden bg-white/[0.04]">
            {currentTrack.albumArt ? (
              <img src={currentTrack.albumArt} alt={currentTrack.title} className="w-full h-full object-cover" />
            ) : (
              <AppLogo size={18} />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-[#e05297] transition-colors">
              {currentTrack.title}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate">
              {currentTrack.artist || 'Unknown Artist'}
            </p>
          </div>
        </button>

        {/* Center — Controls */}
        <div className="flex-1 flex items-center justify-center gap-1 md:gap-2">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 transition-colors hidden md:block ${
              isShuffle ? 'text-[#e05297]' : 'text-slate-500 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle size={16} />
          </button>

          <button
            onClick={previous}
            className="p-1.5 text-slate-300 hover:text-white transition-colors"
          >
            <SkipBack size={18} fill="currentColor" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              isPlaying ? pause() : resume();
            }}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform mx-1"
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <button
            onClick={next}
            className="p-1.5 text-slate-300 hover:text-white transition-colors"
          >
            <SkipForward size={18} fill="currentColor" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-1.5 transition-colors hidden md:block ${
              repeatMode !== 'off' ? 'text-[#e05297]' : 'text-slate-500 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            <RepeatIcon size={16} />
          </button>
        </div>

        {/* Right — Time + Volume + Stop */}
        <div className="flex items-center gap-2 md:gap-3 w-[100px] sm:w-[140px] md:w-[260px] justify-end">
          <span className="text-[11px] text-slate-500 font-mono tabular-nums hidden lg:block">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="hidden md:flex items-center gap-2 w-24">
            <button
              onClick={() => setVolume(volume === 0 ? 1 : 0)}
              className="text-slate-400 hover:text-white transition-colors shrink-0"
            >
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-1 cursor-pointer"
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              stop();
            }}
            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
            title="Stop"
          >
            <Square size={14} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(MiniPlayer);

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
      className="fixed left-3 right-3 bottom-[calc(var(--mobile-nav-height)+12px)] md:left-[272px] md:right-[12px] md:bottom-[10px] z-50 transition-all duration-300 h-[76px] md:h-[84px] theme-transition"
    >
      <div className="relative h-full w-full max-w-7xl mx-auto flex flex-col justify-end">
        {/* Player Bar Content */}
        <div className="relative flex items-center h-full bg-[var(--color-bg-elevated)]/95 backdrop-blur-xl border border-[var(--color-border)] rounded-2xl px-4 md:px-[18px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden theme-transition">
          
          {/* Progress bar - Sitting seamlessly at the very top edge of the player bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[4px] bg-[var(--color-bg-hover)] cursor-pointer group z-20 overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seek(Math.max(0, Math.min(pct * duration, duration)));
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-[#7c3aed] to-[#e05297] transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Left — Track info (clickable to expand) */}
          <button
            onClick={onExpand}
            className="flex items-center gap-3 min-w-0 flex-1 md:flex-none md:w-[30%] text-left group pr-2"
          >
            <div className="w-[52px] h-[52px] md:w-14 md:h-14 flex items-center justify-center rounded-xl overflow-hidden bg-white/5 ring-1 ring-[var(--color-border)] shrink-0 theme-transition">
              {currentTrack.albumArt ? (
                <img src={currentTrack.albumArt} alt={currentTrack.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              ) : (
                <div className="text-[#e05297]">
                  <AppLogo size={18} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[var(--color-text-primary)] truncate leading-tight group-hover:text-[#e05297] transition-colors">
                {currentTrack.title}
              </p>
              <p className="text-[11px] font-medium text-[var(--color-text-secondary)] truncate mt-0.5">
                {currentTrack.artist || 'Unknown Artist'}
              </p>
            </div>
          </button>

          {/* Center — Controls (Perfect 3-way distribution on desktop) */}
          <div className="flex items-center justify-center gap-2 md:gap-4 flex-1 md:flex-none md:w-[40%] shrink-0">
            <button
              onClick={previous}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all active:scale-90 hidden sm:block animate-fade-in"
            >
              <SkipBack size={20} fill="currentColor" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                isPlaying ? pause() : resume();
              }}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg-base)] flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-lg mx-1 shrink-0"
            >
              {isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" className="ml-0.5" />
              )}
            </button>

            <button
              onClick={next}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all active:scale-90 shrink-0"
            >
              <SkipForward size={20} fill="currentColor" />
            </button>
          </div>

          {/* Right — Extra Controls (Desktop only) */}
          <div className="hidden md:flex items-center gap-4 justify-end md:w-[30%] shrink-0">
            <div className="flex items-center gap-2 w-28">
              <button
                onClick={() => setVolume(volume === 0 ? 1 : 0)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors shrink-0"
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
                className="w-full h-1 bg-[var(--color-border)] rounded-full appearance-none cursor-pointer accent-[#e05297]"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleShuffle}
                className={`p-2 transition-all ${isShuffle ? 'text-[#e05297]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                title="Shuffle"
              >
                <Shuffle size={16} />
              </button>
              <button
                onClick={cycleRepeat}
                className={`p-2 transition-all ${repeatMode !== 'off' ? 'text-[#e05297]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                title={`Repeat: ${repeatMode}`}
              >
                <RepeatIcon size={16} />
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                stop();
              }}
              className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 transition-colors"
              title="Stop"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Close for mobile */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              stop();
            }}
            className="md:hidden p-1.5 text-[var(--color-text-secondary)] hover:text-red-400 ml-1 shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(MiniPlayer);

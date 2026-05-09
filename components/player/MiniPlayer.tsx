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
      className="fixed left-0 right-0 z-50 px-3 sm:px-4 md:px-8 transition-all duration-300 bottom-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom,0px))] md:bottom-8"
      style={{
        height: 'var(--player-height)',
      }}
    >
      <div className="relative h-full w-full max-w-7xl mx-auto flex flex-col justify-end">
        {/* Progress bar - Sitting just above the mini player bar */}
        <div
          className="absolute top-[-4px] left-2 right-2 h-[2px] bg-white/5 cursor-pointer group z-20 rounded-full overflow-hidden"
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

        {/* Player Bar Content */}
        <div className="flex items-center h-[64px] bg-[#0d1017]/95 backdrop-blur-xl border border-white/10 rounded-2xl px-3 sm:px-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Left — Track info (clickable to expand) */}
          <button
            onClick={onExpand}
            className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial text-left group"
          >
            <div className="w-11 h-11 flex items-center justify-center rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10 shrink-0">
              {currentTrack.albumArt ? (
                <img src={currentTrack.albumArt} alt={currentTrack.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              ) : (
                <div className="text-[#e05297]">
                  <AppLogo size={18} />
                </div>
              )}
            </div>
            <div className="min-w-0 pr-2">
              <p className="text-sm font-bold text-white truncate leading-tight group-hover:text-[#e05297] transition-colors">
                {currentTrack.title}
              </p>
              <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5">
                {currentTrack.artist || 'Unknown Artist'}
              </p>
            </div>
          </button>

          {/* Center — Controls */}
          <div className="flex items-center justify-center gap-1 sm:gap-4 ml-auto sm:ml-0">
            <button
              onClick={previous}
              className="p-2 text-slate-400 hover:text-white transition-all active:scale-90 hidden xs:block"
            >
              <SkipBack size={20} fill="currentColor" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                isPlaying ? pause() : resume();
              }}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-lg mx-1 shrink-0"
            >
              {isPlaying ? (
                <Pause size={20} fill="currentColor" />
              ) : (
                <Play size={20} fill="currentColor" className="ml-0.5" />
              )}
            </button>

            <button
              onClick={next}
              className="p-2 text-slate-400 hover:text-white transition-all active:scale-90"
            >
              <SkipForward size={20} fill="currentColor" />
            </button>
          </div>

          {/* Right — Extra Controls (Desktop only) */}
          <div className="hidden md:flex items-center gap-4 ml-auto pl-6 border-l border-white/10">
            <div className="flex items-center gap-2 w-28">
              <button
                onClick={() => setVolume(volume === 0 ? 1 : 0)}
                className="text-slate-500 hover:text-white transition-colors shrink-0"
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
                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#e05297]"
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={toggleShuffle}
                className={`p-2 transition-all ${isShuffle ? 'text-[#e05297]' : 'text-slate-500 hover:text-white'}`}
                title="Shuffle"
              >
                <Shuffle size={16} />
              </button>
              <button
                onClick={cycleRepeat}
                className={`p-2 transition-all ${repeatMode !== 'off' ? 'text-[#e05297]' : 'text-slate-500 hover:text-white'}`}
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
              className="p-2 text-slate-500 hover:text-red-500 transition-colors"
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
            className="md:hidden p-2 text-slate-500 hover:text-red-400 ml-2"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(MiniPlayer);

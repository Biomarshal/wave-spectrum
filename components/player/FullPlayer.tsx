'use client';

import { usePlayerStore } from '@/store/playerStore';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  ChevronDown, Volume2, VolumeX, X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo, useCallback } from 'react';
import AppLogo from '../ui/AppLogo';

interface FullPlayerProps {
  onClose: () => void;
}

export default function FullPlayer({ onClose }: FullPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    pause,
    resume,
    next,
    previous,
    stop,
    seek,
    volume,
    setVolume,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    toggleShuffle,
    cycleRepeat,
    queue,
    currentIndex,
  } = usePlayerStore();

  const visualizerHeights = useMemo(
    () => Array.from({ length: 24 }, () => Math.random() * 44 + 12),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentTrack?.id]
  );

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      seek(Math.max(0, Math.min(pct * duration, duration)));
    },
    [duration, seek]
  );

  if (!currentTrack) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const fmt = (t: number) => {
    if (isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[100] bg-[#080a10] flex flex-col overflow-hidden"
    >
      {/* Background gradient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[600px] md:h-[600px] bg-[#7c3aed]/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-[#e05297]/6 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 relative z-10 shrink-0">
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors text-slate-400"
        >
          <ChevronDown size={24} />
        </button>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">
            Now Playing
          </p>
          <p className="text-xs text-slate-300 font-medium mt-0.5">
            {currentIndex + 1} of {queue.length}
          </p>
        </div>
        <button
          onClick={() => { stop(); onClose(); }}
          className="p-2 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors text-slate-500 hover:text-red-400"
          title="Stop playback"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-16 relative z-10 max-w-2xl mx-auto w-full overflow-y-auto">
        {/* Album art */}
        <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px] aspect-square rounded-3xl bg-gradient-to-br from-[#7c3aed] to-[#e05297] flex items-center justify-center relative overflow-hidden shadow-2xl shadow-[#7c3aed]/20 mb-8 md:mb-10 shrink-0">
          {currentTrack.albumArt ? (
            <img src={currentTrack.albumArt} alt={currentTrack.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <>
              <div className="md:hidden">
                <AppLogo size={60} />
              </div>
              <div className="hidden md:block">
                <AppLogo size={80} />
              </div>
            </>
          )}

          {/* Visualizer */}
          <div className="absolute bottom-6 md:bottom-8 flex items-end gap-[3px] h-12 md:h-14">
            {visualizerHeights.map((h, i) => (
              <motion.div
                key={i}
                className="w-[3px] bg-white/30 rounded-full"
                animate={{
                  height: isPlaying ? [8, h, 8] : 8,
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.04,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
        </div>

        {/* Track info */}
        <div className="w-full text-center mb-6 md:mb-8 shrink-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 truncate px-4">
            {currentTrack.title}
          </h2>
          <p className="text-sm md:text-base text-slate-400">
            {currentTrack.artist || 'Unknown Artist'}
          </p>
        </div>

        {/* Progress */}
        <div className="w-full mb-6 shrink-0 px-2">
          <div
            className="relative h-1.5 bg-white/[0.08] rounded-full cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-[#e05297] rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-[11px] text-slate-500 font-mono tabular-nums">
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between w-full max-w-sm mb-6 md:mb-8 shrink-0 px-2">
          <button
            onClick={toggleShuffle}
            className={`p-2.5 transition-colors ${isShuffle ? 'text-[#e05297]' : 'text-slate-500 hover:text-white'}`}
            title="Shuffle"
          >
            <Shuffle size={20} />
          </button>

          <button onClick={previous} className="p-2.5 text-white hover:scale-110 active:scale-95 transition-transform">
            <SkipBack size={26} fill="currentColor" />
          </button>

          <button
            onClick={() => (isPlaying ? pause() : resume())}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg"
          >
            {isPlaying ? (
              <Pause size={26} fill="currentColor" />
            ) : (
              <Play size={26} fill="currentColor" className="ml-1" />
            )}
          </button>

          <button onClick={next} className="p-2.5 text-white hover:scale-110 active:scale-95 transition-transform">
            <SkipForward size={26} fill="currentColor" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-2.5 transition-colors ${repeatMode !== 'off' ? 'text-[#e05297]' : 'text-slate-500 hover:text-white'}`}
            title={`Repeat: ${repeatMode}`}
          >
            <RepeatIcon size={20} />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 w-full max-w-xs opacity-70 hover:opacity-100 transition-opacity shrink-0 px-2">
          <button
            onClick={() => setVolume(volume === 0 ? 1 : 0)}
            className="text-slate-400 hover:text-white transition-colors"
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
            className="w-full accent-white h-1 cursor-pointer"
          />
        </div>
      </div>
    </motion.div>
  );
}

'use client';

import { usePlayerStore } from '@/store/playerStore';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  ChevronDown, Volume2, VolumeX, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useCallback } from 'react';
import AppLogo from '../ui/AppLogo';

interface FullPlayerProps {
  onClose: () => void;
}

import { useState } from 'react';

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
    playTrack,
  } = usePlayerStore();

  const [showQueue, setShowQueue] = useState(false);

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

  // Next tracks in queue
  const upcomingTracks = queue.slice(currentIndex + 1);

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[100] bg-[var(--color-bg-base)] text-[var(--color-text-primary)] flex flex-col overflow-hidden theme-transition px-4 pt-3 pb-[120px] md:px-12 md:pt-6 md:pb-10"
    >
      {/* Background gradient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7c3aed]/10 rounded-full blur-[140px] opacity-60" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#e05297]/10 rounded-full blur-[120px] opacity-40" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between pb-2 relative z-10 shrink-0 safe-top">
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/5 hover:bg-[var(--color-bg-hover)] active:scale-95 transition-all text-[var(--color-text-primary)]"
        >
          <ChevronDown size={22} />
        </button>
        <div className="text-center">
          <p className="text-[9px] uppercase tracking-[0.3em] text-[var(--color-text-muted)] font-black">
            Now Playing
          </p>
          <p className="text-[11px] text-[#e05297] font-bold mt-1 px-2.5 py-0.5 bg-[#e05297]/10 rounded-full border border-[#e05297]/20">
            {currentIndex + 1} / {queue.length}
          </p>
        </div>
        <button
          onClick={() => { stop(); onClose(); }}
          className="p-2.5 rounded-full bg-white/5 hover:bg-red-500/10 active:scale-95 transition-all text-[var(--color-text-muted)] hover:text-red-400"
          title="Stop playback"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-center gap-6 md:gap-12 max-w-5xl mx-auto w-full overflow-y-auto md:overflow-hidden relative z-10 min-h-0 pt-3">
        
        {/* Left column / Section: Artwork */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <div className="w-[72vw] max-w-[320px] md:w-[420px] md:h-[420px] aspect-square rounded-[28px] bg-gradient-to-br from-[#1e1b4b] to-[#312e81] flex items-center justify-center relative overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.6)] ring-1 ring-white/10 shrink-0 mx-auto">
            {currentTrack.albumArt ? (
              <img src={currentTrack.albumArt} alt={currentTrack.title} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="scale-125 opacity-20">
                <AppLogo size={90} />
              </div>
            )}

            {/* Visualizer Overlay */}
            <div className="absolute bottom-6 left-0 right-0 flex items-end justify-center gap-1.5 h-10 px-8 opacity-45">
              {visualizerHeights.slice(0, 10).map((h, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-white rounded-full"
                  animate={{
                    height: isPlaying ? [4, h * 0.8, 4] : 4,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.05,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right column / Section: Track Info & Playback controls */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-md mx-auto shrink-0 md:shrink min-h-0">
          {/* Title & Artist */}
          <div className="text-left mt-6 md:mt-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)] mb-1.5 tracking-tight leading-tight line-clamp-1">
              {currentTrack.title}
            </h2>
            <p className="text-sm sm:text-base text-[#e05297] font-bold mt-2 opacity-90">
              {currentTrack.artist || 'Unknown Artist'}
            </p>
          </div>

          {/* Progress Bar Section */}
          <div className="mt-6 mx-4 md:mx-0">
            <div
              className="relative h-1.5 bg-[var(--color-bg-hover)] rounded-full cursor-pointer group"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-gradient-to-r from-[#7c3aed] to-[#e05297] rounded-full relative transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--color-text-primary)] rounded-full scale-0 group-hover:scale-100 transition-transform shadow-[0_0_12px_rgba(255,255,255,0.5)] border-3 border-[var(--color-bg-base)]" />
              </div>
            </div>
            <div className="flex justify-between mt-2.5 text-[11px] font-bold text-[var(--color-text-muted)] tracking-[0.1em] tabular-nums">
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between mt-[28px]">
            <button
              onClick={toggleShuffle}
              className={`p-3 transition-all hover:scale-110 active:scale-90 ${isShuffle ? 'text-[#e05297] drop-shadow-[0_0_12px_rgba(224,82,151,0.6)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
            >
              <Shuffle size={20} />
            </button>

            <div className="flex items-center gap-6 sm:gap-8">
              <button 
                onClick={previous} 
                className="p-2 text-[var(--color-text-primary)] hover:text-[#e05297] transition-all hover:scale-110 active:scale-90"
              >
                <SkipBack size={30} fill="currentColor" />
              </button>

              <button
                onClick={() => (isPlaying ? pause() : resume())}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg-base)] flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-[0_16px_32px_rgba(0,0,0,0.4)] ring-4 ring-white/10 shrink-0"
              >
                {isPlaying ? (
                  <Pause size={28} fill="currentColor" />
                ) : (
                  <Play size={28} fill="currentColor" className="ml-1" />
                )}
              </button>

              <button 
                onClick={next} 
                className="p-2 text-[var(--color-text-primary)] hover:text-[#e05297] transition-all hover:scale-110 active:scale-90"
              >
                <SkipForward size={30} fill="currentColor" />
              </button>
            </div>

            <button
              onClick={cycleRepeat}
              className={`p-3 transition-all hover:scale-110 active:scale-90 ${repeatMode !== 'off' ? 'text-[#e05297] drop-shadow-[0_0_12px_rgba(224,82,151,0.6)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
            >
              <RepeatIcon size={20} />
            </button>
          </div>

          {/* Volume Control */}
          <div className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-[var(--color-bg-hover)] rounded-xl border border-[var(--color-border)] theme-transition opacity-80 hover:opacity-100 transition-all mt-6 mb-[20px]">
            <button
              onClick={() => setVolume(volume === 0 ? 1 : 0)}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
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
              className="flex-1 h-1 bg-[var(--color-border)] rounded-full appearance-none cursor-pointer accent-[#e05297]"
            />
          </div>

          {/* Up Next / Queue Toggle */}
          <button 
            onClick={() => setShowQueue(!showQueue)}
            className="flex flex-col items-center gap-1.5 mt-[28px] group mx-auto pb-28 md:pb-0"
          >
            <div className="w-10 h-1 bg-[var(--color-text-muted)] opacity-30 rounded-full group-hover:bg-[var(--color-text-secondary)] transition-colors" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)] transition-colors">
              {showQueue ? 'Hide Queue' : 'Up Next'}
            </span>
          </button>
        </div>
      </div>

      {/* Queue Drawer Panel */}
      <AnimatePresence>
        {showQueue && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQueue(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md z-[110]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 h-[70vh] max-h-[70vh] bg-[var(--color-bg-elevated)] rounded-t-[24px] z-[120] flex flex-col border-t border-[var(--color-border)] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] overflow-hidden theme-transition mt-[28px]"
            >
              <div className="flex items-center justify-between px-6 py-5 shrink-0 border-b border-[var(--color-border)]">
                <h3 className="text-lg font-black text-[var(--color-text-primary)] tracking-tight">Queue</h3>
                <button 
                  onClick={() => setShowQueue(false)}
                  className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 pb-10 space-y-2 custom-scrollbar">
                {queue.map((track, i) => (
                  <button
                    key={`${track.id}-${i}`}
                    onClick={() => { playTrack(track, queue); setShowQueue(false); }}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all border ${i === currentIndex ? 'bg-[#e05297]/10 border-[#e05297]/20' : 'hover:bg-[var(--color-bg-hover)] border-transparent'}`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white/5 ring-1 ring-[var(--color-border)]">
                      {track.albumArt ? (
                        <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-30">
                          <AppLogo size={14} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className={`text-sm font-bold truncate ${i === currentIndex ? 'text-[#e05297]' : 'text-[var(--color-text-primary)]'}`}>
                        {track.title}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] font-medium truncate mt-0.5">
                        {track.artist || 'Unknown Artist'}
                      </p>
                    </div>
                    {i === currentIndex && isPlaying && (
                      <div className="flex items-center gap-1 h-3 px-2">
                        {[0, 1, 2].map((j) => (
                          <motion.div
                            key={j}
                            className="w-1 bg-[#e05297] rounded-full"
                            animate={{ height: [4, 12, 4] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: j * 0.1 }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

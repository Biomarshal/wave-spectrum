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
      className="fixed inset-0 z-[100] bg-[#080a10] flex flex-col overflow-hidden safe-top safe-bottom"
    >
      {/* Background gradient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7c3aed]/10 rounded-full blur-[140px] opacity-60" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#e05297]/10 rounded-full blur-[120px] opacity-40" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 sm:px-10 pt-8 pb-4 relative z-10 shrink-0">
        <button
          onClick={onClose}
          className="p-3 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white/80"
        >
          <ChevronDown size={24} />
        </button>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black">
            Now Playing
          </p>
          <p className="text-xs text-[#e05297] font-bold mt-1.5 px-3 py-1 bg-[#e05297]/10 rounded-full border border-[#e05297]/20">
            {currentIndex + 1} / {queue.length}
          </p>
        </div>
        <button
          onClick={() => { stop(); onClose(); }}
          className="p-3 rounded-full bg-white/5 hover:bg-red-500/10 active:scale-95 transition-all text-slate-500 hover:text-red-400"
          title="Stop playback"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Scrollable Center Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 sm:px-16 md:px-24 py-4 max-w-5xl mx-auto w-full">
          {/* Album Art Section */}
          <div className="w-full max-w-[340px] sm:max-w-[420px] md:max-w-[480px] aspect-square mb-10 sm:mb-12 shrink-0 group">
            <motion.div 
              layoutId={`art-${currentTrack.id}`}
              className="w-full h-full rounded-[40px] sm:rounded-[56px] bg-gradient-to-br from-[#1e1b4b] to-[#312e81] flex items-center justify-center relative overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
            >
              {currentTrack.albumArt ? (
                <img src={currentTrack.albumArt} alt={currentTrack.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="scale-150 opacity-20">
                  <AppLogo size={120} />
                </div>
              )}

              {/* Visualizer Overlay */}
              <div className="absolute bottom-10 left-0 right-0 flex items-end justify-center gap-2 h-12 px-12 opacity-40">
                {visualizerHeights.slice(0, 12).map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-white rounded-full"
                    animate={{
                      height: isPlaying ? [4, h, 4] : 4,
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
            </motion.div>
          </div>

          {/* Track Info & Main Controls */}
          <div className="w-full max-w-[480px] flex flex-col px-2">
            {/* Title & Artist */}
            <div className="text-left mb-8">
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-2.5 tracking-tight leading-[1.1] line-clamp-2">
                {currentTrack.title}
              </h2>
              <p className="text-lg sm:text-xl text-[#e05297] font-bold opacity-80">
                {currentTrack.artist || 'Unknown Artist'}
              </p>
            </div>

            {/* Progress Bar Section */}
            <div className="mb-10">
              <div
                className="relative h-2 bg-white/10 rounded-full cursor-pointer group"
                onClick={handleSeek}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#7c3aed] to-[#e05297] rounded-full relative transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full scale-0 group-hover:scale-100 transition-transform shadow-[0_0_15px_rgba(255,255,255,0.5)] border-4 border-[#080a10]" />
                </div>
              </div>
              <div className="flex justify-between mt-4 text-xs font-bold text-slate-500 tracking-[0.1em] tabular-nums">
                <span>{fmt(currentTime)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between mb-12">
              <button
                onClick={toggleShuffle}
                className={`p-4 transition-all hover:scale-110 active:scale-90 ${isShuffle ? 'text-[#e05297] drop-shadow-[0_0_12px_rgba(224,82,151,0.6)]' : 'text-slate-500 hover:text-white'}`}
              >
                <Shuffle size={24} />
              </button>

              <div className="flex items-center gap-8 sm:gap-10">
                <button 
                  onClick={previous} 
                  className="p-2 text-white hover:text-[#e05297] transition-all hover:scale-110 active:scale-90"
                >
                  <SkipBack size={36} fill="currentColor" />
                </button>

                <button
                  onClick={() => (isPlaying ? pause() : resume())}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.4)] ring-4 ring-white/10"
                >
                  {isPlaying ? (
                    <Pause size={36} fill="currentColor" />
                  ) : (
                    <Play size={36} fill="currentColor" className="ml-1.5" />
                  )}
                </button>

                <button 
                  onClick={next} 
                  className="p-2 text-white hover:text-[#e05297] transition-all hover:scale-110 active:scale-90"
                >
                  <SkipForward size={36} fill="currentColor" />
                </button>
              </div>

              <button
                onClick={cycleRepeat}
                className={`p-4 transition-all hover:scale-110 active:scale-90 ${repeatMode !== 'off' ? 'text-[#e05297] drop-shadow-[0_0_12px_rgba(224,82,151,0.6)]' : 'text-slate-500 hover:text-white'}`}
              >
                <RepeatIcon size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Panel - Queue & Volume */}
        <div className="relative z-20 px-8 pb-10 max-w-5xl mx-auto w-full flex flex-col items-center">
          {/* Swipe Indicator / Queue Toggle */}
          <button 
            onClick={() => setShowQueue(!showQueue)}
            className="flex flex-col items-center gap-2 mb-6 group"
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-300 transition-colors">
              {showQueue ? 'Hide Queue' : 'Up Next'}
            </span>
          </button>

          {/* Volume Control (Compact) */}
          <div className="w-full max-w-[320px] flex items-center gap-4 px-4 py-3 bg-white/[0.03] rounded-2xl border border-white/5 opacity-60 hover:opacity-100 transition-all">
            <button
              onClick={() => setVolume(volume === 0 ? 1 : 0)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#e05297]"
            />
          </div>
        </div>
      </div>

      {/* Queue Side/Bottom Panel */}
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
              className="absolute bottom-0 left-0 right-0 h-[70vh] bg-[#0d1017] rounded-t-[40px] z-[120] flex flex-col border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between px-8 py-8 shrink-0">
                <h3 className="text-xl font-black text-white tracking-tight">Queue</h3>
                <button 
                  onClick={() => setShowQueue(false)}
                  className="p-2 text-slate-500 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-2 custom-scrollbar">
                {queue.map((track, i) => (
                  <button
                    key={`${track.id}-${i}`}
                    onClick={() => { playTrack(track, queue); setShowQueue(false); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${i === currentIndex ? 'bg-[#e05297]/10 border border-[#e05297]/20' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white/5">
                      {track.albumArt ? (
                        <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-30">
                          <AppLogo size={14} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className={`text-sm font-bold truncate ${i === currentIndex ? 'text-[#e05297]' : 'text-white'}`}>
                        {track.title}
                      </p>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
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

'use client';

import { memo } from 'react';
import { Track } from '@/store/playerStore';
import { Play, Pause } from 'lucide-react';
import AppLogo from '../ui/AppLogo';
import { motion } from 'framer-motion';

interface SongCardProps {
  track: Track;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  index: number;
}

function SongCard({ track, isActive, isPlaying, onPlay, index }: SongCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.25) }}
      onClick={onPlay}
      className={`group relative rounded-xl p-3 md:p-4 cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-white/[0.08] ring-1 ring-[#e05297]/30'
          : 'bg-white/[0.02] hover:bg-white/[0.06]'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPlay(); } }}
    >
      {/* Cover */}
      <div className="relative w-full aspect-square rounded-lg bg-gradient-to-br from-white/[0.04] to-white/[0.08] mb-2.5 md:mb-3 flex items-center justify-center overflow-hidden">
        {track.albumArt ? (
          <img
            src={track.albumArt}
            alt={track.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : null}

        {isActive && isPlaying ? (
          <div className="relative z-10 flex items-end gap-[3px] h-7 md:h-8">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-[3px] bg-[#e05297] rounded-full"
                animate={{ height: ['20%', '100%', '20%'] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
              />
            ))}
          </div>
        ) : !track.albumArt ? (
          <>
            <div className="md:hidden">
              <AppLogo size={24} />
            </div>
            <div className="hidden md:block">
              <AppLogo size={32} />
            </div>
          </>
        ) : null}

        {/* Play button overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-200 ${
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg shadow-black/30 hover:scale-105 active:scale-95 transition-transform">
            {isActive && isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-0.5" />
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <h3
        className={`text-xs md:text-sm font-semibold truncate mb-0.5 ${
          isActive ? 'text-[#e05297]' : 'text-white'
        }`}
      >
        {track.title}
      </h3>
      <p className="text-[11px] md:text-xs text-slate-500 truncate">
        {track.artist || 'Unknown Artist'}
      </p>
    </motion.div>
  );
}

export default memo(SongCard);

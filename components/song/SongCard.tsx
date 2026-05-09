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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      onClick={onPlay}
      className={`group relative rounded-2xl p-3 sm:p-4 cursor-pointer transition-all duration-300 border border-transparent ${
        isActive
          ? 'bg-white/[0.08] border-white/10 shadow-[0_8px_24px_rgba(224,82,151,0.15)] ring-1 ring-[#e05297]/30'
          : 'bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/5 hover:shadow-xl hover:-translate-y-1'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPlay(); } }}
    >
      {/* Cover container */}
      <div className="relative w-full aspect-square rounded-xl bg-[#1e1b4b]/40 mb-3 sm:mb-4 flex items-center justify-center overflow-hidden shadow-inner ring-1 ring-white/5">
        {track.albumArt ? (
          <img
            src={track.albumArt}
            alt={track.title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
          />
        ) : (
          <div className="text-white/10">
            <AppLogo size={isActive ? 40 : 32} />
          </div>
        )}

        {/* Dynamic visualizer overlay */}
        {isActive && isPlaying && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="flex items-end gap-[3px] h-8 md:h-10">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-[4px] bg-[#e05297] rounded-full shadow-[0_0_10px_#e05297]"
                  animate={{ height: ['25%', '100%', '25%'] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Play button overlay - Premium Spotify style */}
        <div
          className={`absolute bottom-2 right-2 flex items-center justify-center transition-all duration-300 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 ${
            isActive ? 'opacity-100 translate-y-0' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-[#e05297] text-white flex items-center justify-center shadow-xl shadow-black/50 ring-2 ring-white/20 hover:scale-110 active:scale-90 transition-all">
            {isActive && isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-1" />
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="space-y-1">
        <h3
          className={`text-sm font-bold truncate tracking-tight transition-colors ${
            isActive ? 'text-[#e05297]' : 'text-white group-hover:text-white'
          }`}
        >
          {track.title}
        </h3>
        <p className="text-xs font-medium text-slate-500 truncate group-hover:text-slate-400 transition-colors">
          {track.artist || 'Unknown Artist'}
        </p>
      </div>
    </motion.div>
  );
}

export default memo(SongCard);

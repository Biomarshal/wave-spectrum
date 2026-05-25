'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { usePlayerStore, Track } from '@/store/playerStore';
import SongCard from './SongCard';
import { 
  X, 
  Loader2, 
  LayoutGrid, 
  List, 
  ChevronRight, 
  Play, 
  Pause, 
  MoreVertical 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchInput from '@/components/SearchInput';
import AppLogo from '../ui/AppLogo';
import { fetchSongs } from '@/lib/songService';
import { useDebounce } from '@/hooks/useDebounce';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

interface SongGridProps {
  refreshTrigger?: number;
  currentView?: 'home' | 'search' | 'library';
}

export default function SongGrid({ refreshTrigger = 0, currentView = 'home' }: SongGridProps) {
  const [songs, setSongs] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wave_sort_by') as 'date' | 'name' | null;
      if (saved === 'name' || saved === 'date') return saved;
    }
    return 'name';
  });
  const [expandedArtist, setExpandedArtist] = useState<string | null>(null);
  
  // Persist sort selection
  useEffect(() => {
    localStorage.setItem('wave_sort_by', sortBy);
  }, [sortBy]);
  
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const pause = usePlayerStore((s) => s.pause);
  const resume = usePlayerStore((s) => s.resume);

  // Initial load
  const loadInitialSongs = useCallback(async () => {
    setLoading(true);
    const { songs: fetched, lastVisible, hasMore: more } = await fetchSongs(null, 1000);
    setSongs(fetched);
    setLastDoc(lastVisible);
    setHasMore(more);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadInitialSongs();
  }, [loadInitialSongs, refreshTrigger]);

  // Load more
  const loadMoreSongs = useCallback(async () => {
    if (!hasMore || loadingMore || debouncedSearch) return;
    
    setLoadingMore(true);
    const { songs: fetched, lastVisible, hasMore: more } = await fetchSongs(lastDoc);
    
    setSongs(prev => [...prev, ...fetched]);
    setLastDoc(lastVisible);
    setHasMore(more);
    setLoadingMore(false);
  }, [hasMore, loadingMore, lastDoc, debouncedSearch]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !debouncedSearch) {
          loadMoreSongs();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMoreSongs, hasMore, loadingMore, debouncedSearch]);

  const handlePlay = useCallback(
    (track: Track, list: Track[]) => {
      if (currentTrack?.id === track.id) {
        isPlaying ? pause() : resume();
      } else {
        playTrack(track, list);
      }
    },
    [currentTrack?.id, isPlaying, pause, resume, playTrack]
  );

  const filteredAndSorted = useMemo(() => {
    let result = [...songs];
    
    // Filter by search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.artist || '').toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      // Default to date added (descending)
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    return result;
  }, [songs, debouncedSearch, sortBy]);

  // Library Grouping
  const artistGroups = useMemo(() => {
    const groups: Record<string, Track[]> = {};
    filteredAndSorted.forEach(track => {
      const artist = track.artist || 'Unknown Artist';
      if (!groups[artist]) groups[artist] = [];
      groups[artist].push(track);
    });
    return Object.entries(groups).map(([name, tracks]) => ({ name, tracks }));
  }, [filteredAndSorted]);

  // Recently added (first 4)
  const recentTracks = useMemo(() => songs.slice(0, 4), [songs]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] p-4 theme-transition">
            <div className="w-full aspect-square rounded-xl bg-white/[0.04] mb-4 animate-pulse" />
            <div className="h-5 bg-white/[0.04] rounded w-3/4 mb-3 animate-pulse" />
            <div className="h-4 bg-white/[0.04] rounded w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (songs.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-6">
        <div className="w-20 h-20 rounded-3xl bg-[var(--color-bg-hover)] flex items-center justify-center mb-6 border border-[var(--color-border)]">
          <AppLogo size={40} />
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">Your library is quiet</h2>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-xs leading-relaxed">
          Looks like no tracks have been uploaded yet. Ask an admin to add some music.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Search */}
        <div className="max-w-md w-full relative group">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Home specific controls */}
        {currentView === 'home' && (
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#e05297] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#e05297] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <List size={18} />
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="
                bg-[var(--color-bg-elevated)]
                border border-[var(--color-border)]
                text-[var(--color-text-primary)]
                text-sm
                rounded-[12px]
                py-3
                px-4
                outline-none
                focus:ring-2 focus:ring-[#e05297]/40
                cursor-pointer
                transition-all
                hover:bg-[var(--color-bg-hover)]
                theme-transition
                font-medium
              "
            >
              <option value="name" className="bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]">Sort by Name</option>
              <option value="date" className="bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]">Sort by Date Added</option>
            </select>
          </div>
        )}
      </div>

      {/* View Content */}
      <div className="space-y-10">
        {/* Search View: Search Results or Recently Added */}
        {currentView === 'search' && (
          <section>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#e05297] rounded-full" />
              {debouncedSearch ? `Search Results for "${debouncedSearch}"` : 'Recently Added'}
            </h2>
            
            {debouncedSearch ? (
              filteredAndSorted.length > 0 ? (
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {filteredAndSorted.map((track, i) => (
                    <SongCard
                      key={track.id}
                      track={track}
                      isActive={currentTrack?.id === track.id}
                      isPlaying={currentTrack?.id === track.id && isPlaying}
                      onPlay={() => handlePlay(track, filteredAndSorted)}
                      index={i}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-[var(--color-text-muted)] text-sm font-medium">
                  No matching tracks found. Try searching for a different name or artist.
                </div>
              )
            ) : (
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {recentTracks.map((track, i) => (
                  <SongCard
                    key={track.id}
                    track={track}
                    isActive={currentTrack?.id === track.id}
                    isPlaying={currentTrack?.id === track.id && isPlaying}
                    onPlay={() => handlePlay(track, recentTracks)}
                    index={i}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Home View: ONLY All Tracks */}
        {currentView === 'home' && (
          <section>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#7c3aed] rounded-full" />
              {debouncedSearch ? `Results for "${debouncedSearch}"` : 'All Tracks'}
            </h2>
            
            {viewMode === 'grid' ? (
              <motion.div
                layout
                className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6"
              >
                {filteredAndSorted.map((track, i) => (
                  <SongCard
                    key={track.id}
                    track={track}
                    isActive={currentTrack?.id === track.id}
                    isPlaying={currentTrack?.id === track.id && isPlaying}
                    onPlay={() => handlePlay(track, filteredAndSorted)}
                    index={i}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="space-y-1">
                {filteredAndSorted.map((track, i) => (
                  <div
                    key={track.id}
                    onClick={() => handlePlay(track, filteredAndSorted)}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer group ${currentTrack?.id === track.id ? 'bg-[var(--color-bg-hover)]' : 'hover:bg-[var(--color-bg-hover)]'}`}
                  >
                    <div className="w-10 text-[var(--color-text-muted)] font-mono text-xs text-center group-hover:hidden">
                      {i + 1}
                    </div>
                    <div className="hidden group-hover:flex w-10 items-center justify-center text-[#e05297]">
                      {currentTrack?.id === track.id && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                    </div>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 shrink-0 ring-1 ring-[var(--color-border)]">
                      {track.albumArt ? <img src={track.albumArt} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-30"><AppLogo size={12} /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${currentTrack?.id === track.id ? 'text-[#e05297]' : 'text-[var(--color-text-primary)]'}`}>{track.title}</p>
                      <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">{track.artist}</p>
                    </div>
                    <div className="hidden sm:block text-xs text-[var(--color-text-secondary)] font-medium px-4">
                      {new Date(track.createdAt || 0).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Library View: Artist Grouped */}
        {currentView === 'library' && (
          <section className="pb-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {artistGroups.map(({ name, tracks }) => (
                <motion.div 
                  layout
                  key={name}
                  className={`bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[24px] overflow-hidden transition-all duration-300 theme-transition ${expandedArtist === name ? 'ring-1 ring-[#e05297]/30 bg-[var(--color-bg-hover)]' : 'hover:bg-[var(--color-bg-hover)]'}`}
                >
                  <div 
                    onClick={() => setExpandedArtist(expandedArtist === name ? null : name)}
                    className="p-5 sm:p-6 cursor-pointer flex items-center gap-5"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#1e1b4b] to-[#312e81] flex items-center justify-center shrink-0 shadow-2xl relative group/artist">
                      <span className="text-2xl sm:text-3xl font-black text-white/20 uppercase select-none">{name[0]}</span>
                      <div className="absolute inset-0 bg-black/20 group-hover/artist:bg-transparent transition-colors rounded-2xl" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-black text-[var(--color-text-primary)] truncate leading-tight mb-1">{name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-[var(--color-bg-surface)] text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider border border-[var(--color-border)]">
                          Artist
                        </span>
                        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-bold">{tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}</p>
                      </div>
                    </div>

                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${expandedArtist === name ? 'bg-[#e05297] text-white rotate-180 animate-pulse' : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]'}`}>
                      <ChevronRight size={20} />
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedArtist === name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="border-t border-[var(--color-border)]"
                      >
                        <div className="p-3 sm:p-4 space-y-1 bg-[var(--color-bg-surface)]/50">
                          {tracks.map((track, i) => (
                            <div
                              key={track.id}
                              onClick={(e) => { e.stopPropagation(); handlePlay(track, tracks); }}
                              className={`flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer group/item ${currentTrack?.id === track.id ? 'bg-[var(--color-bg-hover)]' : 'hover:bg-[var(--color-bg-hover)]/60'}`}
                            >
                              <div className="w-10 text-[var(--color-text-muted)] font-mono text-[10px] text-center group-hover/item:hidden">
                                {(i + 1).toString().padStart(2, '0')}
                              </div>
                              <div className="hidden group-hover/item:flex w-10 items-center justify-center text-[#e05297]">
                                {currentTrack?.id === track.id && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                              </div>
                              <div className="w-11 h-11 rounded-lg overflow-hidden bg-white/5 shrink-0 shadow-md">
                                {track.albumArt ? (
                                  <img src={track.albumArt} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center opacity-30">
                                    <AppLogo size={12} />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold truncate ${currentTrack?.id === track.id ? 'text-[#e05297]' : 'text-[var(--color-text-primary)]'}`}>{track.title}</p>
                                <p className="text-[11px] text-[var(--color-text-secondary)] font-medium mt-0.5">#{i + 1} from {name}</p>
                              </div>
                              <div className="hidden sm:block">
                                <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                                  <MoreVertical size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Load More Trigger */}
        {!debouncedSearch && hasMore && currentView !== 'library' && (
          <div 
            ref={observerTarget} 
            className="h-20 flex items-center justify-center mt-8"
          >
            {loadingMore && (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 size={20} className="animate-spin text-[#e05297]" />
                <span className="text-sm font-medium">Fetching more tracks...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


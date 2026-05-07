'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { usePlayerStore, Track } from '@/store/playerStore';
import SongCard from './SongCard';
import { X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import SearchInput from '@/components/SearchInput';
import AppLogo from '../ui/AppLogo';
import { fetchSongs } from '@/lib/songService';
import { useDebounce } from '@/hooks/useDebounce';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

interface SongGridProps {
  refreshTrigger?: number;
}

export default function SongGrid({ refreshTrigger = 0 }: SongGridProps) {
  const [songs, setSongs] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  
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
    const { songs: fetched, lastVisible, hasMore: more } = await fetchSongs(null);
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
    (track: Track) => {
      if (currentTrack?.id === track.id) {
        isPlaying ? pause() : resume();
      } else {
        playTrack(track, songs);
      }
    },
    [currentTrack?.id, isPlaying, pause, resume, playTrack, songs]
  );

  const filtered = useMemo(() => {
    if (!debouncedSearch) return songs;
    const q = debouncedSearch.toLowerCase();
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.artist || '').toLowerCase().includes(q)
    );
  }, [songs, debouncedSearch]);

  // Recently added (first 4) - only from the first page of results
  const recentTracks = useMemo(() => songs.slice(0, 4), [songs]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-white/[0.02] p-3 md:p-4">
            <div className="w-full aspect-square rounded-lg bg-white/[0.04] mb-3 animate-pulse" />
            <div className="h-4 bg-white/[0.04] rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-3 bg-white/[0.04] rounded w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (songs.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4">
          <AppLogo size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No tracks yet</h2>
        <p className="text-sm text-slate-500 max-w-sm">
          The library is empty. Ask an admin to upload some tracks to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search */}
      <div className="max-w-sm relative">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Recently Added Section (only if not searching) */}
      {!debouncedSearch && recentTracks.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Recently Added</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {recentTracks.map((track, i) => (
              <SongCard
                key={track.id}
                track={track}
                isActive={currentTrack?.id === track.id}
                isPlaying={currentTrack?.id === track.id && isPlaying}
                onPlay={() => handlePlay(track)}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Songs Section */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          {debouncedSearch ? `Results for "${debouncedSearch}"` : 'All Tracks'}
        </h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
        >
          {filtered.map((track, i) => (
            <SongCard
              key={track.id}
              track={track}
              isActive={currentTrack?.id === track.id}
              isPlaying={currentTrack?.id === track.id && isPlaying}
              onPlay={() => handlePlay(track)}
              index={i}
            />
          ))}
        </motion.div>

        {debouncedSearch && filtered.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-12">
            No tracks match your search.
          </p>
        )}

        {/* Load More Trigger */}
        {!debouncedSearch && hasMore && (
          <div 
            ref={observerTarget} 
            className="h-20 flex items-center justify-center mt-8"
          >
            {loadingMore && (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 size={20} className="animate-spin text-[#e05297]" />
                <span className="text-sm font-medium">Loading more...</span>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}


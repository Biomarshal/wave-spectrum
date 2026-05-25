'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/useAuthStore';
import { saveListeningHistory, updateDailyStats } from '@/lib/stats';

export default function PlayerProvider() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playStartRef = useRef<number | null>(null);
  const totalPlayTimeRef = useRef<number>(0);
  const recoveryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    currentTrack,
    isPlaying,
    volume,
    pause,
    setDuration,
    setCurrentTime,
    onTrackEnd,
    currentTime,
    repeatMode,
    setBuffering,
    setError,
    resume
  } = usePlayerStore();

  const { isAuthenticated, uid } = useAuthStore();

  // Track listening stats
  const flushStats = useCallback(() => {
    if (!isAuthenticated || !uid || !currentTrack) return;

    // Calculate how many seconds were played since the last start
    let sessionSeconds = 0;
    if (playStartRef.current) {
      sessionSeconds = Math.floor((Date.now() - playStartRef.current) / 1000);
    }
    
    const totalSeconds = totalPlayTimeRef.current + sessionSeconds;

    // Only save if played for more than 5 seconds (prevent spam)
    if (totalSeconds >= 5) {
      saveListeningHistory(uid, currentTrack, totalSeconds);
      updateDailyStats(uid, totalSeconds);
    }

    playStartRef.current = null;
    totalPlayTimeRef.current = 0;
  }, [currentTrack, isAuthenticated, uid]);

  const lastTrackId = useRef<string | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Consolidated Audio Logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack) {
      audio.pause();
      if (audio.src) {
        audio.removeAttribute('src');
        audio.load();
      }
      lastTrackId.current = null;
      return;
    }

    const isTrackChanging = lastTrackId.current !== currentTrack.id;

    if (isTrackChanging) {
      // 1. Pause and cleanup old track
      audio.pause();
      flushStats();
      
      // 2. Reset state for new track
      totalPlayTimeRef.current = 0;
      playStartRef.current = null;
      setError(null);
      setBuffering(true);
      
      // 3. Load new source
      audio.src = currentTrack.audioUrl;
      audio.load();
      lastTrackId.current = currentTrack.id;
    }

    if (isPlaying) {
      // 4. Safely trigger play
      // We check playPromiseRef to ensure we don't spam play() calls
      const playPromise = audio.play();
      playPromiseRef.current = playPromise;

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (playPromiseRef.current === playPromise && currentTrack && isPlaying) {
              playStartRef.current = Date.now();
              setError(null);
              setBuffering(false);
            } else {
              audio.pause();
            }
          })
          .catch((error) => {
            // Ignore AbortError as it's just a sign of rapid switching
            if (error.name === 'AbortError') {
              return;
            }
            console.error('Playback error:', error);
            setError('Failed to play audio. Please check your connection.');
            pause();
          });
      }
    } else {
      // 5. Handle pause
      audio.pause();
      if (playStartRef.current) {
        totalPlayTimeRef.current += Math.floor((Date.now() - playStartRef.current) / 1000);
        playStartRef.current = null;
      }
    }
  }, [isPlaying, currentTrack?.id, currentTrack?.audioUrl, pause, setError, setBuffering, flushStats]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Manual Seek sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (Math.abs(audio.currentTime - currentTime) > 1.5) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  // Cleanup
  useEffect(() => {
    return () => {
      flushStats();
      if (recoveryTimeoutRef.current) clearTimeout(recoveryTimeoutRef.current);
    };
  }, [flushStats]);

  const handleTimeUpdate = () => {
    if (audioRef.current && currentTrack) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && currentTrack) {
      setDuration(audioRef.current.duration);
      setBuffering(false);
    }
  };

  const handleWaiting = () => {
    if (currentTrack) {
      setBuffering(true);
    }
  };
  
  const handlePlaying = () => {
    if (currentTrack) {
      setBuffering(false);
      setError(null);
    }
  };

  const handleStalled = () => {
    if (!currentTrack) return;
    // If stalled, try to recover after a short delay
    console.warn('Audio stalled, attempting recovery...');
    if (isPlaying) {
      setBuffering(true);
      if (recoveryTimeoutRef.current) clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = setTimeout(() => {
        if (audioRef.current && isPlaying && currentTrack) {
          audioRef.current.load();
          audioRef.current.currentTime = currentTime;
          audioRef.current.play().catch(() => {});
        }
      }, 3000);
    }
  };

  const handleError = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || !audio.src || audio.src === window.location.href) {
      return;
    }
    setBuffering(false);
    setError('Audio playback failed. Retrying...');
    
    // Auto-retry once
    if (isPlaying) {
      setTimeout(() => {
        if (audioRef.current && isPlaying && currentTrack) {
          audioRef.current.load();
          audioRef.current.currentTime = currentTime;
          audioRef.current.play().catch(() => {
            setError('Persistent playback error. Please try another track.');
            pause();
          });
        }
      }, 2000);
    }
  };

  const handleEnded = () => {
    if (!currentTrack) return;
    flushStats();
    onTrackEnd();
  };

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={handleEnded}
      onWaiting={handleWaiting}
      onPlaying={handlePlaying}
      onStalled={handleStalled}
      onError={handleError}
      preload="auto"
    />
  );
}

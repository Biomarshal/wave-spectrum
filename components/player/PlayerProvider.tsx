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

  // Handle Play/Pause logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            playStartRef.current = Date.now();
            setError(null);
          })
          .catch((error) => {
            console.error('Playback error:', error);
            // Don't pause automatically on first failure, let error handler deal with it
            if (error.name !== 'AbortError') {
              setError('Failed to play audio. Please check your connection.');
              pause();
            }
          });
      }
    } else {
      audio.pause();
      if (playStartRef.current) {
        totalPlayTimeRef.current += Math.floor((Date.now() - playStartRef.current) / 1000);
        playStartRef.current = null;
      }
    }
  }, [isPlaying, currentTrack?.id, pause, setError]);

  // Load new track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    flushStats();
    
    // Reset state for new track
    totalPlayTimeRef.current = 0;
    playStartRef.current = null;
    setError(null);
    setBuffering(true);

    audio.src = currentTrack.audioUrl;
    audio.load();

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          playStartRef.current = Date.now();
        }).catch(() => {});
      }
    }
  }, [currentTrack?.id, flushStats, setBuffering, setError]);

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
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setBuffering(false);
    }
  };

  const handleWaiting = () => setBuffering(true);
  const handlePlaying = () => {
    setBuffering(false);
    setError(null);
  };

  const handleStalled = () => {
    // If stalled, try to recover after a short delay
    console.warn('Audio stalled, attempting recovery...');
    if (isPlaying) {
      setBuffering(true);
      if (recoveryTimeoutRef.current) clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = setTimeout(() => {
        if (audioRef.current && isPlaying) {
          audioRef.current.load();
          audioRef.current.currentTime = currentTime;
          audioRef.current.play().catch(() => {});
        }
      }, 3000);
    }
  };

  const handleError = () => {
    console.error('Audio error event fired');
    setBuffering(false);
    setError('Audio playback failed. Retrying...');
    
    // Auto-retry once
    if (isPlaying) {
      setTimeout(() => {
        if (audioRef.current && isPlaying) {
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

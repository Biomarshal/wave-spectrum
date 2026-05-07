import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  year?: number;
  albumArt?: string;
  audioUrl: string;
  publicId?: string;
  uploadedBy?: string;
  createdAt: number;
}

export type RepeatMode = 'off' | 'one' | 'all';

interface PlayerState {
  // Playback
  currentTrack: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  error: string | null;
  duration: number;
  currentTime: number;
  volume: number;

  // Queue
  queue: Track[];
  currentIndex: number;

  // Modes
  isShuffle: boolean;
  repeatMode: RepeatMode;

  // Actions
  playTrack: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  setBuffering: (isBuffering: boolean) => void;
  setError: (error: string | null) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  onTrackEnd: () => void;
  clearPlayer: () => void;
}


function getShuffledIndex(currentIndex: number, queueLength: number): number {
  if (queueLength <= 1) return 0;
  let next: number;
  do {
    next = Math.floor(Math.random() * queueLength);
  } while (next === currentIndex);
  return next;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  isBuffering: false,
  error: null,
  duration: 0,
  currentTime: 0,
  volume: 1,
  queue: [],
  currentIndex: -1,
  isShuffle: false,
  repeatMode: 'off',

  setBuffering: (isBuffering) => set({ isBuffering }),
  setError: (error) => set({ error }),


  playTrack: (track, queue) => {
    const state = get();
    if (queue) {
      const index = queue.findIndex((t) => t.id === track.id);
      set({
        currentTrack: track,
        isPlaying: true,
        queue,
        currentIndex: index >= 0 ? index : 0,
        currentTime: 0,
        duration: 0,
      });
    } else {
      // If track is already in queue, just jump to it
      const index = state.queue.findIndex((t) => t.id === track.id);
      if (index >= 0) {
        set({
          currentTrack: track,
          isPlaying: true,
          currentIndex: index,
          currentTime: 0,
          duration: 0,
        });
      } else {
        set({
          currentTrack: track,
          isPlaying: true,
          queue: [track],
          currentIndex: 0,
          currentTime: 0,
          duration: 0,
        });
      }
    }
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  stop: () =>
    set({
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      currentIndex: -1,
    }),

  next: () => {
    const { queue, currentIndex, isShuffle, repeatMode } = get();
    if (queue.length === 0) return;

    let nextIndex: number;
    if (isShuffle) {
      nextIndex = getShuffledIndex(currentIndex, queue.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'all') {
          nextIndex = 0;
        } else {
          set({ isPlaying: false });
          return;
        }
      }
    }

    set({
      currentTrack: queue[nextIndex],
      currentIndex: nextIndex,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
    });
  },

  previous: () => {
    const { queue, currentIndex, currentTime } = get();
    if (queue.length === 0) return;

    // If more than 3s into the song, restart it
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = queue.length - 1;

    set({
      currentTrack: queue[prevIndex],
      currentIndex: prevIndex,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
    });
  },

  seek: (time) => set({ currentTime: time }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setDuration: (duration) => set({ duration }),
  setCurrentTime: (time) => set({ currentTime: time }),

  toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),

  cycleRepeat: () =>
    set((s) => {
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const idx = modes.indexOf(s.repeatMode);
      return { repeatMode: modes[(idx + 1) % modes.length] };
    }),

  setQueue: (tracks, startIndex = 0) =>
    set({
      queue: tracks,
      currentIndex: startIndex,
      currentTrack: tracks[startIndex] || null,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
    }),

  onTrackEnd: () => {
    const { repeatMode } = get();
    if (repeatMode === 'one') {
      // Restart the current track (PlayerProvider handles the audio seek)
      set({ currentTime: 0, isPlaying: true });
    } else {
      get().next();
    }
  },

  clearPlayer: () =>
    set({
      currentTrack: null,
      isPlaying: false,
      queue: [],
      currentIndex: -1,
      currentTime: 0,
      duration: 0,
    }),
}));

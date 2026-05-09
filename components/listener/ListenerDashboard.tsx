'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import SongGrid from '@/components/song/SongGrid';
import Profile from '@/components/Profile';
import { AnimatePresence, motion } from 'framer-motion';
import { Music, TrendingUp, Clock } from 'lucide-react';

export default function ListenerDashboard() {
  const [activeView, setActiveView] = useState('home');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <AppShell activeView={activeView} onNavigate={setActiveView}>
      <div className="p-5 sm:p-8 md:p-12 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="mb-10">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                  {greeting}
                </h1>
                <p className="text-sm sm:text-base text-slate-500 font-medium tracking-wide">
                  Welcome back to your Wave Spectrum.
                </p>
              </div>
              <SongGrid currentView="home" />
            </motion.div>
          )}

          {activeView === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="mb-10">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                  Search
                </h1>
                <p className="text-sm sm:text-base text-slate-500 font-medium tracking-wide">
                  Explore millions of tracks.
                </p>
              </div>
              <SongGrid currentView="search" />
            </motion.div>
          )}

          {activeView === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="mb-10">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                  Library
                </h1>
                <p className="text-sm sm:text-base text-slate-500 font-medium tracking-wide">
                  Your curated artist collection.
                </p>
              </div>
              <SongGrid currentView="library" />
            </motion.div>
          )}

          {activeView === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <Profile />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

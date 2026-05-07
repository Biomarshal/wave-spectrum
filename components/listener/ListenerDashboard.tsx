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
      <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{greeting}</h1>
                <p className="text-sm text-slate-500">Pick up where you left off.</p>
              </div>
              <SongGrid />
            </motion.div>
          )}

          {activeView === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Search</h1>
                <p className="text-sm text-slate-500">Find your favorite tracks.</p>
              </div>
              <SongGrid />
            </motion.div>
          )}

          {activeView === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Your Library</h1>
                <p className="text-sm text-slate-500">All your tracks in one place.</p>
              </div>
              <SongGrid />
            </motion.div>
          )}

          {activeView === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Profile />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

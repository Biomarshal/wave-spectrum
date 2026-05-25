'use client';

import { useState, useEffect, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import MiniPlayer from '@/components/player/MiniPlayer';
import FullPlayer from '@/components/player/FullPlayer';
import { usePlayerStore } from '@/store/playerStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import DesktopSidebar from './DesktopSidebar';

interface AppShellProps {
  activeView: string;
  onNavigate: (view: string) => void;
  children: ReactNode;
}

export default function AppShell({ activeView, onNavigate, children }: AppShellProps) {
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const { role } = useAuthStore();

  const hasPlayer = !!currentTrack;

  // Handle navigation
  const handleNavigate = (view: string) => {
    onNavigate(view);
  };

  return (
    <div className="flex h-screen h-[100dvh] bg-[var(--color-bg-base)] text-[var(--color-text-primary)] overflow-hidden relative theme-transition">
      {/* Desktop Sidebar - Hidden on mobile */}
      <DesktopSidebar 
        activeView={activeView} 
        onNavigate={handleNavigate} 
        role={role} 
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile header (visible on all screens) */}
        <Header />

        {/* Scrollable content */}
        <main
          className={`flex-1 overflow-y-auto custom-scrollbar relative theme-transition ${
            hasPlayer 
              ? 'pb-[160px] md:pb-[120px]' 
              : 'pb-[80px] md:pb-[24px]'
          }`}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mini Player - Positioned above bottom nav on mobile, or bottom-right on desktop */}
      <MiniPlayer onExpand={() => setShowFullPlayer(true)} />

      {/* Bottom navigation - Mobile only */}
      <MobileNav
        activeView={activeView}
        onNavigate={handleNavigate}
        hasPlayer={hasPlayer}
      />

      {/* Full Player */}
      <AnimatePresence>
        {showFullPlayer && (
          <FullPlayer onClose={() => setShowFullPlayer(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}


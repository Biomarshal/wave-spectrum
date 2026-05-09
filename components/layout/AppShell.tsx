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
    <div className="flex h-screen h-[100dvh] bg-[#080a10] text-white overflow-hidden relative">
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
          className="flex-1 overflow-y-auto custom-scrollbar relative md:[--main-pb:calc(var(--player-height)+40px)]"
          style={{
            paddingBottom: hasPlayer 
              ? 'var(--main-pb, calc(var(--player-height) + var(--mobile-nav-height) + 24px + env(safe-area-inset-bottom, 0px)))' 
              : 'var(--main-pb, calc(var(--mobile-nav-height) + 24px + env(safe-area-inset-bottom, 0px)))',
          }}
        >
          <div className="px-4 sm:px-8 md:px-10 py-6 md:py-10 max-w-7xl mx-auto w-full">
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


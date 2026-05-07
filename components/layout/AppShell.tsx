'use client';

import { useState, useEffect, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import MiniPlayer from '@/components/player/MiniPlayer';
import FullPlayer from '@/components/player/FullPlayer';
import { usePlayerStore } from '@/store/playerStore';
import { AnimatePresence, motion } from 'framer-motion';

interface AppShellProps {
  activeView: string;
  onNavigate: (view: string) => void;
  children: ReactNode;
}

export default function AppShell({ activeView, onNavigate, children }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  const hasPlayer = !!currentTrack;

  // Handle navigation with mobile menu close
  const handleNavigate = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate bottom padding for content
  const getContentPadding = () => {
    let padding = 0;
    if (hasPlayer) padding += 72; // player height
    return padding;
  };

  return (
    <div className="flex h-screen h-[100dvh] bg-[#080a10] text-white overflow-hidden relative">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          activeView={activeView}
          onNavigate={onNavigate}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-[70] md:hidden"
            >
              <Sidebar
                activeView={activeView}
                onNavigate={handleNavigate}
                collapsed={false}
                onToggle={() => setMobileMenuOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <Header onMenuToggle={() => setMobileMenuOpen(true)} />

        {/* Scrollable content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{
            paddingBottom: hasPlayer 
              ? 'calc(var(--player-height) + var(--mobile-nav-height) + env(safe-area-inset-bottom, 0px))' 
              : 'calc(var(--mobile-nav-height) + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <div className="md:pb-[80px]">
            {children}
          </div>
        </main>
      </div>

      {/* Mini Player */}
      <MiniPlayer onExpand={() => setShowFullPlayer(true)} />

      {/* Mobile bottom navigation */}
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


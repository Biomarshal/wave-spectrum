'use client';

import { memo } from 'react';
import { Home, Search, Library, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
  hasPlayer: boolean;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'profile', label: 'Profile', icon: User },
];

function MobileNav({ activeView, onNavigate, hasPlayer }: MobileNavProps) {
  return (
    <nav
      className="fixed left-0 right-0 z-40 md:hidden safe-bottom"
      style={{
        bottom: hasPlayer ? 'var(--player-height)' : 0,
        background: 'linear-gradient(to top, rgba(8, 10, 16, 0.98), rgba(8, 10, 16, 0.92))',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
      }}
    >
      <div className="flex items-center justify-around" style={{ height: 'var(--mobile-nav-height)' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 min-w-[64px] relative"
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-[#e05297]' : 'text-slate-500'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#e05297]"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-[#e05297]' : 'text-slate-600'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default memo(MobileNav);

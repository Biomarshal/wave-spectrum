'use client';

import { memo } from 'react';
import { 
  Home, 
  Search, 
  Library, 
  User, 
  UploadCloud, 
  Settings 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
  hasPlayer: boolean;
}

import { useAuthStore } from '@/store/useAuthStore';

function MobileNav({ activeView, onNavigate, hasPlayer }: MobileNavProps) {
  const { role } = useAuthStore();

  const listenerItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const adminItems = [
    { id: 'dashboard', label: 'Overview', icon: Home },
    { id: 'upload', label: 'Upload', icon: UploadCloud },
    { id: 'manage', label: 'Manage', icon: Library },
    { id: 'profile', label: 'Settings', icon: Settings },
  ];

  const navItems = role === 'admin' ? adminItems : listenerItems;

  return (
    <nav
      className="fixed left-0 right-0 bottom-0 z-40 md:hidden safe-bottom bg-[#080a10]/95 backdrop-blur-xl border-t border-white/[0.04] px-2"
    >
      <div className="flex items-center justify-around" style={{ height: 'var(--mobile-nav-height)' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center justify-center gap-1 px-2 py-2 min-w-[60px] relative transition-all active:scale-90"
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={`transition-all duration-300 ${
                    isActive ? 'text-[#e05297] drop-shadow-[0_0_8px_rgba(224,82,151,0.4)]' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#e05297] shadow-[0_0_10px_#e05297]"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </div>
              <span
                className={`text-[9px] font-black uppercase tracking-widest transition-colors duration-300 ${
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

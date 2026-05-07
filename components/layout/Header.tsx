'use client';

import { memo } from 'react';
import { Menu } from 'lucide-react';
import AppLogo from '../ui/AppLogo';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

function Header({ onMenuToggle, title }: HeaderProps) {
  return (
    <header className="flex items-center h-14 px-4 border-b border-white/[0.04] md:hidden shrink-0 bg-[#080a10]/80 backdrop-blur-md sticky top-0 z-30">
      <button
        onClick={onMenuToggle}
        className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-lg active:bg-white/[0.04]"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>
      <div className="flex items-center gap-2 ml-3">
        <AppLogo size={14} />
        <span className="text-sm font-bold text-white tracking-tight">
          {title || 'Wave Spectrum'}
        </span>
      </div>
    </header>
  );
}

export default memo(Header);

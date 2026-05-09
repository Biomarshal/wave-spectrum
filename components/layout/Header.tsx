'use client';

import { memo } from 'react';
import { Menu } from 'lucide-react';
import AppLogo from '../ui/AppLogo';

interface HeaderProps {
  title?: string;
}

function Header({ title }: HeaderProps) {
  return (
    <header className="flex items-center h-14 px-4 sm:px-6 border-b border-white/[0.04] shrink-0 bg-[#080a10]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <AppLogo size={14} />
        <span className="text-sm font-bold text-white tracking-tight uppercase">
          {title || 'Wave Spectrum'}
        </span>
      </div>
    </header>
  );
}

export default memo(Header);

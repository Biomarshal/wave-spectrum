'use client';

import { memo } from 'react';
import { Menu } from 'lucide-react';
import AppLogo from '../ui/AppLogo';

interface HeaderProps {
  title?: string;
}

function Header({ title }: HeaderProps) {
  return (
    <header className="flex md:hidden items-center h-14 px-4 sm:px-6 border-b border-[var(--color-border)] shrink-0 bg-[var(--color-bg-base)]/80 backdrop-blur-md sticky top-0 z-30 theme-transition">
      <div className="flex items-center gap-2">
        <AppLogo size={14} />
        <span className="text-sm font-bold text-[var(--color-text-primary)] tracking-tight uppercase">
          {title || 'Wave Spectrum'}
        </span>
      </div>
    </header>
  );
}

export default memo(Header);

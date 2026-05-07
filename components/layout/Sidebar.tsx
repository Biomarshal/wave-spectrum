'use client';

import { memo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore } from '@/store/playerStore';
import {
  Home, User, LogOut, LayoutDashboard, UploadCloud,
  ListMusic, Users, ChevronLeft, ChevronRight, Headphones,
} from 'lucide-react';
import AppLogo from '../ui/AppLogo';

interface NavItem {
  id: string;
  label: string;
  icon: any;
}

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

function Sidebar({ activeView, onNavigate, collapsed, onToggle }: SidebarProps) {
  const { role } = useAuthStore();
  const logout = useAuthStore((s) => s.logout);
  const clearPlayer = usePlayerStore((s) => s.clearPlayer);

  const handleLogout = () => {
    clearPlayer();
    logout();
  };

  const listenerNav: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const adminNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload', icon: UploadCloud },
    { id: 'manage', label: 'Library', icon: ListMusic },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const items = role === 'admin' ? adminNav : listenerNav;

  return (
    <aside
      className={`flex flex-col h-full bg-[#0d1017] border-r border-white/[0.04] transition-all duration-300 shrink-0 ${
        collapsed ? 'w-[72px]' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 h-16 border-b border-white/[0.04] shrink-0 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
        <AppLogo size={20} />
        {!collapsed && (
          <span className="text-base font-bold text-white tracking-tight whitespace-nowrap">
            Wave Spectrum
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full relative ${
                active
                  ? 'bg-white/[0.08] text-white'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#e05297] rounded-r-full" />
              )}
              <Icon size={20} className={`shrink-0 ${active ? 'text-[#e05297]' : ''}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="px-2 py-4 border-t border-white/[0.04] flex flex-col gap-1">
        <button
          onClick={onToggle}
          title={collapsed ? 'Expand' : 'Collapse'}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-white/[0.04] hover:text-white transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400/70 hover:bg-red-500/[0.06] hover:text-red-400 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
          title="Sign Out"
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

export default memo(Sidebar);

'use client';

import { Home, Search, Library, User, Shield, UploadCloud, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import AppLogo from '../ui/AppLogo';
import { useAuthStore } from '@/store/useAuthStore';

interface DesktopSidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  role: 'listener' | 'admin' | null;
}

export default function DesktopSidebar({ activeView, onNavigate, role }: DesktopSidebarProps) {
  const logout = useAuthStore((s) => s.logout);

  const listenerItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const adminItems = [
    { id: 'dashboard', label: 'Overview', icon: Home },
    { id: 'upload', label: 'Upload', icon: UploadCloud },
    { id: 'manage', label: 'Manage Tracks', icon: Library },
    { id: 'users', label: 'User List', icon: User },
    { id: 'profile', label: 'Settings', icon: Settings },
  ];

  const items = role === 'admin' ? adminItems : listenerItems;

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 h-screen bg-[#080a10] border-r border-white/5 shrink-0 sticky top-0">
      {/* Logo Section */}
      <div className="p-8 pb-10">
        <div className="flex items-center gap-3">
          <AppLogo size={32} />
          <div className="flex flex-col">
            <span className="text-lg font-black text-white tracking-tighter uppercase leading-none">Wave Spectrum</span>
            {role === 'admin' && (
              <span className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-widest mt-1">Admin Panel</span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 space-y-1.5">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4">Menu</p>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-gradient-to-r from-[#e05297]/10 to-transparent text-[#e05297] border-l-2 border-[#e05297]' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon 
                size={20} 
                className={`transition-colors ${isActive ? 'text-[#e05297]' : 'group-hover:text-white'}`} 
              />
              <span className="text-sm font-bold tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-6">
        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/5">
          <button 
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all text-xs font-bold uppercase tracking-wider"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}

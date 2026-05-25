'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { getWeeklyStats, formatDuration } from '@/lib/stats';
import { User, Mail, Calendar, Clock, BarChart2, Edit2, Check, X, Headphones, LogOut, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore } from '@/store/playerStore';

import { UserProfile } from '@/lib/userService';

export default function Profile() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('wave_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('wave_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [todayTime, setTodayTime] = useState(0);
  const [weeklyTime, setWeeklyTime] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const logout = useAuthStore((s) => s.logout);
  const clearPlayer = usePlayerStore((s) => s.clearPlayer);

  const handleLogout = () => {
    clearPlayer();
    logout();
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }
      const uid = user.uid;

      try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data() as UserProfile;
          setUserData(data);
          setNewName(data.name || '');
        }

        const today = new Date().toISOString().split('T')[0];
        const statsRef = doc(db, 'users', uid, 'dailyStats', today);
        const statsSnap = await getDoc(statsRef);
        if (statsSnap.exists()) {
          const statsData = statsSnap.data();
          setTodayTime(statsData?.total || 0);
        }

        const weekTotal = await getWeeklyStats(uid);
        setWeeklyTime(weekTotal);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleUpdateName = async () => {
    const user = auth.currentUser;
    if (!user || !newName.trim() || newName.trim() === userData?.name) {
      setIsEditing(false);
      return;
    }
    setIsUpdating(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { name: newName.trim() });
      await updateProfile(user, { displayName: newName.trim() });
      if (userData) {
        setUserData({ ...userData, name: newName.trim() });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating name:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getJoinedDate = () => {
    if (!userData?.createdAt) return 'recently';
    
    // Handle both Firestore Timestamp and regular numbers
    const date = typeof userData.createdAt === 'number' 
      ? new Date(userData.createdAt)
      : (userData.createdAt as any).toDate 
        ? (userData.createdAt as any).toDate() 
        : new Date(userData.createdAt);
        
    return date.toLocaleDateString();
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-3 border-[#e05297]/20 border-t-[#e05297] rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1100px] mx-auto space-y-6 theme-transition pb-40 md:pb-32">
      {/* Profile header */}
      <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 relative overflow-hidden theme-transition">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#e05297]/10 rounded-full blur-3xl" />
        
        {/* Premium Theme Switch */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5 bg-white/5 dark:bg-black/20 border border-[var(--color-border)] rounded-full p-1.5 backdrop-blur-md theme-transition">
          <button
            onClick={() => { if (theme !== 'light') toggleTheme(); }}
            className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-[var(--color-text-primary)] text-[var(--color-bg-base)] shadow-md scale-105' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
            title="Light Mode"
          >
            <Sun size={16} />
          </button>
          <button
            onClick={() => { if (theme !== 'dark') toggleTheme(); }}
            className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-[#7c3aed] text-white shadow-md scale-105' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
            title="Dark Mode"
          >
            <Moon size={16} />
          </button>
        </div>

        <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6 sm:gap-8 relative z-10">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#e05297] flex items-center justify-center shrink-0 shadow-xl shadow-[#7c3aed]/20">
            <User size={36} className="text-white/90" />
          </div>
  
          <div className="flex-1 text-center sm:text-left flex flex-col justify-center min-w-0 w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-3">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-2"
                  >
                    <input
                      id="edit-name"
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-[var(--color-bg-hover)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-xl font-bold text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#e05297]/50 w-full max-w-[180px] sm:max-w-[240px] transition-all"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateName(); }}
                    />
                    <button
                      onClick={handleUpdateName}
                      disabled={isUpdating}
                      className="p-2.5 bg-[#e05297] rounded-xl text-white hover:bg-[#e05297]/80 transition-all hover:scale-105 active:scale-95 shrink-0"
                    >
                      {isUpdating ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Check size={20} />
                      )}
                    </button>
                    <button
                      onClick={() => { setIsEditing(false); setNewName(userData?.name || ''); }}
                      className="p-2.5 bg-[var(--color-bg-hover)] rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all shrink-0"
                    >
                      <X size={20} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="display"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-3"
                  >
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight truncate max-w-[180px] sm:max-w-none">
                      {userData?.name || 'User'}
                    </h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-[var(--color-text-secondary)] hover:text-[#e05297] transition-colors rounded-full hover:bg-[var(--color-bg-hover)]"
                    >
                      <Edit2 size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
  
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  userData?.role === 'admin'
                    ? 'bg-[#7c3aed]/20 text-[#7c3aed] border border-[#7c3aed]/30'
                    : 'bg-[#e05297]/20 text-[#e05297] border border-[#e05297]/30'
                }`}
              >
                {userData?.role || 'Listener'}
              </span>
            </div>
  
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-2 gap-x-5 text-sm font-medium text-[var(--color-text-secondary)] max-w-full">
              <span className="flex items-center gap-2 truncate max-w-full">
                <Mail size={16} className="text-[var(--color-text-muted)] shrink-0" />
                <span className="truncate">{userData?.email}</span>
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <Calendar size={16} className="text-[var(--color-text-muted)] shrink-0" />
                Joined {getJoinedDate()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mb-6">
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-6 transition-all hover:bg-[var(--color-bg-hover)] theme-transition"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#e05297]/10 flex items-center justify-center text-[#e05297] border border-[#e05297]/20">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Today's Session</p>
                <p className="text-2xl font-black text-[var(--color-text-primary)]">{formatDuration(todayTime)}</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-[var(--color-bg-hover)] h-2 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((todayTime / 3600) * 100, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#e05297] to-[#ff7eb3] rounded-full"
            />
          </div>
          <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-tighter">Goal: 1 hour</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-6 transition-all hover:bg-[var(--color-bg-hover)] theme-transition"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed] border border-[#7c3aed]/20">
                <BarChart2 size={24} />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] font-bold uppercase tracking-wider">Weekly Average</p>
                <p className="text-2xl font-black text-[var(--color-text-primary)]">{formatDuration(weeklyTime)}</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-[var(--color-bg-hover)] h-2 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((weeklyTime / 25200) * 100, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] rounded-full"
            />
          </div>
          <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-tighter">Goal: 7 hours</p>
        </motion.div>
      </div>

      {/* Recent Activity & Sign Out */}
      <div className="space-y-4">
        <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-6 theme-transition">
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-2 uppercase tracking-tight">
            <Headphones size={20} className="text-[#e05297]" />
            Listening Activity
          </h3>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg-hover)] flex items-center justify-center mb-4 border border-[var(--color-border)]">
              <Headphones size={24} className="text-[var(--color-text-muted)]" />
            </div>
            <p className="text-sm font-medium text-[var(--color-text-secondary)] max-w-[200px]">
              Your streaming history will appear here once you start playing tracks.
            </p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500/20 transition-all active:scale-[0.98] mt-4"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

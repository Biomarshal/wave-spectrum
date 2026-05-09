'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { getWeeklyStats, formatDuration } from '@/lib/stats';
import { User, Mail, Calendar, Clock, BarChart2, Edit2, Check, X, Headphones, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlayerStore } from '@/store/playerStore';

import { UserProfile } from '@/lib/userService';

export default function Profile() {
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
    <div className="max-w-3xl mx-auto py-4 px-2 sm:px-0">
      {/* Profile header */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sm:p-10 mb-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#e05297]/10 rounded-full blur-3xl" />
        
        <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6 sm:gap-8 relative z-10">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-[#7c3aed] to-[#e05297] flex items-center justify-center shrink-0 shadow-xl shadow-[#7c3aed]/20">
            <User size={48} className="text-white/90" />
          </div>

          <div className="flex-1 text-center sm:text-left flex flex-col justify-center">
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
                      className="bg-white/[0.08] border border-white/[0.1] rounded-xl px-4 py-2 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#e05297]/50 w-48 sm:w-64 transition-all"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateName(); }}
                    />
                    <button
                      onClick={handleUpdateName}
                      disabled={isUpdating}
                      className="p-2.5 bg-[#e05297] rounded-xl text-white hover:bg-[#e05297]/80 transition-all hover:scale-105 active:scale-95"
                    >
                      {isUpdating ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Check size={20} />
                      )}
                    </button>
                    <button
                      onClick={() => { setIsEditing(false); setNewName(userData?.name || ''); }}
                      className="p-2.5 bg-white/[0.06] rounded-xl text-slate-400 hover:text-white transition-all"
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
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                      {userData?.name || 'User'}
                    </h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-slate-400 hover:text-[#e05297] transition-colors rounded-full hover:bg-white/[0.04]"
                    >
                      <Edit2 size={18} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <span
                className={`text-[11px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                  userData?.role === 'admin'
                    ? 'bg-[#7c3aed]/20 text-[#7c3aed] border border-[#7c3aed]/30'
                    : 'bg-[#e05297]/20 text-[#e05297] border border-[#e05297]/30'
                }`}
              >
                {userData?.role || 'Listener'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-2 gap-x-5 text-sm font-medium text-slate-400">
              <span className="flex items-center gap-2">
                <Mail size={16} className="text-slate-500" />
                {userData?.email}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-500" />
                Joined {getJoinedDate()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 transition-all hover:bg-white/[0.05]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#e05297]/10 flex items-center justify-center text-[#e05297] border border-[#e05297]/20">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Today's Session</p>
                <p className="text-2xl font-black text-white">{formatDuration(todayTime)}</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((todayTime / 3600) * 100, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#e05297] to-[#ff7eb3] rounded-full"
            />
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">Goal: 1 hour</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 transition-all hover:bg-white/[0.05]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed] border border-[#7c3aed]/20">
                <BarChart2 size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Weekly Average</p>
                <p className="text-2xl font-black text-white">{formatDuration(weeklyTime)}</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((weeklyTime / 25200) * 100, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] rounded-full"
            />
          </div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">Goal: 7 hours</p>
        </motion.div>
      </div>

      {/* Recent Activity & Sign Out */}
      <div className="space-y-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-tight">
            <Headphones size={20} className="text-[#e05297]" />
            Listening Activity
          </h3>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mb-4 border border-white/[0.04]">
              <Headphones size={24} className="text-slate-600" />
            </div>
            <p className="text-sm font-medium text-slate-500 max-w-[200px]">
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
          Sign Out of Wave Spectrum
        </button>
      </div>
    </div>
  );
}

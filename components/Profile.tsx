'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { getWeeklyStats, formatDuration } from '@/lib/stats';
import { User, Mail, Calendar, Clock, BarChart2, Edit2, Check, X, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { UserProfile } from '@/lib/userService';

export default function Profile() {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [todayTime, setTodayTime] = useState(0);
  const [weeklyTime, setWeeklyTime] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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
    <div className="max-w-3xl mx-auto">
      {/* Profile header */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 sm:p-6 md:p-8 mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#e05297] flex items-center justify-center shrink-0 shadow-lg shadow-[#7c3aed]/15">
            <User size={36} className="text-white/80 sm:hidden" />
            <User size={40} className="text-white/80 hidden sm:block" />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <input
                      id="edit-name"
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-1.5 text-lg sm:text-xl font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#e05297]/40 w-44 sm:w-48"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') handleUpdateName(); }}
                    />
                    <button
                      onClick={handleUpdateName}
                      disabled={isUpdating}
                      className="p-2 bg-[#e05297] rounded-lg text-white hover:bg-[#e05297]/80 transition-colors"
                    >
                      {isUpdating ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => { setIsEditing(false); setNewName(userData?.name || ''); }}
                      className="p-2 bg-white/[0.06] rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="display"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      {userData?.name || 'User'}
                    </h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 text-slate-500 hover:text-white transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <span
                className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                  userData?.role === 'admin'
                    ? 'bg-[#7c3aed]/20 text-[#7c3aed]'
                    : 'bg-[#e05297]/20 text-[#e05297]'
                }`}
              >
                {userData?.role || 'Listener'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-slate-500" />
                {userData?.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-500" />
                Joined {getJoinedDate()}
              </span>

            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#e05297]/10 flex items-center justify-center text-[#e05297]">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Today</p>
              <p className="text-xl font-bold text-white">{formatDuration(todayTime)}</p>
            </div>
          </div>
          <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((todayTime / 3600) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-[#e05297] rounded-full"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Goal: 1 hour</p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed]">
              <BarChart2 size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">This Week</p>
              <p className="text-xl font-bold text-white">{formatDuration(weeklyTime)}</p>
            </div>
          </div>
          <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((weeklyTime / 25200) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-[#7c3aed] rounded-full"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Goal: 7 hours</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 md:p-6">
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Headphones size={16} className="text-[#e05297]" />
          Recent Tracks
        </h3>
        <p className="text-sm text-slate-500 text-center py-8">
          Your listening history will appear here as you stream.
        </p>
      </div>
    </div>
  );
}

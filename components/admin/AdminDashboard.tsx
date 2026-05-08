'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Track } from '@/store/playerStore';
import { fetchAllUsers } from '@/lib/userService';


import { UploadCloud, Edit2, Trash2, X, User, Headphones, TrendingUp } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import Upload from '@/components/Upload';
import Profile from '@/components/Profile';
import SongGrid from '@/components/song/SongGrid';
import AppShell from '@/components/layout/AppShell';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [songs, setSongs] = useState<Track[]>([]);
  const [editingSong, setEditingSong] = useState<Track | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch Songs & Users
  useEffect(() => {
    // We'll still use onSnapshot for songs to keep the dashboard real-time for admins
    const q = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Track[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        fetched.push({
          id: d.id,
          ...data,
          audioUrl: data.audioUrl || data.url,
        } as Track);
      });
      setSongs(fetched);
    });

    const loadUsers = async () => {
      const fetchedUsers = await fetchAllUsers();
      setUsers(fetchedUsers);
    };
    
    loadUsers();

    return () => unsubscribe();
  }, [refreshTrigger]);


  const handleDelete = async (song: Track) => {
    if (!confirm('Are you sure you want to delete this song?')) return;
    try {
      if (song.publicId) {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');
        const token = await user.getIdToken(true);

        await fetch('/api/delete-song', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ publicId: song.publicId }),
        });
      }

      await deleteDoc(doc(db, 'songs', song.id));
    } catch (error) {
      console.error('Error deleting song:', error);
    }
  };

  const handleEdit = async () => {
    if (!editingSong || !editTitle.trim()) return;
    try {
      await updateDoc(doc(db, 'songs', editingSong.id), {
        title: editTitle.trim(),
        artist: editArtist.trim() || 'Unknown Artist',
      });
      setEditingSong(null);
    } catch (error) {
      console.error('Error updating song:', error);
    }
  };

  return (
    <AppShell activeView={activeTab} onNavigate={setActiveTab}>
      <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Overview</h1>
                <p className="text-sm text-slate-500">Platform metrics at a glance.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8">
                {[
                  { label: 'Tracks', value: songs.length, color: 'text-[#e05297]', bg: 'bg-[#e05297]/10', icon: Headphones },
                  { label: 'Users', value: users.length, color: 'text-[#7c3aed]', bg: 'bg-[#7c3aed]/10', icon: User },
                  { label: 'Status', value: 'Online', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: TrendingUp },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={i}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 md:p-6"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center ${s.color}`}>
                          <Icon size={20} />
                        </div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                          {s.label}
                        </p>
                      </div>
                      <p className={`text-2xl md:text-3xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  );
                })}
              </div>

              {/* Quick song preview */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-4">Recent Tracks</h2>
                <SongGrid refreshTrigger={refreshTrigger} />
              </div>
            </motion.div>
          )}

          {/* Upload */}
          {activeTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl"
            >
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Upload Track</h1>
                <p className="text-sm text-slate-500">Add new audio to the library.</p>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
                <Upload
                  onUploadComplete={() => {
                    setActiveTab('manage');
                    setRefreshTrigger((p) => p + 1);
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Manage */}
          {activeTab === 'manage' && (
            <motion.div
              key="manage"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Track Library</h1>
                  <p className="text-sm text-slate-500">Manage uploaded tracks.</p>
                </div>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 active:bg-slate-300 transition-colors flex items-center gap-2 w-fit"
                >
                  <UploadCloud size={16} /> Upload
                </button>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-slate-500">
                      <th className="px-4 md:px-5 py-3 font-medium">Title</th>
                      <th className="px-4 md:px-5 py-3 font-medium">Artist</th>
                      <th className="px-4 md:px-5 py-3 font-medium hidden md:table-cell">Date</th>
                      <th className="px-4 md:px-5 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {songs.map((song) => (
                      <tr key={song.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-4 md:px-5 py-3">
                          <div className="flex items-center gap-3">
                            <AppLogo size={14} />
                            <span className="font-medium text-white truncate max-w-[120px] sm:max-w-none">{song.title}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-5 py-3 text-slate-400">{song.artist || 'Unknown'}</td>
                        <td className="px-4 md:px-5 py-3 text-slate-500 hidden md:table-cell">
                          {new Date(song.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 md:px-5 py-3 text-right">
                          <div className="flex justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingSong(song);
                                setEditTitle(song.title);
                                setEditArtist(song.artist || '');
                              }}
                              className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-white/[0.06] transition-colors"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(song)}
                              className="p-1.5 text-slate-400 hover:text-red-400 rounded-md hover:bg-red-500/[0.06] transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {songs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                          No tracks uploaded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Users */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Users</h1>
                <p className="text-sm text-slate-500">Registered accounts.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {users.length === 0 ? (
                  <p className="col-span-full text-center py-10 text-slate-500">
                    No users found.
                  </p>
                ) : (
                  users.map((u) => (
                    <div
                      key={u.id}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 md:p-5 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center text-slate-400">
                        <User size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">
                          {u.name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase shrink-0 ${
                          u.role === 'admin'
                            ? 'bg-[#7c3aed]/20 text-[#7c3aed]'
                            : 'bg-[#e05297]/20 text-[#e05297]'
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* Profile */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Profile />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingSong && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[90] p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-[#12151c] border border-white/[0.08] rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">Edit Track</h3>
                <button
                  onClick={() => setEditingSong(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1">Title</label>
                  <input
                    id="edit-song-title"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#e05297]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 font-medium mb-1">Artist</label>
                  <input
                    id="edit-song-artist"
                    type="text"
                    value={editArtist}
                    onChange={(e) => setEditArtist(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#e05297]/40"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingSong(null)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/[0.04] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="flex-1 py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-slate-200 active:bg-slate-300 transition-colors"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

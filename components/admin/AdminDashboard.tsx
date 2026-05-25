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
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-1">Overview</h1>
              <p className="text-sm text-[var(--color-text-secondary)]">Platform metrics at a glance.</p>
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
                    className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl p-5 md:p-6 theme-transition"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center ${s.color}`}>
                        <Icon size={20} />
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] font-medium uppercase tracking-wider">
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
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Recent Tracks</h2>
              <SongGrid refreshTrigger={refreshTrigger} currentView="home" />
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
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-1">Upload Track</h1>
              <p className="text-sm text-[var(--color-text-muted)]">Add new audio to the library.</p>
            </div>
            <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden theme-transition">
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
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-1">Track Library</h1>
                <p className="text-sm text-[var(--color-text-secondary)]">Manage uploaded tracks.</p>
              </div>
              <button
                onClick={() => setActiveTab('upload')}
                className="bg-[var(--color-text-primary)] text-[var(--color-bg-base)] text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 w-fit theme-transition"
              >
                <UploadCloud size={16} /> Upload
              </button>
            </div>

            <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden overflow-x-auto theme-transition">
              <table className="w-full text-left text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                    <th className="px-4 md:px-5 py-3 font-medium">Title</th>
                    <th className="px-4 md:px-5 py-3 font-medium">Artist</th>
                    <th className="px-4 md:px-5 py-3 font-medium hidden md:table-cell">Date</th>
                    <th className="px-4 md:px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]/50">
                  {songs.map((song) => (
                    <tr key={song.id} className="hover:bg-[var(--color-bg-hover)] transition-colors group">
                      <td className="px-4 md:px-5 py-3">
                        <div className="flex items-center gap-3">
                          <AppLogo size={14} />
                          <span className="font-medium text-[var(--color-text-primary)] truncate max-w-[120px] sm:max-w-none">{song.title}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-5 py-3 text-[var(--color-text-secondary)]">{song.artist || 'Unknown'}</td>
                      <td className="px-4 md:px-5 py-3 text-[var(--color-text-muted)] hidden md:table-cell">
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
                            className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-md hover:bg-[var(--color-bg-hover)] transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(song)}
                            className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 rounded-md hover:bg-red-500/[0.06] transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {songs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-[var(--color-text-muted)]">
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
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-1">Users</h1>
              <p className="text-sm text-[var(--color-text-muted)]">Registered accounts.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {users.length === 0 ? (
                <p className="col-span-full text-center py-10 text-[var(--color-text-muted)]">
                  No users found.
                </p>
              ) : (
                users.map((u) => (
                  <div
                    key={u.id}
                    className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl p-4 md:p-5 flex items-center gap-4 theme-transition"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-hover)] flex items-center justify-center text-[var(--color-text-secondary)]">
                      <User size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                        {u.name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] truncate">{u.email}</p>
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
              className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl p-6 w-full max-w-md theme-transition"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Edit Track</h3>
                <button
                  onClick={() => setEditingSong(null)}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] font-medium mb-1">Title</label>
                  <input
                    id="edit-song-title"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[#e05297]/40 theme-transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--color-text-muted)] font-medium mb-1">Artist</label>
                  <input
                    id="edit-song-artist"
                    type="text"
                    value={editArtist}
                    onChange={(e) => setEditArtist(e.target.value)}
                    className="w-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[#e05297]/40 theme-transition"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingSong(null)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  className="flex-1 py-2.5 bg-[var(--color-text-primary)] text-[var(--color-bg-base)] rounded-lg text-sm font-semibold hover:opacity-90 active:scale-95 transition-all theme-transition"
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

'use client';

import { useAuthStore } from '@/store/useAuthStore';
import Login from '@/components/Login';
import AdminDashboard from '@/components/admin/AdminDashboard';
import ListenerDashboard from '@/components/listener/ListenerDashboard';
import Landing from '@/components/Landing';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, role } = useAuthStore();
  const [hasDivedIn, setHasDivedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // Check localStorage for dive-in state
    const dived = localStorage.getItem('ws_has_dived_in') === 'true';
    setHasDivedIn(dived);
  }, []);

  const handleDiveIn = () => {
    localStorage.setItem('ws_has_dived_in', 'true');
    setHasDivedIn(true);
  };

  // Wait for hydration of dive-in state
  if (hasDivedIn === null) return null;

  // If authenticated, we always show the dashboard, skipping landing and login
  const showDashboard = isAuthenticated;
  
  // Decide which view to show
  let content;
  if (showDashboard) {
    content = role === 'admin' ? (
      <motion.div
        key="admin"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="h-screen h-[100dvh]"
      >
        <AdminDashboard />
      </motion.div>
    ) : (
      <motion.div
        key="listener"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="h-screen h-[100dvh]"
      >
        <ListenerDashboard />
      </motion.div>
    );
  } else if (!hasDivedIn) {
    content = (
      <motion.div
        key="landing"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Landing onDiveIn={handleDiveIn} />
      </motion.div>
    );
  } else {
    content = (
      <motion.div
        key="login"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Login />
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {content}
    </AnimatePresence>
  );
}


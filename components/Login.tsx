'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Lock, Mail, AlertCircle, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InputField from './InputField';
import AppLogo from './ui/AppLogo';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

export default function Login() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignup && !name)) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);
      if (isSignup) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const enteredName = name.trim();
        const role: 'admin' | 'listener' = email === 'piyushraj@petalmail.com' ? 'admin' : 'listener';

        await updateProfile(user, { displayName: enteredName });
        await setDoc(
          doc(db, 'users', user.uid),
          {
            uid: user.uid,
            email: user.email,
            name: enteredName,
            role,
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );

        setAuth({ isAuthenticated: true, role, uid: user.uid, user });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        let role: 'admin' | 'listener' = 'listener';
        if (userSnap.exists()) {
          const data = userSnap.data();
          role = data?.role === 'admin' ? 'admin' : 'listener';
        } else {
          role = email === 'piyushraj@petalmail.com' ? 'admin' : 'listener';
          await setDoc(
            userRef,
            {
              uid: user.uid,
              email: user.email,
              name: user.displayName || user.email?.split('@')[0] || 'User',
              role,
              createdAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
        setAuth({ isAuthenticated: true, role, uid: user.uid, user });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(getErrorMessage(err.code || 'unknown'));
      setIsLoading(false);
    }
  };


  if (!isMounted) return null;

  return (
    <div className="flex items-center justify-center min-h-screen min-h-[100dvh] bg-[#080a10] px-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#7c3aed]/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#e05297]/6 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <AppLogo size={32} />
          </div>

          <h2 className="text-xl font-bold text-center text-white mb-1">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-center text-slate-500 mb-6">
            {isSignup ? 'Sign up to start streaming' : 'Sign in to continue'}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                >
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {isSignup && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <InputField
                  id="signup-name"
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  icon={<User size={18} />}
                />
              </motion.div>
            )}

            <InputField
              id="login-email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<Mail size={18} />}
            />

            <InputField
              id="login-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<Lock size={18} />}
            />

            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-white text-black rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 active:bg-slate-300 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => { setIsSignup(!isSignup); setError(''); }}
              className="text-sm text-slate-500 hover:text-white transition-colors"
            >
              {isSignup
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

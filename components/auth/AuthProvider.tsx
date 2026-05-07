'use client';

import { useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import LoadingScreen from '../ui/LoadingScreen';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          let role: 'listener' | 'admin' = 'listener';
          if (userSnap.exists()) {
            const data = userSnap.data();
            role = data?.role === 'admin' ? 'admin' : 'listener';
          }

          setAuth({
            isAuthenticated: true,
            uid: firebaseUser.uid,
            user: firebaseUser,
            role,
            loading: false,
          });
        } catch (error) {
          console.error('Auth sync error:', error);
          setAuth({
            isAuthenticated: false,
            uid: null,
            user: null,
            role: null,
            loading: false,
          });
        }
      } else {
        setAuth({
          isAuthenticated: false,
          uid: null,
          user: null,
          role: null,
          loading: false,
        });
      }
    });

    return () => unsubscribe();
  }, [setAuth]);

  if (loading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}


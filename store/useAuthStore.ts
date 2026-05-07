import { create } from 'zustand';
import { auth } from '@/lib/firebase';
import { signOut, User } from 'firebase/auth';

interface AuthState {
  isAuthenticated: boolean;
  role: 'listener' | 'admin' | null;
  uid: string | null;
  loading: boolean;
  user: User | null;

  setAuth: (data: Partial<AuthState>) => void;
  logout: () => Promise<void>;
}


export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  role: null,
  uid: null,
  loading: true,
  user: null,

  setAuth: (data) => set((state) => ({ ...state, ...data })),

  logout: async () => {
    try {
      await signOut(auth);
      set({
        isAuthenticated: false,
        role: null,
        uid: null,
        loading: false,
        user: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
}));
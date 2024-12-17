import { create } from 'zustand';
import { auth, db } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: 'customer' | 'staff') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email: string, password: string, name: string, role: 'customer' | 'staff') => {
    try {
      set({ loading: true, error: null });
      
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      const userData: User = {
        id: firebaseUser.uid,
        email,
        name,
        role,
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      set({ user: userData });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ loading: true, error: null });
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/login',
        handleCodeInApp: false,
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  initialize: () => {
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          set({ 
            user: userDoc.data() as User, 
            loading: false,
            initialized: true 
          });
        }
      } else {
        set({ 
          user: null, 
          loading: false,
          initialized: true 
        });
      }
    });
  },
}));
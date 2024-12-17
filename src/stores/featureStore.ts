import { create } from 'zustand';
import { db, auth } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import type { Feature } from '@/types';
import { useAuthStore } from './authStore';

interface FeatureState {
  features: Feature[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  unsubscribe: (() => void) | null;
  initialize: () => void;
  cleanup: () => void;
  createFeature: (data: Omit<Feature, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => Promise<Feature>;
  updateFeature: (id: string, data: Partial<Feature>) => Promise<void>;
  deleteFeature: (id: string) => Promise<void>;
}

export const useFeatureStore = create<FeatureState>((set, get) => ({
  features: [],
  loading: false,
  initialized: false,
  error: null,
  unsubscribe: null,

  initialize: () => {
    const { user } = useAuthStore.getState();
    if (!user || get().initialized) return;

    const q = query(
      collection(db, 'features'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const features = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Feature[];

      set({ features, initialized: true });
    });

    set({ unsubscribe });
  },

  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null, initialized: false });
    }
  },

  createFeature: async (data) => {
    try {
      set({ loading: true, error: null });

      if (!auth.currentUser) {
        throw new Error('User must be authenticated to create a feature');
      }

      const featureData = {
        ...data,
        createdBy: auth.currentUser.uid,
        assignedTo: data.assignedTo || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const featureRef = await addDoc(collection(db, 'features'), featureData);

      const newFeature = {
        id: featureRef.id,
        ...featureData,
      };

      return newFeature;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateFeature: async (id, data) => {
    try {
      set({ loading: true, error: null });

      await updateDoc(doc(db, 'features', id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteFeature: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const { user } = useAuthStore.getState();
      if (!user || user.role !== 'staff') {
        throw new Error('Only staff members can delete features');
      }

      await deleteDoc(doc(db, 'features', id));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
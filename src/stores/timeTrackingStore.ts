import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, auth } from '@/lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  getDoc,
  doc,
  Timestamp,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import type { TimeTracking } from '@/types';

interface TimeTrackingState {
  activeTimer: TimeTracking | null;
  elapsedTime: number;
  isRunning: boolean;
  recentEntries: TimeTracking[];
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  startTimer: (featureId: string) => Promise<void>;
  stopTimer: (notes?: string) => Promise<void>;
  updateElapsedTime: () => void;
  fetchRecentEntries: () => Promise<void>;
  correctTimeEntry: (id: string, duration: number) => Promise<void>;
}

export const useTimeTrackingStore = create<TimeTrackingState>()(
  persist(
    (set, get) => ({
      activeTimer: null,
      elapsedTime: 0,
      isRunning: false,
      recentEntries: [],
      loading: false,
      error: null,

      initialize: async () => {
        const { activeTimer } = get();
        if (!activeTimer) return;

        try {
          const timerDoc = await getDoc(doc(db, 'timeTracking', activeTimer.id));
          if (!timerDoc.exists() || timerDoc.data()?.status !== 'running') {
            set({ activeTimer: null, isRunning: false, elapsedTime: 0 });
          }
        } catch (error) {
          set({ activeTimer: null, isRunning: false, elapsedTime: 0 });
        }
      },

      startTimer: async (featureId: string) => {
        try {
          set({ loading: true, error: null });

          if (!auth.currentUser) {
            throw new Error('User must be authenticated to start timer');
          }

          const timer: Partial<TimeTracking> = {
            featureId,
            userId: auth.currentUser.uid,
            startTime: Timestamp.now(),
            status: 'running',
          };

          const timerRef = await addDoc(collection(db, 'timeTracking'), timer);
          
          set({
            activeTimer: { 
              id: timerRef.id, 
              ...timer,
              startTime: timer.startTime.toDate()
            } as TimeTracking,
            isRunning: true,
            elapsedTime: 0,
          });

        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      stopTimer: async (notes?: string) => {
        const { activeTimer } = get();
        if (!activeTimer) return;

        try {
          set({ loading: true, error: null });

          const endTime = new Date();
          const duration = Math.floor((endTime.getTime() - activeTimer.startTime.getTime()) / 1000);

          await updateDoc(doc(db, 'timeTracking', activeTimer.id), {
            endTime,
            duration,
            notes,
            status: 'completed',
          });

          set({ activeTimer: null, isRunning: false, elapsedTime: 0 });
          await get().fetchRecentEntries();

        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      updateElapsedTime: () => {
        const { activeTimer, isRunning } = get();
        if (!activeTimer || !isRunning) return;
        
        const elapsed = Math.floor(
          (new Date().getTime() - activeTimer.startTime.getTime()) / 1000
        );
        set({ elapsedTime: elapsed });
      },

      fetchRecentEntries: async () => {
        if (!auth.currentUser) return;

        try {
          set({ loading: true, error: null });

          const q = query(
            collection(db, 'timeTracking'),
            where('userId', '==', auth.currentUser.uid),
            orderBy('startTime', 'desc')
          );

          const snapshot = await getDocs(q);
          const entries = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            startTime: doc.data().startTime.toDate(),
            endTime: doc.data().endTime?.toDate(),
          })) as TimeTracking[];

          set({ recentEntries: entries });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loading: false });
        }
      },

      correctTimeEntry: async (id: string, duration: number) => {
        try {
          set({ loading: true, error: null });

          await updateDoc(doc(db, 'timeTracking', id), {
            duration,
            corrected: true,
          });

          await get().fetchRecentEntries();
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'time-tracking-storage',
      partialize: (state) => ({
        activeTimer: state.activeTimer,
        isRunning: state.isRunning,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initialize();
        }
      },
    }
  )
);
import { create } from 'zustand';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import type { Company } from '@/types';
import { useAuthStore } from './authStore';

interface CompanyState {
  companies: Company[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  unsubscribe: (() => void) | null;
  initialize: () => void;
  cleanup: () => void;
  createCompany: (data: Omit<Company, 'id' | 'createdAt' | 'createdBy'>) => Promise<Company>;
  updateCompany: (id: string, data: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  loading: false,
  initialized: false,
  error: null,
  unsubscribe: null,

  initialize: () => {
    const { user } = useAuthStore.getState();
    if (!user || get().initialized) return;

    const q = query(
      collection(db, 'companies'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const companies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Company[];

      set({ companies, initialized: true });
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

  createCompany: async (data) => {
    try {
      set({ loading: true, error: null });
      const { user } = useAuthStore.getState();

      if (!user || user.role !== 'staff') {
        throw new Error('Only staff members can create companies');
      }

      const companyData = {
        ...data,
        createdAt: Timestamp.now(),
        createdBy: user.id,
      };

      const companyRef = await addDoc(collection(db, 'companies'), companyData);

      const newCompany = {
        id: companyRef.id,
        ...companyData,
        createdAt: companyData.createdAt.toDate(),
      };

      return newCompany;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateCompany: async (id, data) => {
    try {
      set({ loading: true, error: null });
      await updateDoc(doc(db, 'companies', id), {
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

  deleteCompany: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteDoc(doc(db, 'companies', id));
      set(state => ({
        companies: state.companies.filter(company => company.id !== id)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
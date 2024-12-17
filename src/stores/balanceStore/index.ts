import { create } from 'zustand';
import { doc, getDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '../authStore';
import { useCustomers } from '@/hooks/useCustomers';
import type { BalanceStore } from './types';
import { getBalanceQuery, getTimeEntriesQuery, mapBalanceDoc, mapTimeEntryDoc } from './queries';
import { createBalanceDoc, updateBalanceDoc, deleteBalanceDoc, logTransactionDocs, updateTimeEntryDoc } from './mutations';
import { validateStaffRole, validateBalance, validateTransaction } from './validation';

export const useBalanceStore = create<BalanceStore>((set, get) => ({
  balances: [],
  loading: false,
  error: null,
  initialized: false,
  unsubscribe: null,

  initialize: () => {
    const { user } = useAuthStore.getState();
    if (!user || get().initialized) return;

    const query = getBalanceQuery(user.id, user.role === 'staff');
    const unsubscribe = onSnapshot(query, (snapshot) => {
      const balances = snapshot.docs.map(mapBalanceDoc);
      set({ balances, initialized: true });
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

  createBalance: async (data) => {
    try {
      set({ loading: true, error: null });
      const { user } = useAuthStore.getState();
      validateStaffRole(user?.role);

      const balance = await createBalanceDoc(data, user!.id);

      // Send email notification
      // TODO: Implement email notifications
      // Temporarily disabled until email service is implemented
      // if (customer) {
      //   await sendEmailNotification(customer, 'balance-created', {
      //     balanceNumber: balance.balanceNumber,
      //     initialBalance: data.initialBalance,
      //     expiryDate: data.expiryDate,
      //   });
      // }

      return balance;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateBalance: async (id, data) => {
    try {
      set({ loading: true, error: null });
      await updateBalanceDoc(id, data);
      
      set(state => ({
        balances: state.balances.map(balance => 
          balance.id === id ? { ...balance, ...data } : balance
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteBalance: async (id) => {
    try {
      set({ loading: true, error: null });
      await deleteBalanceDoc(id);
      set(state => ({
        balances: state.balances.filter(balance => balance.id !== id)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deactivateBalance: async (id) => {
    await get().updateBalance(id, { status: 'inactive' });
  },

  reactivateBalance: async (id) => {
    await get().updateBalance(id, { status: 'active' });
  },

  getCustomerBalances: async (customerId) => {
    try {
      set({ loading: true, error: null });
      const query = getBalanceQuery(customerId, false);
      const snapshot = await query.get();
      const balances = snapshot.docs.map(mapBalanceDoc);
      set({ balances });
      return balances;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logTransaction: async (balanceId, entry) => {
    try {
      set({ loading: true, error: null });
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User must be authenticated to log transaction');
      
      const balanceDoc = await getDoc(doc(db, 'balances', balanceId));
      const balance = balanceDoc.exists() ? mapBalanceDoc(balanceDoc) : null;
      
      validateBalance(balance);
      validateTransaction(balance!, entry.amount);
      
      const newBalance = await logTransactionDocs(balanceId, balance!, entry, user.id);
      
      set(state => ({
        balances: state.balances.map(b => 
          b.id === balanceId 
            ? { ...b, currentBalance: newBalance }
            : b
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateTimeEntry: async (id: string, data: Partial<TimeEntry>) => {
    try {
      set({ loading: true, error: null });
      await updateTimeEntryDoc(id, data);
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getTimeEntries: async (balanceId) => {
    try {
      set({ loading: true, error: null });
      const snapshot = await getDocs(getTimeEntriesQuery(balanceId));
      return snapshot.docs.map(mapTimeEntryDoc);
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
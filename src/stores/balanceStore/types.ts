import type { Balance, TimeEntry } from '@/types';

export interface BalanceState {
  balances: Balance[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  unsubscribe: (() => void) | null;
}

export interface BalanceActions {
  initialize: () => void;
  cleanup: () => void;
  createBalance: (data: Omit<Balance, 'id' | 'createdBy' | 'status'>) => Promise<Balance>;
  updateBalance: (id: string, data: Partial<Balance>) => Promise<void>;
  deleteBalance: (id: string) => Promise<void>;
  deactivateBalance: (id: string) => Promise<void>;
  reactivateBalance: (id: string) => Promise<void>;
  getCustomerBalances: (customerId: string) => Promise<Balance[]>;
  logTransaction: (balanceId: string, entry: Omit<TimeEntry, 'id' | 'balanceId' | 'createdAt' | 'createdBy'>) => Promise<void>;
  updateTimeEntry: (id: string, data: Partial<TimeEntry>) => Promise<void>;
  getTimeEntries: (balanceId: string) => Promise<TimeEntry[]>;
}

export type BalanceStore = BalanceState & BalanceActions;
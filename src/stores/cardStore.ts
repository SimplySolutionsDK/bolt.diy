@@ .. @@
-import type { PrepaidCard, TimeEntry } from '@/types';
-import { generateCardNumber } from '@/utils/cardUtils';
+import type { Balance, TimeEntry } from '@/types';
+import { generateBalanceNumber } from '@/utils/balanceUtils';
 import { useAuthStore } from './authStore';
 import { sendEmailNotification } from '@/services/emailService';
 import { useCustomers } from '@/hooks/useCustomers';

-interface CardState {
-  cards: PrepaidCard[];
+interface BalanceState {
+  balances: Balance[];
   loading: boolean;
   error: string | null;
   initialized: boolean;
   unsubscribe: (() => void) | null;
   initialize: () => void;
   cleanup: () => void;
-  createCard: (data: Omit<PrepaidCard, 'id' | 'createdBy' | 'status'>) => Promise<PrepaidCard>;
-  updateCard: (id: string, data: Partial<PrepaidCard>) => Promise<void>;
-  deleteCard: (id: string) => Promise<void>;
-  deactivateCard: (id: string) => Promise<void>;
-  reactivateCard: (id: string) => Promise<void>;
-  getCustomerCards: (customerId: string) => Promise<PrepaidCard[]>;
-  logTime: (cardId: string, entry: Omit<TimeEntry, 'id' | 'cardId' | 'createdAt' | 'createdBy'>) => Promise<void>;
+  createBalance: (data: Omit<Balance, 'id' | 'createdBy' | 'status'>) => Promise<Balance>;
+  updateBalance: (id: string, data: Partial<Balance>) => Promise<void>;
+  deleteBalance: (id: string) => Promise<void>;
+  deactivateBalance: (id: string) => Promise<void>;
+  reactivateBalance: (id: string) => Promise<void>;
+  getCustomerBalances: (customerId: string) => Promise<Balance[]>;
+  logTransaction: (balanceId: string, entry: Omit<TimeEntry, 'id' | 'balanceId' | 'createdAt' | 'createdBy'>) => Promise<void>;
   getTimeEntries: (balanceId: string) => Promise<TimeEntry[]>;
 }

-export const useCardStore = create<CardState>((set, get) => ({
-  cards: [],
+export const useBalanceStore = create<BalanceState>((set, get) => ({
+  balances: [],
   loading: false,
   initialized: false,
   error: null,
   unsubscribe: null,

   initialize: () => {
     const { user } = useAuthStore.getState();
     if (!user || get().initialized) return;

     const q = user.role === 'staff'
-      ? query(collection(db, 'cards'), orderBy('createdAt', 'desc'))
+      ? query(collection(db, 'balances'), orderBy('createdAt', 'desc'))
       : query(
-          collection(db, 'cards'),
+          collection(db, 'balances'),
           where('customerId', '==', user.id),
           orderBy('createdAt', 'desc')
         );

     const unsubscribe = onSnapshot(q, (snapshot) => {
-      const cards = snapshot.docs.map(doc => ({
+      const balances = snapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data(),
         createdAt: doc.data().createdAt?.toDate(),
         expiryDate: doc.data().expiryDate?.toDate(),
-      })) as PrepaidCard[];
+      })) as Balance[];

-      set({ cards, initialized: true });
+      set({ balances, initialized: true });
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

-  createCard: async (data) => {
+  createBalance: async (data) => {
     try {
       set({ loading: true, error: null });
       const { user } = useAuthStore.getState();

       if (!user || user.role !== 'staff') {
-        throw new Error('Only staff members can create cards');
+        throw new Error('Only staff members can create balances');
       }

-      const cardNumber = await generateCardNumber();
+      const balanceNumber = await generateBalanceNumber();

-      const cardData = {
+      const balanceData = {
         ...data,
-        cardNumber,
+        balanceNumber,
         status: 'active' as const,
-        remainingHours: data.totalHours,
+        currentBalance: data.initialBalance,
         createdAt: Timestamp.now(),
         createdBy: user.id,
         expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
-        remainingHoursPercentage: 100,
       };

-      const cardRef = await addDoc(collection(db, 'cards'), cardData);
+      const balanceRef = await addDoc(collection(db, 'balances'), balanceData);

-      const newCard = {
-        id: cardRef.id,
-        ...cardData,
+      const newBalance = {
+        id: balanceRef.id,
+        ...balanceData,
       };

       // Send email notification to customer
       const { customers } = useCustomers.getState();
       const customer = customers.find(c => c.id === data.customerId);
       if (customer) {
-        await sendEmailNotification(customer, 'card-created', {
-          cardNumber: cardNumber,
-          totalHours: data.totalHours,
+        await sendEmailNotification(customer, 'balance-created', {
+          balanceNumber: balanceNumber,
+          initialBalance: data.initialBalance,
           expiryDate: data.expiryDate,
         });
       }

-      return newCard;
+      return newBalance;
     } catch (error) {
       set({ error: (error as Error).message });
       throw error;
     } finally {
       set({ loading: false });
     }
   },

-  updateCard: async (id, data) => {
+  updateBalance: async (id, data) => {
     try {
       set({ loading: true, error: null });
-      await updateDoc(doc(db, 'cards', id), {
+      await updateDoc(doc(db, 'balances', id), {
         ...data,
         updatedAt: Timestamp.now(),
       });
       
       set(state => ({
-        cards: state.cards.map(card => 
-          card.id === id ? { ...card, ...data } : card
+        balances: state.balances.map(balance => 
+          balance.id === id ? { ...balance, ...data } : balance
         ),
       }));
     } catch (error) {
       set({ error: (error as Error).message });
       throw error;
     } finally {
       set({ loading: false });
     }
   },

-  deleteCard: async (id: string) => {
+  deleteBalance: async (id: string) => {
     try {
       set({ loading: true, error: null });
-      await deleteDoc(doc(db, 'cards', id));
+      await deleteDoc(doc(db, 'balances', id));
       set(state => ({
-        cards: state.cards.filter(card => card.id !== id)
+        balances: state.balances.filter(balance => balance.id !== id)
       }));
     } catch (error) {
       set({ error: (error as Error).message });
       throw error;
     } finally {
       set({ loading: false });
     }
   },

-  deactivateCard: async (id) => {
-    await get().updateCard(id, { status: 'inactive' });
+  deactivateBalance: async (id) => {
+    await get().updateBalance(id, { status: 'inactive' });
   },

-  reactivateCard: async (id) => {
-    await get().updateCard(id, { status: 'active' });
+  reactivateBalance: async (id) => {
+    await get().updateBalance(id, { status: 'active' });
   },

-  getCustomerCards: async (customerId) => {
+  getCustomerBalances: async (customerId) => {
     try {
       set({ loading: true, error: null });
       const q = query(
-        collection(db, 'cards'),
+        collection(db, 'balances'),
         where('customerId', '==', customerId),
         orderBy('createdAt', 'desc')
       );
       
       const snapshot = await getDocs(q);
-      const cards = snapshot.docs.map(doc => ({
+      const balances = snapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data(),
-      })) as PrepaidCard[];
+      })) as Balance[];

-      set({ cards });
-      return cards;
+      set({ balances });
+      return balances;
     } catch (error) {
       set({ error: (error as Error).message });
       throw error;
     } finally {
       set({ loading: false });
     }
   },

-  logTime: async (cardId, entry) => {
+  logTransaction: async (balanceId, entry) => {
     try {
       set({ loading: true, error: null });
       
       if (!auth.currentUser) {
-        throw new Error('User must be authenticated to log time');
+        throw new Error('User must be authenticated to log transaction');
       }
       
-      const cardRef = doc(db, 'cards', cardId);
-      const cardDoc = await getDoc(cardRef);
+      const balanceRef = doc(db, 'balances', balanceId);
+      const balanceDoc = await getDoc(balanceRef);
       
-      if (!cardDoc.exists()) {
-        throw new Error('Card not found');
+      if (!balanceDoc.exists()) {
+        throw new Error('Balance not found');
       }
       
-      const card = cardDoc.data() as PrepaidCard;
+      const balance = balanceDoc.data() as Balance;
       
-      if (card.status !== 'active') {
-        throw new Error('Card is inactive');
+      if (balance.status !== 'active') {
+        throw new Error('Balance is inactive');
       }
       
-      if (card.remainingHours < entry.hoursDeducted) {
-        throw new Error('Insufficient hours remaining');
+      const newBalance = balance.currentBalance - entry.amount;
+      if (balance.type === 'hours' && newBalance < 0) {
+        throw new Error('Insufficient balance');
       }
       
       const batch = writeBatch(db);
       
       // Create time entry
       const entryRef = doc(collection(db, 'timeEntries'));
       batch.set(entryRef, {
         ...entry,
-        cardId,
+        balanceId,
         createdAt: Timestamp.now(),
         createdBy: auth.currentUser?.uid,
       });
       
-      // Update card balance
-      batch.update(cardRef, {
-        remainingHours: card.remainingHours - entry.hoursDeducted,
+      // Update balance
+      batch.update(balanceRef, {
+        currentBalance: newBalance,
         updatedAt: Timestamp.now(),
       });
       
       await batch.commit();
       
       // Update local state
       set(state => ({
-        cards: state.cards.map(c => 
-          c.id === cardId 
-            ? { ...c, remainingHours: c.remainingHours - entry.hoursDeducted }
-            : c
+        balances: state.balances.map(b => 
+          b.id === balanceId 
+            ? { ...b, currentBalance: newBalance }
+            : b
         ),
       }));
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
       const q = query(
         collection(db, 'timeEntries'),
-        where('cardId', '==', balanceId),
+        where('balanceId', '==', balanceId),
         orderBy('serviceDate', 'desc')
       );
       
       const snapshot = await getDocs(q);
       return snapshot.docs.map(doc => ({
         id: doc.id,
         ...doc.data(),
         serviceDate: doc.data().serviceDate instanceof Timestamp ? doc.data().serviceDate.toDate() : new Date(doc.data().serviceDate),
         createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
       })) as TimeEntry[];
     } catch (error) {
       set({ error: (error as Error).message });
       throw error;
     } finally {
       set({ loading: false });
     }
   },
}));
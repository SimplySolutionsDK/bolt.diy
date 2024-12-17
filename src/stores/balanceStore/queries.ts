import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Balance, TimeEntry } from '@/types';

export const getBalanceQuery = (userId: string, isStaff: boolean) =>
  isStaff
    ? query(collection(db, 'balances'), orderBy('createdAt', 'desc'))
    : query(
        collection(db, 'balances'),
        where('customerId', '==', userId),
        orderBy('createdAt', 'desc')
      );

export const getTimeEntriesQuery = (balanceId: string) =>
  query(
    collection(db, 'timeEntries'),
    where('balanceId', '==', balanceId),
    orderBy('serviceDate', 'desc')
  );

export const mapBalanceDoc = (doc: any): Balance => ({
  id: doc.id,
  ...doc.data(),
  createdAt: doc.data().createdAt?.toDate(),
  expiryDate: doc.data().expiryDate?.toDate(),
});

export const mapTimeEntryDoc = (doc: any): TimeEntry => ({
  id: doc.id,
  ...doc.data(),
  serviceDate: doc.data().serviceDate instanceof Timestamp 
    ? doc.data().serviceDate.toDate() 
    : new Date(doc.data().serviceDate),
  createdAt: doc.data().createdAt instanceof Timestamp 
    ? doc.data().createdAt.toDate() 
    : new Date(doc.data().createdAt)
});
import { collection, doc, addDoc, updateDoc, deleteDoc, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Balance, TimeEntry } from '@/types';
import { generateBalanceNumber } from '@/utils/balanceUtils';
import { sendEmailNotification } from '@/services/emailService';

export async function createBalanceDoc(data: Partial<Balance>, userId: string) {
  const balanceNumber = await generateBalanceNumber();
  
  const balanceData = {
    ...data,
    balanceNumber,
    status: 'active' as const,
    currentBalance: data.initialBalance,
    createdAt: Timestamp.now(),
    createdBy: userId,
    expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
  };

  const balanceRef = await addDoc(collection(db, 'balances'), balanceData);
  
  return {
    id: balanceRef.id,
    ...balanceData,
  };
}

export async function updateBalanceDoc(id: string, data: Partial<Balance>) {
  await updateDoc(doc(db, 'balances', id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteBalanceDoc(id: string) {
  await deleteDoc(doc(db, 'balances', id));
}

export async function updateTimeEntryDoc(id: string, data: Partial<TimeEntry>) {
  await updateDoc(doc(db, 'timeEntries', id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function logTransactionDocs(
  balanceId: string, 
  balance: Balance,
  entry: Partial<TimeEntry>,
  userId: string
) {
  const batch = writeBatch(db);
  const newBalance = balance.currentBalance - (entry.amount || 0);
  
  // Map description to notes field
  const { description, ...restEntry } = entry;
  const timeEntryData = {
    ...restEntry,
    notes: description,  // Map description to notes
    balanceId,
    createdAt: Timestamp.now(),
    createdBy: userId,
  };

  // Create time entry
  const entryRef = doc(collection(db, 'timeEntries'));
  batch.set(entryRef, timeEntryData);

  // Update balance
  batch.update(doc(db, 'balances', balanceId), {
    currentBalance: newBalance,
    updatedAt: Timestamp.now(),
  });

  await batch.commit();
  
  return newBalance;
}
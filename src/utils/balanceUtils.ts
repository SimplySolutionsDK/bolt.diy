import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { TrendingDown, TrendingUp, Plus, Minus, type LucideIcon } from 'lucide-react';
import type { Balance } from '@/types';

export async function generateBalanceNumber(): Promise<string> {
  const prefix = 'BAL'; // Balance
  const length = 8;
  let isUnique = false;
  let balanceNumber = '';
  
  while (!isUnique) {
    // Generate random number
    const randomNum = Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
    
    balanceNumber = `${prefix}${randomNum}`;
    
    // Check if number exists
    const q = query(
      collection(db, 'balances'),
      where('balanceNumber', '==', balanceNumber)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      isUnique = true;
    }
  }
  
  return balanceNumber;
}

export function formatBalance(amount: number, type: 'hours' | 'credits'): string {
  if (type === 'hours') {
    const absAmount = Math.abs(amount);
    const hours = Math.floor(absAmount);
    const minutes = Math.round((absAmount - hours) * 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  return `${amount.toFixed(2)} credits`;
}

export function getBalanceIcon(amount: number): LucideIcon {
  if (amount > 0) {
    return Plus;
  }
  return Minus;
}

export function formatBalanceWithType(balance: Balance): string {
  return formatBalance(balance.currentBalance, balance.type);
}

export function formatBalanceNumber(balanceNumber: string): string {
  // Format as BAL-XXXXXXXX
  return `${balanceNumber.slice(0, 3)}-${balanceNumber.slice(3)}`;
}

export function getBalanceStatus(balance: Balance): {
  label: string;
  color: 'green' | 'yellow' | 'red' | 'gray';
} {
  if (balance.status === 'inactive') {
    return { label: 'Inactive', color: 'gray' };
  }
  
  const balancePercentage = (balance.currentBalance / balance.initialBalance) * 100;
  
  if (balancePercentage <= 20) {
    return { label: 'Low Balance', color: 'red' };
  }
  
  if (balancePercentage <= 50) {
    return { label: 'Medium Balance', color: 'yellow' };
  }
  
  return { label: 'Good Balance', color: 'green' };
}
import type { Balance } from '@/types';

export function validateStaffRole(role?: string) {
  if (role !== 'staff') {
    throw new Error('Only staff members can perform this action');
  }
}

export function validateBalance(balance: Balance | null) {
  if (!balance) {
    throw new Error('Balance not found');
  }

  if (balance.status !== 'active') {
    throw new Error('Balance is inactive');
  }
}

export function validateTransaction(balance: Balance, amount: number) {
  const newBalance = balance.currentBalance - amount;
  return newBalance;
}
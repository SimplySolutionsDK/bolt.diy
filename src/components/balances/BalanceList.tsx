import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { CreditCard, Clock, Calendar, AlertCircle, Trash2, Plus, Minus } from 'lucide-react';
import type { Balance } from '@/types';
import { formatBalanceNumber, getBalanceStatus, formatBalance } from '@/utils/balanceUtils';
import { cn } from '@/utils/cn';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { useCustomers } from '@/hooks/useCustomers';
import DeleteDialog from '@/components/ui/DeleteDialog';
import { useBalanceStore } from '@/stores/balanceStore';
import { useAuthStore } from '@/stores/authStore';

interface BalanceListProps {
  balances: Balance[];
  onBalanceClick?: (balance: Balance) => void;
  loading?: boolean;
}

export default function BalanceList({ balances, onBalanceClick, loading }: BalanceListProps) {
  const { customers } = useCustomers();
  const { language } = useLanguage();
  const { user } = useAuthStore();
  const isStaff = user?.role === 'staff';
  const { deleteBalance } = useBalanceStore();
  const [balanceToDelete, setBalanceToDelete] = React.useState<Balance | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const t = translations[language].balances;
  
  const groupedBalances = useMemo(() => {
    const groups = new Map();
    
    balances.forEach(balance => {
      const customer = customers.find(c => c.id === balance.customerId);
      if (!customer) return;
      
      if (!groups.has(balance.customerId)) {
        groups.set(balance.customerId, {
          customer,
          balances: []
        });
      }
      
      groups.get(balance.customerId).balances.push(balance);
    });
    
    return Array.from(groups.values())
      .sort((a, b) => a.customer.name.localeCompare(b.customer.name));
  }, [balances, customers]);
  
  const handleDelete = async () => {
    if (!balanceToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteBalance(balanceToDelete.id);
    } finally {
      setIsDeleting(false);
      setBalanceToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-gray-700 rounded-lg h-32 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (balances.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {t.noBalances}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t.createPrompt}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedBalances.map(({ customer, balances }, groupIndex) => (
        <div key={customer.id} className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            {customer.name}
          </h3>
          <div className="space-y-4">
            {balances.map((balance, index) => {
              const status = getBalanceStatus(balance);
              const isLowBalance = (balance.currentBalance / balance.initialBalance) <= 0.2;
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (groupIndex * balances.length + index) * 0.05 }}
                  key={balance.id}
                  className={cn(
                    "bg-white dark:bg-gray-800 rounded-lg shadow p-6",
                    "cursor-pointer",
                    "hover:shadow-md transition-all",
                    "border border-transparent hover:border-blue-500/20"
                  )}
                  onClick={() => onBalanceClick?.(balance)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          {formatBalanceNumber(balance.balanceNumber)}
                        </p>
                        <div className={cn(
                          "flex items-center gap-2 mt-1 p-2 rounded-md",
                          balance.currentBalance > 0 
                            ? "bg-green-50 dark:bg-green-900/20" 
                            : "bg-red-50 dark:bg-red-900/20"
                        )}>
                          {balance.currentBalance < 0 && (
                            <Minus className="w-4 h-4 text-red-500" />
                          )}
                          <h3 className={cn(
                            "text-lg font-semibold",
                            balance.currentBalance > 0 
                              ? "text-green-700 dark:text-green-300"
                              : "text-red-700 dark:text-red-300"
                          )}> 
                            {formatBalance(balance.currentBalance, balance.type)}
                          </h3>
                          {balance.currentBalance > 0 && (
                            <Plus className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full transition-colors',
                        status.color === 'green'
                          ? 'bg-green-100 text-green-800'
                          : status.color === 'yellow'
                          ? 'bg-yellow-100 text-yellow-800'
                          : status.color === 'red'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {formatBalance(balance.initialBalance, balance.type)} {t[`${balance.type}Total`]}
                    </div>
                    {balance.expiryDate && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {t.expires} {format(balance.expiryDate, 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                  
                  {isLowBalance && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>{t.lowBalance}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <div className="flex items-center gap-2">
                      {isStaff && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBalanceToDelete(balance);
                        }}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          "text-gray-400 hover:text-red-500",
                          "hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
      
      {isStaff && <DeleteDialog
        isOpen={!!balanceToDelete}
        onClose={() => setBalanceToDelete(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title={t.delete}
        description={t.deleteConfirm.replace('{balanceNumber}', balanceToDelete?.balanceNumber || '')}
      />}
    </div>
  );
}
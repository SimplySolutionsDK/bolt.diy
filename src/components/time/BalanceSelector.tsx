import React, { useMemo } from 'react';
import { CreditCard, Plus, Minus } from 'lucide-react';
import type { Balance } from '@/types';
import { formatBalanceNumber, formatBalance } from '@/utils/balanceUtils';
import Input from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { useCustomers } from '@/hooks/useCustomers';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { useAuthStore } from '@/stores/authStore';

interface BalanceSelectorProps {
  balances: Balance[];
  selectedBalanceId: string | null;
  onSelect: (balanceId: string) => void;
  loading?: boolean;
}

export default function BalanceSelector({
  balances,
  selectedBalanceId,
  onSelect,
  loading
}: BalanceSelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { customers } = useCustomers();
  const { language } = useLanguage();
  const { user } = useAuthStore();
  const t = translations[language].time;
  const isMobile = window.innerWidth < 768;
  
  const groupedBalances = useMemo(() => {
    const groups = new Map();
    
    // Filter balances based on user role
    let filteredBalances = user?.role === 'staff' 
      ? balances 
      : balances.filter(balance => balance.customerId === user?.id);
      
    // Apply search filter
    if (searchQuery) {
      filteredBalances = filteredBalances.filter(balance => {
        const customer = customers.find(c => c.id === balance.customerId);
        return customer?.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    filteredBalances.forEach(balance => {
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
  }, [balances, customers, user, searchQuery]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-gray-700 rounded-lg h-24 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (balances.length === 0) {
    return (
      <div className="text-center py-8">
        <CreditCard className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {t.noActiveBalances}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t.createBalancePrompt}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Input
          placeholder="Search by customer name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-64"
        />
      </div>
      <div className={cn(
        "space-y-6",
        isMobile && selectedBalanceId ? "hidden" : "block",
        !isMobile && "max-h-[600px] overflow-y-auto"
      )}>
        {groupedBalances.map(({ customer, balances }, groupIndex) => (
          <div key={customer.id} className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {customer.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {balances.map((balance, index) => (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: (groupIndex * balances.length + index) * 0.05,
                    duration: 0.2
                  }}
                  key={balance.id}
                  onClick={() => onSelect(balance.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg transition-all",
                    "hover:bg-gray-50 dark:hover:bg-gray-700",
                    "border-2",
                    selectedBalanceId === balance.id
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                      : "border-transparent"
                  )}
                >
                  <div className="flex items-center justify-between">
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
                        <p className={cn(
                          "font-medium",
                          balance.currentBalance > 0 
                            ? "text-green-700 dark:text-green-300"
                            : "text-red-700 dark:text-red-300"
                        )}>
                          {formatBalance(balance.currentBalance, balance.type)}
                        </p>
                        {balance.currentBalance > 0 && (
                          <Plus className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    <CreditCard 
                      className={cn(
                        "w-5 h-5",
                        selectedBalanceId === balance.id
                          ? "text-blue-500"
                          : "text-gray-400"
                      )}
                    />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
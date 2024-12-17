import React, { useMemo } from 'react';
import { CreditCard } from 'lucide-react';
import type { PrepaidCard } from '@/types';
import { formatCardNumber } from '@/utils/cardUtils';
import { formatHoursToTime } from '@/utils/timeUtils';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { useCustomers } from '@/hooks/useCustomers';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { useAuthStore } from '@/stores/authStore';

interface CardSelectorProps {
  cards: PrepaidCard[];
  selectedCardId: string | null;
  onSelect: (cardId: string) => void;
  loading?: boolean;
}

export default function CardSelector({
  cards,
  selectedCardId,
  onSelect,
  loading
}: CardSelectorProps) {
  const { customers } = useCustomers();
  const { language } = useLanguage();
  const { user } = useAuthStore();
  const t = translations[language].time;
  
  const groupedCards = useMemo(() => {
    const groups = new Map();
    
    // Filter cards based on user role
    const filteredCards = user?.role === 'staff' 
      ? cards 
      : cards.filter(card => card.customerId === user?.id);

    filteredCards.forEach(card => {
      const customer = customers.find(c => c.id === card.customerId);
      if (!customer) return;
      
      if (!groups.has(card.customerId)) {
        groups.set(card.customerId, {
          customer,
          cards: []
        });
      }
      
      groups.get(card.customerId).cards.push(card);
    });
    
    return Array.from(groups.values())
      .sort((a, b) => a.customer.name.localeCompare(b.customer.name));
  }, [cards, customers, user]);

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

  if (cards.length === 0) {
    return (
      <div className="text-center py-8">
        <CreditCard className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {t.noActiveCards}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t.createCardPrompt}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        {t.selectCard}
      </h2>
      <div className="space-y-6">
        {groupedCards.map(({ customer, cards }, groupIndex) => (
          <div key={customer.id} className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {customer.name}
            </h3>
            <div className="space-y-2">
              {cards.map((card, index) => (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: (groupIndex * cards.length + index) * 0.05,
                    duration: 0.2
                  }}
                  key={card.id}
                  onClick={() => onSelect(card.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg transition-all",
                    "hover:bg-gray-50 dark:hover:bg-gray-700",
                    "border-2",
                    selectedCardId === card.id
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                      : "border-transparent"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        {formatCardNumber(card.cardNumber)}
                      </p>
                      <p className="mt-1 font-medium">
                        {formatHoursToTime(card.remainingHours)} {t.hoursRemaining}
                      </p>
                    </div>
                    <CreditCard 
                      className={cn(
                        "w-5 h-5",
                        selectedCardId === card.id
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
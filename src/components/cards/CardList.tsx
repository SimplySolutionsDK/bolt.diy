import React, { useMemo } from 'react';
import { format, isAfter } from 'date-fns';
import { CreditCard, Clock, Calendar, AlertCircle, Trash2 } from 'lucide-react';
import type { PrepaidCard } from '@/types';
import { formatCardNumber, getCardStatus } from '@/utils/cardUtils';
import { formatHoursToTime } from '@/utils/timeUtils';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { useCustomers } from '@/hooks/useCustomers';
import DeleteDialog from '@/components/ui/DeleteDialog';
import { useCardStore } from '@/stores/cardStore';
import { useAuthStore } from '@/stores/authStore';

interface CardListProps {
  cards: PrepaidCard[];
  onCardClick?: (card: PrepaidCard) => void;
  loading?: boolean;
}

export default function CardList({ cards, onCardClick, loading }: CardListProps) {
  const { customers } = useCustomers();
  const { language } = useLanguage();
  const { user } = useAuthStore();
  const isStaff = user?.role === 'staff';
  const { deleteCard } = useCardStore();
  const [cardToDelete, setCardToDelete] = React.useState<PrepaidCard | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const t = translations[language].cards;
  
  const groupedCards = useMemo(() => {
    const groups = new Map();
    
    cards.forEach(card => {
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
  }, [cards, customers]);
  
  const handleDelete = async () => {
    if (!cardToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteCard(cardToDelete.id);
    } finally {
      setIsDeleting(false);
      setCardToDelete(null);
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

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {t.noCards}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t.createPrompt}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedCards.map(({ customer, cards }, groupIndex) => (
        <div key={customer.id} className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            {customer.name}
          </h3>
          <div className="space-y-4">
            {cards.map((card, index) => {
              const status = getCardStatus(card);
              const isExpired = card.expiryDate && isAfter(new Date(), card.expiryDate);
              const isLowBalance = (card.remainingHours / card.totalHours) <= 0.2;
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (groupIndex * cards.length + index) * 0.05 }}
                  key={card.id}
                  className={cn(
                    "bg-white dark:bg-gray-800 rounded-lg shadow p-6",
                    "cursor-pointer",
                    "hover:shadow-md transition-all",
                    "border border-transparent hover:border-blue-500/20"
                  )}
                  onClick={() => onCardClick?.(card)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          {formatCardNumber(card.cardNumber)}
                        </p>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {formatHoursToTime(card.remainingHours)} {translations[language].time.hoursRemaining}
                        </h3>
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
                      {formatHoursToTime(card.totalHours)} {t.totalHours}
                    </div>
                    {card.expiryDate && (
                      <div className={cn(
                        "flex items-center",
                        isExpired && "text-red-500 dark:text-red-400"
                      )}>
                        <Calendar className="w-4 h-4 mr-2" />
                        {t.expires} {format(card.expiryDate, 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                  
                  {(isLowBalance || isExpired) && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>
                        {isExpired 
                          ? t.expired
                          : t.lowBalance}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <div className="flex items-center gap-2">
                      {isStaff && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCardToDelete(card);
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
        isOpen={!!cardToDelete}
        onClose={() => setCardToDelete(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Card"
        description={`Are you sure you want to delete card ${cardToDelete?.cardNumber}? This action cannot be undone.`}
      />}
    </div>
  );
}
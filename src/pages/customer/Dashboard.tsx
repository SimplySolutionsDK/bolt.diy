import React from 'react';
import { Clock, Users, CreditCard, Lightbulb } from 'lucide-react';
import { useCardStore } from '@/stores/cardStore';
import { useFeatureStore } from '@/stores/featureStore';
import { useCustomers } from '@/hooks/useCustomers';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import CustomerCompanySelector from '@/components/companies/CustomerCompanySelector';
import UnreadMessagesOverview from '@/components/features/UnreadMessagesOverview';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';

export default function CustomerDashboard() {
  const { cards, initialize: initializeCards } = useCardStore();
  const { features, initialize: initializeFeatures } = useFeatureStore();
  const { language } = useLanguage();
  const t = translations[language].features;

  React.useEffect(() => {
    initializeCards();
    initializeFeatures();
  }, [initializeCards, initializeFeatures]);

  const stats = [
    {
      title: 'Active Cards',
      value: cards.filter(card => card.status === 'active').length,
      icon: CreditCard,
      color: 'text-blue-500',
    },
    {
      title: 'Active Features',
      value: features.filter(feature => feature.status === 'in_progress').length,
      icon: Lightbulb,
      color: 'text-yellow-500',
    },
    {
      title: 'Total Hours',
      value: cards.reduce((total, card) => total + card.remainingHours, 0).toFixed(1),
      icon: Clock,
      color: 'text-green-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Customer Dashboard
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </p>
              </div>
              <div className={cn(
                "p-3 rounded-lg bg-gray-50 dark:bg-gray-700",
                stat.color
              )}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <CustomerCompanySelector />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          {t.title}
        </h2>
        <UnreadMessagesOverview />
      </div>
    </div>
  );
}
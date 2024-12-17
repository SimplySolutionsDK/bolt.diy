import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import type { StatItem } from '@/types/dashboard';

interface DashboardStatsProps {
  stats: StatItem[];
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const { language } = useLanguage();
  const t = translations[language].nav;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                {t[stat.title]}
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
  );
}
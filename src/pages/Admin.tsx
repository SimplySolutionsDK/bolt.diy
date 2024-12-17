import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

const adminFeatures = [
  {
    title: 'Companies',
    description: 'Manage company profiles and their associated users',
    icon: Building2,
    path: '/companies',
    color: 'bg-blue-500',
  },
  {
    title: 'Users',
    description: 'View and manage user accounts and permissions',
    icon: Users,
    path: '/users',
    color: 'bg-green-500'
  },
  {
    title: 'System Settings',
    description: 'Configure global system settings and preferences',
    icon: Settings,
    path: '/settings/system',
    color: 'bg-purple-500',
    comingSoon: true,
  },
];

export default function Admin() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Admin Dashboard
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "relative group cursor-pointer",
              feature.comingSoon && "opacity-60 cursor-not-allowed"
            )}
            onClick={() => !feature.comingSoon && navigate(feature.path)}
          >
            <div className={cn(
              "absolute inset-0.5 rounded-2xl blur opacity-75 group-hover:opacity-100 transition",
              feature.color
            )} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 h-full border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-lg",
                  "bg-gradient-to-br from-white/90 to-white/50",
                  "dark:from-gray-800/90 dark:to-gray-800/50"
                )}>
                  <feature.icon className={cn(
                    "w-6 h-6",
                    feature.color.replace('bg-', 'text-')
                  )} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {feature.title}
                  </h2>
                  {feature.comingSoon && (
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
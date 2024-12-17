import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Clock } from 'lucide-react';
import UnreadMessagesOverview from '@/components/features/UnreadMessagesOverview';
import { useFeatureStore } from '@/stores/featureStore';

export default function Home() {
  const { user } = useAuthStore();
  const { initialize, cleanup } = useFeatureStore();

  React.useEffect(() => {
    if (user?.role === 'staff') {
      initialize();
      return () => cleanup();
    }
  }, [user, initialize, cleanup]);

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-blue-600" />
        <h1 className="mt-6 text-4xl font-bold text-gray-900 dark:text-gray-100">
          Welcome to Hours Tracker
        </h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
          {user ? `Welcome back, ${user.name}!` : 'Track your prepaid hours with ease'}
        </p>
      </div>

      {user?.role === 'staff' ? (
        <div className="mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Features with Unread Messages
            </h2>
            <UnreadMessagesOverview />
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Start
            </h2>
            <ul className="space-y-4 text-gray-600 dark:text-gray-400">
              <li>• View and manage prepaid hour cards</li>
              <li>• Track time usage and history</li>
              <li>• Generate detailed reports</li>
              <li>• Configure notification preferences</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Getting Started
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Navigate using the menu to access different features:
            </p>
            <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
              <li>• Cards - Manage prepaid hour cards</li>
              <li>• Time - Log and track time usage</li>
              <li>• Settings - Configure your preferences</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
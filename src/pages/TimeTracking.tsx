import React from 'react';
import TimeTracker from '@/components/time-tracking/TimeTracker';
import RecentEntries from '@/components/time-tracking/RecentEntries';

export default function TimeTracking() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Time Tracking
      </h1>

      <TimeTracker />
      <RecentEntries />
    </div>
  );
}
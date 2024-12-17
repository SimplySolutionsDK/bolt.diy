import React from 'react';
import { format } from 'date-fns';
import { Clock, User, Calendar } from 'lucide-react';
import type { TimeEntry } from '@/types';
import { formatBalance } from '@/utils/balanceUtils';
import TimeEntryDetails from './TimeEntryDetails';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { cn } from '@/utils/cn';
import { useUser } from '@/hooks/useUser';

function ConsultantName({ consultantId }: { consultantId: string }) {
  const { user } = useUser(consultantId);
  
  if (!user) {
    return <span className="text-gray-400">Unknown Consultant</span>;
  }
  
  return (
    <span className="text-gray-600 dark:text-gray-300">
      {user.name}
    </span>
  );
}

function formatTimeHHMM(amount: number): string {
  const hours = Math.floor(amount);
  const minutes = Math.round((amount - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

interface TimeEntryListProps {
  entries: TimeEntry[];
  loading?: boolean;
  onUpdateEntry?: (id: string, data: Partial<TimeEntry>) => Promise<void>;
}

export default function TimeEntryList({ entries, loading, onUpdateEntry }: TimeEntryListProps) {
  const { language } = useLanguage();
  const t = translations[language].time;
  const [selectedEntry, setSelectedEntry] = React.useState<TimeEntry | null>(null);

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

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={cn(
            "bg-white dark:bg-gray-800 rounded-lg shadow",
            "p-4 transition-all duration-200 cursor-pointer",
            "border border-gray-200 dark:border-gray-700"
          )}
          onClick={() => setSelectedEntry(entry)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {entry.title}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({formatTimeHHMM(entry.amount)})
                </span>
              </div>
              <div className="mt-1 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <ConsultantName consultantId={entry.createdBy} />
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(entry.serviceDate, 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          </div>
          {entry.notes && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
              {entry.notes}
            </div>
          )}
        </div>
      ))}
      
      {selectedEntry && (
        <TimeEntryDetails
          isOpen={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
          entry={selectedEntry}
          onUpdate={onUpdateEntry}
        />
      )}
    </div>
  );
}
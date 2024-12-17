import React from 'react';
import { format } from 'date-fns';
import { Clock, Edit2 } from 'lucide-react';
import { useTimeTrackingStore } from '@/stores/timeTrackingStore';
import { useFeatureStore } from '@/stores/featureStore';
import { formatDuration } from '@/utils/timeUtils';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function RecentEntries() {
  const [editingEntry, setEditingEntry] = React.useState<string | null>(null);
  const [newDuration, setNewDuration] = React.useState<number>(0);
  const { recentEntries, fetchRecentEntries, correctTimeEntry } = useTimeTrackingStore();
  const { features, initialize: initializeFeatures } = useFeatureStore();

  React.useEffect(() => {
    initializeFeatures();
    fetchRecentEntries();
  }, [initializeFeatures, fetchRecentEntries]);

  const handleCorrection = async () => {
    if (!editingEntry || newDuration <= 0) return;
    await correctTimeEntry(editingEntry, newDuration);
    setEditingEntry(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        Recent Time Entries
      </h3>

      <div className="space-y-4">
        {recentEntries.map((entry) => {
          const feature = features.find(f => f.id === entry.featureId);
          
          return (
            <div
              key={entry.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {feature?.title || 'Unknown Feature'}
                  </h4>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {format(entry.startTime, 'MMM d, yyyy HH:mm')}
                    {entry.endTime && (
                      <> - {format(entry.endTime, 'HH:mm')}</>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono">
                      {formatDuration(entry.duration)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingEntry(entry.id);
                      setNewDuration(entry.duration);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {entry.notes && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {entry.notes}
                </p>
              )}
              {entry.corrected && (
                <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-500">
                  This entry has been manually corrected
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        title="Correct Time Entry"
      >
        <div className="space-y-4">
          <Input
            label="Duration (seconds)"
            type="number"
            value={newDuration}
            onChange={(e) => setNewDuration(Number(e.target.value))}
            min={1}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setEditingEntry(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleCorrection}>
              Save Correction
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
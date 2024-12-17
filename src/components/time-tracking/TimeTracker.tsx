import React from 'react';
import { useInterval } from 'react-use';
import { Play, Square, Clock, AlertCircle } from 'lucide-react';
import { useTimeTrackingStore } from '@/stores/timeTrackingStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDuration } from '@/utils/timeUtils';
import Button from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';

interface TimeTrackerProps {
  featureId: string;
  onTimerStop?: (elapsedSeconds: number) => void;
}

export default function TimeTracker({ featureId, onTimerStop }: TimeTrackerProps) {
  const { user } = useAuthStore();
  const [showStopDialog, setShowStopDialog] = React.useState(false);
  const [notes, setNotes] = React.useState('');
  const {
    activeTimer,
    isRunning,
    elapsedTime,
    loading,
    startTimer,
    stopTimer,
    updateElapsedTime,
  } = useTimeTrackingStore();

  useInterval(updateElapsedTime, isRunning ? 1000 : null);

  if (!user || user.role !== 'staff') {
    return (
      <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
        <AlertCircle className="w-5 h-5" />
        <span>Only staff members can access time tracking.</span>
      </div>
    );
  }

  const handleStart = async () => {
    await startTimer(featureId);
  };

  const handleStop = async () => {
    await stopTimer(notes);
    setShowStopDialog(false);
    setNotes('');
    onTimerStop?.(elapsedTime);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            Time Tracker
          </h3>
        </div>
        {isRunning && (
          <div className="text-xl font-mono text-blue-600">
            {formatDuration(elapsedTime)}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        {!isRunning ? (
          <Button
            onClick={handleStart}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start Timer
          </Button>
        ) : (
          <Button
            onClick={() => setShowStopDialog(true)}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Stop Timer
          </Button>
        )}
      </div>

      <Dialog
        isOpen={showStopDialog}
        onClose={() => {
          if (!isRunning) {
            setShowStopDialog(false);
            setNotes('');
          }
        }}
        title="Stop Timer"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to stop the timer? Current duration:{' '}
            <span className="font-mono font-medium">
              {formatDuration(elapsedTime)}
            </span>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              rows={3}
              placeholder="Add any notes about this time entry..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                if (!isRunning) {
                  setShowStopDialog(false);
                  setNotes('');
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleStop}
              isLoading={loading}
            >
              Stop Timer
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
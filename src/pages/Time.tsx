import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Clock, Plus, Timer } from 'lucide-react';
import Dialog from '@/components/ui/Dialog';
import { useAuthStore } from '@/stores/authStore'; 
import { useBalanceStore } from '@/stores/balanceStore'; 
import Button from '@/components/ui/Button';
import TimeEntryDialog from '@/components/time/TimeEntryDialog';
import TimeEntryList from '@/components/time/TimeEntryList';
import BalanceSelector from '@/components/time/BalanceSelector';
import TimeTracker from '@/components/time-tracking/TimeTracker';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { useFeatureStore } from '@/stores/featureStore';
import { findNearestTimeInterval } from '@/utils/timeUtils';

export default function Time() {
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isTimeTrackerOpen, setIsTimeTrackerOpen] = useState(false);
  const [trackedHours, setTrackedHours] = useState<number>(0);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const location = useLocation();
  const [selectedBalanceId, setSelectedBalanceId] = useState<string | null>(
    location.state?.selectedBalanceId || null
  );
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const { user } = useAuthStore();
  const { language } = useLanguage();
  const t = translations[language].time;
  const { balances, loading, logTransaction, getTimeEntries, updateTimeEntry, initialize, cleanup } = useBalanceStore();
  const { features, initialize: initializeFeatures } = useFeatureStore();

  React.useEffect(() => {
    initialize();
    initializeFeatures();
    return () => cleanup();
  }, [initialize, initializeFeatures, cleanup]);

  React.useEffect(() => {
    async function fetchTimeEntries() {
      if (selectedBalanceId) {
        setIsLoadingEntries(true);
        try {
          const entries = await getTimeEntries(selectedBalanceId);
          setTimeEntries(entries);
        } finally {
          setIsLoadingEntries(false);
        }
      }
    }
    fetchTimeEntries();
  }, [selectedBalanceId, getTimeEntries]);

  const handleLogTransaction = async (data: any) => {
    if (!selectedBalanceId) return;
    
    try {
      await logTransaction(selectedBalanceId, {
        ...data,
        amount: Number(data.amount),
        featureId: selectedFeatureId
      });
      setIsEntryDialogOpen(false);
      setTrackedHours(0);
      
      // Refresh time entries
      const updatedEntries = await getTimeEntries(selectedBalanceId);
      setTimeEntries(updatedEntries);
    } catch (error) {
      console.error('Failed to log transaction:', error);
    }
  };

  const handleUpdateEntry = async (id: string, data: Partial<TimeEntry>) => {
    try {
      setIsLoadingEntries(true);
      await updateTimeEntry(id, data); 
      
      // Refresh entries after update
      if (selectedBalanceId) {
        const entries = await getTimeEntries(selectedBalanceId);
        setTimeEntries(entries);
      }
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const selectedBalance = selectedBalanceId 
    ? balances.find(balance => balance.id === selectedBalanceId)
    : null;

  const handleTimerStop = (elapsedSeconds: number) => {
    // Convert seconds to hours and find nearest interval
    const hours = elapsedSeconds / 3600;
    const roundedHours = Math.max(0.083, findNearestTimeInterval(hours));
    setTrackedHours(roundedHours);
    setIsTimeTrackerOpen(false);
    setIsEntryDialogOpen(true);
  };

  const handleOpenTimeTracker = () => {
    // Find or create a feature for this balance
    const balanceFeature = features.find(f => f.customerId === selectedBalance?.customerId);
    if (balanceFeature) {
      setSelectedFeatureId(balanceFeature.id);
      setIsTimeTrackerOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {t.title}
        </h1>
        {selectedBalance && user?.role === 'staff' && (
          <div className="flex items-center gap-2 justify-start md:justify-end">
            <Button
              onClick={handleOpenTimeTracker}
              variant="secondary"
              className="flex items-center gap-2 h-10 whitespace-nowrap min-w-[120px]"
            >
              <Timer className="w-4 h-4" />
              {t.trackTime}
            </Button>
            <Button
              onClick={() => setIsEntryDialogOpen(true)}
              className="flex items-center gap-2 h-10 whitespace-nowrap min-w-[120px]"
            >
              <Plus className="w-4 h-4" />
              {t.addTime}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[300px,1fr]">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <BalanceSelector
            balances={balances}
            selectedBalanceId={selectedBalanceId}
            onSelect={setSelectedBalanceId}
            loading={loading}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          {selectedBalance ? (
            <TimeEntryList 
              entries={timeEntries} 
              loading={isLoadingEntries}
              onUpdateEntry={handleUpdateEntry}
            />
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                {t.noBalanceSelected}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t.selectBalancePrompt}
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedBalance && (
        <>
          <TimeEntryDialog
            isOpen={isEntryDialogOpen}
            onClose={() => setIsEntryDialogOpen(false)}
            onSubmit={handleLogTransaction}
            currentBalance={selectedBalance.currentBalance}
            balanceNumber={selectedBalance.balanceNumber}
            customerId={selectedBalance.customerId}
            balanceType={selectedBalance.type}
            defaultHours={trackedHours}
          />

          {user?.role === 'staff' && selectedFeatureId && (
            <Dialog
              isOpen={isTimeTrackerOpen}
              onClose={() => setIsTimeTrackerOpen(false)}
              title="Time Tracker"
            >
              <div className="space-y-4">
                <TimeTracker 
                  featureId={selectedFeatureId}
                  onTimerStop={handleTimerStop}
                />
                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => setIsTimeTrackerOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </Dialog>
          )}
        </>
      )}
    </div>
  );
}
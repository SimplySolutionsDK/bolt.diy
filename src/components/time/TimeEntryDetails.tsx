import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Clock, Calendar, User, Tag, Lightbulb } from 'lucide-react';
import Dialog from '@/components/ui/Dialog';
import { useUser } from '@/hooks/useUser';
import { useFeatureStore } from '@/stores/featureStore';
import Input from '@/components/ui/Input';
import { TIME_INTERVALS } from '@/utils/timeUtils';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { useAuthStore } from '@/stores/authStore';
import type { TimeEntry } from '@/types';

const editTimeEntrySchema = z.object({
  title: z.string().min(2, 'Title is required'),
  amount: z.number().min(0.083, 'Invalid time interval').max(24, 'Maximum 24 hours allowed'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

type EditTimeEntryForm = z.infer<typeof editTimeEntrySchema>;

interface TimeEntryDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  entry: TimeEntry;
  onUpdate?: (id: string, data: Partial<TimeEntry>) => Promise<void>;
}

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

function FeatureInfo({ featureId }: { featureId?: string }) {
  const { features } = useFeatureStore();
  const feature = features.find(f => f.id === featureId);
  
  if (!feature) return null;
  
  return (
    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
      <Lightbulb className="w-5 h-5 text-gray-400" />
      <div className="flex flex-col">
        <span className="font-medium">{feature.title}</span>
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full w-fit",
          feature.status === 'proposed'
            ? "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
            : feature.status === 'scoping'
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
            : feature.status === 'in_progress'
            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
            : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
        )}>
          {feature.status}
        </span>
      </div>
    </div>
  );
}

export default function TimeEntryDetails({
  isOpen,
  onClose,
  entry,
  onUpdate
}: TimeEntryDetailsProps) {
  const { language } = useLanguage();
  const t = translations[language].time;
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canEdit = user?.id === entry.createdBy;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<EditTimeEntryForm>({
    resolver: zodResolver(editTimeEntrySchema),
    defaultValues: {
      title: entry.title,
      amount: entry.amount,
      description: entry.notes
    }
  });

  const handleClose = () => {
    setIsEditing(false);
    reset();
    onClose();
  };

  const handleUpdate = async (data: EditTimeEntryForm) => {
    if (!onUpdate) return;
    
    try {
      setError(null);
      await onUpdate(entry.id, {
        title: data.title,
        amount: data.amount,
        notes: data.description
      });
      setIsEditing(false);
      handleClose(); // Close the dialog after successful update
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update time entry');
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Edit Time Entry" : "Time Entry Details"}
    >
      {isEditing ? (
        <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
          <Input
            label="Title"
            error={errors.title?.message}
            {...register('title')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time Interval
            </label>
            <select
              className={cn(
                "w-full px-3 py-2 border rounded-md shadow-sm",
                "text-gray-900 dark:text-gray-100",
                "bg-white dark:bg-gray-800",
                "border-gray-300 dark:border-gray-700",
                "focus:ring-blue-500 focus:border-blue-500"
              )}
              {...register('amount', { valueAsNumber: true })}
            >
              {TIME_INTERVALS.map(interval => (
                <option key={interval.value} value={interval.value}>
                  {interval.label}
                </option>
              ))}
            </select>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              className={cn(
                "w-full px-3 py-2 border rounded-md shadow-sm",
                "placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500",
                "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                "sm:text-sm"
              )}
              rows={4}
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {entry.title}
            </h3>
            <div className="mt-4 grid gap-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Clock className="w-5 h-5 text-gray-400" />
                <span>{formatTimeHHMM(entry.amount)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <User className="w-5 h-5 text-gray-400" />
                <ConsultantName consultantId={entry.createdBy} />
              </div>

              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>{format(entry.serviceDate, 'PPP')}</span>
              </div>
              
              {entry.featureId && (
                <FeatureInfo featureId={entry.featureId} />
              )}

              {entry.notes && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {entry.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={handleClose}
            >
              Close
            </Button>
            {canEdit && onUpdate && (
              <Button
                onClick={() => setIsEditing(true)}
              >
                Edit Entry
              </Button>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
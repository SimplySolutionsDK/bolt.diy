import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import TimeTracker from '@/components/time-tracking/TimeTracker';
import { useTimeTrackingStore } from '@/stores/timeTrackingStore';
import { useAuthStore } from '@/stores/authStore';

const timeEntrySchema = z.object({
  consultantName: z.string().min(2, 'Consultant name is required'),
  serviceDate: z.string().min(1, 'Service date is required'),
  hoursDeducted: z.number()
    .min(0.5, 'Minimum 0.5 hours required')
    .max(24, 'Maximum 24 hours allowed'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

type TimeEntryFormData = z.infer<typeof timeEntrySchema>;

interface TimeEntryFormProps {
  onSubmit: (data: TimeEntryFormData) => Promise<void>;
  isLoading?: boolean;
  remainingHours: number;
  featureId?: string;
}

export default function TimeEntryForm({ 
  onSubmit, 
  isLoading,
  remainingHours,
  featureId,
}: TimeEntryFormProps) {
  const { user } = useAuthStore();
  const { activeTimer, elapsedTime } = useTimeTrackingStore();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TimeEntryFormData>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      serviceDate: format(new Date(), 'yyyy-MM-dd'),
      hoursDeducted: 1,
      consultantName: user?.name || '',
    },
  });

  // Update hours when timer stops
  React.useEffect(() => {
    if (!activeTimer && elapsedTime > 0) {
      const hours = Math.max(0.5, Math.round((elapsedTime / 3600) * 2) / 2);
      setValue('hoursDeducted', hours);
    }
  }, [activeTimer, elapsedTime, setValue]);

  const hoursDeducted = watch('hoursDeducted', 0);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {user?.role === 'staff' && featureId && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <TimeTracker featureId={featureId} />
        </div>
      )}

      <Input
        label="Consultant Name"
        type="text"
        required
        error={errors.consultantName?.message}
        {...register('consultantName')}
      />

      <Input
        label="Service Date"
        type="date"
        required
        max={format(new Date(), 'yyyy-MM-dd')}
        error={errors.serviceDate?.message}
        {...register('serviceDate')}
      />

      <div>
        <Input
          label="Hours"
          type="number"
          step="0.5"
          required
          error={errors.hoursDeducted?.message}
          {...register('hoursDeducted', { valueAsNumber: true })}
        />
        <p className="mt-1 text-sm text-gray-500">
          {remainingHours - hoursDeducted} hours will remain after this entry
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes (Optional)
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          rows={4}
          maxLength={500}
          {...register('notes')}
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.notes.message}
          </p>
        )}
      </div>

      <Button 
        type="submit" 
        isLoading={isLoading}
        disabled={hoursDeducted > remainingHours}
      >
        Log Time
      </Button>
    </form>
  );
}
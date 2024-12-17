import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCustomers } from '@/hooks/useCustomers';
import { useFeatureStore } from '@/stores/featureStore';
import { format } from 'date-fns';
import { formatBalance, formatBalanceNumber } from '@/utils/balanceUtils';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { TIME_INTERVALS } from '@/utils/timeUtils';
import { useAuthStore } from '@/stores/authStore';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import ComboBox from '@/components/ui/ComboBox';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';

const timeEntrySchema = z.object({
  title: z.string().min(2, 'Title is required'),
  consultantId: z.string().min(1, 'Consultant is required'),
  serviceDate: z.string().min(1, 'Service date is required'),
  featureId: z.string().optional(),
  amount: z
    .number()
    .min(0.083, 'Invalid time interval')
    .max(24, 'Maximum 24 hours allowed'),
  category: z.enum(['development', 'design', 'consulting', 'support', 'other']),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
});

type TimeEntryForm = z.infer<typeof timeEntrySchema>;

interface TimeEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TimeEntryForm) => Promise<void>;
  currentBalance: number;
  balanceNumber: string;
  customerId: string;
  balanceType: 'hours' | 'credits';
  defaultHours?: number;
}

export default function TimeEntryDialog({
  isOpen,
  onClose,
  onSubmit,
  currentBalance,
  balanceNumber,
  customerId,
  balanceType,
  defaultHours = 1,
}: TimeEntryDialogProps) {
  const { user } = useAuthStore();
  const { customers = [], loading: loadingCustomers } = useCustomers();
  const {
    features = [],
    initialize: initializeFeatures,
    cleanup: cleanupFeatures,
  } = useFeatureStore();
  const { language } = useLanguage();
  const t = translations[language]?.time || {};
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    if (isOpen) initializeFeatures();
    return () => cleanupFeatures();
  }, [isOpen, initializeFeatures, cleanupFeatures]);

  const consultantOptions = React.useMemo(
    () =>
      customers
        .filter((customer) => customer.role === 'staff')
        .map((consultant) => ({
          value: consultant.id,
          label: consultant.name,
        })),
    [customers]
  );

  const featureOptions = React.useMemo(
    () =>
      features
        .filter((feature) => feature.customerId === customerId)
        .map((feature) => ({
          value: feature.id,
          label: feature.title,
        })),
    [features, customerId]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TimeEntryForm>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      serviceDate: format(new Date(), 'yyyy-MM-dd'),
      amount: defaultHours,
      consultantId: user?.id || '',
      category: 'development',
    },
  });

  const handleClose = () => {
    reset();
    onClose();
    cleanupFeatures();
  };

  const amount = watch('amount', 0);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={`Log Transaction - ${formatBalanceNumber(balanceNumber)} (${balanceType})`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Title"
          type="text"
          required
          error={errors.title?.message}
          {...register('title')}
          placeholder="Brief description of work done"
        />

        <ComboBox
          label="Consultant"
          name="consultantId"
          control={control}
          options={consultantOptions}
          onSearch={setSearchQuery}
          placeholder="Select a consultant"
          required
          error={errors.consultantId?.message}
          isLoading={loadingCustomers}
        />

        <ComboBox
          label="Related Feature (Optional)"
          name="featureId"
          control={control}
          options={featureOptions}
          placeholder="Select a feature..."
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Service Date"
            type="date"
            required
            max={format(new Date(), 'yyyy-MM-dd')}
            error={errors.serviceDate?.message}
            {...register('serviceDate')}
          />

          <div>
            <label className="block text-sm font-medium mb-1">
              {balanceType === 'hours' ? 'Time Interval' : 'Amount'}
            </label>
            <select
              className="w-full px-3 py-2 border rounded-md shadow-sm"
              {...register('amount', { valueAsNumber: true })}
            >
              {balanceType === 'hours'
                ? TIME_INTERVALS.map((interval) => (
                    <option key={interval.value} value={interval.value}>
                      {interval.label}
                    </option>
                  ))
                : [<option key={1} value={1}>1 credit</option>]}
            </select>
            {errors.amount && (
              <p className="text-red-600 text-sm">{errors.amount.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            {...register('category')}
          >
            <option value="development">Development</option>
            <option value="design">Design</option>
            <option value="consulting">Consulting</option>
            <option value="support">Support</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description (Optional)
          </label>
          <textarea
            rows={4}
            maxLength={500}
            placeholder="Detailed description of work performed..."
            {...register('description')}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="text-sm">
          {formatBalance(currentBalance - amount, balanceType)} {t.willRemain}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            //disabled={amount > currentBalance}
          >
            Log Transaction
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

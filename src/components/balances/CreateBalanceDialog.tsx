import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import CustomerSelector from '@/components/shared/CustomerSelector';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';

const createBalanceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  initialBalance: z.number()
    .min(0.5, 'Minimum 0.5 required')
    .max(1000, 'Maximum 1000 allowed'),
  type: z.enum(['hours', 'credits']),
  expiryDate: z.string().optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

type CreateBalanceForm = z.infer<typeof createBalanceSchema>;

interface CreateBalanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBalanceForm) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateBalanceDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}: CreateBalanceDialogProps) {
  const { language } = useLanguage();
  const t = translations[language].balances;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateBalanceForm>({
    resolver: zodResolver(createBalanceSchema),
    defaultValues: {
      initialBalance: 10,
      type: 'hours',
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const [error, setError] = React.useState<string | null>(null);

  const handleFormSubmit = async (data: CreateBalanceForm) => {
    if (isSubmitting) return;
    
    try {
      setError(null);
      await onSubmit(data);
      handleClose();
    } catch (error) {
      // Extract error message or provide default
      const errorMessage = error instanceof Error ? error.message : 'Failed to create balance';
      setError(errorMessage);
      console.error('Failed to create balance:', errorMessage);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={t.createBalance}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <CustomerSelector
          name="customerId"
          control={control}
          required
          error={errors.customerId?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t.initialBalance}
            type="number"
            step="0.5"
            required
            error={errors.initialBalance?.message}
            {...register('initialBalance', { valueAsNumber: true })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.balanceType}
            </label>
            <select
              className={cn(
                "w-full px-3 py-2 border rounded-md shadow-sm",
                "text-gray-900 dark:text-gray-100",
                "bg-white dark:bg-gray-800",
                "border-gray-300 dark:border-gray-700",
                "focus:ring-blue-500 focus:border-blue-500"
              )}
              {...register('type')}
            >
              <option value="hours">{t.balanceTypes.hours}</option>
              <option value="credits">{t.balanceTypes.credits}</option>
            </select>
          </div>
        </div>

        <Input
          label={t.expiryDate}
          type="date"
          min={format(new Date(), 'yyyy-MM-dd')}
          error={errors.expiryDate?.message}
          {...register('expiryDate')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.notes}
          </label>
          <textarea
            className={cn(
              "w-full px-3 py-2 border rounded-md shadow-sm",
              "placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500",
              "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
              "sm:text-sm"
            )}
            rows={3}
            maxLength={500}
            placeholder={t.notesPlaceholder}
            {...register('notes')}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.notes.message}
            </p>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading || isSubmitting}
            className="flex-1"
          >
            {t.cancel}
          </Button>
          <Button
            type="submit"
            isLoading={isLoading || isSubmitting}
            className="flex-1"
          >
            {t.create}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
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

const createCardSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  totalHours: z.number()
    .min(0.5, 'Minimum 0.5 hours required')
    .max(1000, 'Maximum 1000 hours allowed'),
  expiryDate: z.string().optional(),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

type CreateCardForm = z.infer<typeof createCardSchema>;

interface CreateCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCardForm) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateCardDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}: CreateCardDialogProps) {

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CreateCardForm>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      totalHours: 10,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Card"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <CustomerSelector
          name="customerId"
          control={control}
          required
          error={errors.customerId?.message}
        />

        <Input
          label="Total Hours"
          type="number"
          step="0.5"
          required
          error={errors.totalHours?.message}
          {...register('totalHours', { valueAsNumber: true })}
        />

        <Input
          label="Expiry Date"
          type="date"
          min={format(new Date(), 'yyyy-MM-dd')}
          error={errors.expiryDate?.message}
          {...register('expiryDate')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (Optional)
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
            placeholder="Additional notes about this card..."
            {...register('notes')}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.notes.message}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className="flex-1"
          >
            Create Card
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const cardSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  totalHours: z.number()
    .min(0.5, 'Minimum 0.5 hours required')
    .max(1000, 'Maximum 1000 hours allowed'),
  expiryDate: z.string().optional(),
});

type CardFormData = z.infer<typeof cardSchema>;

interface CardFormProps {
  onSubmit: (data: CardFormData) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<CardFormData>;
}

export default function CardForm({ onSubmit, isLoading, defaultValues }: CardFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      totalHours: 10,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

      <Button type="submit" isLoading={isLoading}>
        Create Card
      </Button>
    </form>
  );
}
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCustomers } from '@/hooks/useCustomers';
import { useFeatureStore } from '@/stores/featureStore';
import { format } from 'date-fns';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import ComboBox from '@/components/ui/ComboBox';
import CustomerSelector from '@/components/shared/CustomerSelector';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { useAuthStore } from '@/stores/authStore';

const createFeatureSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['high', 'medium', 'low'] as const),
  status: z.enum(['proposed', 'scoping', 'in_progress', 'completed'] as const),
  customerId: z.string().min(1, 'Customer is required'),
  assignedTo: z.string().optional(),
});

type CreateFeatureForm = z.infer<typeof createFeatureSchema>;

interface CreateFeatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFeatureForm) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateFeatureDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}: CreateFeatureDialogProps) {
  const { language } = useLanguage();
  const t = translations[language].features;
  const { user } = useAuthStore();
  const [consultantSearchQuery, setConsultantSearchQuery] = React.useState('');
  const { customers, loading: loadingCustomers } = useCustomers(consultantSearchQuery);

  const consultantOptions = React.useMemo(() => 
    customers
      .filter(user => user.role === 'staff')
      .map(consultant => ({
        value: consultant.id,
        label: consultant.name
      })),
    [customers]
  );

  const customerOptions = React.useMemo(() => 
    customers
      .filter(user => user.role === 'customer')
      .map(customer => ({
        value: customer.id,
        label: customer.name
      })),
    [customers]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CreateFeatureForm>({
    resolver: zodResolver(createFeatureSchema),
    defaultValues: {
      priority: 'medium',
      status: user?.role === 'customer' ? 'proposed' : undefined,
      customerId: user?.role === 'customer' ? user.id : undefined,
      assignedTo: user?.role === 'staff' ? user.id : undefined,
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
      title={t.createFeature}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={t.form.title}
          type="text"
          required
          error={errors.title?.message}
          {...register('title')}
          placeholder={t.form.titlePlaceholder}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t.form.description}
          </label>
          <textarea
            className={cn(
              "w-full px-3 py-2 border rounded-md shadow-sm",
              "placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500",
              "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
              "sm:text-sm"
            )}
            rows={4}
            placeholder={t.form.descriptionPlaceholder}
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.description.message}
            </p>
          )}
        </div>

        {user?.role === 'staff' && (
          <CustomerSelector
            name="customerId"
            control={control}
            required
            error={errors.customerId?.message}
          />
        )}

        {user?.role === 'staff' && (
          <ComboBox
            label={t.form.assignConsultant}
            name="assignedTo"
            control={control}
            options={consultantOptions}
            onSearch={setConsultantSearchQuery}
            placeholder={t.form.selectConsultant}
            isLoading={loadingCustomers}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.form.priority}
            </label>
            <select
              className={cn(
                "w-full px-3 py-2 border rounded-md shadow-sm",
                "text-gray-900 dark:text-gray-100",
                "bg-white dark:bg-gray-800",
                "border-gray-300 dark:border-gray-700",
                "focus:ring-blue-500 focus:border-blue-500"
              )}
              {...register('priority')}
            >
              {(['high', 'medium', 'low'] as const).map((priority) => (
                <option key={priority} value={priority}>
                  {t.priority[priority]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.form.status}
            </label>
            <select
              className={cn(
                "w-full px-3 py-2 border rounded-md shadow-sm",
                "text-gray-900 dark:text-gray-100",
                "bg-white dark:bg-gray-800",
                "border-gray-300 dark:border-gray-700",
                "focus:ring-blue-500 focus:border-blue-500"
              )}
              {...register('status')}
              disabled={user?.role === 'customer'}
            >
              {(['proposed', 'scoping', 'in_progress', 'completed'] as const).map((status) => (
                <option key={status} value={status}>
                  {t.status[status]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            {t.form.cancel}
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className="flex-1"
          >
            {t.form.submit}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
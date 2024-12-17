import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import { Tag, X, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import type { Company } from '@/types';

const DEFAULT_SERVICE_TYPES = [
  'Software Development',
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Digital Marketing',
  'Social Media Management',
  'IT Support',
  'Cloud Services',
  'Consulting'
];

const editCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  address: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  phone: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  serviceTypes: z.array(z.string()),
  customServiceTypes: z.array(z.string()).optional(),
});

type EditCompanyForm = z.infer<typeof editCompanySchema>;

interface EditCompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditCompanyForm) => Promise<void>;
  company: Company;
  isLoading?: boolean;
}

export default function EditCompanyDialog({
  isOpen,
  onClose,
  onSubmit,
  company,
  isLoading
}: EditCompanyDialogProps) {
  const { language } = useLanguage();
  const t = translations[language].company;
  const [selectedServices, setSelectedServices] = React.useState<string[]>(
    company.serviceTypes?.filter(service => DEFAULT_SERVICE_TYPES.includes(service)) || []
  );
  const [customService, setCustomService] = React.useState('');
  const [customServices, setCustomServices] = React.useState<string[]>(
    company.serviceTypes?.filter(service => !DEFAULT_SERVICE_TYPES.includes(service)) || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditCompanyForm>({
    resolver: zodResolver(editCompanySchema),
    defaultValues: {
      name: company.name,
      address: company.address || '',
      location: company.location || '',
      phone: company.phone || '',
      website: company.website || '',
      description: company.description || '',
      serviceTypes: company.serviceTypes || [],
      customServiceTypes: company.serviceTypes?.filter(service => !DEFAULT_SERVICE_TYPES.includes(service)) || [],
    }
  });

  const handleClose = () => {
    reset();
    setSelectedServices(company.serviceTypes?.filter(service => DEFAULT_SERVICE_TYPES.includes(service)) || []);
    setCustomServices(company.serviceTypes?.filter(service => !DEFAULT_SERVICE_TYPES.includes(service)) || []);
    onClose();
  };

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => {
      const newServices = prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service];
      setValue('serviceTypes', newServices);
      return newServices;
    });
  };

  const handleAddCustomService = () => {
    if (customService.trim() && !customServices.includes(customService.trim())) {
      setCustomServices(prev => {
        const newServices = [...prev, customService.trim()];
        setValue('customServiceTypes', newServices);
        return newServices;
      });
      setCustomService('');
    }
  };

  const handleRemoveCustomService = (service: string) => {
    setCustomServices(prev => {
      const newServices = prev.filter(s => s !== service);
      setValue('customServiceTypes', newServices);
      return newServices;
    });
  };

  const handleFormSubmit = async (data: EditCompanyForm) => {
    try {
      // Combine selected and custom services
      const allServiceTypes = [...data.serviceTypes];
      if (data.customServiceTypes) {
        allServiceTypes.push(...data.customServiceTypes);
      }
      
      // Update data with combined services
      const submitData = {
        ...data,
        serviceTypes: allServiceTypes,
      };
      
      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error('Failed to submit form:', error);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={t.editCompany}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Company Name"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Address"
          {...register('address')}
          error={errors.address?.message}
        />

        <Input
          label="Location"
          required
          {...register('location')}
          error={errors.location?.message}
          placeholder="e.g., Copenhagen, Aarhus, etc."
        />

        <Input
          label="Phone"
          type="tel"
          {...register('phone')}
          error={errors.phone?.message}
        />

        <Input
          label="Website"
          type="url"
          {...register('website')}
          error={errors.website?.message}
          placeholder="https://example.com"
        />

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
            maxLength={500}
            placeholder="Company description..."
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t.serviceTypes}
          </label>
          
          <div className="flex flex-wrap gap-2">
            {DEFAULT_SERVICE_TYPES.map(service => (
              <button
                key={service}
                type="button"
                onClick={() => handleServiceToggle(service)}
                className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-sm",
                  "transition-colors duration-200",
                  selectedServices.includes(service)
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                )}
              >
                <Tag className="w-3 h-3 mr-1" />
                {service}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Add custom service type..."
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomService())}
              />
              <Button
                type="button"
                onClick={handleAddCustomService}
                disabled={!customService.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {customServices.map(service => (
                <span
                  key={service}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                >
                  {service}
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomService(service)}
                    className="p-0.5 hover:bg-green-200 dark:hover:bg-green-800 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
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
            {t.saveChanges}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
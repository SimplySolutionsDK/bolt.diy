import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Dialog from '@/components/ui/Dialog';
import Input from '@/components/ui/Input';
import ComboBox from '@/components/ui/ComboBox';
import Button from '@/components/ui/Button';
import { useCompanyStore } from '@/stores/companyStore';
import { cn } from '@/utils/cn';
import type { User } from '@/types';
import { createCustomerCompanyRelation, removeCustomerCompanyRelation, getCustomerCompanies } from '@/lib/db/customerCompanyRelations';

const editUserSchema = z.object({
  companyId: z.string().optional(),
  role: z.enum(['customer', 'staff', 'consultant']),
  customerCompanies: z.array(z.string()).optional(),
});

type EditUserForm = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (user: User) => void;
}

export default function EditUserDialog({
  isOpen,
  onClose,
  user,
  onUpdate,
}: EditUserDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCompanies, setSelectedCompanies] = React.useState<string[]>([]);
  const { companies } = useCompanyStore();

  React.useEffect(() => {
    async function fetchCustomerCompanies() {
      if (user.role === 'customer') {
        const companyIds = await getCustomerCompanies(user.id);
        setSelectedCompanies(companyIds);
      }
    }
    fetchCustomerCompanies();
  }, [user]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      companyId: user.companyId || '',
      role: user.role,
      customerCompanies: [],
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCompanySelect = async (companyId: string) => {
    if (selectedCompanies.includes(companyId)) {
      // Remove company
      await removeCustomerCompanyRelation(user.id, companyId);
      setSelectedCompanies(prev => prev.filter(id => id !== companyId));
    } else {
      // Add company
      await createCustomerCompanyRelation(user.id, companyId);
      setSelectedCompanies(prev => [...prev, companyId]);
    }
  };

  const onSubmit = async (data: EditUserForm) => {
    try {
      setLoading(true);
      setError(null);

      const updates: Partial<User> = {
        role: data.role,
      };

      // Only update company if user is staff/consultant
      if (data.role === 'staff' || data.role === 'consultant') {
        updates.companyId = data.companyId || null;
      } else {
        // Clear company if changing to customer role
        updates.companyId = null;
      }

      await updateDoc(doc(db, 'users', user.id), updates);

      onUpdate({
        ...user,
        ...updates,
      });

      handleClose();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit User"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>
          <p className="text-gray-900 dark:text-gray-100">
            {user.name}
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <p className="text-gray-900 dark:text-gray-100">
            {user.email}
          </p>
        </div>

        {user.role === 'customer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Associated Companies
            </label>
            <div className="space-y-2">
              {companies.map(company => (
                <div
                  key={company.id}
                  className="flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    id={company.id}
                    checked={selectedCompanies.includes(company.id)}
                    onChange={() => handleCompanySelect(company.id)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <label
                    htmlFor={company.id}
                    className="text-sm text-gray-900 dark:text-gray-100"
                  >
                    {company.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Role
          </label>
          <select
            className={cn(
              "mt-1 w-full px-3 py-2 border rounded-md shadow-sm",
              "text-gray-900 dark:text-gray-100",
              "bg-white dark:bg-gray-800",
              "border-gray-300 dark:border-gray-700",
              "focus:ring-blue-500 focus:border-blue-500"
            )}
            {...register('role')}
          >
            <option value="customer">Customer</option>
            <option value="consultant">Consultant</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        {watch('role') !== 'customer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Company
            </label>
            <select
              className={cn(
                "w-full px-3 py-2 border rounded-md shadow-sm",
                "text-gray-900 dark:text-gray-100",
                "bg-white dark:bg-gray-800",
                "border-gray-300 dark:border-gray-700",
                "focus:ring-blue-500 focus:border-blue-500"
              )}
              {...register('companyId')}
            >
              <option value="">No company</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            {errors.companyId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.companyId.message}
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={loading}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LanguageSwitch from '@/components/ui/LanguageSwitch';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'staff']),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { signUp } = useAuthStore();
  const { language } = useLanguage();
  const t = translations[language].auth.register;
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'customer',
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError(null);
      await signUp(data.email, data.password, data.name, data.role);
    } catch (err) {
      setError('Failed to create account. Please try again.');
    }
  };

  return (
    <div>
      <LanguageSwitch />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label={t.fullName}
          type="text"
          autoComplete="name"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label={t.email}
          type="email"
          autoComplete="email"
          required
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label={t.password}
          type="password"
          autoComplete="new-password"
          required
          error={errors.password?.message}
          {...register('password')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.accountType}
          </label>
          <select
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            {...register('role')}
          >
            <option value="customer">{t.customer}</option>
            {/*<option value="staff">Staff</option>*/}
          </select>
        </div>

        {error && (
          <div className="text-sm text-red-600">
            {t.error}
          </div>
        )}

        <Button type="submit" isLoading={isSubmitting}>
          {t.submit}
        </Button>
      </form>

      <div className="mt-6">
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {t.hasAccount}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link to="/login">
            <Button variant="secondary">
              {t.signIn}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
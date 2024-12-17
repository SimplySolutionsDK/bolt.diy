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

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { signIn } = useAuthStore();
  const { language } = useLanguage();
  const t = translations[language].auth.login;
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setError(null);
      await signIn(data.email, data.password);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div>
      <LanguageSwitch />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label={t.email}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label={t.password}
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-end">
          <Link to="/reset-password" className="text-sm text-blue-600 hover:text-blue-500">
            {t.forgotPassword}
          </Link>
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
                {t.noAccount}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link to="/register">
            <Button variant="secondary">
              {t.createAccount}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
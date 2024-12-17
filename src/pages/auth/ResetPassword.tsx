import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LanguageSwitch from '@/components/ui/LanguageSwitch';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].auth.resetPassword;
  const { resetPassword } = useAuthStore();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    try {
      setError(null);
      await resetPassword(data.email);
      // Show success message
      setSuccess(true);
    } catch (err) {
      setError(t.error);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t.successTitle}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {t.successMessage}
        </p>
        <Link to="/login">
          <Button variant="secondary">
            {t.backToLogin}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <LanguageSwitch />
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t.title}
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        {t.description}
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label={t.email}
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        
        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        <Button type="submit" isLoading={isSubmitting}>
          {t.submit}
        </Button>
      </form>

      <div className="mt-6">
        <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
          {t.backToLogin}
        </Link>
      </div>
    </div>
  );
}
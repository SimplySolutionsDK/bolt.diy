import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { Clock } from 'lucide-react';

export default function AuthLayout() {
  const { user } = useAuthStore();
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const t = translations[language].common;

  React.useEffect(() => {
    // Set default language to Danish
    if (language === 'en') {
      setLanguage('da');
    }
  }, []);

  if (user) {
    const redirectPath = user.role === 'staff' ? '/staff' : '/customer';
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Clock className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t.appName}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
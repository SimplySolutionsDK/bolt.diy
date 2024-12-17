import React from 'react';
import { Globe, Shield } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import Button from '@/components/ui/Button';
import ConsultantUpgrade from '@/components/upgrade/ConsultantUpgrade';

export default function Settings() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language].settings;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {t.title}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {t.language}
            </h2>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t.selectLanguage}
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={language === 'en' ? 'primary' : 'secondary'}
              onClick={() => setLanguage('en')}
            >
              {t.english}
            </Button>
            <Button
              variant={language === 'da' ? 'primary' : 'secondary'}
              onClick={() => setLanguage('da')}
            >
              {t.danish}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mt-6">
        <ConsultantUpgrade />
      </div>
    </div>
  );
}
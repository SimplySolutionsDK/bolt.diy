import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/utils/cn';

export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-400" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'da')}
        className={cn(
          "text-sm border-0 bg-transparent focus:ring-0 focus:outline-none",
          "text-gray-600 dark:text-gray-300"
        )}
      >
        <option value="da">Dansk</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
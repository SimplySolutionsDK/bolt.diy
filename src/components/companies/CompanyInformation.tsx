import React from 'react';
import { Building2, MapPin, Phone, Globe, Tag } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Company } from '@/types';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';

interface CompanyInformationProps {
  company: Company;
}

export default function CompanyInformation({ company }: CompanyInformationProps) {
  const { language } = useLanguage();
  const t = translations[language].company;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-full overflow-hidden">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        {t.information}
      </h2>
      
      <div className="space-y-4 overflow-x-auto">
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
          <Building2 className="w-5 h-5 text-gray-400" />
          <span className="truncate">{company.name}</span>
        </div>

        {company.location && (
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <MapPin className="w-5 h-5 text-gray-400" />
            <span className="truncate">{company.location}</span>
          </div>
        )}

        {company.phone && (
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <Phone className="w-5 h-5 text-gray-400" />
            <span className="truncate">{company.phone}</span>
          </div>
        )}

        {company.website && (
          <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
            <Globe className="w-5 h-5 text-gray-400" />
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline truncate"
            >
              {company.website}
            </a>
          </div>
        )}
      </div>

      {company.serviceTypes && company.serviceTypes.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {t.serviceTypes}
          </h3>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            {company.serviceTypes.map(service => (
              <span
                key={service}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 whitespace-nowrap"
              >
                <Tag className="w-3 h-3 mr-1" />
                {service}
              </span>
            ))}
          </div>
        </div>
      )}

      {company.description && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {t.description}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {company.description}
          </p>
        </div>
      )}
    </div>
  );
}
import React from 'react';
import { Users, Mail, Building2 } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { cn } from '@/utils/cn';
import type { User } from '@/types';

interface CompanyCustomersListProps {
  customerIds: string[];
  loading?: boolean;
}

export default function CompanyCustomersList({ customerIds, loading }: CompanyCustomersListProps) {
  const { customers } = useCustomers();
  const { language } = useLanguage();
  const t = translations[language].company;

  const companyCustomers = React.useMemo(() => 
    customers.filter(customer => customerIds.includes(customer.id)),
    [customers, customerIds]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-gray-700 rounded-lg h-16 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (companyCustomers.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {t.noUsers}
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {companyCustomers.map((customer) => (
        <div
          key={customer.id}
          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition-colors"
        >
          <div className="flex items-center gap-4">
            {customer.photoURL ? (
              <img
                src={customer.photoURL}
                alt={customer.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-500" />
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {customer.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                {customer.email}
              </div>
            </div>
          </div>
          <span className={cn(
            "px-3 py-1 text-sm rounded-full",
            "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
          )}>
            {customer.role}
          </span>
        </div>
      ))}
    </div>
  );
}
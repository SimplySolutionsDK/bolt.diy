import React from 'react';
import { Building2 } from 'lucide-react';
import { useCompanyStore } from '@/stores/companyStore';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { cn } from '@/utils/cn';
import { getCustomerCompanies, createCustomerCompanyRelation, removeCustomerCompanyRelation } from '@/lib/db/customerCompanyRelations';

export default function CustomerCompanySelector() {
  const [selectedCompanies, setSelectedCompanies] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { companies, initialize } = useCompanyStore();
  const { user } = useAuthStore();
  const { language } = useLanguage();
  const t = translations[language].company;

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  React.useEffect(() => {
    async function fetchCustomerCompanies() {
      if (user?.id) {
        setLoading(true);
        try {
          const companyIds = await getCustomerCompanies(user.id);
          setSelectedCompanies(companyIds);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchCustomerCompanies();
  }, [user]);

  const handleCompanySelect = async (companyId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      if (selectedCompanies.includes(companyId)) {
        await removeCustomerCompanyRelation(user.id, companyId);
        setSelectedCompanies(prev => prev.filter(id => id !== companyId));
      } else {
        await createCustomerCompanyRelation(user.id, companyId);
        setSelectedCompanies(prev => [...prev, companyId]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {t.information}
        </h2>
      </div>

      {companies.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          {t.noUsers}
        </p>
      ) : (
        <div className="space-y-2">
          {companies.map(company => (
            <div
              key={company.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                selectedCompanies.includes(company.id)
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-500/50"
              )}
              onClick={() => handleCompanySelect(company.id)}
            >
              <input
                type="checkbox"
                checked={selectedCompanies.includes(company.id)}
                onChange={() => {}}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  {company.name}
                </h3>
                {company.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {company.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
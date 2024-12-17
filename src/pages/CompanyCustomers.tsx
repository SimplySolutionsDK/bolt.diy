import React from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { getCompanyCustomers } from '@/lib/db/customerCompanyRelations';
import Button from '@/components/ui/Button';
import CompanyCustomersList from '@/components/company/CompanyCustomersList';

export default function CompanyCustomers() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { language } = useLanguage();
  const t = translations[language].company;
  const [loading, setLoading] = React.useState(true);
  const [customerIds, setCustomerIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    async function fetchCompanyCustomers() {
      if (user?.companyId) {
        try {
          setLoading(true);
          const ids = await getCompanyCustomers(user.companyId);
          setCustomerIds(ids);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchCompanyCustomers();
  }, [user?.companyId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          className="!p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {t.users}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <CompanyCustomersList 
          customerIds={customerIds}
          loading={loading}
        />
      </div>
    </div>
  );
}
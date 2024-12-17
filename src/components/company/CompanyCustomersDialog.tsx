import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { getCompanyCustomers } from '@/lib/db/customerCompanyRelations';
import Dialog from '@/components/ui/Dialog';
import CompanyCustomersList from '@/components/company/CompanyCustomersList';

interface CompanyCustomersDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CompanyCustomersDialog({ isOpen, onClose }: CompanyCustomersDialogProps) {
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
    
    if (isOpen) {
      fetchCompanyCustomers();
    }
  }, [user?.companyId, isOpen]);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t.users}
    >
      <div className="min-h-[300px] max-h-[600px] overflow-y-auto">
        <CompanyCustomersList 
          customerIds={customerIds}
          loading={loading}
        />
      </div>
    </Dialog>
  );
}
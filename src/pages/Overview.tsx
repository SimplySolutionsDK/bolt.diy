import React from 'react';
import { useBalanceStore } from '@/stores/balanceStore';
import { useFeatureStore } from '@/stores/featureStore';
import { useCustomers } from '@/hooks/useCustomers';
import { useAuthStore } from '@/stores/authStore';
import { useCompanyStore } from '@/stores/companyStore';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import type { StatItem } from '@/types/dashboard';
import CompanyCustomersDialog from '@/components/company/CompanyCustomersDialog';
import UnreadMessagesOverview from '@/components/features/UnreadMessagesOverview';
import CustomerCompanySelector from '@/components/companies/CustomerCompanySelector';
import CompanyInformation from '@/components/companies/CompanyInformation';
import CompanyUsers from '@/components/companies/CompanyUsers';
import Button from '@/components/ui/Button';
import EditCompanyDialog from '@/components/companies/EditCompanyDialog';
import { Pencil, Clock, Users, CreditCard, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { getCompanyCustomers } from '@/lib/db/customerCompanyRelations';
import { useNavigate } from 'react-router-dom';

export default function Overview() {
  const { balances, initialize: initializeBalances } = useBalanceStore();
  const { features, initialize: initializeFeatures } = useFeatureStore();
  const { companies, initialize: initializeCompanies, updateCompany } = useCompanyStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { customers } = useCustomers();
  const { language } = useLanguage();
  const t = translations[language];
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isCustomersDialogOpen, setIsCustomersDialogOpen] = React.useState(false);
  const [companyCustomers, setCompanyCustomers] = React.useState<string[]>([]);

  React.useEffect(() => {
    initializeBalances();
    initializeFeatures();
    if (user?.role !== 'customer') {
      initializeCompanies();
    }
  }, [initializeBalances, initializeFeatures, initializeCompanies, user?.role]);

  React.useEffect(() => {
    async function fetchCompanyCustomers() {
      if (user?.companyId) {
        const customerIds = await getCompanyCustomers(user.companyId);
        setCompanyCustomers(customerIds);
      }
    }
    fetchCompanyCustomers();
  }, [user?.companyId]);

  const userCompany = React.useMemo(() => 
    companies.find(c => c.id === user?.companyId),
    [companies, user?.companyId]
  );

  const handleEditCompany = async (data: any) => {
    if (!userCompany) return;
    try {
      await updateCompany(userCompany.id, data);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update company:', error);
    }
  };

  const stats = React.useMemo(() => {
    const baseStats = [
      {
        title: 'activeBalances',
        value: balances.filter(balance => balance.status === 'active').length,
        icon: CreditCard,
        color: 'text-blue-500',
      },
      {
        title: 'activeFeatures',
        value: features.filter(feature => feature.status === 'in_progress').length,
        icon: Lightbulb,
        color: 'text-yellow-500',
      },
      {
        title: 'totalHours',
        value: balances
          .filter(b => b.type === 'hours')
          .reduce((total, b) => total + b.currentBalance, 0)
          .toFixed(1),
        icon: Clock,
        color: 'text-green-500',
      },
    ];

    // Add active customers stat for staff/consultant
    if (user?.role !== 'customer') {
      baseStats.push({
        title: 'activeCustomers',
        value: companyCustomers.length,
        icon: Users,
        color: 'text-purple-500',
      });
    }

    return baseStats;
  }, [balances, features, user?.role, companyCustomers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {user?.role === 'staff' 
            ? t.nav[`${user.role}Dashboard`] 
            : t.nav.dashboard}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            onClick={() => {
              if (stat.icon === Users && (user?.role === 'staff' || user?.role === 'consultant')) {
                setIsCustomersDialogOpen(true);
              }
            }}
            style={stat.icon === Users ? { cursor: 'pointer' } : undefined}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t.nav[stat.title]}
                </p>
                <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                  {stat.value}
                </p>
              </div>
              <div className={cn(
                "p-3 rounded-lg bg-gray-50 dark:bg-gray-700",
                stat.color
              )}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          {t.features.title}
        </h2>
        <UnreadMessagesOverview />
      </div>

      {user?.role === 'customer' && (
        <CustomerCompanySelector />
      )}
      
      {userCompany && (user?.role === 'consultant' || user?.role === 'staff') && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="relative">
            <CompanyInformation company={userCompany} />
            <Button
              variant="secondary"
              onClick={() => setIsEditDialogOpen(true)}
              className="absolute top-6 right-6 !p-2"
            >
              <Pencil className="w-5 h-5" />
            </Button>
          </div>
          <CompanyUsers companyId={userCompany.id} />
        </div>
      )}
      
      {userCompany && (
        <EditCompanyDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSubmit={handleEditCompany}
          company={userCompany}
        />
      )}
      
      {userCompany && (
        <CompanyCustomersDialog
          isOpen={isCustomersDialogOpen}
          onClose={() => setIsCustomersDialogOpen(false)}
        />
      )}
    </div>
  );
}
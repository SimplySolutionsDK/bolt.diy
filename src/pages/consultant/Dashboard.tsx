import React from 'react';
import { Clock, Users, CreditCard, Lightbulb } from 'lucide-react';
import { useCardStore } from '@/stores/cardStore';
import { useFeatureStore } from '@/stores/featureStore';
import { useCustomers } from '@/hooks/useCustomers';
import { useAuthStore } from '@/stores/authStore';
import { useCompanyStore } from '@/stores/companyStore';
import { motion } from 'framer-motion';
import UnreadMessagesOverview from '@/components/features/UnreadMessagesOverview';
import CompanyInformation from '@/components/companies/CompanyInformation';
import CompanyUsers from '@/components/companies/CompanyUsers';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { cn } from '@/utils/cn';
import Button from '@/components/ui/Button';
import EditCompanyDialog from '@/components/companies/EditCompanyDialog';
import { Pencil } from 'lucide-react';

export default function ConsultantDashboard() {
  const { cards, initialize: initializeCards } = useCardStore();
  const { features, initialize: initializeFeatures } = useFeatureStore();
  const { companies, initialize: initializeCompanies, updateCompany } = useCompanyStore();
  const { user } = useAuthStore();
  const { customers } = useCustomers();
  const { language } = useLanguage();
  const t = translations[language];
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  React.useEffect(() => {
    initializeCards();
    initializeFeatures();
    initializeCompanies();
  }, [initializeCards, initializeFeatures, initializeCompanies]);

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

  const stats = [
    {
      title: t.nav.activeCards,
      value: cards.filter(card => card.status === 'active').length,
      icon: CreditCard,
      color: 'text-blue-500',
    },
    {
      title: t.nav.activeFeatures,
      value: features.filter(feature => feature.status === 'in_progress').length,
      icon: Lightbulb,
      color: 'text-yellow-500',
    },
    {
      title: t.nav.totalHours,
      value: cards.reduce((total, card) => total + card.remainingHours, 0).toFixed(1),
      icon: Clock,
      color: 'text-green-500',
    },
    {
      title: t.nav.activeCustomers,
      value: customers.filter(user => user.role === 'customer').length,
      icon: Users,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {t.nav.consultantDashboard}
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
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
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
      
      {userCompany && (
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
    </div>
  );
}
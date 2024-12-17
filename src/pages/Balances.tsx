import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import CreateBalanceDialog from '@/components/balances/CreateBalanceDialog';
import BalanceList from '@/components/balances/BalanceList';
import { useBalanceStore } from '@/stores/balanceStore';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { useAuthStore } from '@/stores/authStore';
import type { Balance } from '@/types';

export default function Balances() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const { balances, loading, createBalance, initialize, cleanup } = useBalanceStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].balances;

  React.useEffect(() => {
    initialize();
    return () => cleanup();
  }, [initialize, cleanup]);

  const handleBalanceClick = (balance: Balance) => {
    navigate('/time', { state: { selectedBalanceId: balance.id } });
  };

  const handleCreateBalance = async (data: any) => {
    try {
      await createBalance({
        ...data,
        initialBalance: Number(data.initialBalance || 10)
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      // Let the dialog handle the error
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {t.title}
        </h1>
        {user?.role === 'staff' && (
          <div className="flex justify-start md:justify-end">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t.createBalance}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <BalanceList 
          balances={balances} 
          loading={loading} 
          onBalanceClick={handleBalanceClick} 
        />
      </div>

      <CreateBalanceDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateBalance}
        isLoading={loading}
      />
    </div>
  );
}
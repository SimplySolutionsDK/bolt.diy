import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import CreateCardDialog from '@/components/cards/CreateCardDialog';
import CardList from '@/components/cards/CardList';
import { useCardStore } from '@/stores/cardStore';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { useAuthStore } from '@/stores/authStore';


const INITIAL_HOURS = 10;

export default function Cards() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const { cards, loading, createCard, initialize, cleanup } = useCardStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].cards;

  React.useEffect(() => {
    initialize();
    return () => cleanup();
  }, [initialize, cleanup]);

  const handleCardClick = (card: PrepaidCard) => {
    navigate('/time', { state: { selectedCardId: card.id } });
  };

  const handleCreateCard = async (data: any) => {
    try {
      await createCard({
        ...data,
        totalHours: Number(data.totalHours || INITIAL_HOURS)
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create card:', error);
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
              {t.createCard}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <CardList cards={cards} loading={loading} onCardClick={handleCardClick} />
      </div>

      <CreateCardDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateCard}
        isLoading={loading}
      />
    </div>
  );
}
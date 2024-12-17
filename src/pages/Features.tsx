import React from 'react';
import { Plus, Loader } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import { useFeatureStore } from '@/stores/featureStore';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import Button from '@/components/ui/Button';
import FeatureList from '@/components/features/FeatureList';
import CreateFeatureDialog from '@/components/features/CreateFeatureDialog';
import FeatureDetails from '@/components/features/FeatureDetails';

export default function Features() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const { features, loading, createFeature, initialize, cleanup } = useFeatureStore();
  const { language } = useLanguage();
  const t = translations[language].features;

  React.useEffect(() => {
    initialize();
    return () => cleanup();
  }, [initialize, cleanup]);

  const handleCreateFeature = async (data: any) => {
    try {
      await createFeature(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create feature:', error);
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {t.title}
              </h1>
              <div className="flex justify-start md:justify-end">
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  {t.createFeature}
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <FeatureList features={features} loading={loading} />
            </div>

            <CreateFeatureDialog
              isOpen={isCreateDialogOpen}
              onClose={() => setIsCreateDialogOpen(false)}
              onSubmit={handleCreateFeature}
              isLoading={loading}
            />
          </div>
        }
      />
      <Route path="/:id" element={<FeatureDetails />} />
    </Routes>
  );
}
import React from 'react';
import { Plus, Users, ArrowLeft } from 'lucide-react';
import { useCompanyStore } from '@/stores/companyStore';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import CreateCompanyDialog from '@/components/companies/CreateCompanyDialog';

export default function Companies() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const { companies, loading, createCompany, initialize, cleanup } = useCompanyStore();
  const { language } = useLanguage();
  const t = translations[language].nav;
  const navigate = useNavigate();

  React.useEffect(() => {
    initialize();
    return () => cleanup();
  }, [initialize, cleanup]);

  const handleCreateCompany = async (data: any) => {
    try {
      await createCompany(data);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create company:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => navigate('/admin')}
            className="!p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Companies
          </h1>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Company
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-100 dark:bg-gray-700 rounded-lg h-24 animate-pulse"
              />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No companies found. Create one to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => navigate(`/companies/${company.id}`)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {company.name}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>View Users</span>
                  </div>
                </div>
                {company.description && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {company.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {company.address && (
                    <span>{company.address}</span>
                  )}
                  {company.phone && (
                    <span>{company.phone}</span>
                  )}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {company.website}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateCompanyDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateCompany}
        isLoading={loading}
      />
    </div>
  );
}
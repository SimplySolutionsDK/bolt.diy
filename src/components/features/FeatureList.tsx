import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lightbulb, Trash2, Clock, User } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import type { Feature } from '@/types';
import { cn } from '@/utils/cn';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { format } from 'date-fns';
import DeleteDialog from '@/components/ui/DeleteDialog';
import { useAuthStore } from '@/stores/authStore';
import { useFeatureStore } from '@/stores/featureStore';
import { useCustomers } from '@/hooks/useCustomers';
import MessageCounter from './MessageCounter';

interface FeatureListProps {
  features: Feature[];
  loading?: boolean;
}

function AssignedConsultant({ consultantId }: { consultantId?: string }) {
  const { user, loading } = useUser(consultantId);
  
  if (loading) {
    return <span className="text-gray-400">Loading...</span>;
  }
  
  if (!user) {
    return <span className="text-gray-400">Unassigned</span>;
  }
  
  return (
    <span className="text-gray-600 dark:text-gray-300">
      {user.name} (Consultant)
    </span>
  );
}

interface FeatureGroupProps {
  customerName: string;
  features: Feature[];
  onFeatureClick: (feature: Feature) => void;
  onDeleteFeature: (feature: Feature) => void;
  isStaff: boolean;
  featureToDelete: Feature | null;
  isDeleting: boolean;
  onDeleteConfirm: () => Promise<void>;
  onDeleteCancel: () => void;
}

function FeatureGroup({ 
  customerName, 
  features, 
  onFeatureClick, 
  onDeleteFeature, 
  isStaff,
  featureToDelete,
  isDeleting,
  onDeleteConfirm,
  onDeleteCancel
}: FeatureGroupProps) {
  const { language } = useLanguage();
  const t = translations[language].features;

  const getPriorityColor = (priority: Feature['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    }
  };

  const getStatusColor = (status: Feature['status']) => {
    switch (status) {
      case 'proposed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'scoping':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
        {customerName}
      </h3>
      {features.map((feature, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          key={feature.id}
          onClick={() => onFeatureClick(feature)}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {feature.title}
                </h3>
                <div className="flex gap-2">
                  <span className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full',
                    getPriorityColor(feature.priority)
                  )}>
                    {t.priority[feature.priority]}
                  </span>
                  <span className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full',
                    getStatusColor(feature.status)
                  )}>
                    {t.status[feature.status]}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <MessageCounter 
                featureId={feature.id} 
                className="text-gray-500 dark:text-gray-400"
              />
              {isStaff && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFeature(feature);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {format(feature.createdAt, 'MMM d, yyyy')}
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <AssignedConsultant consultantId={feature.assignedTo} />
            </div>
          </div>
        </motion.div>
      ))}
      
      <DeleteDialog
        isOpen={!!featureToDelete}
        onClose={onDeleteCancel}
        onConfirm={onDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Feature"
        description={`Are you sure you want to delete feature "${featureToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}

export default function FeatureList({ features, loading }: FeatureListProps) {
  const { language } = useLanguage();
  const { user } = useAuthStore();
  const [featureToDelete, setFeatureToDelete] = React.useState<Feature | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { deleteFeature } = useFeatureStore();
  const navigate = useNavigate();
  const t = translations[language].features;
  const { customers } = useCustomers();
  
  const handleDelete = async () => {
    if (!featureToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteFeature(featureToDelete.id);
    } finally {
      setIsDeleting(false);
      setFeatureToDelete(null);
    }
  };

  const organizedFeatures = useMemo(() => {
    if (!user) return [];

    const filteredFeatures = user.role === 'staff'
      ? features
      : features.filter(feature => feature.customerId === user.id);

    if (user.role === 'staff') {
      const groups = new Map<string, { customerName: string; features: Feature[] }>();
      
      filteredFeatures.forEach(feature => {
        const customer = customers.find(c => c.id === feature.customerId);
        if (!customer) return;
        
        if (!groups.has(feature.customerId)) {
          groups.set(feature.customerId, {
            customerName: customer.name,
            features: []
          });
        }
        
        groups.get(feature.customerId)?.features.push(feature);
      });
      
      return Array.from(groups.values())
        .sort((a, b) => a.customerName.localeCompare(b.customerName));
    }

    return [{
      customerName: user.name,
      features: filteredFeatures.sort((a, b) => 
        b.createdAt.getTime() - a.createdAt.getTime()
      )
    }];
  }, [features, user, customers]);

  const handleFeatureClick = (feature: Feature) => {
    navigate(`/features/${feature.id}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-100 dark:bg-gray-700 rounded-lg h-32 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="text-center py-12">
        <Lightbulb className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {t.noFeatures}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t.createPrompt}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {organizedFeatures.map(({ customerName, features }) => (
        <FeatureGroup
          key={customerName}
          customerName={customerName}
          features={features}
          onFeatureClick={handleFeatureClick}
          onDeleteFeature={setFeatureToDelete}
          featureToDelete={featureToDelete}
          isDeleting={isDeleting}
          onDeleteConfirm={handleDelete}
          onDeleteCancel={() => setFeatureToDelete(null)}
          isStaff={user?.role === 'staff'}
        />
      ))}
    </div>
  );
}
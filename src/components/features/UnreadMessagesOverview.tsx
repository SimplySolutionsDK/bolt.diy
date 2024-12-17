import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, User, ArrowRight, Inbox } from 'lucide-react';
import { memo } from 'react';
import { useFeatureStore } from '@/stores/featureStore';
import { useMessages } from '@/hooks/useMessages';
import { useCustomers } from '@/hooks/useCustomers';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/utils/cn';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';

const FeatureWithUnreadMessages = memo(({ featureId }: { featureId: string }) => {
  const { features } = useFeatureStore();
  const { messages } = useMessages(featureId);
  const navigate = useNavigate();
  const feature = features.find(f => f.id === featureId);
  const { user: customer } = useUser(feature?.customerId);
  const { user: consultant } = useUser(feature?.assignedTo);
  
  if (!feature) return null;

  const unreadCount = messages.filter(m => m.status !== 'read').length;
  if (unreadCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-all cursor-pointer"
      onClick={() => navigate(`/features/${feature.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {feature.title}
          </h3>
          <div className="mt-1 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {customer?.name || 'Unknown Customer'}
            </div>
            {consultant && (
              <div className="flex items-center gap-1">
                <span>→</span>
                {consultant.name}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-sm",
            "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
          )}>
            <MessageCircle className="w-4 h-4" />
            <span>{unreadCount}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </motion.div>
  );
});

FeatureWithUnreadMessages.displayName = 'FeatureWithUnreadMessages';
export default function UnreadMessagesOverview() {
  const { features } = useFeatureStore();
  
  return (
    <div className="space-y-4">
      {features.length === 0 && (
        <div className="text-center py-12">
          <Inbox className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            No unread messages
          </h3>
        </div>
      )}
      {features.map(feature => (
        <FeatureWithUnreadMessages key={feature.id} featureId={feature.id} />
      ))}
    </div>
  );
}
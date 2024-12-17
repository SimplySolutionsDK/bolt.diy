import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFeatureStore } from '@/stores/featureStore';
import { useAuthStore } from '@/stores/authStore';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/utils/translations';
import { useCustomers } from '@/hooks/useCustomers';
import { ArrowLeft, Loader, Pencil, Check, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import ComboBox from '@/components/ui/ComboBox';
import { format } from 'date-fns';
import { cn } from '@/utils/cn';
import MessageBoard from './MessageBoard';
import { useMessages } from '@/hooks/useMessages';

export default function FeatureDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { features, updateFeature } = useFeatureStore();
  const { user: currentUser } = useAuthStore();
  const { language } = useLanguage();
  const t = translations[language].features;
  const { customers } = useCustomers();
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isEditingDescription, setIsEditingDescription] = React.useState(false);
  const [isEditingStatus, setIsEditingStatus] = React.useState(false);
  const [editedDescription, setEditedDescription] = React.useState('');
  const [descriptionError, setDescriptionError] = React.useState<string | null>(null);

  const { messages, sendMessage, loading: loadingMessages, messageContainerRef } = useMessages(id);

  const feature = features.find(f => f.id === id);
  
  const canEditStatus = React.useMemo(() => {
    if (!feature || !currentUser) return false;
    return (
      (currentUser.role === 'staff' || currentUser.role === 'consultant') &&
      feature.assignedTo === currentUser.id
    );
  }, [feature, currentUser]);

  React.useEffect(() => {
    if (feature) {
      setEditedDescription(feature.description);
    }
  }, [feature]);

  const handleStatusChange = async (newStatus: string) => {
    if (!feature) return;
    setLoading(true);
    try {
      await updateFeature(feature.id, { status: newStatus });
      setIsEditingStatus(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  const customerOptions = React.useMemo(() => 
    customers
      .filter(user => user.role === 'customer')
      .map(customer => ({
        value: customer.id,
        label: customer.name
      })),
    [customers]
  );

  const staffOptions = React.useMemo(() => 
    customers
      .filter(user => user.role === 'staff')
      .map(staff => ({
        value: staff.id,
        label: staff.name
      })),
    [customers]
  );

  const handleAssignCustomer = async (customerId: string) => {
    if (!feature) return;
    setLoading(true);
    try {
      await updateFeature(feature.id, { customerId: customerId || null });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignConsultant = async (consultantId: string) => {
    if (!feature) return;
    setLoading(true);
    try {
      await updateFeature(feature.id, { 
        assignedTo: consultantId || null 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDescriptionEdit = async () => {
    if (!feature || !editedDescription.trim()) return;
    
    if (editedDescription.length < 10) {
      setDescriptionError('Description must be at least 10 characters');
      return;
    }
    
    setLoading(true);
    try {
      await updateFeature(feature.id, { description: editedDescription.trim() });
      setIsEditingDescription(false);
      setDescriptionError(null);
    } catch (error) {
      setDescriptionError('Failed to update description');
    } finally {
      setLoading(false);
    }
  };

  const cancelDescriptionEdit = () => {
    setIsEditingDescription(false);
    setEditedDescription(feature?.description || '');
    setDescriptionError(null);
  };

  if (!feature) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/features')}
          className="!p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {feature.title}
          </h1>
          <div className="flex items-center gap-2">
            {canEditStatus ? (
              <select
                value={feature.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={loading}
                className={cn(
                  "px-3 py-1 text-sm rounded-md border",
                  "bg-white dark:bg-gray-800",
                  "border-gray-300 dark:border-gray-700",
                  "focus:ring-blue-500 focus:border-blue-500"
                )}
              >
                <option value="proposed">{t.status.proposed}</option>
                <option value="scoping">{t.status.scoping}</option>
                <option value="in_progress">{t.status.in_progress}</option>
                <option value="completed">{t.status.completed}</option>
              </select>
            ) : (
              <span className={cn(
                "px-3 py-1 text-sm rounded-full",
                feature.status === 'proposed'
                  ? "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                  : feature.status === 'scoping'
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                  : feature.status === 'in_progress'
                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                  : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
              )}>
                {t.status[feature.status]}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            <div className="flex items-center justify-between">
              <span>{t.details.description}</span>
              {!isEditingDescription && (
                <button
                  onClick={() => setIsEditingDescription(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
          </h2>
          {isEditingDescription ? (
            <div className="space-y-2">
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className={cn(
                  "w-full px-3 py-2 border rounded-md shadow-sm",
                  "placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500",
                  "dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100",
                  "sm:text-sm",
                  descriptionError && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
                rows={4}
                placeholder="Enter feature description..."
              />
              {descriptionError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {descriptionError}
                </p>
              )}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleDescriptionEdit}
                  isLoading={loading}
                  className="!py-1.5"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button
                  variant="secondary"
                  onClick={cancelDescriptionEdit}
                  className="!py-1.5"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              {feature.description}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              {t.details.assignCustomer}
            </h2>
            <ComboBox
              options={customerOptions}
              value={feature.customerId || ''}
              onChange={handleAssignCustomer}
              onSearch={setSearchQuery}
              placeholder={t.details.selectCustomer}
              isLoading={loading}
            />
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              {t.details.assignConsultant}
            </h2>
            <ComboBox
              options={staffOptions}
              value={feature.assignedTo || ''}
              onChange={handleAssignConsultant}
              onSearch={setSearchQuery}
              placeholder={t.details.selectConsultant}
              isLoading={loading}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t.details.createdAt}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {format(feature.createdAt, 'PPP')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t.details.lastUpdated}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {format(feature.updatedAt, 'PPP')}
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Discussion
          </h2>
          <MessageBoard
            featureId={feature.id}
            messages={messages}
            onSendMessage={sendMessage}
            loading={loadingMessages}
            messageContainerRef={messageContainerRef}
          />
        </div>
      </div>
    </div>
  );
}
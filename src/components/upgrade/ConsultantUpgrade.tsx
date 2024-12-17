import React from 'react';
import { Shield, Check } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createConsultantCheckoutSession, getStripe } from '@/lib/stripe';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/hooks/useLanguage'; 
import { translations } from '@/utils/translations';

export default function ConsultantUpgrade() {
  const { user } = useAuthStore();
  const { language } = useLanguage();
  const t = translations[language].upgrade;
  const [loading, setLoading] = React.useState(false);
  const [showMockSuccess, setShowMockSuccess] = React.useState(false);

  const handleUpgrade = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const session = await createConsultantCheckoutSession(user.id, user.email);
      
      // Get Stripe instance
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }
      
      // Redirect to Stripe checkout
      if (session.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error('Error starting upgrade:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'consultant') {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-medium text-green-900 dark:text-green-100">
            {t.alreadyConsultant}
          </h3>
        </div>
        <p className="mt-2 text-green-700 dark:text-green-300">
          {t.enjoyBenefits}
        </p>
      </div>
    );
  }

  if (showMockSuccess) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-medium text-green-900 dark:text-green-100">
            {t.upgradeSuccess}
          </h3>
        </div>
        <p className="mt-2 text-green-700 dark:text-green-300">
          {t.processingUpgrade}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t.consultantPlan}
          </h2>
        </div>
        
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          {t.consultantDescription}
        </p>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {t.features}
          </h3>
          <ul className="space-y-3">
            {t.featuresList.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              $49
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              / {t.month}
            </span>
          </div>
          <Button
            onClick={handleUpgrade}
            isLoading={loading}
            className="mt-4 w-full"
          >
            {t.upgradeNow}
          </Button>
        </div>
      </div>
    </div>
  );
}
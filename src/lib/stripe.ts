import { loadStripe } from '@stripe/stripe-js';
import type { User } from '@/types';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.warn('Stripe publishable key not found');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

// Subscription price IDs
export const SUBSCRIPTION_PRICES = {
  CONSULTANT: import.meta.env.VITE_STRIPE_CONSULTANT_PRICE_ID || 'price_consultant',
} as const;

export async function createConsultantCheckoutSession(userId: string, userEmail: string) {
  try {
    // For development, return mock data if no Stripe key is set
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!stripeKey) {
      console.log('Development mode: Mocking Stripe checkout');
      return { url: '#mock-checkout', success: true };
    }

    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        userEmail,
        priceId: SUBSCRIPTION_PRICES.CONSULTANT,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { url } = await response.json();
    return { url, success: true };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function getSubscriptionStatus(userId: string): Promise<User['subscriptionStatus']> {
  try {
    const response = await fetch('/.netlify/functions/get-subscription-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to get subscription status');
    }

    const { status } = await response.json();
    return status;
  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw error;
  }
}
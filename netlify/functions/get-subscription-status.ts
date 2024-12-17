import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { db } from '../../src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const { userId } = JSON.parse(event.body || '');
    
    // Get user document
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' }),
      };
    }

    const userData = userDoc.data();
    const subscriptionId = userData.subscriptionId;

    if (!subscriptionId) {
      return {
        statusCode: 200,
        body: JSON.stringify({ status: null }),
      };
    }

    // Get subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    return {
      statusCode: 200,
      body: JSON.stringify({ status: subscription.status }),
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get subscription status' }),
    };
  }
}
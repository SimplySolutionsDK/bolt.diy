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
    const { userId, userEmail, priceId } = JSON.parse(event.body || '');

    // Get or create Stripe customer
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();
    
    let stripeCustomerId = userData?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          firebaseUserId: userId,
        },
      });
      stripeCustomerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.URL}/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/settings`,
      metadata: {
        firebaseUserId: userId,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session' }),
    };
  }
}
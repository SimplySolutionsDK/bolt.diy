import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { db } from '../../src/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const handler: Handler = async (event) => {
  try {
    const sig = event.headers['stripe-signature'];
    let payload = event.body;

    // Ensure raw body is used if Base64 encoded
    if (event.isBase64Encoded) {
      payload = Buffer.from(payload!, 'base64').toString('utf8');
    }

    console.log('Incoming Stripe Signature:', sig);
    console.log('Raw Payload:', payload);

    // Construct the Stripe event
    const stripeEvent = stripe.webhooks.constructEvent(
      payload!,
      sig!,
      endpointSecret
    );

    console.log('Constructed Stripe Event:', stripeEvent.type);
    console.log('Event Data:', stripeEvent.data.object);

    // Handle the event
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.firebaseUserId;

        console.log('Checkout Session Completed Event:', session);
        console.log('User ID from metadata:', userId);

        if (userId) {
          await updateDoc(doc(db, 'users', userId), {
            role: 'consultant',
            stripeCustomerId: session.customer,
            subscriptionId: session.subscription,
            subscriptionStatus: 'active',
          });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.firebaseUserId;

        console.log('Subscription Event:', stripeEvent.type);
        console.log('Subscription Data:', subscription);
        console.log('User ID from metadata:', userId);

        if (userId) {
          await updateDoc(doc(db, 'users', userId), {
            subscriptionStatus: subscription.status,
            ...(subscription.status === 'canceled' && { role: 'customer' }),
          });
        }
        break;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Stripe webhook error:', error.message, error.stack);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Webhook error' }),
    };
  }
};

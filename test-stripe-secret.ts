import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

async function testSecret() {
  try {
    const products = await stripe.products.list();
    console.log('Stripe Products:', products);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching Stripe products:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

testSecret();

import Stripe from 'stripe';

let connectionSettings: any;

async function getCredentials() {
  const envSecret = process.env.STRIPE_SECRET_KEY;
  const envPublishable = process.env.STRIPE_PUBLISHABLE_KEY;
  
  if (envSecret && envPublishable) {
    return {
      publishableKey: envPublishable,
      secretKey: envSecret,
    };
  }

  throw new Error('Stripe credentials not found. Please set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY environment variables');
}

export async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();
  return new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil',
  });
}

export async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}

export async function getStripeSecretKey() {
  const { secretKey } = await getCredentials();
  return secretKey;
}

let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const secretKey = await getStripeSecretKey();
    // Placeholder - implement Stripe sync service as needed
    // For now returns null
  }
  return stripeSync;
}

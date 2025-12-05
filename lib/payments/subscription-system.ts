/**
 * BARRELVERSE PREMIUM SUBSCRIPTION SYSTEM
 * =======================================
 * Handles all premium features, subscriptions, and payments
 * 
 * Revenue Streams:
 * - Premium Monthly: $9.99/mo
 * - Premium Annual: $89.99/yr (25% savings)
 * - Marketplace Commission: 5% on all sales
 * - Auction Fees: 7% on auction sales
 * - Insurance Referrals: 10% commission
 * 
 * Built by Claude + Roy Henderson
 * CR AudioViz AI, LLC - BarrelVerse
 * 2025-12-04
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// ============================================
// PRICING TIERS
// ============================================

export const PRICING_TIERS = {
  FREE: {
    id: 'free',
    name: 'Collector',
    price: 0,
    interval: null,
    features: [
      'Track up to 25 bottles',
      'Basic tasting notes',
      '5 trivia games per day',
      'Museum access',
      'Community forums (read only)',
    ],
    limits: {
      maxBottles: 25,
      triviaPerDay: 5,
      marketplaceListings: 0,
      photoUploads: 10,
      valueAlerts: 1,
    }
  },
  PREMIUM_MONTHLY: {
    id: 'premium_monthly',
    name: 'Connoisseur',
    price: 999, // $9.99 in cents
    interval: 'month',
    stripePriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    features: [
      'Unlimited bottle tracking',
      'Advanced tasting AI assistant',
      'Unlimited trivia & games',
      'Full museum + VR tours',
      'Community forums (full access)',
      'Marketplace: Buy & Sell',
      '10 active listings',
      'Price alerts (unlimited)',
      'Collection insurance quotes',
      'Shareable certifications',
      'Priority support',
    ],
    limits: {
      maxBottles: -1, // unlimited
      triviaPerDay: -1,
      marketplaceListings: 10,
      photoUploads: -1,
      valueAlerts: -1,
    }
  },
  PREMIUM_ANNUAL: {
    id: 'premium_annual',
    name: 'Connoisseur (Annual)',
    price: 8999, // $89.99 in cents (save ~25%)
    interval: 'year',
    stripePriceId: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID,
    features: [
      'Everything in Connoisseur',
      '25% savings vs monthly',
      '25 marketplace listings',
      'Early access to new features',
      'Exclusive annual member badge',
    ],
    limits: {
      maxBottles: -1,
      triviaPerDay: -1,
      marketplaceListings: 25,
      photoUploads: -1,
      valueAlerts: -1,
    }
  },
  MASTER: {
    id: 'master',
    name: 'Master Distiller',
    price: 2499, // $24.99/mo
    interval: 'month',
    stripePriceId: process.env.STRIPE_MASTER_PRICE_ID,
    features: [
      'Everything in Connoisseur',
      'Unlimited marketplace listings',
      'Auction hosting (reduced fees: 5%)',
      'Verified collector badge',
      'Featured profile placement',
      'White-glove support',
      'Early release notifications',
      'Private trading network',
    ],
    limits: {
      maxBottles: -1,
      triviaPerDay: -1,
      marketplaceListings: -1,
      photoUploads: -1,
      valueAlerts: -1,
    }
  }
};

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

/**
 * Create a Stripe customer for a user
 */
export async function createStripeCustomer(userId: string, email: string, name?: string): Promise<string> {
  // Check if customer already exists
  const { data: existingUser } = await supabase
    .from('bv_users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (existingUser?.stripe_customer_id) {
    return existingUser.stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      barrelverse_user_id: userId,
      platform: 'barrelverse'
    }
  });

  // Save to database
  await supabase
    .from('bv_users')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  return customer.id;
}

/**
 * Create a checkout session for subscription
 */
export async function createSubscriptionCheckout(
  userId: string,
  email: string,
  tierId: 'premium_monthly' | 'premium_annual' | 'master',
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const tier = PRICING_TIERS[tierId.toUpperCase() as keyof typeof PRICING_TIERS];
  
  if (!tier || !("stripePriceId" in tier) || !tier.stripePriceId) {
    throw new Error(`Invalid tier: ${tierId}`);
  }

  const customerId = await createStripeCustomer(userId, email);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: (tier as any).stripePriceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      user_id: userId,
      tier_id: tierId,
      platform: 'barrelverse'
    },
    subscription_data: {
      metadata: {
        user_id: userId,
        tier_id: tierId,
      }
    },
    allow_promotion_codes: true,
  });

  return session.url || '';
}

/**
 * Handle successful subscription
 */
export async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata.user_id;
  const tierId = subscription.metadata.tier_id;

  if (!userId) {
    console.error('No user_id in subscription metadata');
    return;
  }

  // Update user subscription status
  await supabase
    .from('bv_users')
    .update({
      subscription_tier: tierId,
      subscription_status: subscription.status,
      subscription_id: subscription.id,
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  // Log the event
  await supabase
    .from('bv_subscription_events')
    .insert({
      user_id: userId,
      event_type: 'subscription_created',
      tier_id: tierId,
      stripe_subscription_id: subscription.id,
      amount: subscription.items.data[0]?.price?.unit_amount || 0,
      currency: subscription.currency,
      metadata: { subscription_id: subscription.id }
    });

  // Grant any welcome bonuses
  await grantSubscriptionBonus(userId, tierId);
}

/**
 * Handle subscription cancellation
 */
export async function handleSubscriptionCanceled(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata.user_id;

  if (!userId) return;

  await supabase
    .from('bv_users')
    .update({
      subscription_tier: 'free',
      subscription_status: 'canceled',
      subscription_canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  await supabase
    .from('bv_subscription_events')
    .insert({
      user_id: userId,
      event_type: 'subscription_canceled',
      stripe_subscription_id: subscription.id,
    });
}

/**
 * Grant subscription welcome bonus
 */
async function grantSubscriptionBonus(userId: string, tierId: string): Promise<void> {
  const bonuses: Record<string, { proofTokens: number; badge: string }> = {
    premium_monthly: { proofTokens: 500, badge: 'connoisseur_subscriber' },
    premium_annual: { proofTokens: 2500, badge: 'annual_supporter' },
    master: { proofTokens: 5000, badge: 'master_distiller' }
  };

  const bonus = bonuses[tierId];
  if (!bonus) return;

  // Grant $PROOF tokens
  await supabase.rpc('add_proof_tokens', {
    p_user_id: userId,
    p_amount: bonus.proofTokens,
    p_reason: `Welcome bonus for ${tierId} subscription`
  });

  // Grant badge
  await supabase
    .from('bv_user_achievements')
    .insert({
      user_id: userId,
      achievement_id: bonus.badge,
      earned_at: new Date().toISOString()
    })
    .onConflict('user_id,achievement_id')
    .ignore();
}

// ============================================
// MARKETPLACE PAYMENTS
// ============================================

/**
 * Create a payment intent for marketplace purchase
 */
export async function createMarketplacePayment(
  buyerId: string,
  sellerId: string,
  listingId: string,
  amount: number, // in cents
  description: string
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  // Get buyer's customer ID
  const { data: buyer } = await supabase
    .from('bv_users')
    .select('stripe_customer_id, email')
    .eq('id', buyerId)
    .single();

  const customerId = buyer?.stripe_customer_id || 
    await createStripeCustomer(buyerId, buyer?.email || '');

  // Calculate platform fee (5%)
  const platformFee = Math.round(amount * 0.05);
  const sellerPayout = amount - platformFee;

  // Get seller's connected account (if they have one)
  const { data: seller } = await supabase
    .from('bv_users')
    .select('stripe_connect_id')
    .eq('id', sellerId)
    .single();

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    customer: customerId,
    description,
    metadata: {
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: sellerId,
      platform_fee: platformFee,
      seller_payout: sellerPayout,
      type: 'marketplace_purchase'
    },
    // If seller has connected account, use transfers
    ...(seller?.stripe_connect_id && {
      transfer_data: {
        destination: seller.stripe_connect_id,
        amount: sellerPayout,
      },
    }),
  });

  return {
    clientSecret: paymentIntent.client_secret || '',
    paymentIntentId: paymentIntent.id
  };
}

// ============================================
// AUCTION PAYMENTS
// ============================================

/**
 * Process auction winning payment
 */
export async function processAuctionPayment(
  auctionId: string,
  winnerId: string,
  sellerId: string,
  winningBid: number // in cents
): Promise<{ success: boolean; error?: string }> {
  try {
    // Calculate platform fee (7% for auctions)
    const platformFee = Math.round(winningBid * 0.07);
    const sellerPayout = winningBid - platformFee;

    // Get winner's payment method
    const { data: winner } = await supabase
      .from('bv_users')
      .select('stripe_customer_id, default_payment_method')
      .eq('id', winnerId)
      .single();

    if (!winner?.stripe_customer_id || !winner?.default_payment_method) {
      return { success: false, error: 'No payment method on file' };
    }

    // Create and confirm payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: winningBid,
      currency: 'usd',
      customer: winner.stripe_customer_id,
      payment_method: winner.default_payment_method,
      confirm: true,
      off_session: true,
      metadata: {
        auction_id: auctionId,
        winner_id: winnerId,
        seller_id: sellerId,
        platform_fee: platformFee,
        seller_payout: sellerPayout,
        type: 'auction_payment'
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // Update auction status
      await supabase
        .from('bv_auctions')
        .update({
          status: 'paid',
          payment_intent_id: paymentIntent.id,
          paid_at: new Date().toISOString()
        })
        .eq('id', auctionId);

      return { success: true };
    }

    return { success: false, error: 'Payment failed' };
  } catch (error) {
    console.error('Auction payment error:', error);
    return { success: false, error: (error as Error).message };
  }
}

// ============================================
// INSURANCE REFERRALS
// ============================================

export const INSURANCE_PARTNERS = [
  {
    id: 'collectinsure',
    name: 'CollectInsure',
    description: 'Specialized spirits collection insurance',
    referralUrl: 'https://collectinsure.com/?ref=barrelverse',
    commission: 0.10, // 10%
    features: ['No deductibles', 'Breakage covered', 'Appreciation coverage'],
  },
  {
    id: 'chubb',
    name: 'Chubb Collectors',
    description: 'Premium collection insurance',
    referralUrl: 'https://chubb.com/collectors?ref=barrelverse',
    commission: 0.08,
    features: ['Worldwide coverage', 'Market value protection'],
  }
];

/**
 * Track insurance referral click
 */
export async function trackInsuranceReferral(
  userId: string,
  partnerId: string,
  collectionValue: number
): Promise<void> {
  await supabase
    .from('bv_insurance_referrals')
    .insert({
      user_id: userId,
      partner_id: partnerId,
      collection_value: collectionValue,
      clicked_at: new Date().toISOString(),
      status: 'clicked'
    });
}

// ============================================
// AFFILIATE TRACKING
// ============================================

export const RETAILER_AFFILIATES = [
  {
    id: 'totalwine',
    name: 'Total Wine',
    affiliateParam: 'bv_ref',
    commission: 0.05,
  },
  {
    id: 'reservebar',
    name: 'ReserveBar',
    affiliateParam: 'ref',
    commission: 0.08,
  },
  {
    id: 'drizly',
    name: 'Drizly',
    affiliateParam: 'utm_source',
    commission: 0.04,
  },
  {
    id: 'caskers',
    name: 'Caskers',
    affiliateParam: 'ref',
    commission: 0.10,
  }
];

/**
 * Generate affiliate link for a spirit
 */
export function generateAffiliateLink(
  retailerId: string,
  productUrl: string
): string {
  const retailer = RETAILER_AFFILIATES.find(r => r.id === retailerId);
  if (!retailer) return productUrl;

  const url = new URL(productUrl);
  url.searchParams.set(retailer.affiliateParam, 'barrelverse');
  return url.toString();
}

/**
 * Track affiliate click
 */
export async function trackAffiliateClick(
  userId: string | null,
  retailerId: string,
  spiritId: string
): Promise<void> {
  await supabase
    .from('bv_affiliate_clicks')
    .insert({
      user_id: userId,
      retailer_id: retailerId,
      spirit_id: spiritId,
      clicked_at: new Date().toISOString()
    });
}

// ============================================
// EXPORTS
// ============================================

export {
  stripe,
  supabase,
};

export default {
  PRICING_TIERS,
  createStripeCustomer,
  createSubscriptionCheckout,
  handleSubscriptionCreated,
  handleSubscriptionCanceled,
  createMarketplacePayment,
  processAuctionPayment,
  INSURANCE_PARTNERS,
  trackInsuranceReferral,
  RETAILER_AFFILIATES,
  generateAffiliateLink,
  trackAffiliateClick,
};


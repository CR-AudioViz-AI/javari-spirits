/**
 * STRIPE PAYMENT INTEGRATION
 * ==========================
 * Handle subscriptions, one-time payments, and webhooks
 * 
 * POST /api/payments/create-checkout - Create checkout session
 * POST /api/payments/create-portal - Create customer portal
 * GET /api/payments/plans - Get available plans
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// SUBSCRIPTION PLANS
// ============================================

const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Get started with basic features',
    price: 0,
    interval: 'month',
    features: [
      'Browse spirit database',
      'Basic search',
      '5 collection items',
      'Community reviews (read)',
      'Daily trivia',
    ],
    limits: {
      collections: 5,
      scans: 10,
      ai_requests: 5,
    },
  },
  enthusiast: {
    id: 'enthusiast',
    name: 'Enthusiast',
    description: 'For passionate spirit lovers',
    price: 9.99,
    interval: 'month',
    stripe_price_id: process.env.STRIPE_ENTHUSIAST_PRICE_ID || 'price_enthusiast',
    features: [
      'Unlimited collection items',
      'Advanced search & filters',
      'Unlimited bottle scans',
      'AI Cocktail Genius (50/month)',
      'Write reviews',
      'Price alerts',
      'Export collection',
      'No ads',
    ],
    limits: {
      collections: -1, // unlimited
      scans: -1,
      ai_requests: 50,
    },
  },
  connoisseur: {
    id: 'connoisseur',
    name: 'Connoisseur',
    description: 'The ultimate spirit experience',
    price: 24.99,
    interval: 'month',
    stripe_price_id: process.env.STRIPE_CONNOISSEUR_PRICE_ID || 'price_connoisseur',
    features: [
      'Everything in Enthusiast',
      'Unlimited AI requests',
      'Early access to features',
      'Exclusive virtual tastings',
      'Priority support',
      'API access',
      'Custom collections',
      'Distillery discounts',
    ],
    limits: {
      collections: -1,
      scans: -1,
      ai_requests: -1,
    },
  },
  annual_enthusiast: {
    id: 'annual_enthusiast',
    name: 'Enthusiast (Annual)',
    description: 'Save 20% with annual billing',
    price: 95.88, // $7.99/month
    interval: 'year',
    stripe_price_id: process.env.STRIPE_ENTHUSIAST_ANNUAL_ID || 'price_enthusiast_annual',
    features: ['All Enthusiast features', '2 months free'],
    limits: { collections: -1, scans: -1, ai_requests: 50 },
  },
  annual_connoisseur: {
    id: 'annual_connoisseur',
    name: 'Connoisseur (Annual)',
    description: 'Save 20% with annual billing',
    price: 239.88, // $19.99/month
    interval: 'year',
    stripe_price_id: process.env.STRIPE_CONNOISSEUR_ANNUAL_ID || 'price_connoisseur_annual',
    features: ['All Connoisseur features', '2 months free'],
    limits: { collections: -1, scans: -1, ai_requests: -1 },
  },
};

// ============================================
// GET - Get Plans
// ============================================

export async function GET() {
  return NextResponse.json({
    success: true,
    plans: Object.values(PLANS),
    features: {
      free: PLANS.free.features,
      enthusiast: PLANS.enthusiast.features,
      connoisseur: PLANS.connoisseur.features,
    },
  });
}

// ============================================
// POST - Handle Payment Actions
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, planId, successUrl, cancelUrl } = body;

    // Validate Stripe configuration
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey || stripeKey === 'your_stripe_secret_key') {
      // Return demo response if Stripe not configured
      return NextResponse.json({
        success: true,
        demo: true,
        message: 'Stripe not configured. Demo mode active.',
        checkoutUrl: successUrl || '/subscription/success?demo=true',
      });
    }

    // Dynamic import Stripe (only if key exists)
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    switch (action) {
      // ==========================================
      // CREATE CHECKOUT SESSION
      // ==========================================
      case 'create-checkout': {
        const plan = PLANS[planId as keyof typeof PLANS];
        if (!plan || !plan.stripe_price_id) {
          return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        // Get or create Stripe customer
        let customerId: string | undefined;
        
        if (userId) {
          const { data: profile } = await supabase
            .from('bv_user_profiles')
            .select('stripe_customer_id, email')
            .eq('user_id', userId)
            .single();

          if (profile?.stripe_customer_id) {
            customerId = profile.stripe_customer_id;
          } else if (profile?.email) {
            // Create new Stripe customer
            const customer = await stripe.customers.create({
              email: profile.email,
              metadata: { userId },
            });
            customerId = customer.id;

            // Save to profile
            await supabase
              .from('bv_user_profiles')
              .update({ stripe_customer_id: customerId })
              .eq('user_id', userId);
          }
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          customer: customerId,
          line_items: [
            {
              price: plan.stripe_price_id,
              quantity: 1,
            },
          ],
          success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
          metadata: {
            userId,
            planId,
          },
          subscription_data: {
            metadata: {
              userId,
              planId,
            },
          },
          allow_promotion_codes: true,
        });

        return NextResponse.json({
          success: true,
          checkoutUrl: session.url,
          sessionId: session.id,
        });
      }

      // ==========================================
      // CREATE CUSTOMER PORTAL
      // ==========================================
      case 'create-portal': {
        if (!userId) {
          return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const { data: profile } = await supabase
          .from('bv_user_profiles')
          .select('stripe_customer_id')
          .eq('user_id', userId)
          .single();

        if (!profile?.stripe_customer_id) {
          return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
        }

        const portalSession = await stripe.billingPortal.sessions.create({
          customer: profile.stripe_customer_id,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
        });

        return NextResponse.json({
          success: true,
          portalUrl: portalSession.url,
        });
      }

      // ==========================================
      // ONE-TIME PURCHASE (Credits, etc.)
      // ==========================================
      case 'purchase-credits': {
        const creditPackages = {
          small: { credits: 50, price: 499 }, // $4.99
          medium: { credits: 150, price: 999 }, // $9.99
          large: { credits: 500, price: 2499 }, // $24.99
        };

        const pkg = creditPackages[body.package as keyof typeof creditPackages];
        if (!pkg) {
          return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
          mode: 'payment',
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `${pkg.credits} AI Credits`,
                  description: `One-time purchase of ${pkg.credits} AI credits for Javari Spirits`,
                },
                unit_amount: pkg.price,
              },
              quantity: 1,
            },
          ],
          success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
          metadata: {
            userId,
            type: 'credits',
            credits: pkg.credits.toString(),
          },
        });

        return NextResponse.json({
          success: true,
          checkoutUrl: session.url,
          sessionId: session.id,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

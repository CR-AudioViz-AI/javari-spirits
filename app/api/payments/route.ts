// 2026-09-04: table names corrected against the live schema. These are renames
// the code never caught up with - bv_user_profiles and bv_users are both
// bv_profiles, bv_activity_log is bv_activities, bv_tickets is
// bv_support_tickets. Each returned PostgREST 42P01 and failed the WHOLE
// query, so every feature built on them returned nothing.
//
// Only verified renames were applied. bv_tasting_sessions and bv_user_favorites
// look like renames and are NOT: their columns do not exist in any candidate
// table, so they are unbuilt features and repointing them would swap a loud
// failure for a silent wrong answer.
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
import { requireCaller } from '@/lib/api/caller';
import { lazyAdminDb } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';

const supabase = lazyAdminDb();

// ============================================
// SUBSCRIPTION PLANS
// ============================================

// 2026-09-04: placeholder Stripe price ids removed.
//
// Each of these read `process.env.STRIPE_X_PRICE_ID || 'price_enthusiast'` and
// none of those variables is set on this project. A checkout therefore sent
// Stripe a price id that does not exist, and the customer saw a failure with no
// explanation of what was wrong.
//
// A fake id is worse than an absent one: the route's own guard already refuses
// when stripe_price_id is undefined, and the fallback was defeating it. Removing
// the fallback lets that guard do its job.
//
// This app needs a working buy path. Setting the four STRIPE_*_PRICE_ID variables
// on the Vercel project is what closes it - the code is now honest about them
// being missing.
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
    stripe_price_id: process.env.STRIPE_ENTHUSIAST_PRICE_ID,
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
    stripe_price_id: process.env.STRIPE_CONNOISSEUR_PRICE_ID,
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
    stripe_price_id: process.env.STRIPE_ENTHUSIAST_ANNUAL_ID,
    features: ['All Enthusiast features', '2 months free'],
    limits: { collections: -1, scans: -1, ai_requests: 50 },
  },
  annual_connoisseur: {
    id: 'annual_connoisseur',
    name: 'Connoisseur (Annual)',
    description: 'Save 20% with annual billing',
    price: 239.88, // $19.99/month
    interval: 'year',
    stripe_price_id: process.env.STRIPE_CONNOISSEUR_ANNUAL_ID,
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
    // user id deliberately not taken from the body.
    const {action,  planId, successUrl, cancelUrl} = body;
    const _c = await requireCaller(request);
    if (!_c.ok) return _c.res;
    const userId = _c.userId;

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
        // 2026-09-01: typed so stripe_price_id is visible. PLANS is inferred from
        // an object literal where not every entry carries the field, so TypeScript
        // narrows the union to the entries that lack it — and the guard below reads
        // as a property that does not exist rather than as a missing price.
        const plan = PLANS[planId as keyof typeof PLANS] as { id: string; stripe_price_id?: string } | undefined;
        if (!plan || !plan.stripe_price_id) {
          return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        // Get or create Stripe customer
        let customerId: string | undefined;
        
        if (userId) {
          const { data: profile } = await supabase
            .from('bv_profiles')
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
              .from('bv_profiles')
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
          .from('bv_profiles')
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

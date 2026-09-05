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
 * STRIPE CHECKOUT API
 * ====================
 * Creates Stripe checkout sessions for subscriptions
 * 
 * Built by Claude + Roy Henderson
 * CR AudioViz AI, LLC - BarrelVerse
 * 2025-12-04
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireCaller } from '@/lib/api/caller';
import Stripe from 'stripe';
import { lazyAdminDb } from '@/lib/supabase/admin';
// 2026-08-31: LAZY, not module scope. A Stripe client constructed here runs
// during `next build` when Next collects page data, so the BUILD would need a
// live STRIPE_SECRET_KEY — and the vault cannot serve a build. Constructing on first use
// means the key is read when a request arrives, after hydration has run.
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }
  return _stripe;
}

const supabase = lazyAdminDb();

// Price IDs from Stripe Dashboard
const PRICE_IDS: Record<string, string> = {
  premium_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
  premium_annual: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID || '',
  master: process.env.STRIPE_MASTER_PRICE_ID || ''
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // user id deliberately not taken from the body.
    const {tierId} = body;
    const _c = await requireCaller(request);
    if (!_c.ok) return _c.res;
    const userId = _c.userId;

    // Validate tier
    if (!PRICE_IDS[tierId]) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId: string | null = null;

    if (userId) {
      const { data: user } = await supabase
        .from('bv_profiles')
        .select('stripe_customer_id, email, display_name')
        .eq('id', userId)
        .single();

      if (user?.stripe_customer_id) {
        stripeCustomerId = user.stripe_customer_id;
      } else if (user?.email) {
        // Create new Stripe customer
        const customer = await getStripe().customers.create({
          email: user.email,
          name: user.display_name || undefined,
          metadata: {
            supabase_user_id: userId
          }
        });
        stripeCustomerId = customer.id;

        // Save to database
        await supabase
          .from('bv_profiles')
          .update({ stripe_customer_id: customer.id })
          .eq('id', userId);
      }
    }

    // Create checkout session
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: stripeCustomerId || undefined,
      line_items: [
        {
          price: PRICE_IDS[tierId],
          quantity: 1
        }
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          tier_id: tierId,
          user_id: userId || ''
        }
      },
      metadata: {
        tier_id: tierId,
        user_id: userId || ''
      },
      allow_promotion_codes: true
    });

    // Log the checkout attempt
    if (userId) {
      await supabase
        .from('bv_activities')
        .insert({
          user_id: userId,
          event_type: 'checkout_started',
          event_data: {
            tier_id: tierId,
            session_id: session.id
          }
        });
    }

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

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
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Price IDs from Stripe Dashboard
const PRICE_IDS: Record<string, string> = {
  premium_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
  premium_annual: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID || '',
  master: process.env.STRIPE_MASTER_PRICE_ID || ''
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tierId, userId } = body;

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
        .from('bv_users')
        .select('stripe_customer_id, email, display_name')
        .eq('id', userId)
        .single();

      if (user?.stripe_customer_id) {
        stripeCustomerId = user.stripe_customer_id;
      } else if (user?.email) {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.display_name || undefined,
          metadata: {
            supabase_user_id: userId
          }
        });
        stripeCustomerId = customer.id;

        // Save to database
        await supabase
          .from('bv_users')
          .update({ stripe_customer_id: customer.id })
          .eq('id', userId);
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
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
        .from('bv_activity_log')
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

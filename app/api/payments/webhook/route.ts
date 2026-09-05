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
 * STRIPE WEBHOOK HANDLER
 * =======================
 * Process Stripe events for subscriptions and payments
 * 
 * POST /api/payments/webhook - Handle Stripe webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import { lazyAdminDb } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';

const supabase = lazyAdminDb();

// ============================================
// POST - Handle Webhook
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    // Validate Stripe configuration
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeKey || stripeKey === 'your_stripe_secret_key') {
      console.log('[Webhook] Stripe not configured, skipping');
      return NextResponse.json({ received: true, demo: true });
    }

    // Dynamic import Stripe
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    let event: any;

    // Verify webhook signature
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: any) {
        console.error('[Webhook] Signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      // Parse without verification (dev mode)
      event = JSON.parse(body);
    }

    console.log(`[Webhook] Processing event: ${event.type}`);

    // ==========================================
    // HANDLE EVENTS
    // ==========================================

    switch (event.type) {
      // ==========================================
      // CHECKOUT COMPLETED
      // ==========================================
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        const type = session.metadata?.type;

        console.log(`[Webhook] Checkout completed for user ${userId}, plan ${planId}`);

        if (type === 'credits') {
          // Handle credit purchase
          const credits = parseInt(session.metadata?.credits || '0');
          if (userId && credits > 0) {
            await supabase.rpc('add_user_credits', {
              p_user_id: userId,
              p_credits: credits,
            });
            console.log(`[Webhook] Added ${credits} credits to user ${userId}`);
          }
        } else if (userId && planId) {
          // Handle subscription
          await supabase
            .from('bv_profiles')
            .update({
              subscription_plan: planId,
              subscription_status: 'active',
              stripe_subscription_id: session.subscription,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

          // Record transaction
          await supabase.from('bv_transactions').insert({
            user_id: userId,
            type: 'subscription',
            plan_id: planId,
            amount: session.amount_total / 100,
            currency: session.currency,
            stripe_session_id: session.id,
            status: 'completed',
          });
        }
        break;
      }

      // ==========================================
      // SUBSCRIPTION UPDATED
      // ==========================================
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await supabase
            .from('bv_profiles')
            .update({
              subscription_status: subscription.status,
              subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

          console.log(`[Webhook] Updated subscription for user ${userId}: ${subscription.status}`);
        }
        break;
      }

      // ==========================================
      // SUBSCRIPTION DELETED
      // ==========================================
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await supabase
            .from('bv_profiles')
            .update({
              subscription_plan: 'free',
              subscription_status: 'canceled',
              subscription_current_period_end: null,
              stripe_subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);

          console.log(`[Webhook] Subscription canceled for user ${userId}`);
        }
        break;
      }

      // ==========================================
      // INVOICE PAID
      // ==========================================
      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          // Find user by subscription ID
          const { data: profile } = await supabase
            .from('bv_profiles')
            .select('user_id')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

          if (profile) {
            // Record payment
            await supabase.from('bv_transactions').insert({
              user_id: profile.user_id,
              type: 'subscription_renewal',
              amount: invoice.amount_paid / 100,
              currency: invoice.currency,
              stripe_invoice_id: invoice.id,
              status: 'completed',
            });

            console.log(`[Webhook] Invoice paid for user ${profile.user_id}`);
          }
        }
        break;
      }

      // ==========================================
      // INVOICE PAYMENT FAILED
      // ==========================================
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          const { data: profile } = await supabase
            .from('bv_profiles')
            .select('user_id, email')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

          if (profile) {
            // Update status
            await supabase
              .from('bv_profiles')
              .update({
                subscription_status: 'past_due',
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', profile.user_id);

            // TODO: Send payment failed email
            console.log(`[Webhook] Payment failed for user ${profile.user_id}`);
          }
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

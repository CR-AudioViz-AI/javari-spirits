// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  
  // Map price IDs to plan names
  const planMap: Record<string, string> = {
    'price_collector': 'collector',
    'price_connoisseur': 'connoisseur',
    'price_sommelier': 'sommelier',
  };
  
  const plan = planMap[priceId] || 'collector';

  // Find user by stripe customer id
  const { data: existingSub } = await supabase
    .from('bv_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (existingSub) {
    await supabase
      .from('bv_subscriptions')
      .update({
        stripe_subscription_id: subscription.id,
        plan,
        status: subscription.status === 'active' ? 'active' : 'past_due',
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customerId);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  await supabase
    .from('bv_subscriptions')
    .update({
      status: 'cancelled',
      plan: 'free',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Create notification for successful payment
  const customerId = invoice.customer as string;
  
  const { data: sub } = await supabase
    .from('bv_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (sub?.user_id) {
    await supabase.from('bv_notifications').insert({
      user_id: sub.user_id,
      type: 'payment_success',
      title: 'Payment Successful',
      body: `Your subscription payment of $${(invoice.amount_paid / 100).toFixed(2)} was successful.`,
    });
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  const { data: sub } = await supabase
    .from('bv_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (sub?.user_id) {
    await supabase.from('bv_notifications').insert({
      user_id: sub.user_id,
      type: 'payment_failed',
      title: 'Payment Failed',
      body: 'We were unable to process your subscription payment. Please update your payment method.',
    });

    await supabase
      .from('bv_subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_customer_id', customerId);
  }
}
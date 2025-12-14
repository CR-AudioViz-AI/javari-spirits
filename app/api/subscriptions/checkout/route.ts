// app/api/subscriptions/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Subscription plans
const PLANS = {
  collector: {
    name: "Collector",
    price: 999, // $9.99
    priceId: process.env.STRIPE_PRICE_COLLECTOR,
    features: [
      "Unlimited collection tracking",
      "Price alerts (10 per month)",
      "Advanced search filters",
      "Export collection data",
      "Ad-free experience"
    ]
  },
  connoisseur: {
    name: "Connoisseur",
    price: 1999, // $19.99
    priceId: process.env.STRIPE_PRICE_CONNOISSEUR,
    features: [
      "Everything in Collector",
      "Unlimited price alerts",
      "AI Sommelier (50 chats/month)",
      "Exclusive tastings access",
      "Priority support",
      "Early access to new features"
    ]
  },
  sommelier: {
    name: "Sommelier",
    price: 4999, // $49.99
    priceId: process.env.STRIPE_PRICE_SOMMELIER,
    features: [
      "Everything in Connoisseur",
      "Unlimited AI Sommelier",
      "Personal collection insurance quotes",
      "VIP distillery tours",
      "Rare bottle alerts",
      "Dedicated account manager",
      "White-glove support"
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    const { userId, plan, successUrl, cancelUrl } = await request.json();

    if (!userId || !plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const selectedPlan = PLANS[plan as keyof typeof PLANS];

    // Get or create Stripe customer
    const { data: existingSub } = await supabase
      .from("bv_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    let customerId = existingSub?.stripe_customer_id;

    if (!customerId) {
      // Get user email
      const { data: userData } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", userId)
        .single();

      const customer = await stripe.customers.create({
        email: userData?.email,
        name: userData?.full_name,
        metadata: { userId },
      });
      customerId = customer.id;

      // Create subscription record
      await supabase.from("bv_subscriptions").insert({
        user_id: userId,
        stripe_customer_id: customerId,
        plan: "free",
        status: "active",
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `CRAVBarrels ${selectedPlan.name}`,
              description: selectedPlan.features.join(" • "),
            },
            unit_amount: selectedPlan.price,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
      metadata: { userId, plan },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ plans: PLANS });
}

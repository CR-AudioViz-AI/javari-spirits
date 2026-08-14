'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// ============================================
// PLANS DATA
// ============================================

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'forever',
    description: 'Get started with basic features',
    features: [
      { text: 'Browse spirit database', included: true },
      { text: 'Basic search', included: true },
      { text: '5 collection items', included: true },
      { text: 'Community reviews (read)', included: true },
      { text: 'Daily trivia', included: true },
      { text: 'AI Cocktail Genius', included: false },
      { text: 'Unlimited scans', included: false },
      { text: 'Price alerts', included: false },
      { text: 'Export collection', included: false },
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    id: 'enthusiast',
    name: 'Enthusiast',
    price: 9.99,
    yearlyPrice: 95.88,
    interval: 'month',
    description: 'For passionate spirit lovers',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Unlimited collection items', included: true },
      { text: 'Advanced search & filters', included: true },
      { text: 'Unlimited bottle scans', included: true },
      { text: 'AI Cocktail Genius (50/mo)', included: true },
      { text: 'Write reviews', included: true },
      { text: 'Price alerts', included: true },
      { text: 'Export collection', included: true },
      { text: 'No ads', included: true },
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    id: 'connoisseur',
    name: 'Connoisseur',
    price: 24.99,
    yearlyPrice: 239.88,
    interval: 'month',
    description: 'The ultimate spirit experience',
    features: [
      { text: 'Everything in Enthusiast', included: true },
      { text: 'Unlimited AI requests', included: true },
      { text: 'Early access to features', included: true },
      { text: 'Exclusive virtual tastings', included: true },
      { text: 'Priority support', included: true },
      { text: 'API access', included: true },
      { text: 'Custom collections', included: true },
      { text: 'Distillery discounts', included: true },
      { text: 'Verified collector badge', included: true },
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
];

const FAQS = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes, all paid plans come with a 7-day free trial. No credit card required to start.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.',
  },
  {
    q: 'Can I switch plans?',
    a: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'Your collection and reviews are saved for 90 days. You can export everything before canceling.',
  },
];

// ============================================
// PRICING PAGE
// ============================================

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      window.location.href = '/auth/signup';
      return;
    }

    setLoading(planId);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-checkout',
          planId: billingCycle === 'yearly' ? `annual_${planId}` : planId,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.demo) {
        alert('Demo mode: Stripe not configured. Redirecting to success page.');
        window.location.href = '/subscription/success?demo=true';
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }

    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white">
            <span className="text-2xl">🥃</span>
            <span className="font-bold">Javari Spirits</span>
          </Link>
          <Link href="/auth/login" className="text-gray-400 hover:text-white">
            Sign In
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start free and upgrade as you grow your collection. All plans include a 7-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingCycle === 'yearly' ? 'bg-amber-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500'}`}>
              Yearly
              <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative bg-gray-800 rounded-2xl p-8 border ${
                plan.popular ? 'border-amber-500' : 'border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-amber-500 text-black text-sm font-bold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">
                    ${billingCycle === 'yearly' && plan.yearlyPrice
                      ? (plan.yearlyPrice / 12).toFixed(2)
                      : plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500">/month</span>
                  )}
                </div>
                {billingCycle === 'yearly' && plan.yearlyPrice && (
                  <p className="text-sm text-gray-500 mt-1">
                    ${plan.yearlyPrice}/year (billed annually)
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className={feature.included ? 'text-green-500' : 'text-gray-600'}>
                      {feature.included ? '✓' : '✗'}
                    </span>
                    <span className={feature.included ? 'text-gray-300' : 'text-gray-600'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  plan.popular
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                } ${loading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading === plan.id ? 'Loading...' : plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Compare All Features
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Free</th>
                  <th className="text-center py-4 px-4 text-amber-500 font-medium">Enthusiast</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Connoisseur</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Spirit Database Access', '✓', '✓', '✓'],
                  ['Collection Items', '5', 'Unlimited', 'Unlimited'],
                  ['Bottle Scans', '10/month', 'Unlimited', 'Unlimited'],
                  ['AI Cocktail Genius', '5/month', '50/month', 'Unlimited'],
                  ['Write Reviews', '✗', '✓', '✓'],
                  ['Price Alerts', '✗', '✓', '✓'],
                  ['Export Data', '✗', '✓', '✓'],
                  ['Virtual Tastings', '✗', '✗', '✓'],
                  ['API Access', '✗', '✗', '✓'],
                  ['Priority Support', '✗', '✗', '✓'],
                ].map(([feature, free, enthusiast, connoisseur], i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="py-4 px-4 text-gray-300">{feature}</td>
                    <td className="py-4 px-4 text-center text-gray-400">{free}</td>
                    <td className="py-4 px-4 text-center text-white">{enthusiast}</td>
                    <td className="py-4 px-4 text-center text-gray-300">{connoisseur}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between"
                >
                  <span className="font-medium text-white">{faq.q}</span>
                  <span className="text-gray-400 text-xl">
                    {expandedFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-400">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="text-center mt-16">
          <div className="flex items-center justify-center gap-8 text-gray-500">
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💳</span>
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🛡️</span>
              <span>Money Back Guarantee</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

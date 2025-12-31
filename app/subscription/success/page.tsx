'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  const sessionId = searchParams.get('session_id');
  const isDemo = searchParams.get('demo') === 'true';

  useEffect(() => {
    // Verify session and get details
    const verifySession = async () => {
      if (isDemo) {
        setSubscriptionDetails({
          plan: 'Enthusiast',
          status: 'active',
          demo: true,
        });
        setLoading(false);
        return;
      }

      if (sessionId) {
        // In production, verify with Stripe
        setSubscriptionDetails({
          plan: 'Enthusiast',
          status: 'active',
        });
      }
      setLoading(false);
    };

    verifySession();
  }, [sessionId, isDemo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">🥃</div>
          <p className="text-white">Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <h1 className="text-3xl font-bold text-white mb-4">
          Welcome to {subscriptionDetails?.plan || 'Premium'}!
        </h1>

        {isDemo && (
          <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-4 mb-6">
            <p className="text-amber-400 text-sm">
              Demo Mode: Stripe is not configured. This is a simulated success page.
            </p>
          </div>
        )}

        <p className="text-gray-400 mb-8">
          Your subscription is now active. You have full access to all premium features.
        </p>

        {/* Features Unlocked */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 text-left">
          <h3 className="text-white font-semibold mb-4">🎉 Features Unlocked:</h3>
          <ul className="space-y-3">
            {[
              'Unlimited collection items',
              'Unlimited bottle scans',
              'AI Cocktail Genius',
              'Price alerts & tracking',
              'Write & share reviews',
              'Ad-free experience',
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-300">
                <span className="text-green-500">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Link
            href="/explore"
            className="block w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-colors"
          >
            Start Exploring →
          </Link>
          <Link
            href="/profile"
            className="block w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors"
          >
            View Your Account
          </Link>
        </div>

        {/* Confetti effect placeholder */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 1,
                y: -20,
                x: Math.random() * window.innerWidth,
              }}
              animate={{ 
                opacity: 0,
                y: window.innerHeight + 100,
                rotate: Math.random() * 360,
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 0.5,
              }}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                backgroundColor: ['#f59e0b', '#10b981', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 4)],
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">🥃</div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

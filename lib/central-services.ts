/**
 * CR AudioViz AI - Central Services Client
 * 
 * This file connects to centralized services at craudiovizai.com
 * per the Henderson Standard.
 * 
 * REPLACES: Local lib/stripe.ts, lib/auth.ts, lib/payments/
 * 
 * @author CR AudioViz AI
 * @created December 26, 2025
 */

const CENTRAL_API = process.env.NEXT_PUBLIC_CENTRAL_API || 'https://craudiovizai.com/api';
const APP_ID = process.env.NEXT_PUBLIC_APP_ID || 'unknown';

// ============================================================
// AUTHENTICATION (via Central)
// ============================================================

export async function signIn(email: string, password: string) {
  const response = await fetch(`${CENTRAL_API}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, appId: APP_ID }),
  });
  return response.json();
}

export async function signUp(email: string, password: string, metadata?: Record<string, any>) {
  const response = await fetch(`${CENTRAL_API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, metadata, appId: APP_ID }),
  });
  return response.json();
}

export async function signOut() {
  const response = await fetch(`${CENTRAL_API}/auth/signout`, { method: 'POST' });
  return response.json();
}

export async function getSession() {
  const response = await fetch(`${CENTRAL_API}/auth/session`);
  return response.json();
}

// ============================================================
// PAYMENTS (via Central)
// ============================================================

export async function createCheckout(options: {
  priceId?: string;
  amount?: number;
  successUrl?: string;
  cancelUrl?: string;
}) {
  const response = await fetch(`${CENTRAL_API}/stripe/create-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...options,
      appId: APP_ID,
      successUrl: options.successUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/success`,
      cancelUrl: options.cancelUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/cancel`,
    }),
  });
  return response.json();
}

export async function getCreditsBalance(userId: string) {
  const response = await fetch(`${CENTRAL_API}/credits/balance?userId=${userId}`);
  return response.json();
}

export async function spendCredits(userId: string, amount: number, description: string) {
  const response = await fetch(`${CENTRAL_API}/credits/spend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount, description, appId: APP_ID }),
  });
  return response.json();
}

// ============================================================
// OPERATIONS (via Central)
// ============================================================

export async function logActivity(action: string, metadata?: Record<string, any>) {
  try {
    await fetch(`${CENTRAL_API}/activity/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, metadata, appId: APP_ID }),
    });
  } catch (e) {
    console.error('Activity log failed:', e);
  }
}

export async function createTicket(type: string, subject: string, description: string) {
  const response = await fetch(`${CENTRAL_API}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, subject, description, appId: APP_ID }),
  });
  return response.json();
}

export default {
  signIn,
  signUp,
  signOut,
  getSession,
  createCheckout,
  getCreditsBalance,
  spendCredits,
  logActivity,
  createTicket,
};

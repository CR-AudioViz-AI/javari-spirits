// 2026-09-05: table names corrected against the live schema.
//
// These are bv_-prefixed names for tables that exist WITHOUT the prefix. Each
// returned PostgREST 42P01 and failed the whole query, so every feature built
// on them returned nothing rather than something partial.
//
// Only prefix-strips whose target has an id and a substantial column set were
// applied. Eight other close-looking names were REJECTED: bv_distillery_views
// is not bv_distilleries, bv_lessons is not cv_lessons, and repointing those
// would swap a loud failure for a silent wrong answer.
/**
 * EMAIL AUTOMATION API
 * ====================
 * Welcome sequences, notifications, and automated emails
 * 
 * POST /api/email/send - Send email
 * POST /api/email/welcome-sequence - Start welcome sequence
 * GET /api/email/templates - Get available templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireCaller } from '@/lib/api/caller';
import { lazyAdminDb } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';

const supabase = lazyAdminDb();

// ============================================
// EMAIL TEMPLATES CONFIG
// ============================================

const EMAIL_TEMPLATES = {
  welcome_day0: { subject: '🥃 Welcome to Javari Spirits!', delay: 0 },
  welcome_day1: { subject: '🔍 Discover Your First Spirit', delay: 86400000 },
  welcome_day3: { subject: '🍸 Meet Your AI Cocktail Genius', delay: 259200000 },
  welcome_day7: { subject: '🎮 Ready to Play? Try Spirit Trivia!', delay: 604800000 },
  inactive_7day: { subject: 'We miss you! Your collection awaits 🥃', delay: 0 },
  subscription_confirmed: { subject: '✅ Subscription Confirmed!', delay: 0 },
  payment_failed: { subject: '⚠️ Payment Failed - Action Required', delay: 0 },
  price_alert: { subject: '💰 Price Drop Alert!', delay: 0 },
  achievement_unlocked: { subject: '🏆 Achievement Unlocked!', delay: 0 },
  weekly_digest: { subject: '📰 This Week in Spirits', delay: 0 },
};

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://javarispirits.com';

// ============================================
// GENERATE EMAIL HTML
// ============================================

function generateEmailHTML(template: string, data: any): string {
  const header = `
    <div style="text-align: center; margin-bottom: 30px;">
      <span style="font-size: 48px;">🥃</span>
      <h1 style="color: #f59e0b; margin: 10px 0 0 0; font-size: 24px;">Javari Spirits</h1>
    </div>
  `;

  const footer = `
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #374151; color: #6b7280; font-size: 12px;">
      <p style="margin: 0;">Javari Spirits • A CR AudioViz AI Platform</p>
      <p style="margin: 10px 0 0 0;">
        <a href="${BASE_URL}/unsubscribe?email=${data.email}" style="color: #6b7280;">Unsubscribe</a> • 
        <a href="${BASE_URL}/preferences" style="color: #6b7280;">Email Preferences</a>
      </p>
    </div>
  `;

  const templates: Record<string, string> = {
    welcome_day0: `
      <h2 style="color: #e5e7eb; margin: 0 0 20px 0;">Welcome, ${data.name || 'Spirit Enthusiast'}! 🎉</h2>
      <p style="color: #9ca3af; line-height: 1.6;">
        You've just joined the ultimate platform for spirit enthusiasts. Here's what awaits you:
      </p>
      <div style="margin: 25px 0;">
        <div style="padding: 15px; background: #374151; border-radius: 8px; margin-bottom: 10px;">
          <span style="font-size: 20px;">🔍</span>
          <span style="color: #e5e7eb; margin-left: 10px;">Explore 20,000+ spirits</span>
        </div>
        <div style="padding: 15px; background: #374151; border-radius: 8px; margin-bottom: 10px;">
          <span style="font-size: 20px;">📷</span>
          <span style="color: #e5e7eb; margin-left: 10px;">Scan any bottle instantly</span>
        </div>
        <div style="padding: 15px; background: #374151; border-radius: 8px; margin-bottom: 10px;">
          <span style="font-size: 20px;">🍸</span>
          <span style="color: #e5e7eb; margin-left: 10px;">AI-powered cocktail recipes</span>
        </div>
        <div style="padding: 15px; background: #374151; border-radius: 8px;">
          <span style="font-size: 20px;">🏆</span>
          <span style="color: #e5e7eb; margin-left: 10px;">Earn XP & unlock rewards</span>
        </div>
      </div>
      <div style="text-align: center;">
        <a href="${BASE_URL}/explore" style="display: inline-block; background: #f59e0b; color: #000; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Start Exploring →
        </a>
      </div>
    `,

    welcome_day1: `
      <h2 style="color: #e5e7eb; margin: 0 0 20px 0;">🔍 Discover Your First Spirit</h2>
      <p style="color: #9ca3af; line-height: 1.6;">
        Ready to dive in? Here are some ways to find your next favorite bottle:
      </p>
      <div style="margin: 25px 0;">
        <h3 style="color: #f59e0b; margin: 20px 0 10px 0;">📷 Scan a Bottle</h3>
        <p style="color: #9ca3af; margin: 0;">Point your camera at any bottle to instantly identify it.</p>
        
        <h3 style="color: #f59e0b; margin: 20px 0 10px 0;">🔍 Browse Categories</h3>
        <p style="color: #9ca3af; margin: 0;">Explore bourbon, scotch, tequila, rum, and more.</p>
        
        <h3 style="color: #f59e0b; margin: 20px 0 10px 0;">⭐ Top Rated</h3>
        <p style="color: #9ca3af; margin: 0;">See what the community loves most.</p>
      </div>
      <div style="text-align: center;">
        <a href="${BASE_URL}/explore" style="display: inline-block; background: #f59e0b; color: #000; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Explore Spirits
        </a>
      </div>
    `,

    welcome_day3: `
      <h2 style="color: #e5e7eb; margin: 0 0 20px 0;">🍸 Meet Your AI Cocktail Genius</h2>
      <p style="color: #9ca3af; line-height: 1.6;">
        Did you know Javari Spirits has an AI bartender? Just tell it what spirits you have, and it'll create the perfect cocktail for you!
      </p>
      <div style="background: #374151; border-radius: 12px; padding: 20px; margin: 25px 0;">
        <p style="color: #e5e7eb; margin: 0; font-style: italic;">
          "I have bourbon and vermouth..."
        </p>
        <p style="color: #f59e0b; margin: 10px 0 0 0;">
          → Try a classic Manhattan! Here's exactly how to make it...
        </p>
      </div>
      <div style="text-align: center;">
        <a href="${BASE_URL}/cocktails/genius" style="display: inline-block; background: #f59e0b; color: #000; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Try Cocktail Genius
        </a>
      </div>
    `,

    welcome_day7: `
      <h2 style="color: #e5e7eb; margin: 0 0 20px 0;">🎮 Test Your Spirit Knowledge!</h2>
      <p style="color: #9ca3af; line-height: 1.6;">
        Think you know your bourbon from your rye? Your Islay from your Speyside? Put your knowledge to the test!
      </p>
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
        <p style="color: #fff; font-size: 18px; margin: 0 0 10px 0; font-weight: bold;">Daily Trivia Challenge</p>
        <p style="color: #e5e7eb; margin: 0;">5 questions • 100 XP reward</p>
      </div>
      <div style="text-align: center;">
        <a href="${BASE_URL}/games" style="display: inline-block; background: #f59e0b; color: #000; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Play Now
        </a>
      </div>
    `,

    subscription_confirmed: `
      <h2 style="color: #e5e7eb; margin: 0 0 20px 0;">✅ Welcome to ${data.plan || 'Premium'}!</h2>
      <p style="color: #9ca3af; line-height: 1.6;">
        Your subscription is now active. Here's what you've unlocked:
      </p>
      <div style="margin: 25px 0;">
        <div style="padding: 12px 15px; background: #374151; border-radius: 8px; margin-bottom: 8px; color: #10b981;">
          ✓ Unlimited collection items
        </div>
        <div style="padding: 12px 15px; background: #374151; border-radius: 8px; margin-bottom: 8px; color: #10b981;">
          ✓ Unlimited bottle scans
        </div>
        <div style="padding: 12px 15px; background: #374151; border-radius: 8px; margin-bottom: 8px; color: #10b981;">
          ✓ AI Cocktail Genius access
        </div>
        <div style="padding: 12px 15px; background: #374151; border-radius: 8px; margin-bottom: 8px; color: #10b981;">
          ✓ Price alerts & tracking
        </div>
        <div style="padding: 12px 15px; background: #374151; border-radius: 8px; color: #10b981;">
          ✓ Ad-free experience
        </div>
      </div>
      <div style="text-align: center;">
        <a href="${BASE_URL}/profile" style="display: inline-block; background: #f59e0b; color: #000; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          View Your Account
        </a>
      </div>
    `,

    payment_failed: `
      <h2 style="color: #ef4444; margin: 0 0 20px 0;">⚠️ Payment Failed</h2>
      <p style="color: #9ca3af; line-height: 1.6;">
        We couldn't process your subscription payment. Please update your payment method to keep your premium features active.
      </p>
      <div style="background: #374151; border-radius: 12px; padding: 20px; margin: 25px 0; border-left: 4px solid #ef4444;">
        <p style="color: #e5e7eb; margin: 0;">
          Your account will be downgraded to Free in 3 days if payment is not updated.
        </p>
      </div>
      <div style="text-align: center;">
        <a href="${BASE_URL}/profile/billing" style="display: inline-block; background: #ef4444; color: #fff; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Update Payment Method
        </a>
      </div>
    `,

    price_alert: `
      <h2 style="color: #e5e7eb; margin: 0 0 20px 0;">💰 Price Drop Alert!</h2>
      <p style="color: #9ca3af; line-height: 1.6;">
        A spirit on your watchlist just dropped in price:
      </p>
      <div style="background: #374151; border-radius: 12px; padding: 20px; margin: 25px 0;">
        <p style="color: #f59e0b; font-size: 18px; margin: 0 0 10px 0; font-weight: bold;">${data.spirit_name || 'Buffalo Trace'}</p>
        <p style="color: #9ca3af; margin: 0;">
          <span style="text-decoration: line-through;">$${data.old_price || '45'}</span>
          <span style="color: #10b981; font-size: 20px; margin-left: 10px;">$${data.new_price || '35'}</span>
        </p>
      </div>
      <div style="text-align: center;">
        <a href="${BASE_URL}/spirits/${data.spirit_id || '1'}" style="display: inline-block; background: #f59e0b; color: #000; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          View Details
        </a>
      </div>
    `,

    achievement_unlocked: `
      <h2 style="color: #e5e7eb; margin: 0 0 20px 0;">🏆 Achievement Unlocked!</h2>
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); border-radius: 12px; padding: 30px; margin: 25px 0; text-align: center;">
        <span style="font-size: 60px;">${data.badge || '🥇'}</span>
        <p style="color: #fff; font-size: 20px; margin: 15px 0 5px 0; font-weight: bold;">${data.achievement_name || 'First Bottle'}</p>
        <p style="color: #fef3c7; margin: 0;">+${data.xp || '50'} XP earned</p>
      </div>
      <div style="text-align: center;">
        <a href="${BASE_URL}/profile/achievements" style="display: inline-block; background: #f59e0b; color: #000; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          View All Achievements
        </a>
      </div>
    `,

    weekly_digest: `
      <h2 style="color: #e5e7eb; margin: 0 0 20px 0;">📰 This Week in Spirits</h2>
      <p style="color: #9ca3af; line-height: 1.6;">
        Here's what happened this week in the world of spirits:
      </p>
      <div style="margin: 25px 0;">
        <h3 style="color: #f59e0b; margin: 20px 0 10px 0;">🔥 Trending Spirits</h3>
        <p style="color: #9ca3af;">Buffalo Trace, Eagle Rare, Blanton's</p>
        
        <h3 style="color: #f59e0b; margin: 20px 0 10px 0;">🆕 New Additions</h3>
        <p style="color: #9ca3af;">15 new spirits added to the database</p>
        
        <h3 style="color: #f59e0b; margin: 20px 0 10px 0;">🏆 Top Players</h3>
        <p style="color: #9ca3af;">WhiskeyMaster leads with 125,000 XP</p>
      </div>
      <div style="text-align: center;">
        <a href="${BASE_URL}" style="display: inline-block; background: #f59e0b; color: #000; padding: 14px 35px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Explore Javari Spirits
        </a>
      </div>
    `,
  };

  const content = templates[template] || templates.welcome_day0;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${EMAIL_TEMPLATES[template as keyof typeof EMAIL_TEMPLATES]?.subject || 'Javari Spirits'}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    ${header}
    <div style="background-color: #1f2937; border-radius: 12px; padding: 30px;">
      ${content}
    </div>
    ${footer}
  </div>
</body>
</html>
  `;
}

// ============================================
// POST - Send Email / Start Sequence
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // user id deliberately not taken from the body.
    const {action, email, template, data} = body;
    const _c = await requireCaller(request);
    if (!_c.ok) return _c.res;
    const userId = _c.userId;

    switch (action) {
      // ==========================================
      // SEND SINGLE EMAIL
      // ==========================================
      case 'send': {
        if (!email || !template) {
          return NextResponse.json({ error: 'Email and template required' }, { status: 400 });
        }

        const templateConfig = EMAIL_TEMPLATES[template as keyof typeof EMAIL_TEMPLATES];
        if (!templateConfig) {
          return NextResponse.json({ error: 'Invalid template' }, { status: 400 });
        }

        const html = generateEmailHTML(template, { email, ...data });
        
        // Check for email provider configuration
        const resendKey = process.env.RESEND_API_KEY;
        const sendgridKey = process.env.SENDGRID_API_KEY;

        if (resendKey && resendKey !== 'your_resend_api_key') {
          // Use Resend
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Javari Spirits <hello@javarispirits.com>',
              to: email,
              subject: templateConfig.subject,
              html,
            }),
          });

          const result = await response.json();
          
          // Log to database
          await supabase.from('email_logs').insert({
            user_id: userId,
            email,
            template,
            subject: templateConfig.subject,
            status: response.ok ? 'sent' : 'failed',
            provider: 'resend',
            response: result,
          }).then(
            () => undefined,
            // 2026-09-01: .then(ok, err) rather than .catch().
            //
            // A PostgrestFilterBuilder is a THENABLE, not a Promise — it has no
            // .catch(). It only executes when awaited or then'd, so `.catch()` was
            // both a type error AND a query that never ran: these logging writes
            // have never reached the database.
            () => undefined,
          );

          return NextResponse.json({
            success: response.ok,
            messageId: result.id,
          });
        }

        // Demo mode - log only
        await supabase.from('email_logs').insert({
          user_id: userId,
          email,
          template,
          subject: templateConfig.subject,
          status: 'demo',
          provider: 'none',
        }).then(
            () => undefined,
            // 2026-09-01: .then(ok, err) rather than .catch().
            //
            // A PostgrestFilterBuilder is a THENABLE, not a Promise — it has no
            // .catch(). It only executes when awaited or then'd, so `.catch()` was
            // both a type error AND a query that never ran: these logging writes
            // have never reached the database.
            () => undefined,
          );

        return NextResponse.json({
          success: true,
          demo: true,
          message: 'Email logged (no provider configured)',
          html: html.substring(0, 500) + '...',
        });
      }

      // ==========================================
      // START WELCOME SEQUENCE
      // ==========================================
      case 'welcome-sequence': {
        if (!email || !userId) {
          return NextResponse.json({ error: 'Email and userId required' }, { status: 400 });
        }

        const sequences = [
          { template: 'welcome_day0', delay: 0 },
          { template: 'welcome_day1', delay: 86400000 },
          { template: 'welcome_day3', delay: 259200000 },
          { template: 'welcome_day7', delay: 604800000 },
        ];

        // Schedule emails
        for (const seq of sequences) {
          const sendAt = new Date(Date.now() + seq.delay);
          
          await supabase.from('email_queue').insert({
            user_id: userId,
            email,
            template: seq.template,
            scheduled_for: sendAt.toISOString(),
            status: 'pending',
          }).then(
            () => undefined,
            // 2026-09-01: .then(ok, err) rather than .catch().
            //
            // A PostgrestFilterBuilder is a THENABLE, not a Promise — it has no
            // .catch(). It only executes when awaited or then'd, so `.catch()` was
            // both a type error AND a query that never ran: these logging writes
            // have never reached the database.
            () => undefined,
          );
        }

        // Send first email immediately
        const html = generateEmailHTML('welcome_day0', { email, name: data?.name });
        
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey && resendKey !== 'your_resend_api_key') {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'Javari Spirits <hello@javarispirits.com>',
              to: email,
              subject: '🥃 Welcome to Javari Spirits!',
              html,
            }),
          });
        }

        return NextResponse.json({
          success: true,
          message: 'Welcome sequence started',
          scheduled: sequences.length,
        });
      }

      // ==========================================
      // PROCESS EMAIL QUEUE
      // ==========================================
      case 'process-queue': {
        const { data: pendingEmails } = await supabase
          .from('email_queue')
          .select('*')
          .eq('status', 'pending')
          .lte('scheduled_for', new Date().toISOString())
          .limit(50);

        let processed = 0;
        
        for (const queuedEmail of pendingEmails || []) {
          const html = generateEmailHTML(queuedEmail.template, { email: queuedEmail.email });
          const templateConfig = EMAIL_TEMPLATES[queuedEmail.template as keyof typeof EMAIL_TEMPLATES];

          const resendKey = process.env.RESEND_API_KEY;
          if (resendKey && resendKey !== 'your_resend_api_key') {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'Javari Spirits <hello@javarispirits.com>',
                to: queuedEmail.email,
                subject: templateConfig?.subject || 'Javari Spirits',
                html,
              }),
            });
          }

          await supabase
            .from('email_queue')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', queuedEmail.id);

          processed++;
        }

        return NextResponse.json({
          success: true,
          processed,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// GET - Get Templates
// ============================================

export async function GET() {
  return NextResponse.json({
    success: true,
    templates: Object.entries(EMAIL_TEMPLATES).map(([key, val]) => ({
      id: key,
      ...val,
    })),
    configured: {
      resend: !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key',
      sendgrid: !!process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'your_sendgrid_api_key',
    },
  });
}

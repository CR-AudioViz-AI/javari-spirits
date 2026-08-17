/**
 * NEWSLETTER SUBSCRIPTION API
 * ===========================
 * Email capture and newsletter management
 * 
 * POST /api/newsletter - Subscribe email
 * DELETE /api/newsletter - Unsubscribe email
 * GET /api/newsletter - Get stats or verify
 */

import { NextRequest, NextResponse } from 'next/server';
import { lazyAdminDb } from '@/lib/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const supabase = lazyAdminDb();

// ============================================
// EMAIL VALIDATION
// ============================================

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ============================================
// POST - Subscribe
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source = 'website', preferences = {}, user_id } = body;
    
    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({
        error: 'Please provide a valid email address',
      }, { status: 400 });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Try the dedicated newsletter table first
    let tableExists = true;
    const { data: existing, error: checkError } = await supabase
      .from('bv_newsletter_subscribers')
      .select('id, status, verified')
      .eq('email', normalizedEmail)
      .single();
    
    // If table doesn't exist, fall back to activities table
    if (checkError?.code === 'PGRST204' || checkError?.message?.includes('Could not find')) {
      tableExists = false;
    }
    
    if (tableExists && existing) {
      if (existing.status === 'subscribed') {
        return NextResponse.json({
          success: true,
          message: "You're already subscribed! Check your inbox for our latest updates.",
          alreadySubscribed: true,
        });
      }
      
      // Resubscribe if previously unsubscribed
      if (existing.status === 'unsubscribed') {
        const verificationToken = generateToken();
        
        await supabase
          .from('bv_newsletter_subscribers')
          .update({
            status: 'subscribed',
            verification_token: verificationToken,
            resubscribed_at: new Date().toISOString(),
            verified: true,
            verified_at: new Date().toISOString(),
            preferences,
          })
          .eq('id', existing.id);
        
        return NextResponse.json({
          success: true,
          message: 'Welcome back! You have been resubscribed.',
          resubscribed: true,
        });
      }
    }
    
    if (tableExists) {
      // Create new subscription in dedicated table
      const verificationToken = generateToken();
      const unsubscribeToken = generateToken();
      
      const { data: subscriber, error } = await supabase
        .from('bv_newsletter_subscribers')
        .insert({
          email: normalizedEmail,
          status: 'subscribed',
          source,
          preferences,
          verification_token: verificationToken,
          unsubscribe_token: unsubscribeToken,
          subscribed_at: new Date().toISOString(),
          verified: true,
          verified_at: new Date().toISOString(),
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          user_agent: request.headers.get('user-agent'),
        })
        .select()
        .single();
      
      if (error) {
        console.error('Newsletter signup error:', error);
        
        // If table still doesn't exist, use fallback
        if (error.code === 'PGRST204' || error.message?.includes('Could not find')) {
          tableExists = false;
        } else {
          throw error;
        }
      }
    }
    
    // Fallback: Log to activities table
    if (!tableExists) {
      // Check if already logged
      const { data: existingActivity } = await supabase
        .from('bv_activities')
        .select('id')
        .eq('action', 'newsletter_signup')
        .eq('metadata->>email', normalizedEmail)
        .single();
      
      if (existingActivity) {
        return NextResponse.json({
          success: true,
          message: "You're already subscribed! Check your inbox for our latest updates.",
          alreadySubscribed: true,
        });
      }
      
      // Log as activity
      await supabase.from('bv_activities').insert({
        user_id: user_id || null,
        action: 'newsletter_signup',
        entity_type: 'newsletter',
        metadata: {
          email: normalizedEmail,
          source,
          preferences,
          subscribed_at: new Date().toISOString(),
          ip_address: request.headers.get('x-forwarded-for'),
        },
      });
    }
    
    // Award XP if user is logged in
    if (user_id) {
      await supabase.from('bv_xp_log').insert({
        user_id: user_id,
        action: 'newsletter_signup',
        xp_earned: 25,
        reference_type: 'newsletter',
      });
      
      const { data: profile } = await supabase
        .from('bv_profiles')
        .select('total_xp')
        .eq('id', user_id)
        .single();
      
      if (profile) {
        await supabase
          .from('bv_profiles')
          .update({ total_xp: (profile.total_xp || 0) + 25 })
          .eq('id', user_id);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Thanks for subscribing! You'll receive our latest updates and exclusive offers.",
      subscribed: true,
    });
    
  } catch (error: any) {
    console.error('Newsletter API error:', error);
    return NextResponse.json({ 
      error: 'Something went wrong. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    }, { status: 500 });
  }
}

// ============================================
// DELETE - Unsubscribe
// ============================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    
    if (!email && !token) {
      return NextResponse.json({
        error: 'Email or unsubscribe token required',
      }, { status: 400 });
    }
    
    // Try dedicated table first
    if (token) {
      const { data, error } = await supabase
        .from('bv_newsletter_subscribers')
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('unsubscribe_token', token)
        .select()
        .single();
      
      if (!error && data) {
        return NextResponse.json({
          success: true,
          message: "You've been unsubscribed. We're sorry to see you go!",
        });
      }
    }
    
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      
      const { error } = await supabase
        .from('bv_newsletter_subscribers')
        .update({
          status: 'unsubscribed',
          unsubscribed_at: new Date().toISOString(),
        })
        .eq('email', normalizedEmail);
      
      // Also mark in activities if using fallback
      await supabase.from('bv_activities').insert({
        action: 'newsletter_unsubscribe',
        entity_type: 'newsletter',
        metadata: {
          email: normalizedEmail,
          unsubscribed_at: new Date().toISOString(),
        },
      });
      
      return NextResponse.json({
        success: true,
        message: "You've been unsubscribed. We're sorry to see you go!",
      });
    }
    
    return NextResponse.json({
      error: 'Could not process unsubscribe request',
    }, { status: 400 });
    
  } catch (error: any) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// GET - Verify Email or Get Stats
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const token = searchParams.get('token');
    
    // Verify email
    if (action === 'verify' && token) {
      const { data, error } = await supabase
        .from('bv_newsletter_subscribers')
        .update({
          status: 'subscribed',
          verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq('verification_token', token)
        .eq('status', 'pending')
        .select()
        .single();
      
      if (error || !data) {
        return NextResponse.json({
          error: 'Invalid or expired verification link',
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: true,
        message: "Email verified! You're all set to receive our updates.",
      });
    }
    
    // Get subscriber stats
    if (action === 'stats') {
      // Try dedicated table
      const { count: total } = await supabase
        .from('bv_newsletter_subscribers')
        .select('*', { count: 'exact', head: true });
      
      const { count: subscribed } = await supabase
        .from('bv_newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'subscribed');
      
      // Also count from activities as fallback
      const { count: activitySignups } = await supabase
        .from('bv_activities')
        .select('*', { count: 'exact', head: true })
        .eq('action', 'newsletter_signup');
      
      return NextResponse.json({
        success: true,
        stats: {
          total: (total || 0) + (activitySignups || 0),
          subscribed: subscribed || 0,
          fromActivities: activitySignups || 0,
        },
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error: any) {
    console.error('Newsletter GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

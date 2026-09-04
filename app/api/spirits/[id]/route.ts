/**
 * SPIRIT DETAIL API
 * =================
 * Get detailed spirit information including reviews, affiliate links, and related spirits
 * 
 * Endpoints:
 * GET /api/spirits/[id] - Get spirit details
 * GET /api/spirits/[id]?include=reviews - Include reviews
 * GET /api/spirits/[id]?include=related - Include related spirits
 * GET /api/spirits/[id]?include=affiliate - Include affiliate links
 * POST /api/spirits/[id]/review - Submit a review
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireCaller } from '@/lib/api/caller';
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

export const dynamic = 'force-dynamic';

// ============================================
// GET - Spirit Details
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const spiritId = params.id;
    const { searchParams } = new URL(request.url);
    const include = searchParams.get('include')?.split(',') || [];
    
    // Get spirit details
    const { data: spirit, error } = await supabase
      .from('bv_spirits')
      .select('*')
      .eq('id', spiritId)
      .single();
    
    if (error || !spirit) {
      return NextResponse.json({ error: 'Spirit not found' }, { status: 404 });
    }
    
    // Build response
    const response: any = {
      success: true,
      data: spirit,
    };
    
    // Include reviews if requested
    if (include.includes('reviews') || include.includes('all')) {
      const { data: reviews } = await supabase
        .from('bv_tasting_sessions')
        .select(`
          id,
          user_id,
          overall_rating,
          nose_notes,
          palate_notes,
          finish_notes,
          personal_notes,
          would_buy_again,
          completed_at,
          user:bv_profiles(display_name, avatar_url)
        `)
        .eq('spirit_id', spiritId)
        .not('personal_notes', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(20);
      
      response.reviews = (reviews || []).map(r => ({
        id: r.id,
        user_id: r.user_id,
        user_name: (r.user as any)?.display_name || 'Anonymous',
        user_avatar: (r.user as any)?.avatar_url,
        rating: r.overall_rating,
        nose_notes: r.nose_notes,
        palate_notes: r.palate_notes,
        finish_notes: r.finish_notes,
        content: r.personal_notes,
        would_buy_again: r.would_buy_again,
        created_at: r.completed_at,
        helpful_count: 0, // Would come from separate table
      }));
    }
    
    // Include related spirits if requested
    if (include.includes('related') || include.includes('all')) {
      // Find related by category, brand, or similar flavor profile
      const { data: related } = await supabase
        .from('bv_spirits')
        .select('id, name, brand, category, image_url, community_rating, msrp')
        .or(`category.eq.${spirit.category},brand.eq.${spirit.brand}`)
        .neq('id', spiritId)
        .limit(8);
      
      response.related = related || [];
    }
    
    // Include affiliate links if requested
    if (include.includes('affiliate') || include.includes('all')) {
      // In production, would query actual affiliate partners
      // For now, generate sample links based on spirit
      response.affiliate_links = generateAffiliateLinks(spirit);
    }
    
    // Log view for analytics
    await logSpiritView(spiritId);
    
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('Spirit detail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// POST - Submit Review
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const spiritId = params.id;
    const body = await request.json();
    // user id deliberately not taken from the body.
    const {rating,
      nose_notes,
      palate_notes,
      finish_notes,
      content,
      would_buy_again} = body;
    const _c = await requireCaller(request);
    if (!_c.ok) return _c.res;
    const user_id = _c.userId;
    
    // Validate required fields
    if (!user_id || !rating) {
      return NextResponse.json({
        error: 'Missing required fields: user_id, rating',
      }, { status: 400 });
    }
    
    // Verify spirit exists
    const { data: spirit, error: spiritError } = await supabase
      .from('bv_spirits')
      .select('id, name')
      .eq('id', spiritId)
      .single();
    
    if (spiritError || !spirit) {
      return NextResponse.json({ error: 'Spirit not found' }, { status: 404 });
    }
    
    // Create tasting session as review
    const { data: review, error } = await supabase
      .from('bv_tasting_sessions')
      .insert({
        user_id,
        spirit_id: spiritId,
        spirit_name: spirit.name,
        overall_rating: rating,
        nose_notes: nose_notes || [],
        palate_notes: palate_notes || [],
        finish_notes: finish_notes || [],
        personal_notes: content,
        would_buy_again: would_buy_again || false,
        notes: [
          ...(nose_notes || []).map((n: string) => ({ category: 'nose', note: n, intensity: 1 })),
          ...(palate_notes || []).map((n: string) => ({ category: 'palate', note: n, intensity: 1 })),
          ...(finish_notes || []).map((n: string) => ({ category: 'finish', note: n, intensity: 1 })),
        ],
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Review insert error:', error);
      return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
    }
    
    // Update spirit community rating
    await updateSpiritRating(spiritId);
    
    // Award XP for review
    await awardReviewXP(user_id, review.id, content?.length || 0);
    
    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review submitted successfully',
    });
    
  } catch (error: any) {
    console.error('Review submit error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateAffiliateLinks(spirit: any) {
  // In production, would query actual affiliate partners via Awin API
  // For now, generate sample links
  const basePrice = spirit.msrp || 50;
  
  const retailers = [
    {
      retailer: 'Total Wine',
      url: `https://www.totalwine.com/search/all?text=${encodeURIComponent(spirit.name)}`,
      price: basePrice * 0.95,
      in_stock: true,
      logo_url: null,
    },
    {
      retailer: 'Drizly',
      url: `https://drizly.com/search?q=${encodeURIComponent(spirit.name)}`,
      price: basePrice * 1.1,
      in_stock: true,
      logo_url: null,
    },
    {
      retailer: 'ReserveBar',
      url: `https://www.reservebar.com/search?q=${encodeURIComponent(spirit.name)}`,
      price: basePrice * 1.2,
      in_stock: Math.random() > 0.3,
      logo_url: null,
    },
    {
      retailer: 'Caskers',
      url: `https://www.caskers.com/catalogsearch/result/?q=${encodeURIComponent(spirit.name)}`,
      price: basePrice * 0.98,
      in_stock: Math.random() > 0.4,
      logo_url: null,
    },
  ];
  
  return retailers.map(r => ({
    ...r,
    price: Math.round(r.price * 100) / 100,
  }));
}

async function logSpiritView(spiritId: string) {
  await supabase.from('bv_spirit_views').insert({
    spirit_id: spiritId,
    viewed_at: new Date().toISOString(),
  });
}

async function updateSpiritRating(spiritId: string) {
  const { data: sessions } = await supabase
    .from('bv_tasting_sessions')
    .select('overall_rating')
    .eq('spirit_id', spiritId)
    .not('overall_rating', 'is', null);
  
  if (sessions && sessions.length > 0) {
    const avgRating = sessions.reduce((sum, s) => sum + s.overall_rating, 0) / sessions.length;
    
    await supabase
      .from('bv_spirits')
      .update({
        community_rating: Math.round(avgRating * 10) / 10,
        rating_count: sessions.length,
      })
      .eq('id', spiritId);
  }
}

async function awardReviewXP(userId: string, reviewId: string, contentLength: number) {
  // Base XP for review
  let xpEarned = 25;
  
  // Bonus for detailed reviews
  if (contentLength >= 50) xpEarned += 10;
  if (contentLength >= 100) xpEarned += 15;
  if (contentLength >= 200) xpEarned += 25;
  
  // Update user XP
  const { data: profile } = await supabase
    .from('bv_profiles')
    .select('total_xp, reviews_written')
    .eq('id', userId)
    .single();
  
  if (profile) {
    await supabase
      .from('bv_profiles')
      .update({
        total_xp: (profile.total_xp || 0) + xpEarned,
        reviews_written: (profile.reviews_written || 0) + 1,
      })
      .eq('id', userId);
  }
  
  // Log XP
  await supabase.from('bv_xp_log').insert({
    user_id: userId,
    action: 'review_written',
    xp_earned: xpEarned,
    reference_id: reviewId,
    reference_type: 'review',
  });
  
  // Check review achievements
  await checkReviewAchievements(userId);
}

async function checkReviewAchievements(userId: string) {
  const { data: profile } = await supabase
    .from('bv_profiles')
    .select('reviews_written')
    .eq('id', userId)
    .single();
  
  if (!profile) return;
  
  const reviews = profile.reviews_written || 0;
  
  const milestones = [
    { count: 1, id: 'first_review', name: 'First Words', xp: 50 },
    { count: 10, id: 'reviewer_10', name: 'Critic', xp: 150 },
    { count: 25, id: 'reviewer_25', name: 'Sommelier', xp: 300 },
    { count: 50, id: 'reviewer_50', name: 'Expert Reviewer', xp: 500 },
    { count: 100, id: 'reviewer_100', name: 'Master Critic', xp: 1000 },
  ];
  
  for (const milestone of milestones) {
    if (reviews >= milestone.count) {
      const { data: existing } = await supabase
        .from('bv_user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', milestone.id)
        .single();
      
      if (!existing) {
        await supabase.from('bv_user_achievements').insert({
          user_id: userId,
          achievement_id: milestone.id,
          earned_at: new Date().toISOString(),
        });
        
        await supabase.from('bv_notifications').insert({
          user_id: userId,
          type: 'achievement',
          title: `Achievement Unlocked: ${milestone.name}!`,
          message: `You've written ${milestone.count} reviews! +${milestone.xp} XP`,
          data: { achievement_id: milestone.id, xp: milestone.xp },
        });
      }
    }
  }
}

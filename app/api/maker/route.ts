/**
 * MAKER STOREFRONT API
 * ====================
 * API for distillery/brand management
 * 
 * Endpoints:
 * GET /api/maker - Get distillery profile and stats
 * POST /api/maker - Create distillery profile
 * PATCH /api/maker - Update distillery profile
 * GET /api/maker/analytics - Get detailed analytics
 * GET /api/maker/reviews - Get reviews for distillery's spirits
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireCaller } from '@/lib/api/caller';
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

export const dynamic = 'force-dynamic';

// ============================================
// GET - Retrieve Distillery Profile
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const distilleryId = searchParams.get('id');
    // 2026-09-04: identity from the token, never the query string.
    const _c = await requireCaller(request);
    if (!_c.ok) return _c.res;
    const userId = _c.userId;
    const action = searchParams.get('action');
    
    // Get distillery by user (owner)
    if (userId && !distilleryId) {
      const { data: distillery, error } = await supabase
        .from('bv_distilleries')
        .select(`
          *,
          spirits:bv_spirits(count),
          reviews:bv_reviews(count)
        `)
        .eq('owner_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: 'Failed to fetch distillery' }, { status: 500 });
      }
      
      if (!distillery) {
        return NextResponse.json({
          success: true,
          data: null,
          message: 'No distillery profile found for this user',
        });
      }
      
      // Get stats
      const stats = await getDistilleryStats(distillery.id);
      
      return NextResponse.json({
        success: true,
        data: {
          ...distillery,
          stats,
        },
      });
    }
    
    // Get specific distillery
    if (distilleryId) {
      // Analytics action
      if (action === 'analytics') {
        const analytics = await getDistilleryAnalytics(distilleryId);
        return NextResponse.json({
          success: true,
          data: analytics,
        });
      }
      
      // Reviews action
      if (action === 'reviews') {
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');
        const spiritId = searchParams.get('spirit_id');
        const rating = searchParams.get('rating');
        
        let query = supabase
          .from('bv_reviews')
          .select(`
            *,
            spirit:bv_spirits!inner(id, name, distillery_id),
            user:bv_profiles(display_name, avatar_url)
          `)
          .eq('spirit.distillery_id', distilleryId)
          .order('created_at', { ascending: false });
        
        if (spiritId) {
          query = query.eq('spirit_id', spiritId);
        }
        
        if (rating) {
          query = query.eq('rating', parseInt(rating));
        }
        
        const { data: reviews, error } = await query.range(offset, offset + limit - 1);
        
        if (error) {
          return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
        }
        
        return NextResponse.json({
          success: true,
          data: reviews || [],
        });
      }
      
      // Default: get distillery profile
      const { data: distillery, error } = await supabase
        .from('bv_distilleries')
        .select('*')
        .eq('id', distilleryId)
        .single();
      
      if (error) {
        return NextResponse.json({ error: 'Distillery not found' }, { status: 404 });
      }
      
      // Get spirits
      const { data: spirits } = await supabase
        .from('bv_spirits')
        .select('*')
        .eq('distillery_id', distilleryId)
        .order('name');
      
      // Get stats
      const stats = await getDistilleryStats(distilleryId);
      
      // Log view
      await logDistilleryView(distilleryId);
      
      return NextResponse.json({
        success: true,
        data: {
          ...distillery,
          spirits: spirits || [],
          stats,
        },
      });
    }
    
    // List all distilleries (public)
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const country = searchParams.get('country');
    
    let query = supabase
      .from('bv_distilleries')
      .select('*')
      .eq('is_public', true)
      .order('name');
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%`);
    }
    
    if (country) {
      query = query.eq('country', country);
    }
    
    const { data: distilleries, error } = await query.limit(limit);
    
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch distilleries' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: distilleries || [],
    });
    
  } catch (error: any) {
    console.error('Maker GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// POST - Create Distillery Profile
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      owner_id,
      name,
      location,
      country,
      region,
      description,
      founded_year,
      website_url,
      social_links,
      logo_url,
      cover_image_url,
    } = body;
    
    // Validate required fields
    if (!owner_id || !name) {
      return NextResponse.json({
        error: 'Missing required fields: owner_id, name',
      }, { status: 400 });
    }
    
    // Check if user already has a distillery
    const { data: existing } = await supabase
      .from('bv_distilleries')
      .select('id')
      .eq('owner_id', owner_id)
      .single();
    
    if (existing) {
      return NextResponse.json({
        error: 'User already has a distillery profile',
      }, { status: 400 });
    }
    
    // Create distillery
    const { data: distillery, error } = await supabase
      .from('bv_distilleries')
      .insert({
        owner_id,
        name,
        location,
        country,
        region,
        description,
        founded_year,
        website_url,
        social_links,
        logo_url,
        cover_image_url,
        is_verified: false,
        is_public: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Create distillery error:', error);
      return NextResponse.json({ error: 'Failed to create distillery' }, { status: 500 });
    }
    
    // Award XP for creating distillery
    await supabase.from('bv_xp_log').insert({
      user_id: owner_id,
      action: 'distillery_created',
      xp_earned: 500,
      reference_id: distillery.id,
      reference_type: 'distillery',
    });
    
    return NextResponse.json({
      success: true,
      data: distillery,
      message: 'Distillery profile created successfully',
    });
    
  } catch (error: any) {
    console.error('Maker POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// PATCH - Update Distillery Profile
// ============================================

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      distillery_id,
      owner_id,
      action,
      ...updates
    } = body;
    
    if (!distillery_id || !owner_id) {
      return NextResponse.json({
        error: 'Missing required fields: distillery_id, owner_id',
      }, { status: 400 });
    }
    
    // Verify ownership
    const { data: distillery, error: fetchError } = await supabase
      .from('bv_distilleries')
      .select('owner_id')
      .eq('id', distillery_id)
      .single();
    
    if (fetchError || !distillery) {
      return NextResponse.json({ error: 'Distillery not found' }, { status: 404 });
    }
    
    if (distillery.owner_id !== owner_id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    // Handle specific actions
    if (action === 'reply_review') {
      const { review_id, reply } = updates;
      
      const { error } = await supabase
        .from('bv_reviews')
        .update({
          maker_reply: reply,
          maker_replied_at: new Date().toISOString(),
        })
        .eq('id', review_id);
      
      if (error) {
        return NextResponse.json({ error: 'Failed to save reply' }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: 'Reply saved successfully',
      });
    }
    
    // Update profile
    const allowedFields = [
      'name', 'location', 'country', 'region', 'description',
      'founded_year', 'website_url', 'social_links',
      'logo_url', 'cover_image_url', 'is_public',
    ];
    
    const filteredUpdates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }
    
    filteredUpdates.updated_at = new Date().toISOString();
    
    const { data: updated, error } = await supabase
      .from('bv_distilleries')
      .update(filteredUpdates)
      .eq('id', distillery_id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: 'Failed to update distillery' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Distillery updated successfully',
    });
    
  } catch (error: any) {
    console.error('Maker PATCH error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getDistilleryStats(distilleryId: string) {
  // Get spirit count
  const { count: spiritCount } = await supabase
    .from('bv_spirits')
    .select('*', { count: 'exact', head: true })
    .eq('distillery_id', distilleryId);
  
  // Get review stats
  const { data: reviews } = await supabase
    .from('bv_reviews')
    .select('rating')
    .eq('distillery_id', distilleryId);
  
  const reviewCount = reviews?.length || 0;
  const avgRating = reviewCount > 0
    ? (reviews ?? []).reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewCount
    : 0;
  
  // Get view count (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { count: viewCount } = await supabase
    .from('bv_distillery_views')
    .select('*', { count: 'exact', head: true })
    .eq('distillery_id', distilleryId)
    .gte('viewed_at', thirtyDaysAgo.toISOString());
  
  return {
    total_spirits: spiritCount || 0,
    total_reviews: reviewCount,
    average_rating: Math.round(avgRating * 10) / 10,
    monthly_views: viewCount || 0,
  };
}

async function getDistilleryAnalytics(distilleryId: string) {
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const twoMonthsAgo = new Date(today);
  twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
  
  // Views today
  const { count: viewsToday } = await supabase
    .from('bv_distillery_views')
    .select('*', { count: 'exact', head: true })
    .eq('distillery_id', distilleryId)
    .gte('viewed_at', today.toISOString());
  
  // Views this week
  const { count: viewsWeek } = await supabase
    .from('bv_distillery_views')
    .select('*', { count: 'exact', head: true })
    .eq('distillery_id', distilleryId)
    .gte('viewed_at', weekAgo.toISOString());
  
  // Views this month
  const { count: viewsMonth } = await supabase
    .from('bv_distillery_views')
    .select('*', { count: 'exact', head: true })
    .eq('distillery_id', distilleryId)
    .gte('viewed_at', monthAgo.toISOString());
  
  // Views previous month (for trend calculation)
  const { count: viewsPrevMonth } = await supabase
    .from('bv_distillery_views')
    .select('*', { count: 'exact', head: true })
    .eq('distillery_id', distilleryId)
    .gte('viewed_at', twoMonthsAgo.toISOString())
    .lt('viewed_at', monthAgo.toISOString());
  
  // Calculate trend
  const currentViews = viewsMonth || 0;
  const previousViews = viewsPrevMonth || 1; // Avoid division by zero
  const viewsTrend = Math.round(((currentViews - previousViews) / previousViews) * 100);
  
  // Top spirits by views
  const { data: topSpirits } = await supabase
    .from('bv_spirit_views')
    .select(`
      spirit_id,
      spirit:bv_spirits!inner(id, name, distillery_id)
    `)
    .eq('spirit.distillery_id', distilleryId)
    .gte('viewed_at', monthAgo.toISOString());
  
  // Count views per spirit
  const spiritViewCounts: Record<string, { id: string; name: string; views: number }> = {};
  for (const view of (topSpirits || [])) {
    const id = view.spirit_id;
    const name = (view.spirit as any)?.name || 'Unknown';
    if (!spiritViewCounts[id]) {
      spiritViewCounts[id] = { id, name, views: 0 };
    }
    spiritViewCounts[id].views++;
  }
  
  const topSpiritsArray = Object.values(spiritViewCounts)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
  
  // Review sentiment (basic calculation)
  const { data: recentReviews } = await supabase
    .from('bv_reviews')
    .select('rating')
    .eq('distillery_id', distilleryId)
    .gte('created_at', monthAgo.toISOString());
  
  let positive = 0, neutral = 0, negative = 0;
  for (const review of (recentReviews || [])) {
    if (review.rating >= 4) positive++;
    else if (review.rating === 3) neutral++;
    else negative++;
  }
  
  const totalReviews = positive + neutral + negative;
  const sentiment = {
    positive: totalReviews > 0 ? Math.round((positive / totalReviews) * 100) : 0,
    neutral: totalReviews > 0 ? Math.round((neutral / totalReviews) * 100) : 0,
    negative: totalReviews > 0 ? Math.round((negative / totalReviews) * 100) : 0,
  };
  
  // Geographic breakdown (simplified)
  const { data: viewsWithCountry } = await supabase
    .from('bv_distillery_views')
    .select('country')
    .eq('distillery_id', distilleryId)
    .gte('viewed_at', monthAgo.toISOString())
    .not('country', 'is', null);
  
  const countryCounts: Record<string, number> = {};
  for (const view of (viewsWithCountry || [])) {
    const country = view.country || 'Unknown';
    countryCounts[country] = (countryCounts[country] || 0) + 1;
  }
  
  const totalCountryViews = Object.values(countryCounts).reduce((a, b) => a + b, 0) || 1;
  const geographicBreakdown = Object.entries(countryCounts)
    .map(([country, count]) => ({
      country,
      percentage: Math.round((count / totalCountryViews) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);
  
  return {
    views_today: viewsToday || 0,
    views_week: viewsWeek || 0,
    views_month: viewsMonth || 0,
    views_trend: viewsTrend,
    top_spirits: topSpiritsArray,
    review_sentiment: sentiment,
    geographic_breakdown: geographicBreakdown,
  };
}

async function logDistilleryView(distilleryId: string) {
  // In production, would capture more data like country from IP
  await supabase.from('bv_distillery_views').insert({
    distillery_id: distilleryId,
    viewed_at: new Date().toISOString(),
  });
}

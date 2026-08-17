/**
 * TASTING SESSIONS API
 * ====================
 * Save and retrieve user tasting sessions
 * 
 * Endpoints:
 * GET /api/tasting/sessions - Get user's tasting history
 * POST /api/tasting/sessions - Save a new tasting session
 */

import { NextRequest, NextResponse } from 'next/server';
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

export const dynamic = 'force-dynamic';

// ============================================
// GET - Retrieve Tasting Sessions
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const spiritId = searchParams.get('spirit_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Build query
    let query = supabase
      .from('bv_tasting_sessions')
      .select(`
        *,
        spirit:bv_spirits(id, name, brand, category, image_url, abv)
      `)
      .order('completed_at', { ascending: false });
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    if (spiritId) {
      query = query.eq('spirit_id', spiritId);
    }
    
    const { data: sessions, error, count } = await query
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Tasting sessions query error:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }
    
    // Calculate stats
    const stats = {
      total_sessions: sessions?.length || 0,
      average_rating: sessions && sessions.length > 0
        ? (sessions.reduce((sum, s) => sum + (s.overall_rating || 0), 0) / sessions.length).toFixed(1)
        : 0,
      would_buy_again_percent: sessions && sessions.length > 0
        ? Math.round((sessions.filter(s => s.would_buy_again).length / sessions.length) * 100)
        : 0,
      unique_spirits: new Set(sessions?.map(s => s.spirit_id)).size,
    };
    
    return NextResponse.json({
      success: true,
      data: sessions || [],
      stats,
      pagination: {
        limit,
        offset,
        has_more: (sessions?.length || 0) === limit,
      },
    });
    
  } catch (error: any) {
    console.error('Tasting sessions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// POST - Save Tasting Session
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      spirit_id,
      spirit_name,
      notes,
      overall_rating,
      would_buy_again,
      personal_notes,
      price_paid,
      location,
      companions,
    } = body;
    
    // Validate required fields
    if (!spirit_name || !notes || overall_rating === undefined) {
      return NextResponse.json({
        error: 'Missing required fields: spirit_name, notes, overall_rating',
      }, { status: 400 });
    }
    
    // Extract flavor profile from notes
    const flavorProfile = extractFlavorProfile(notes);
    
    // Create session record
    const sessionData = {
      user_id: user_id || null,
      spirit_id: spirit_id || null,
      spirit_name,
      notes,
      nose_notes: notes.filter((n: any) => n.category === 'nose').map((n: any) => n.note),
      palate_notes: notes.filter((n: any) => n.category === 'palate').map((n: any) => n.note),
      finish_notes: notes.filter((n: any) => n.category === 'finish').map((n: any) => n.note),
      flavor_profile: flavorProfile,
      overall_rating,
      would_buy_again: would_buy_again || false,
      personal_notes: personal_notes || null,
      price_paid: price_paid || null,
      location: location || null,
      companions: companions || null,
      completed_at: new Date().toISOString(),
    };
    
    const { data: session, error } = await supabase
      .from('bv_tasting_sessions')
      .insert(sessionData)
      .select()
      .single();
    
    if (error) {
      console.error('Insert session error:', error);
      return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
    }
    
    // Award XP for completing tasting
    if (user_id) {
      await awardTastingXP(user_id, session.id, notes.length);
    }
    
    // Update spirit average rating
    if (spirit_id) {
      await updateSpiritRating(spirit_id);
    }
    
    return NextResponse.json({
      success: true,
      data: session,
      message: 'Tasting session saved successfully',
    });
    
  } catch (error: any) {
    console.error('Save session error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function extractFlavorProfile(notes: any[]): string[] {
  const profile: string[] = [];
  const allNotes = notes.map(n => n.note.toLowerCase()).join(' ');
  
  const categories: Record<string, string[]> = {
    sweet: ['vanilla', 'caramel', 'honey', 'maple', 'butterscotch', 'toffee', 'sugar', 'chocolate'],
    fruity: ['apple', 'pear', 'cherry', 'plum', 'peach', 'orange', 'lemon', 'berry', 'fruit', 'tropical'],
    spicy: ['cinnamon', 'pepper', 'clove', 'ginger', 'nutmeg', 'spice'],
    smoky: ['smoke', 'peat', 'campfire', 'ash', 'tobacco', 'charcoal'],
    woody: ['oak', 'wood', 'cedar', 'barrel', 'charred'],
    floral: ['rose', 'lavender', 'violet', 'jasmine', 'flower', 'floral'],
    herbal: ['mint', 'eucalyptus', 'grass', 'hay', 'herb', 'tea'],
    nutty: ['almond', 'walnut', 'hazelnut', 'pecan', 'nut', 'marzipan'],
    grain: ['corn', 'wheat', 'barley', 'rye', 'bread', 'malt'],
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(k => allNotes.includes(k))) {
      profile.push(category);
    }
  }
  
  return profile;
}

async function awardTastingXP(userId: string, sessionId: string, notesCount: number) {
  // Base XP for completing a tasting
  let xpEarned = 50;
  
  // Bonus XP based on detail
  if (notesCount >= 5) xpEarned += 25;
  if (notesCount >= 10) xpEarned += 25;
  if (notesCount >= 15) xpEarned += 50;
  
  // Update user XP
  const { data: profile } = await supabase
    .from('bv_profiles')
    .select('total_xp, tastings_completed')
    .eq('id', userId)
    .single();
  
  if (profile) {
    await supabase
      .from('bv_profiles')
      .update({
        total_xp: (profile.total_xp || 0) + xpEarned,
        tastings_completed: (profile.tastings_completed || 0) + 1,
      })
      .eq('id', userId);
  }
  
  // Log XP activity
  await supabase.from('bv_xp_log').insert({
    user_id: userId,
    action: 'tasting_completed',
    xp_earned: xpEarned,
    reference_id: sessionId,
    reference_type: 'tasting_session',
  });
  
  // Check for tasting-related achievements
  await checkTastingAchievements(userId);
}

async function checkTastingAchievements(userId: string) {
  const { data: profile } = await supabase
    .from('bv_profiles')
    .select('tastings_completed')
    .eq('id', userId)
    .single();
  
  if (!profile) return;
  
  const tastings = profile.tastings_completed || 0;
  
  // Achievement milestones
  const milestones = [
    { count: 1, id: 'first_tasting', name: 'First Sip', xp: 100 },
    { count: 10, id: 'taster_10', name: 'Developing Palate', xp: 250 },
    { count: 25, id: 'taster_25', name: 'Spirits Explorer', xp: 500 },
    { count: 50, id: 'taster_50', name: 'Connoisseur', xp: 1000 },
    { count: 100, id: 'taster_100', name: 'Master Taster', xp: 2500 },
  ];
  
  for (const milestone of milestones) {
    if (tastings >= milestone.count) {
      // Check if already earned
      const { data: existing } = await supabase
        .from('bv_user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', milestone.id)
        .single();
      
      if (!existing) {
        // Award achievement
        await supabase.from('bv_user_achievements').insert({
          user_id: userId,
          achievement_id: milestone.id,
          earned_at: new Date().toISOString(),
        });
        
        // Award bonus XP
        await supabase
          .from('bv_profiles')
          .update({
            total_xp: supabase.rpc('increment_xp', { amount: milestone.xp }),
          })
          .eq('id', userId);
        
        // Create notification
        await supabase.from('bv_notifications').insert({
          user_id: userId,
          type: 'achievement',
          title: `Achievement Unlocked: ${milestone.name}!`,
          message: `You've completed ${milestone.count} tastings! +${milestone.xp} XP`,
          data: { achievement_id: milestone.id, xp: milestone.xp },
        });
      }
    }
  }
}

async function updateSpiritRating(spiritId: string) {
  // Calculate new average rating
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

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export const dynamic = 'force-dynamic';

// GET /api/leaderboard - Fetch leaderboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all-time';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const type = searchParams.get('type') || 'xp'; // xp, achievements, streak, bottles
    
    let query = supabase
      .from('bv_profiles')
      .select(`
        id,
        username,
        avatar_url,
        xp,
        level,
        achievements_count,
        streak_days,
        total_bottles,
        proof_tokens,
        created_at,
        updated_at
      `)
      .limit(limit);
    
    // Apply sorting based on type
    switch (type) {
      case 'achievements':
        query = query.order('achievements_count', { ascending: false });
        break;
      case 'streak':
        query = query.order('streak_days', { ascending: false });
        break;
      case 'bottles':
        query = query.order('total_bottles', { ascending: false });
        break;
      case 'xp':
      default:
        query = query.order('xp', { ascending: false });
    }
    
    // Apply time filter for period
    if (period === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('updated_at', weekAgo.toISOString());
    } else if (period === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('updated_at', monthAgo.toISOString());
    }
    
    const { data: leaderboard, error } = await query;
    
    if (error) {
      console.error('Leaderboard query error:', error);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
    
    // Add rank numbers
    const rankedLeaderboard = (leaderboard || []).map((entry, index) => ({
      ...entry,
      rank: index + 1,
      // Calculate level from XP if not stored
      level: entry.level || calculateLevel(entry.xp || 0),
    }));
    
    return NextResponse.json({
      success: true,
      data: rankedLeaderboard,
      period,
      type,
      count: rankedLeaderboard.length,
    });
    
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/leaderboard - Update user stats (for internal use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, action, amount } = body;
    
    if (!user_id || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get current user stats
    const { data: currentStats, error: fetchError } = await supabase
      .from('bv_profiles')
      .select('*')
      .eq('id', user_id)
      .single();
    
    if (fetchError || !currentStats) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    let updates: Record<string, number | string> = {};
    let xpGained = 0;
    
    switch (action) {
      case 'add_bottle':
        updates.total_bottles = (currentStats.total_bottles || 0) + 1;
        xpGained = 10;
        break;
        
      case 'write_tasting_note':
        updates.tasting_notes = (currentStats.tasting_notes || 0) + 1;
        xpGained = 25;
        break;
        
      case 'trivia_correct':
        updates.trivia_correct = (currentStats.trivia_correct || 0) + 1;
        xpGained = 5;
        break;
        
      case 'complete_quiz':
        updates.quizzes_completed = (currentStats.quizzes_completed || 0) + 1;
        xpGained = 50;
        break;
        
      case 'daily_login':
        // Update streak
        const lastLogin = new Date(currentStats.last_login || 0);
        const today = new Date();
        const daysSinceLastLogin = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastLogin === 1) {
          // Consecutive day
          updates.streak_days = (currentStats.streak_days || 0) + 1;
          xpGained = 10 + Math.min((currentStats.streak_days || 0) * 2, 50); // Bonus for streak
        } else if (daysSinceLastLogin > 1) {
          // Streak broken
          updates.streak_days = 1;
          xpGained = 10;
        }
        updates.last_login = today.toISOString();
        break;
        
      case 'earn_achievement':
        updates.achievements_count = (currentStats.achievements_count || 0) + 1;
        xpGained = amount || 100;
        break;
        
      case 'add_xp':
        xpGained = amount || 0;
        break;
        
      case 'add_proof':
        updates.proof_tokens = (currentStats.proof_tokens || 0) + (amount || 0);
        break;
        
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
    
    // Add XP
    if (xpGained > 0) {
      const newXp = (currentStats.xp || 0) + xpGained;
      updates.xp = newXp;
      updates.level = calculateLevel(newXp);
    }
    
    updates.updated_at = new Date().toISOString();
    
    // Update user stats
    const { error: updateError } = await supabase
      .from('bv_profiles')
      .update(updates)
      .eq('id', user_id);
    
    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 });
    }
    
    // Check for new achievements
    const newAchievements = await checkAchievements(user_id, {
      ...currentStats,
      ...updates,
    });
    
    return NextResponse.json({
      success: true,
      xp_gained: xpGained,
      new_total_xp: updates.xp || currentStats.xp,
      new_level: updates.level || currentStats.level,
      new_achievements: newAchievements,
    });
    
  } catch (error) {
    console.error('Update stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper: Calculate level from XP
function calculateLevel(xp: number): number {
  // XP curve: level N requires N * 1000 XP
  let level = 1;
  let totalXpRequired = 0;
  
  while (totalXpRequired + level * 1000 <= xp) {
    totalXpRequired += level * 1000;
    level++;
  }
  
  return level;
}

// Helper: Check for new achievements
async function checkAchievements(userId: string, stats: Record<string, number | string | null>): Promise<string[]> {
  const earnedAchievements: string[] = [];
  
  // Get all achievements user hasn't earned yet
  const { data: allAchievements } = await supabase
    .from('bv_achievements')
    .select('id, requirement_type, requirement_value, requirement_category');
  
  const { data: userAchievements } = await supabase
    .from('bv_user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);
  
  const earnedIds = new Set((userAchievements || []).map(ua => ua.achievement_id));
  
  for (const achievement of (allAchievements || [])) {
    if (earnedIds.has(achievement.id)) continue;
    
    let earned = false;
    
    switch (achievement.requirement_type) {
      case 'collection_count':
        earned = (stats.total_bottles as number || 0) >= achievement.requirement_value;
        break;
      case 'tasting_notes':
        earned = (stats.tasting_notes as number || 0) >= achievement.requirement_value;
        break;
      case 'trivia_correct':
        earned = (stats.trivia_correct as number || 0) >= achievement.requirement_value;
        break;
      case 'streak_days':
        earned = (stats.streak_days as number || 0) >= achievement.requirement_value;
        break;
      case 'level':
        earned = (stats.level as number || 1) >= achievement.requirement_value;
        break;
    }
    
    if (earned) {
      // Grant achievement
      await supabase
        .from('bv_user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id,
          earned_at: new Date().toISOString(),
        });
      
      earnedAchievements.push(achievement.id);
    }
  }
  
  return earnedAchievements;
}

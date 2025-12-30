/**
 * LEADERBOARD API
 * ================
 * Get top players and rankings
 * 
 * GET /api/leaderboard - Get top players
 * GET /api/leaderboard?user_id=xxx - Get user's rank
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// GET - Leaderboard
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const period = searchParams.get('period') || 'all-time';
    const category = searchParams.get('category') || 'overall';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build date filter based on period
    let dateFilter: string | null = null;
    const now = new Date();
    
    switch (period) {
      case 'daily':
        dateFilter = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        break;
      case 'weekly':
        dateFilter = new Date(now.setDate(now.getDate() - 7)).toISOString();
        break;
      case 'monthly':
        dateFilter = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
        break;
      default:
        dateFilter = null;
    }

    // Try to get from database
    let query = supabase
      .from('bv_user_profiles')
      .select(`
        id,
        user_id,
        display_name,
        avatar_url,
        total_xp,
        level,
        current_streak,
        achievements,
        created_at
      `)
      .order('total_xp', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: profiles, error } = await query;

    if (error) {
      console.error('Leaderboard error:', error);
    }

    // If we have data, format it
    if (profiles && profiles.length > 0) {
      const leaderboard = profiles.map((profile, index) => ({
        rank: offset + index + 1,
        id: profile.user_id,
        username: profile.display_name || `Player${profile.user_id.slice(0, 4)}`,
        avatar: profile.avatar_url || getRandomAvatar(),
        xp: profile.total_xp || 0,
        level: profile.level || 1,
        badges: extractBadges(profile.achievements),
        streak: profile.current_streak || 0,
        joinedAt: profile.created_at,
      }));

      // Get user's rank if requested
      let userRank = null;
      if (userId) {
        const { data: userProfile, error: userError } = await supabase
          .from('bv_user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (userProfile && !userError) {
          // Get count of users with more XP
          const { count } = await supabase
            .from('bv_user_profiles')
            .select('*', { count: 'exact', head: true })
            .gt('total_xp', userProfile.total_xp || 0);

          userRank = {
            rank: (count || 0) + 1,
            id: userProfile.user_id,
            username: userProfile.display_name || 'You',
            avatar: userProfile.avatar_url || '😎',
            xp: userProfile.total_xp || 0,
            level: userProfile.level || 1,
            badges: extractBadges(userProfile.achievements),
            streak: userProfile.current_streak || 0,
          };
        }
      }

      return NextResponse.json({
        success: true,
        leaderboard,
        userRank,
        pagination: {
          limit,
          offset,
          hasMore: profiles.length === limit,
        },
      });
    }

    // Return demo data if no database results
    const demoLeaderboard = generateDemoLeaderboard(limit, offset);
    
    return NextResponse.json({
      success: true,
      leaderboard: demoLeaderboard,
      userRank: userId ? {
        rank: 156,
        id: userId,
        username: 'You',
        avatar: '😎',
        xp: 3450,
        level: 8,
        badges: ['🌟'],
        streak: 5,
      } : null,
      pagination: {
        limit,
        offset,
        hasMore: true,
      },
    });

  } catch (error: any) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getRandomAvatar(): string {
  const avatars = ['👨‍🍳', '🤠', '🧔', '🏴‍☠️', '🌵', '🌿', '🍇', '❄️', '🛢️', '🎯', '🔥', '⭐'];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

function extractBadges(achievements: any): string[] {
  if (!achievements) return [];
  if (Array.isArray(achievements)) {
    return achievements.slice(0, 3).map(a => a.icon || '🏆');
  }
  return ['🏆'];
}

function generateDemoLeaderboard(limit: number, offset: number) {
  const names = [
    'WhiskeyMaster', 'BourbonKing', 'ScotchLover', 'RumRunner', 'TequilaSunrise',
    'GinEnthusiast', 'CognacConnoisseur', 'VodkaPurist', 'MezcalMaven', 'BarrelHunter',
    'OakAger', 'DistilleryDan', 'MashBillMike', 'ProofPro', 'CaskStrength',
    'SingleMalt', 'DoubleOak', 'TripleDistilled', 'AngelsShare', 'DevilsCut',
  ];
  
  const avatars = ['👨‍🍳', '🤠', '🧔', '🏴‍☠️', '🌵', '🌿', '🍇', '❄️', '🛢️', '🎯'];
  const badgeSets = [
    ['🏆', '🥃', '⭐'], ['🥈', '🔥', '📚'], ['🥉', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🎯'],
    ['🏝️', '⚓'], ['🇲🇽', '🌮'], ['🍸', '🌿'], ['🇫🇷', '🍷'], ['🇷🇺', '❄️'],
  ];

  const leaderboard = [];
  for (let i = 0; i < limit; i++) {
    const rank = offset + i + 1;
    const xpBase = 150000 - (rank * 1500) + Math.floor(Math.random() * 500);
    
    leaderboard.push({
      rank,
      id: `demo-${rank}`,
      username: names[i % names.length] + (rank > 20 ? rank : ''),
      avatar: avatars[i % avatars.length],
      xp: Math.max(1000, xpBase),
      level: Math.max(1, Math.floor(xpBase / 3000)),
      badges: badgeSets[i % badgeSets.length] || ['🌟'],
      streak: Math.max(0, 50 - rank + Math.floor(Math.random() * 10)),
      joinedAt: new Date(Date.now() - (rank * 86400000 * 10)).toISOString(),
    });
  }
  
  return leaderboard;
}

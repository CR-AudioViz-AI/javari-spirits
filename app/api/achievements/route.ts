// app/api/achievements/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireCaller } from '@/lib/api/caller';
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

// Achievement definitions
const ACHIEVEMENTS = [
  // Collection achievements
  { name: 'First Bottle', description: 'Add your first bottle to the collection', icon: '🍾', category: 'collection', requirement_type: 'collection_count', requirement_value: 1, points: 10 },
  { name: 'Shelf Stocker', description: 'Collect 10 bottles', icon: '📦', category: 'collection', requirement_type: 'collection_count', requirement_value: 10, points: 25 },
  { name: 'Serious Collector', description: 'Collect 50 bottles', icon: '🏆', category: 'collection', requirement_type: 'collection_count', requirement_value: 50, points: 100 },
  { name: 'Master Collector', description: 'Collect 100 bottles', icon: '👑', category: 'collection', requirement_type: 'collection_count', requirement_value: 100, points: 250 },
  { name: 'Vault Keeper', description: 'Collect 500 bottles', icon: '🏰', category: 'collection', requirement_type: 'collection_count', requirement_value: 500, points: 1000 },
  
  // Category achievements
  { name: 'Bourbon Trail', description: 'Collect 10 different bourbons', icon: '🥃', category: 'category', requirement_type: 'bourbon_count', requirement_value: 10, points: 50 },
  { name: 'Scotch Explorer', description: 'Collect 10 different scotches', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', category: 'category', requirement_type: 'scotch_count', requirement_value: 10, points: 50 },
  { name: 'Rum Runner', description: 'Collect 10 different rums', icon: '🏴‍☠️', category: 'category', requirement_type: 'rum_count', requirement_value: 10, points: 50 },
  { name: 'Agave Aficionado', description: 'Collect 10 tequilas or mezcals', icon: '🌵', category: 'category', requirement_type: 'agave_count', requirement_value: 10, points: 50 },
  { name: 'Gin Genius', description: 'Collect 10 different gins', icon: '🫒', category: 'category', requirement_type: 'gin_count', requirement_value: 10, points: 50 },
  
  // Review achievements
  { name: 'Critic', description: 'Write your first tasting note', icon: '📝', category: 'reviews', requirement_type: 'review_count', requirement_value: 1, points: 10 },
  { name: 'Reviewer', description: 'Write 10 tasting notes', icon: '✍️', category: 'reviews', requirement_type: 'review_count', requirement_value: 10, points: 50 },
  { name: 'Connoisseur', description: 'Write 50 tasting notes', icon: '🎖️', category: 'reviews', requirement_type: 'review_count', requirement_value: 50, points: 200 },
  
  // Social achievements
  { name: 'Social Butterfly', description: 'Follow 10 collectors', icon: '🦋', category: 'social', requirement_type: 'following_count', requirement_value: 10, points: 25 },
  { name: 'Influencer', description: 'Get 100 followers', icon: '⭐', category: 'social', requirement_type: 'follower_count', requirement_value: 100, points: 200 },
  
  // Distillery achievements
  { name: 'Tourist', description: 'Visit your first distillery', icon: '🎫', category: 'distillery', requirement_type: 'visit_count', requirement_value: 1, points: 25 },
  { name: 'Pilgrim', description: 'Visit 10 distilleries', icon: '🗺️', category: 'distillery', requirement_type: 'visit_count', requirement_value: 10, points: 100 },
  { name: 'Globetrotter', description: 'Visit 50 distilleries', icon: '🌍', category: 'distillery', requirement_type: 'visit_count', requirement_value: 50, points: 500 },
  
  // Special achievements
  { name: 'Unicorn Hunter', description: 'Add an ultra-rare bottle to your collection', icon: '🦄', category: 'special', requirement_type: 'ultra_rare_count', requirement_value: 1, points: 100, is_secret: false },
  { name: 'Whale Watcher', description: 'Have a collection worth over $10,000', icon: '🐋', category: 'special', requirement_type: 'collection_value', requirement_value: 10000, points: 250, is_secret: true },
  { name: 'Early Adopter', description: 'Join BarrelVerse in the first month', icon: '🚀', category: 'special', requirement_type: 'join_date', requirement_value: 0, points: 100 },
];

// GET - List all achievements and user progress
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // 2026-09-04: identity from the token, never the query string.
  const _c = await requireCaller(request);
  if (!_c.ok) return _c.res;
  const userId = _c.userId;

  // Get all achievements
  const { data: achievements, error: achError } = await supabase
    .from('bv_achievements')
    .select('*')
    .order('sort_order', { ascending: true });

  if (achError) {
    return NextResponse.json({ error: achError.message }, { status: 500 });
  }

  // If no userId, return just achievements
  if (!userId) {
    return NextResponse.json({ achievements });
  }

  // Get user's progress
  const { data: userProgress, error: progError } = await supabase
    .from('bv_user_achievements')
    .select('*')
    .eq('user_id', userId);

  if (progError) {
    return NextResponse.json({ error: progError.message }, { status: 500 });
  }

  // Merge achievements with user progress
  const progressMap = new Map(userProgress?.map(p => [p.achievement_id, p]) || []);
  const merged = achievements?.map(ach => ({
    ...ach,
    progress: progressMap.get(ach.id)?.progress || 0,
    unlocked: !!progressMap.get(ach.id)?.unlocked_at,
    unlocked_at: progressMap.get(ach.id)?.unlocked_at,
  }));

  // Calculate total points
  const totalPoints = merged?.reduce((sum, ach) => sum + (ach.unlocked ? ach.points : 0), 0) || 0;
  const unlockedCount = merged?.filter(a => a.unlocked).length || 0;

  return NextResponse.json({
    achievements: merged,
    stats: {
      totalPoints,
      unlockedCount,
      totalCount: achievements?.length || 0,
    }
  });
}

// POST - Check and update achievements for a user
export async function POST(request: NextRequest) {
  try {
    // user id deliberately not taken from the body.
    const {action, data} = await request.json();
    const _c = await requireCaller(request);
    if (!_c.ok) return _c.res;
    const userId = _c.userId;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user's current stats
    const stats = await getUserStats(userId);
    
    // Check all achievements
    const { data: achievements } = await supabase
      .from('bv_achievements')
      .select('*');

    const newlyUnlocked: any[] = [];

    for (const achievement of achievements || []) {
      const { data: existing } = await supabase
        .from('bv_user_achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .single();

      if (existing?.unlocked_at) continue; // Already unlocked

      const currentProgress = getProgressForAchievement(achievement, stats);
      const isComplete = currentProgress >= achievement.requirement_value;

      if (existing) {
        // Update progress
        await supabase
          .from('bv_user_achievements')
          .update({
            progress: currentProgress,
            unlocked_at: isComplete ? new Date().toISOString() : null,
          })
          .eq('id', existing.id);
      } else {
        // Create new progress record
        await supabase
          .from('bv_user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            progress: currentProgress,
            unlocked_at: isComplete ? new Date().toISOString() : null,
          });
      }

      if (isComplete && !existing?.unlocked_at) {
        newlyUnlocked.push(achievement);
        
        // Create notification
        await supabase.from('bv_notifications').insert({
          user_id: userId,
          type: 'achievement_unlocked',
          title: `🏆 Achievement Unlocked!`,
          body: `You earned "${achievement.name}" - ${achievement.description}`,
          data: { achievementId: achievement.id, points: achievement.points },
        });
      }
    }

    return NextResponse.json({
      newlyUnlocked,
      message: newlyUnlocked.length > 0 
        ? `Unlocked ${newlyUnlocked.length} achievement(s)!` 
        : 'Progress updated'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getUserStats(userId: string) {
  // Get collection counts
  const { count: collectionCount } = await supabase
    .from('bv_user_collections')
    .select('id', { count: 'exact' })
    .eq('user_id', userId);

  // Get category counts
  const { data: categoryData } = await supabase
    .from('bv_user_collections')
    .select('spirit:bv_spirits(category)')
    .eq('user_id', userId);

  const categoryCounts: Record<string, number> = {};
  categoryData?.forEach((item: any) => {
    const cat = item.spirit?.category;
    if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Get review count
  const { count: reviewCount } = await supabase
    .from('bv_reviews')
    .select('id', { count: 'exact' })
    .eq('user_id', userId);

  // Get social counts
  const { count: followingCount } = await supabase
    .from('bv_follows')
    .select('id', { count: 'exact' })
    .eq('follower_id', userId);

  const { count: followerCount } = await supabase
    .from('bv_follows')
    .select('id', { count: 'exact' })
    .eq('following_id', userId);

  // Get visit count
  const { count: visitCount } = await supabase
    .from('bv_distillery_visits')
    .select('id', { count: 'exact' })
    .eq('user_id', userId);

  // Get ultra rare count
  const { count: ultraRareCount } = await supabase
    .from('bv_user_collections')
    .select('id, spirit:bv_spirits!inner(rarity)', { count: 'exact' })
    .eq('user_id', userId)
    .eq('spirit.rarity', 'ultra_rare');

  return {
    collection_count: collectionCount || 0,
    bourbon_count: categoryCounts['bourbon'] || 0,
    scotch_count: categoryCounts['scotch'] || 0,
    rum_count: categoryCounts['rum'] || 0,
    agave_count: (categoryCounts['tequila'] || 0) + (categoryCounts['mezcal'] || 0),
    gin_count: categoryCounts['gin'] || 0,
    review_count: reviewCount || 0,
    following_count: followingCount || 0,
    follower_count: followerCount || 0,
    visit_count: visitCount || 0,
    ultra_rare_count: ultraRareCount || 0,
  };
}

function getProgressForAchievement(achievement: any, stats: any): number {
  return stats[achievement.requirement_type] || 0;
}

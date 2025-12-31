// app/api/community/submit-spirit/route.ts
// Community Spirit Submission System with Gamification

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ============================================
// BADGE DEFINITIONS
// ============================================

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  requirement: string;
  xp_reward: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

export const BADGES: Badge[] = [
  // Spirit Submission Badges
  { id: 'first_pour', name: 'First Pour', icon: '🥃', description: 'Added your first spirit to the database', requirement: 'submissions >= 1', xp_reward: 10, tier: 'bronze' },
  { id: 'scout', name: 'Scout', icon: '🔍', description: 'Added 10 new spirits', requirement: 'submissions >= 10', xp_reward: 50, tier: 'bronze' },
  { id: 'contributor', name: 'Contributor', icon: '🏅', description: 'Added 50 spirits', requirement: 'submissions >= 50', xp_reward: 200, tier: 'silver' },
  { id: 'curator', name: 'Curator', icon: '🏆', description: 'Added 100 spirits', requirement: 'submissions >= 100', xp_reward: 500, tier: 'gold' },
  { id: 'master_curator', name: 'Master Curator', icon: '👑', description: 'Added 500 spirits', requirement: 'submissions >= 500', xp_reward: 2000, tier: 'platinum' },
  { id: 'legend', name: 'Legend', icon: '💎', description: 'Added 1000+ spirits', requirement: 'submissions >= 1000', xp_reward: 5000, tier: 'diamond' },
  
  // Photo Submission Badges
  { id: 'photographer', name: 'Photographer', icon: '📸', description: 'Added your first photo', requirement: 'photos >= 1', xp_reward: 15, tier: 'bronze' },
  { id: 'gallery_builder', name: 'Gallery Builder', icon: '🖼️', description: 'Added 25 photos', requirement: 'photos >= 25', xp_reward: 100, tier: 'silver' },
  { id: 'lens_master', name: 'Lens Master', icon: '📷', description: 'Added 100 photos', requirement: 'photos >= 100', xp_reward: 500, tier: 'gold' },
  { id: 'shutterbug', name: 'Shutterbug', icon: '🎞️', description: 'Added 500 photos', requirement: 'photos >= 500', xp_reward: 2500, tier: 'platinum' },
  
  // Verification Badges
  { id: 'verifier', name: 'Verifier', icon: '✅', description: 'Verified 10 community submissions', requirement: 'verifications >= 10', xp_reward: 75, tier: 'bronze' },
  { id: 'quality_guard', name: 'Quality Guard', icon: '🛡️', description: 'Verified 50 submissions', requirement: 'verifications >= 50', xp_reward: 250, tier: 'silver' },
  { id: 'trusted_reviewer', name: 'Trusted Reviewer', icon: '⭐', description: 'Verified 200 submissions', requirement: 'verifications >= 200', xp_reward: 1000, tier: 'gold' },
  
  // Accuracy Badges
  { id: 'accuracy_bronze', name: 'Accurate Contributor', icon: '🎯', description: '90%+ approval rate on submissions', requirement: 'accuracy >= 90', xp_reward: 100, tier: 'bronze' },
  { id: 'accuracy_silver', name: 'Precision Submitter', icon: '🎯', description: '95%+ approval rate on submissions', requirement: 'accuracy >= 95', xp_reward: 300, tier: 'silver' },
  { id: 'accuracy_gold', name: 'Accuracy King', icon: '🎯', description: '98%+ approval rate on submissions', requirement: 'accuracy >= 98', xp_reward: 750, tier: 'gold' },
  
  // Special Photo Badges
  { id: 'label_hunter', name: 'Label Hunter', icon: '🏷️', description: 'Added 10 clear front label photos', requirement: 'front_labels >= 10', xp_reward: 75, tier: 'bronze' },
  { id: 'back_label_pro', name: 'Back Label Pro', icon: '📋', description: 'Added 10 back label photos', requirement: 'back_labels >= 10', xp_reward: 100, tier: 'silver' },
  { id: 'box_collector', name: 'Box Collector', icon: '📦', description: 'Added 5 original packaging photos', requirement: 'packaging_photos >= 5', xp_reward: 50, tier: 'bronze' },
  { id: 'pour_shot_artist', name: 'Pour Shot Artist', icon: '🥃', description: 'Added 5 action pour shots', requirement: 'pour_shots >= 5', xp_reward: 75, tier: 'silver' },
  
  // Category Specialist Badges
  { id: 'bourbon_expert', name: 'Bourbon Expert', icon: '🌽', description: 'Added 50 bourbon spirits', requirement: 'bourbon_submissions >= 50', xp_reward: 250, tier: 'silver' },
  { id: 'scotch_connoisseur', name: 'Scotch Connoisseur', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', description: 'Added 50 Scotch whiskies', requirement: 'scotch_submissions >= 50', xp_reward: 250, tier: 'silver' },
  { id: 'tequila_aficionado', name: 'Tequila Aficionado', icon: '🌵', description: 'Added 50 tequilas', requirement: 'tequila_submissions >= 50', xp_reward: 250, tier: 'silver' },
  { id: 'rum_runner', name: 'Rum Runner', icon: '🏝️', description: 'Added 50 rums', requirement: 'rum_submissions >= 50', xp_reward: 250, tier: 'silver' },
  { id: 'gin_guru', name: 'Gin Guru', icon: '🌿', description: 'Added 50 gins', requirement: 'gin_submissions >= 50', xp_reward: 250, tier: 'silver' },
  
  // Streak Badges
  { id: 'weekly_warrior', name: 'Weekly Warrior', icon: '📅', description: 'Submitted spirits 7 days in a row', requirement: 'streak >= 7', xp_reward: 100, tier: 'bronze' },
  { id: 'monthly_master', name: 'Monthly Master', icon: '🗓️', description: 'Submitted spirits 30 days in a row', requirement: 'streak >= 30', xp_reward: 500, tier: 'gold' },
  
  // Community Badges
  { id: 'helpful', name: 'Helpful', icon: '🤝', description: 'Had 10 submissions upvoted by others', requirement: 'upvotes_received >= 10', xp_reward: 50, tier: 'bronze' },
  { id: 'community_hero', name: 'Community Hero', icon: '🦸', description: 'Had 100 submissions upvoted by others', requirement: 'upvotes_received >= 100', xp_reward: 300, tier: 'silver' },
  { id: 'influencer', name: 'Influencer', icon: '🌟', description: 'Had 500 submissions upvoted by others', requirement: 'upvotes_received >= 500', xp_reward: 1000, tier: 'gold' },
];

// ============================================
// DAILY/WEEKLY CHALLENGES
// ============================================

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  requirement: number;
  metric: string;
  xp_reward: number;
  bonus_credits?: number;
}

export const CHALLENGES: Challenge[] = [
  // Daily Challenges
  { id: 'daily_snap', name: 'Daily Snap', description: 'Upload 1 spirit photo today', type: 'daily', requirement: 1, metric: 'photos_today', xp_reward: 5, bonus_credits: 1 },
  { id: 'daily_submission', name: 'Daily Discovery', description: 'Add 1 new spirit today', type: 'daily', requirement: 1, metric: 'submissions_today', xp_reward: 10, bonus_credits: 2 },
  { id: 'daily_verifier', name: 'Daily Verifier', description: 'Verify 3 submissions today', type: 'daily', requirement: 3, metric: 'verifications_today', xp_reward: 15, bonus_credits: 3 },
  
  // Weekly Challenges
  { id: 'weekly_explorer', name: 'Weekly Explorer', description: 'Add 10 spirits this week', type: 'weekly', requirement: 10, metric: 'submissions_week', xp_reward: 100, bonus_credits: 25 },
  { id: 'gallery_week', name: 'Gallery Week', description: 'Upload 20 photos this week', type: 'weekly', requirement: 20, metric: 'photos_week', xp_reward: 150, bonus_credits: 30 },
  { id: 'category_collector', name: 'Category Collector', description: 'Add spirits from 5 different categories', type: 'weekly', requirement: 5, metric: 'categories_week', xp_reward: 75, bonus_credits: 15 },
  { id: 'verification_hero', name: 'Verification Hero', description: 'Verify 25 submissions this week', type: 'weekly', requirement: 25, metric: 'verifications_week', xp_reward: 125, bonus_credits: 25 },
  
  // Monthly Challenges
  { id: 'monthly_centurion', name: 'Monthly Centurion', description: 'Add 100 spirits this month', type: 'monthly', requirement: 100, metric: 'submissions_month', xp_reward: 1000, bonus_credits: 200 },
  { id: 'photo_marathon', name: 'Photo Marathon', description: 'Upload 200 photos this month', type: 'monthly', requirement: 200, metric: 'photos_month', xp_reward: 1500, bonus_credits: 300 },
  { id: 'top_contributor', name: 'Top Contributor', description: 'Be in top 10 contributors for the month', type: 'monthly', requirement: 1, metric: 'rank_month', xp_reward: 2000, bonus_credits: 500 },
];

// ============================================
// LEADERBOARD REWARDS
// ============================================

interface LeaderboardReward {
  position: number;
  xp_bonus: number;
  credits_bonus: number;
  special_badge?: string;
}

export const WEEKLY_LEADERBOARD_REWARDS: LeaderboardReward[] = [
  { position: 1, xp_bonus: 500, credits_bonus: 100, special_badge: 'weekly_champion' },
  { position: 2, xp_bonus: 300, credits_bonus: 50, special_badge: 'weekly_runner_up' },
  { position: 3, xp_bonus: 200, credits_bonus: 25, special_badge: 'weekly_third' },
  { position: 4, xp_bonus: 100, credits_bonus: 15 },
  { position: 5, xp_bonus: 75, credits_bonus: 10 },
  { position: 6, xp_bonus: 50, credits_bonus: 5 },
  { position: 7, xp_bonus: 50, credits_bonus: 5 },
  { position: 8, xp_bonus: 50, credits_bonus: 5 },
  { position: 9, xp_bonus: 50, credits_bonus: 5 },
  { position: 10, xp_bonus: 50, credits_bonus: 5 },
];

export const MONTHLY_LEADERBOARD_REWARDS: LeaderboardReward[] = [
  { position: 1, xp_bonus: 2000, credits_bonus: 500, special_badge: 'monthly_legend' },
  { position: 2, xp_bonus: 1000, credits_bonus: 250, special_badge: 'monthly_elite' },
  { position: 3, xp_bonus: 500, credits_bonus: 100, special_badge: 'monthly_star' },
  { position: 4, xp_bonus: 250, credits_bonus: 50 },
  { position: 5, xp_bonus: 200, credits_bonus: 40 },
  { position: 6, xp_bonus: 150, credits_bonus: 30 },
  { position: 7, xp_bonus: 100, credits_bonus: 20 },
  { position: 8, xp_bonus: 100, credits_bonus: 20 },
  { position: 9, xp_bonus: 100, credits_bonus: 20 },
  { position: 10, xp_bonus: 100, credits_bonus: 20 },
];

// ============================================
// API ENDPOINTS
// ============================================

// GET - Get badges, challenges, leaderboard info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';
  
  if (type === 'badges') {
    return NextResponse.json({
      success: true,
      badges: BADGES,
      total: BADGES.length
    });
  }
  
  if (type === 'challenges') {
    return NextResponse.json({
      success: true,
      challenges: CHALLENGES,
      daily: CHALLENGES.filter(c => c.type === 'daily'),
      weekly: CHALLENGES.filter(c => c.type === 'weekly'),
      monthly: CHALLENGES.filter(c => c.type === 'monthly')
    });
  }
  
  if (type === 'rewards') {
    return NextResponse.json({
      success: true,
      weekly_rewards: WEEKLY_LEADERBOARD_REWARDS,
      monthly_rewards: MONTHLY_LEADERBOARD_REWARDS
    });
  }
  
  return NextResponse.json({
    success: true,
    badges: BADGES,
    challenges: CHALLENGES,
    weekly_rewards: WEEKLY_LEADERBOARD_REWARDS,
    monthly_rewards: MONTHLY_LEADERBOARD_REWARDS,
    summary: {
      total_badges: BADGES.length,
      badge_tiers: {
        bronze: BADGES.filter(b => b.tier === 'bronze').length,
        silver: BADGES.filter(b => b.tier === 'silver').length,
        gold: BADGES.filter(b => b.tier === 'gold').length,
        platinum: BADGES.filter(b => b.tier === 'platinum').length,
        diamond: BADGES.filter(b => b.tier === 'diamond').length,
      },
      total_challenges: CHALLENGES.length,
      challenge_types: {
        daily: CHALLENGES.filter(c => c.type === 'daily').length,
        weekly: CHALLENGES.filter(c => c.type === 'weekly').length,
        monthly: CHALLENGES.filter(c => c.type === 'monthly').length,
      },
      max_xp_from_badges: BADGES.reduce((sum, b) => sum + b.xp_reward, 0),
      max_monthly_xp_from_challenges: CHALLENGES.reduce((sum, c) => sum + c.xp_reward, 0),
    }
  });
}

// POST - Submit a new spirit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name,
      brand,
      category,
      subcategory,
      abv,
      origin_country,
      description,
      image_url,
      barcode,
      user_id
    } = body;
    
    // Validate required fields
    if (!name || !category) {
      return NextResponse.json({
        success: false,
        error: 'Name and category are required'
      }, { status: 400 });
    }
    
    // Calculate XP reward based on completeness
    let xp_earned = 10; // Base XP for submission
    
    if (brand) xp_earned += 2;
    if (abv) xp_earned += 2;
    if (origin_country) xp_earned += 2;
    if (description && description.length > 50) xp_earned += 5;
    if (image_url) xp_earned += 15; // Bonus for photo
    if (barcode) xp_earned += 5;
    
    // Check for badges earned
    const badges_earned: string[] = [];
    
    // This would check database for user's submission count
    // For now, return the potential badges
    
    return NextResponse.json({
      success: true,
      message: 'Spirit submitted for community verification',
      xp_earned,
      potential_badges: ['first_pour', 'scout', 'contributor'],
      submission: {
        name,
        brand,
        category,
        subcategory,
        abv,
        origin_country,
        description,
        image_url,
        barcode,
        status: 'pending_verification',
        submitted_at: new Date().toISOString(),
        submitted_by: user_id
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to process submission'
    }, { status: 500 });
  }
}

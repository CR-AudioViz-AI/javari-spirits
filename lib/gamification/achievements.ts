// 2026-09-04: table names corrected against the live schema. These are renames
// the code never caught up with - bv_user_profiles and bv_users are both
// bv_profiles, bv_activity_log is bv_activities, bv_tickets is
// bv_support_tickets. Each returned PostgREST 42P01 and failed the WHOLE
// query, so every feature built on them returned nothing.
//
// Only verified renames were applied. bv_tasting_sessions and bv_user_favorites
// look like renames and are NOT: their columns do not exist in any candidate
// table, so they are unbuilt features and repointing them would swap a loud
// failure for a silent wrong answer.
/**
 * BARRELVERSE CERTIFICATION & ACHIEVEMENT SYSTEM
 * ===============================================
 * The gamification engine that drives engagement and viral sharing
 * 
 * Features:
 * - 100+ Achievements/Badges
 * - 6 Certification Paths
 * - XP & Leveling System
 * - Shareable Certificates
 * - Leaderboards
 * - Daily/Weekly Challenges
 * 
 * Built by Claude + Roy Henderson
 * CR AudioViz AI, LLC - BarrelVerse
 * 2025-12-04
 */

import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

// ============================================
// TYPES
// ============================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  proofReward: number;
  requirement: AchievementRequirement;
  shareText: string;
  isSecret?: boolean;
}

export interface Certification {
  id: string;
  name: string;
  description: string;
  category: string;
  levels: CertificationLevel[];
  icon: string;
  color: string;
}

export interface CertificationLevel {
  level: number;
  name: string;
  requirements: string[];
  xpRequired: number;
  badge: string;
  perks: string[];
}

export interface AchievementRequirement {
  type: string;
  value: number;
  category?: string;
  spirit_type?: string;
  action?: string;
}

export type AchievementCategory = 
  | 'collection' 
  | 'tasting' 
  | 'social' 
  | 'trivia' 
  | 'exploration' 
  | 'trading' 
  | 'events' 
  | 'special';

// ============================================
// ACHIEVEMENTS (100+)
// ============================================

export const ACHIEVEMENTS: Achievement[] = [
  // ========== COLLECTION ACHIEVEMENTS (25) ==========
  {
    id: 'first_bottle',
    name: 'First Pour',
    description: 'Add your first spirit to your collection',
    category: 'collection',
    icon: '🥃',
    rarity: 'common',
    xpReward: 50,
    proofReward: 25,
    requirement: { type: 'collection_count', value: 1 },
    shareText: "I just started my spirits journey on BarrelVerse! 🥃"
  },
  {
    id: 'shelf_starter',
    name: 'Shelf Starter',
    description: 'Collect 10 spirits',
    category: 'collection',
    icon: '📚',
    rarity: 'common',
    xpReward: 100,
    proofReward: 50,
    requirement: { type: 'collection_count', value: 10 },
    shareText: "My bar is growing! 10 bottles and counting 🍾"
  },
  {
    id: 'growing_collection',
    name: 'Growing Collection',
    description: 'Collect 25 spirits',
    category: 'collection',
    icon: '🏠',
    rarity: 'common',
    xpReward: 250,
    proofReward: 100,
    requirement: { type: 'collection_count', value: 25 },
    shareText: "25 bottles in my collection! 🥂"
  },
  {
    id: 'serious_collector',
    name: 'Serious Collector',
    description: 'Collect 50 spirits',
    category: 'collection',
    icon: '🏛️',
    rarity: 'rare',
    xpReward: 500,
    proofReward: 250,
    requirement: { type: 'collection_count', value: 50 },
    shareText: "50 bottles! I'm officially a serious collector 🏆"
  },
  {
    id: 'master_collector',
    name: 'Master Collector',
    description: 'Collect 100 spirits',
    category: 'collection',
    icon: '👑',
    rarity: 'epic',
    xpReward: 1000,
    proofReward: 500,
    requirement: { type: 'collection_count', value: 100 },
    shareText: "100 BOTTLES! Master Collector status achieved! 👑"
  },
  {
    id: 'legendary_cellar',
    name: 'Legendary Cellar',
    description: 'Collect 250 spirits',
    category: 'collection',
    icon: '🏰',
    rarity: 'legendary',
    xpReward: 2500,
    proofReward: 1000,
    requirement: { type: 'collection_count', value: 250 },
    shareText: "250 bottles! My cellar is LEGENDARY! 🏰✨"
  },
  {
    id: 'bourbon_beginner',
    name: 'Bourbon Beginner',
    description: 'Collect 5 bourbons',
    category: 'collection',
    icon: '🌽',
    rarity: 'common',
    xpReward: 75,
    proofReward: 35,
    requirement: { type: 'category_count', value: 5, category: 'bourbon' },
    shareText: "Starting my bourbon journey with 5 bottles! 🌽"
  },
  {
    id: 'bourbon_enthusiast',
    name: 'Bourbon Enthusiast',
    description: 'Collect 25 bourbons',
    category: 'collection',
    icon: '🥃',
    rarity: 'rare',
    xpReward: 300,
    proofReward: 150,
    requirement: { type: 'category_count', value: 25, category: 'bourbon' },
    shareText: "25 bourbons! Kentucky would be proud 🥃"
  },
  {
    id: 'bourbon_master',
    name: 'Bourbon Master',
    description: 'Collect 50 bourbons',
    category: 'collection',
    icon: '🎖️',
    rarity: 'epic',
    xpReward: 750,
    proofReward: 350,
    requirement: { type: 'category_count', value: 50, category: 'bourbon' },
    shareText: "50 BOURBONS! I AM the Bourbon Master! 🎖️"
  },
  {
    id: 'scotch_explorer',
    name: 'Scotch Explorer',
    description: 'Collect 10 Scotch whiskies',
    category: 'collection',
    icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    rarity: 'common',
    xpReward: 150,
    proofReward: 75,
    requirement: { type: 'category_count', value: 10, category: 'scotch' },
    shareText: "Exploring Scotland one dram at a time! 🏴󠁧󠁢󠁳󠁣󠁴󠁿"
  },
  {
    id: 'rum_runner',
    name: 'Rum Runner',
    description: 'Collect 10 rums',
    category: 'collection',
    icon: '🏴‍☠️',
    rarity: 'common',
    xpReward: 150,
    proofReward: 75,
    requirement: { type: 'category_count', value: 10, category: 'rum' },
    shareText: "Yo ho ho and 10 bottles of rum! 🏴‍☠️"
  },
  {
    id: 'tequila_aficionado',
    name: 'Tequila Aficionado',
    description: 'Collect 10 tequilas',
    category: 'collection',
    icon: '🌵',
    rarity: 'common',
    xpReward: 150,
    proofReward: 75,
    requirement: { type: 'category_count', value: 10, category: 'tequila' },
    shareText: "¡Salud! 10 tequilas in my collection 🌵"
  },
  {
    id: 'white_whale_hunter',
    name: 'White Whale Hunter',
    description: 'Add a bottle with 95+ rating to collection',
    category: 'collection',
    icon: '🐋',
    rarity: 'legendary',
    xpReward: 1500,
    proofReward: 750,
    requirement: { type: 'bottle_rating', value: 95 },
    shareText: "I CAUGHT MY WHITE WHALE! 🐋🥃"
  },
  {
    id: 'pappy_hunter',
    name: 'Pappy Hunter',
    description: 'Add any Pappy Van Winkle to collection',
    category: 'collection',
    icon: '🦄',
    rarity: 'legendary',
    xpReward: 2000,
    proofReward: 1000,
    requirement: { type: 'specific_brand', value: 1, category: 'pappy_van_winkle' },
    shareText: "I FOUND PAPPY! 🦄 The holy grail is mine!",
    isSecret: true
  },
  {
    id: 'btac_collector',
    name: 'BTAC Collector',
    description: 'Collect all 5 Buffalo Trace Antique Collection bottles',
    category: 'collection',
    icon: '🦬',
    rarity: 'legendary',
    xpReward: 5000,
    proofReward: 2500,
    requirement: { type: 'btac_complete', value: 5 },
    shareText: "FULL BTAC SET! All 5 bottles! 🦬👑",
    isSecret: true
  },

  // ========== TASTING ACHIEVEMENTS (20) ==========
  {
    id: 'first_taste',
    name: 'First Taste',
    description: 'Write your first tasting note',
    category: 'tasting',
    icon: '📝',
    rarity: 'common',
    xpReward: 50,
    proofReward: 25,
    requirement: { type: 'tasting_notes', value: 1 },
    shareText: "Just wrote my first tasting note! 📝"
  },
  {
    id: 'developing_palate',
    name: 'Developing Palate',
    description: 'Write 10 tasting notes',
    category: 'tasting',
    icon: '👅',
    rarity: 'common',
    xpReward: 150,
    proofReward: 75,
    requirement: { type: 'tasting_notes', value: 10 },
    shareText: "10 tasting notes! My palate is developing 👅"
  },
  {
    id: 'refined_palate',
    name: 'Refined Palate',
    description: 'Write 50 tasting notes',
    category: 'tasting',
    icon: '🍷',
    rarity: 'rare',
    xpReward: 500,
    proofReward: 250,
    requirement: { type: 'tasting_notes', value: 50 },
    shareText: "50 tasting notes! My palate is REFINED 🍷"
  },
  {
    id: 'master_taster',
    name: 'Master Taster',
    description: 'Write 100 tasting notes',
    category: 'tasting',
    icon: '🏅',
    rarity: 'epic',
    xpReward: 1000,
    proofReward: 500,
    requirement: { type: 'tasting_notes', value: 100 },
    shareText: "100 tasting notes! I'm a MASTER TASTER! 🏅"
  },
  {
    id: 'flavor_finder',
    name: 'Flavor Finder',
    description: 'Identify 25 unique flavor notes',
    category: 'tasting',
    icon: '🔍',
    rarity: 'rare',
    xpReward: 300,
    proofReward: 150,
    requirement: { type: 'unique_flavors', value: 25 },
    shareText: "I can identify 25 different flavor notes! 🔍"
  },
  {
    id: 'nose_knows',
    name: 'The Nose Knows',
    description: 'Complete 20 blind tasting challenges',
    category: 'tasting',
    icon: '👃',
    rarity: 'epic',
    xpReward: 800,
    proofReward: 400,
    requirement: { type: 'blind_tastings', value: 20 },
    shareText: "20 blind tastings! My nose KNOWS! 👃"
  },

  // ========== TRIVIA ACHIEVEMENTS (15) ==========
  {
    id: 'trivia_rookie',
    name: 'Trivia Rookie',
    description: 'Answer 10 trivia questions correctly',
    category: 'trivia',
    icon: '❓',
    rarity: 'common',
    xpReward: 50,
    proofReward: 25,
    requirement: { type: 'trivia_correct', value: 10 },
    shareText: "10 trivia questions right! 🧠"
  },
  {
    id: 'trivia_enthusiast',
    name: 'Trivia Enthusiast',
    description: 'Answer 50 trivia questions correctly',
    category: 'trivia',
    icon: '🧩',
    rarity: 'common',
    xpReward: 200,
    proofReward: 100,
    requirement: { type: 'trivia_correct', value: 50 },
    shareText: "50 trivia questions! I know my spirits! 🧩"
  },
  {
    id: 'trivia_master',
    name: 'Trivia Master',
    description: 'Answer 200 trivia questions correctly',
    category: 'trivia',
    icon: '🎓',
    rarity: 'rare',
    xpReward: 500,
    proofReward: 250,
    requirement: { type: 'trivia_correct', value: 200 },
    shareText: "200 correct answers! TRIVIA MASTER! 🎓"
  },
  {
    id: 'trivia_legend',
    name: 'Trivia Legend',
    description: 'Answer 500 trivia questions correctly',
    category: 'trivia',
    icon: '🏆',
    rarity: 'epic',
    xpReward: 1000,
    proofReward: 500,
    requirement: { type: 'trivia_correct', value: 500 },
    shareText: "500 correct! I'm a TRIVIA LEGEND! 🏆"
  },
  {
    id: 'perfect_round',
    name: 'Perfect Round',
    description: 'Get 10/10 on a trivia round',
    category: 'trivia',
    icon: '💯',
    rarity: 'rare',
    xpReward: 300,
    proofReward: 150,
    requirement: { type: 'perfect_round', value: 1 },
    shareText: "PERFECT SCORE! 10/10 on BarrelVerse trivia! 💯"
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 30-day trivia streak',
    category: 'trivia',
    icon: '🔥',
    rarity: 'epic',
    xpReward: 1000,
    proofReward: 500,
    requirement: { type: 'trivia_streak', value: 30 },
    shareText: "30-DAY STREAK! 🔥 I'm on FIRE!"
  },
  {
    id: 'history_buff',
    name: 'History Buff',
    description: 'Answer 50 history category questions correctly',
    category: 'trivia',
    icon: '📜',
    rarity: 'rare',
    xpReward: 400,
    proofReward: 200,
    requirement: { type: 'trivia_category', value: 50, category: 'history' },
    shareText: "50 history questions! I know my spirits history! 📜"
  },

  // ========== SOCIAL ACHIEVEMENTS (15) ==========
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Get 10 followers',
    category: 'social',
    icon: '🦋',
    rarity: 'common',
    xpReward: 100,
    proofReward: 50,
    requirement: { type: 'followers', value: 10 },
    shareText: "10 followers! Join my spirits journey! 🦋"
  },
  {
    id: 'influencer',
    name: 'Spirits Influencer',
    description: 'Get 100 followers',
    category: 'social',
    icon: '⭐',
    rarity: 'rare',
    xpReward: 500,
    proofReward: 250,
    requirement: { type: 'followers', value: 100 },
    shareText: "100 FOLLOWERS! I'm a Spirits Influencer! ⭐"
  },
  {
    id: 'helpful_reviewer',
    name: 'Helpful Reviewer',
    description: 'Get 50 upvotes on your reviews',
    category: 'social',
    icon: '👍',
    rarity: 'rare',
    xpReward: 400,
    proofReward: 200,
    requirement: { type: 'review_upvotes', value: 50 },
    shareText: "50 upvotes on my reviews! People find me helpful! 👍"
  },
  {
    id: 'share_the_love',
    name: 'Share the Love',
    description: 'Share your collection 10 times',
    category: 'social',
    icon: '❤️',
    rarity: 'common',
    xpReward: 100,
    proofReward: 50,
    requirement: { type: 'shares', value: 10 },
    shareText: "I love sharing my collection! ❤️🥃"
  },
  {
    id: 'referral_king',
    name: 'Referral King',
    description: 'Refer 10 friends who sign up',
    category: 'social',
    icon: '👑',
    rarity: 'epic',
    xpReward: 1000,
    proofReward: 500,
    requirement: { type: 'referrals', value: 10 },
    shareText: "10 friends joined because of me! 👑"
  },

  // ========== EXPLORATION ACHIEVEMENTS (15) ==========
  {
    id: 'museum_visitor',
    name: 'Museum Visitor',
    description: 'Visit all 7 museum wings',
    category: 'exploration',
    icon: '🏛️',
    rarity: 'common',
    xpReward: 200,
    proofReward: 100,
    requirement: { type: 'museum_wings', value: 7 },
    shareText: "I explored all 7 wings of the Spirits Museum! 🏛️"
  },
  {
    id: 'distillery_hopper',
    name: 'Distillery Hopper',
    description: 'Check in at 5 different distilleries',
    category: 'exploration',
    icon: '🏭',
    rarity: 'rare',
    xpReward: 400,
    proofReward: 200,
    requirement: { type: 'distillery_visits', value: 5 },
    shareText: "5 distillery visits! Living the dream! 🏭"
  },
  {
    id: 'bourbon_trail_complete',
    name: 'Bourbon Trail Complete',
    description: 'Visit all Kentucky Bourbon Trail distilleries',
    category: 'exploration',
    icon: '🛤️',
    rarity: 'legendary',
    xpReward: 2000,
    proofReward: 1000,
    requirement: { type: 'bourbon_trail', value: 1 },
    shareText: "KENTUCKY BOURBON TRAIL COMPLETE! 🛤️🥃👑"
  },
  {
    id: 'world_traveler',
    name: 'World Traveler',
    description: 'Collect spirits from 10 different countries',
    category: 'exploration',
    icon: '🌍',
    rarity: 'epic',
    xpReward: 800,
    proofReward: 400,
    requirement: { type: 'countries', value: 10 },
    shareText: "Spirits from 10 countries! I'm a world traveler! 🌍"
  },

  // ========== TRADING ACHIEVEMENTS (10) ==========
  {
    id: 'first_trade',
    name: 'First Trade',
    description: 'Complete your first trade',
    category: 'trading',
    icon: '🤝',
    rarity: 'common',
    xpReward: 100,
    proofReward: 50,
    requirement: { type: 'trades', value: 1 },
    shareText: "Made my first trade on BarrelVerse! 🤝"
  },
  {
    id: 'active_trader',
    name: 'Active Trader',
    description: 'Complete 10 trades',
    category: 'trading',
    icon: '📊',
    rarity: 'rare',
    xpReward: 500,
    proofReward: 250,
    requirement: { type: 'trades', value: 10 },
    shareText: "10 trades complete! Active trader status! 📊"
  },
  {
    id: 'auction_winner',
    name: 'Auction Winner',
    description: 'Win your first auction',
    category: 'trading',
    icon: '🔨',
    rarity: 'rare',
    xpReward: 300,
    proofReward: 150,
    requirement: { type: 'auctions_won', value: 1 },
    shareText: "Won my first auction! 🔨💰"
  },
  {
    id: 'auction_master',
    name: 'Auction Master',
    description: 'Win 10 auctions',
    category: 'trading',
    icon: '🏅',
    rarity: 'epic',
    xpReward: 1000,
    proofReward: 500,
    requirement: { type: 'auctions_won', value: 10 },
    shareText: "10 auction wins! I'm the AUCTION MASTER! 🏅"
  },

  // ========== SPECIAL/SECRET ACHIEVEMENTS (10) ==========
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Log a tasting note after midnight',
    category: 'special',
    icon: '🦉',
    rarity: 'common',
    xpReward: 100,
    proofReward: 50,
    requirement: { type: 'time_based', value: 1, action: 'night_tasting' },
    shareText: "Late night whiskey session! 🦉🥃",
    isSecret: true
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Log a tasting note before 7 AM',
    category: 'special',
    icon: '🐦',
    rarity: 'rare',
    xpReward: 150,
    proofReward: 75,
    requirement: { type: 'time_based', value: 1, action: 'morning_tasting' },
    shareText: "Morning dram! Early bird gets the bourbon! 🐦",
    isSecret: true
  },
  {
    id: 'anniversary',
    name: '1 Year Anniversary',
    description: 'Be a member for 1 year',
    category: 'special',
    icon: '🎂',
    rarity: 'epic',
    xpReward: 1000,
    proofReward: 500,
    requirement: { type: 'membership_days', value: 365 },
    shareText: "1 YEAR on BarrelVerse! 🎂🥃"
  },
  {
    id: 'og_member',
    name: 'OG Member',
    description: 'Joined during the beta period',
    category: 'special',
    icon: '🌟',
    rarity: 'legendary',
    xpReward: 2000,
    proofReward: 1000,
    requirement: { type: 'beta_member', value: 1 },
    shareText: "OG BarrelVerse member since day 1! 🌟",
    isSecret: true
  },
];

// ============================================
// CERTIFICATION PATHS
// ============================================

export const CERTIFICATIONS: Certification[] = [
  {
    id: 'bourbon_certification',
    name: 'Bourbon Certification',
    description: 'Master the art of bourbon appreciation',
    category: 'bourbon',
    icon: '🥃',
    color: '#8B4513',
    levels: [
      {
        level: 1,
        name: 'Bourbon Novice',
        requirements: [
          'Collect 5 bourbons',
          'Write 3 bourbon tasting notes',
          'Score 70%+ on Bourbon Basics quiz'
        ],
        xpRequired: 500,
        badge: 'bourbon_novice',
        perks: ['Bourbon Novice badge', 'Access to Bourbon 101 content']
      },
      {
        level: 2,
        name: 'Bourbon Enthusiast',
        requirements: [
          'Collect 15 bourbons',
          'Write 10 bourbon tasting notes',
          'Score 80%+ on Bourbon History quiz',
          'Visit 1 Kentucky distillery'
        ],
        xpRequired: 1500,
        badge: 'bourbon_enthusiast',
        perks: ['Bourbon Enthusiast badge', 'Exclusive bourbon recommendations', '5% marketplace discount']
      },
      {
        level: 3,
        name: 'Bourbon Connoisseur',
        requirements: [
          'Collect 30 bourbons',
          'Write 25 bourbon tasting notes with flavor profiles',
          'Score 85%+ on Advanced Bourbon quiz',
          'Complete 5 blind bourbon tastings',
          'Visit 3 Kentucky distilleries'
        ],
        xpRequired: 3500,
        badge: 'bourbon_connoisseur',
        perks: ['Verified Connoisseur badge', 'Priority auction access', '10% marketplace discount']
      },
      {
        level: 4,
        name: 'Bourbon Master',
        requirements: [
          'Collect 50+ bourbons',
          'Write 50 detailed tasting notes',
          'Score 95%+ on Master Bourbon exam',
          'Complete Bourbon Trail',
          'Mentor 5 newer members'
        ],
        xpRequired: 7500,
        badge: 'bourbon_master',
        perks: ['MASTER badge', 'Featured profile', 'Free premium for 1 month', 'Invitation to Master events']
      }
    ]
  },
  {
    id: 'scotch_certification',
    name: 'Scotch Certification',
    description: 'Journey through the regions of Scotland',
    category: 'scotch',
    icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    color: '#2E4A62',
    levels: [
      {
        level: 1,
        name: 'Scotch Explorer',
        requirements: [
          'Collect 5 Scotch whiskies',
          'Try whisky from 3 different regions',
          'Score 70%+ on Scotch Regions quiz'
        ],
        xpRequired: 500,
        badge: 'scotch_explorer',
        perks: ['Scotch Explorer badge', 'Regional guide access']
      },
      {
        level: 2,
        name: 'Scotch Aficionado',
        requirements: [
          'Collect 15 Scotch whiskies',
          'Try all 5 whisky regions',
          'Write 10 Scotch tasting notes',
          'Score 80%+ on Scotch Production quiz'
        ],
        xpRequired: 1500,
        badge: 'scotch_aficionado',
        perks: ['Aficionado badge', 'Scotch pairing recommendations']
      },
      {
        level: 3,
        name: 'Scotch Connoisseur',
        requirements: [
          'Collect 30 Scotch whiskies',
          'Complete 5 blind Scotch tastings',
          'Score 90%+ on Advanced Scotch exam'
        ],
        xpRequired: 3500,
        badge: 'scotch_connoisseur',
        perks: ['Connoisseur badge', 'Exclusive release notifications']
      },
      {
        level: 4,
        name: 'Scotch Master',
        requirements: [
          'Collect 50+ Scotch whiskies',
          'Score 95%+ on Master Scotch exam',
          'Visit a Scottish distillery'
        ],
        xpRequired: 7500,
        badge: 'scotch_master',
        perks: ['MASTER badge', 'Invitation to tastings']
      }
    ]
  },
  {
    id: 'history_certification',
    name: 'Spirits History Certification',
    description: 'Become an expert on the history of alcohol',
    category: 'history',
    icon: '📜',
    color: '#8B7355',
    levels: [
      {
        level: 1,
        name: 'History Student',
        requirements: [
          'Complete History 101 course',
          'Visit 3 museum wings',
          'Score 70%+ on History Basics quiz'
        ],
        xpRequired: 400,
        badge: 'history_student',
        perks: ['History Student badge', 'Timeline access']
      },
      {
        level: 2,
        name: 'History Enthusiast',
        requirements: [
          'Complete Prohibition course',
          'Visit all museum wings',
          'Score 80%+ on Prohibition quiz',
          'Answer 50 history trivia questions'
        ],
        xpRequired: 1200,
        badge: 'history_enthusiast',
        perks: ['History Enthusiast badge', 'Exclusive historical content']
      },
      {
        level: 3,
        name: 'History Scholar',
        requirements: [
          'Complete all history courses',
          'Score 90%+ on comprehensive history exam',
          'Write 5 historical spirit reviews'
        ],
        xpRequired: 3000,
        badge: 'history_scholar',
        perks: ['Scholar badge', 'Contribute to museum content']
      },
      {
        level: 4,
        name: 'History Master',
        requirements: [
          'Score 95%+ on Master History exam',
          'Create 3 approved historical entries',
          'Mentor 5 history students'
        ],
        xpRequired: 6000,
        badge: 'history_master',
        perks: ['MASTER HISTORIAN badge', 'Museum contributor status']
      }
    ]
  },
  // Add more certifications: Rum, Tequila, Cocktails, etc.
];

// ============================================
// ACHIEVEMENT FUNCTIONS
// ============================================

/**
 * Check if user has earned an achievement
 */
export async function checkAchievement(
  userId: string,
  achievementId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('bv_user_achievements')
    .select('id')
    .eq('user_id', userId)
    .eq('achievement_id', achievementId)
    .single();

  return !!data;
}

/**
 * Grant achievement to user
 */
export async function grantAchievement(
  userId: string,
  achievementId: string
): Promise<{ success: boolean; achievement?: Achievement }> {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return { success: false };

  // Check if already earned
  const alreadyEarned = await checkAchievement(userId, achievementId);
  if (alreadyEarned) return { success: false };

  // Grant achievement
  await supabase
    .from('bv_user_achievements')
    .insert({
      user_id: userId,
      achievement_id: achievementId,
      earned_at: new Date().toISOString()
    });

  // Grant XP
  await supabase.rpc('add_user_xp', {
    p_user_id: userId,
    p_amount: achievement.xpReward,
    p_reason: `Achievement: ${achievement.name}`
  });

  // Grant $PROOF tokens
  await supabase.rpc('add_proof_tokens', {
    p_user_id: userId,
    p_amount: achievement.proofReward,
    p_reason: `Achievement: ${achievement.name}`
  });

  // Log event
  await supabase
    .from('bv_activities')
    .insert({
      user_id: userId,
      event_type: 'achievement_earned',
      event_data: {
        achievement_id: achievementId,
        achievement_name: achievement.name,
        xp_earned: achievement.xpReward,
        proof_earned: achievement.proofReward
      }
    });

  return { success: true, achievement };
}

/**
 * Check all achievements for a user
 */
export async function checkAllAchievements(userId: string): Promise<Achievement[]> {
  const newAchievements: Achievement[] = [];

  // Get user stats
  const { data: stats } = await supabase
    .from('cv_user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!stats) return newAchievements;

  // Check each achievement
  for (const achievement of ACHIEVEMENTS) {
    const alreadyEarned = await checkAchievement(userId, achievement.id);
    if (alreadyEarned) continue;

    let earned = false;
    const req = achievement.requirement;

    switch (req.type) {
      case 'collection_count':
        earned = stats.total_bottles >= req.value;
        break;
      case 'category_count':
        const categoryCount = stats[`${req.category}_count`] || 0;
        earned = categoryCount >= req.value;
        break;
      case 'tasting_notes':
        earned = stats.tasting_notes_count >= req.value;
        break;
      case 'trivia_correct':
        earned = stats.trivia_correct >= req.value;
        break;
      case 'trivia_streak':
        earned = stats.current_trivia_streak >= req.value;
        break;
      case 'followers':
        earned = stats.follower_count >= req.value;
        break;
      case 'trades':
        earned = stats.trades_completed >= req.value;
        break;
      // Add more cases as needed
    }

    if (earned) {
      const result = await grantAchievement(userId, achievement.id);
      if (result.success && result.achievement) {
        newAchievements.push(result.achievement);
      }
    }
  }

  return newAchievements;
}

/**
 * Generate shareable achievement card
 */
export function generateAchievementShareUrl(
  achievement: Achievement,
  username: string
): string {
  const params = new URLSearchParams({
    type: 'achievement',
    id: achievement.id,
    user: username,
    text: achievement.shareText
  });
  return `https://barrelverse.com/share/achievement?${params.toString()}`;
}

/**
 * Generate shareable certification card
 */
export function generateCertificationShareUrl(
  certificationId: string,
  level: number,
  username: string
): string {
  const cert = CERTIFICATIONS.find(c => c.id === certificationId);
  const levelInfo = cert?.levels.find(l => l.level === level);
  
  const params = new URLSearchParams({
    type: 'certification',
    cert: certificationId,
    level: level.toString(),
    user: username,
    name: levelInfo?.name || ''
  });
  return `https://barrelverse.com/share/certification?${params.toString()}`;
}

// ============================================
// EXPORTS
// ============================================

export default {
  ACHIEVEMENTS,
  CERTIFICATIONS,
  checkAchievement,
  grantAchievement,
  checkAllAchievements,
  generateAchievementShareUrl,
  generateCertificationShareUrl
};

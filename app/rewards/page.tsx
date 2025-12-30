'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp_reward: number;
  proof_reward: number;
  earned_at?: string;
  progress?: number;
  total?: number;
}

interface UserStats {
  level: number;
  xp: number;
  xp_to_next_level: number;
  total_bottles: number;
  tasting_notes: number;
  trivia_correct: number;
  streak_days: number;
  rank: number;
  proof_tokens: number;
  achievements_count: number;
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url?: string;
  level: number;
  xp: number;
  achievements_count: number;
  streak_days: number;
  is_current_user?: boolean;
}

interface Certification {
  id: string;
  name: string;
  category: string;
  icon: string;
  color: string;
  current_level: number;
  max_level: number;
  progress: number;
  next_level_name: string;
}

// ============================================
// CONSTANTS
// ============================================

const RARITY_COLORS = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 to-orange-500',
};

const RARITY_BORDERS = {
  common: 'border-gray-300',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-amber-400 animate-pulse',
};

const CATEGORY_ICONS: Record<string, string> = {
  collection: '📚',
  tasting: '👅',
  trivia: '🧠',
  social: '🤝',
  exploration: '🗺️',
  trading: '💱',
  events: '🎉',
  special: '✨',
};

const LEADERBOARD_TABS = [
  { id: 'all-time', label: 'All Time', icon: '🏆' },
  { id: 'monthly', label: 'This Month', icon: '📅' },
  { id: 'weekly', label: 'This Week', icon: '🔥' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function calculateLevel(xp: number): { level: number; progress: number; xpToNext: number } {
  // XP curve: level N requires N * 1000 XP
  let level = 1;
  let totalXpRequired = 0;
  
  while (totalXpRequired + level * 1000 <= xp) {
    totalXpRequired += level * 1000;
    level++;
  }
  
  const xpInCurrentLevel = xp - totalXpRequired;
  const xpForNextLevel = level * 1000;
  const progress = (xpInCurrentLevel / xpForNextLevel) * 100;
  
  return { level, progress, xpToNext: xpForNextLevel - xpInCurrentLevel };
}

// ============================================
// COMPONENTS
// ============================================

function XPProgressBar({ current, total, level }: { current: number; total: number; level: number }) {
  const progress = (current / total) * 100;
  
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">Level {level}</span>
        <span className="text-sm text-gray-500">{formatNumber(current)} / {formatNumber(total)} XP</span>
      </div>
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full relative"
        >
          <div className="absolute inset-0 bg-white/20 animate-shimmer" />
        </motion.div>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">Level {level}</span>
        <span className="text-xs text-gray-400">Level {level + 1}</span>
      </div>
    </div>
  );
}

function AchievementCard({ achievement, onClick }: { achievement: Achievement; onClick?: () => void }) {
  const isEarned = !!achievement.earned_at;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border-2 cursor-pointer transition-all
        ${isEarned ? RARITY_BORDERS[achievement.rarity] : 'border-gray-200 opacity-60'}
        ${isEarned ? 'bg-white shadow-lg' : 'bg-gray-50'}
      `}
    >
      {/* Rarity glow for legendary */}
      {isEarned && achievement.rarity === 'legendary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-xl animate-pulse" />
      )}
      
      <div className="relative flex items-start gap-3">
        {/* Icon */}
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center text-2xl
          ${isEarned ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]} text-white` : 'bg-gray-200'}
        `}>
          {achievement.icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold truncate ${isEarned ? 'text-gray-900' : 'text-gray-400'}`}>
              {achievement.name}
            </h3>
            {isEarned && (
              <span className={`
                px-2 py-0.5 text-xs font-medium rounded-full capitalize
                ${achievement.rarity === 'legendary' ? 'bg-amber-100 text-amber-700' :
                  achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                  achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'}
              `}>
                {achievement.rarity}
              </span>
            )}
          </div>
          <p className={`text-sm mt-1 ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
            {achievement.description}
          </p>
          
          {/* Progress bar for unearned */}
          {!isEarned && achievement.progress !== undefined && achievement.total && (
            <div className="mt-2">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {achievement.progress} / {achievement.total}
              </p>
            </div>
          )}
          
          {/* Rewards */}
          {isEarned && (
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-amber-600 font-medium">+{achievement.xp_reward} XP</span>
              <span className="text-xs text-purple-600 font-medium">+{achievement.proof_reward} $PROOF</span>
            </div>
          )}
        </div>
        
        {/* Checkmark for earned */}
        {isEarned && (
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { icon: '👑', color: 'text-amber-500', bg: 'bg-amber-50' };
    if (rank === 2) return { icon: '🥈', color: 'text-gray-400', bg: 'bg-gray-50' };
    if (rank === 3) return { icon: '🥉', color: 'text-amber-700', bg: 'bg-amber-50/50' };
    return { icon: rank.toString(), color: 'text-gray-600', bg: 'bg-white' };
  };
  
  const rankInfo = getRankDisplay(entry.rank);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        flex items-center gap-4 p-4 rounded-xl transition-all
        ${entry.is_current_user ? 'bg-amber-50 border-2 border-amber-300' : rankInfo.bg}
        ${entry.is_current_user ? 'shadow-lg' : 'hover:shadow-md'}
      `}
    >
      {/* Rank */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${rankInfo.color}`}>
        {entry.rank <= 3 ? (
          <span className="text-2xl">{rankInfo.icon}</span>
        ) : (
          <span className="text-lg">{entry.rank}</span>
        )}
      </div>
      
      {/* Avatar & Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
          {entry.avatar_url ? (
            <img src={entry.avatar_url} alt={entry.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            entry.username.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className={`font-semibold truncate ${entry.is_current_user ? 'text-amber-700' : 'text-gray-900'}`}>
            {entry.username}
            {entry.is_current_user && <span className="ml-2 text-xs">(You)</span>}
          </p>
          <p className="text-xs text-gray-500">Level {entry.level}</p>
        </div>
      </div>
      
      {/* Stats */}
      <div className="hidden sm:flex items-center gap-6">
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">{formatNumber(entry.xp)}</p>
          <p className="text-xs text-gray-500">XP</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">{entry.achievements_count}</p>
          <p className="text-xs text-gray-500">Badges</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-orange-500">🔥 {entry.streak_days}</p>
          <p className="text-xs text-gray-500">Streak</p>
        </div>
      </div>
    </motion.div>
  );
}

function CertificationCard({ cert }: { cert: Certification }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${cert.color}20` }}
        >
          {cert.icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{cert.name}</h3>
          <p className="text-sm text-gray-500">
            {cert.current_level > 0 ? `Level ${cert.current_level}` : 'Not Started'}
          </p>
        </div>
      </div>
      
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Progress to {cert.next_level_name}</span>
          <span className="font-medium" style={{ color: cert.color }}>{Math.round(cert.progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${cert.progress}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full"
            style={{ backgroundColor: cert.color }}
          />
        </div>
        <div className="flex justify-between">
          {Array.from({ length: cert.max_level }).map((_, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${i < cert.current_level ? 'text-white' : 'bg-gray-100 text-gray-400'}
              `}
              style={i < cert.current_level ? { backgroundColor: cert.color } : {}}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function StatsCard({ icon, label, value, sublabel, color = 'amber' }: {
  icon: string;
  label: string;
  value: string | number;
  sublabel?: string;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    amber: 'from-amber-400 to-orange-500',
    purple: 'from-purple-400 to-purple-600',
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-green-600',
  };
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-xl`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function RewardsPage() {
  const supabase = createClientComponentClient();
  const [activeTab, setActiveTab] = useState<'achievements' | 'leaderboard' | 'certifications'>('achievements');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('all-time');
  const [achievementFilter, setAchievementFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [leaderboardPeriod]);

  async function fetchData() {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch user stats
      if (user) {
        const { data: stats } = await supabase
          .from('bv_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (stats) {
          const levelInfo = calculateLevel(stats.xp || 0);
          setUserStats({
            level: levelInfo.level,
            xp: stats.xp || 0,
            xp_to_next_level: levelInfo.xpToNext,
            total_bottles: stats.total_bottles || 0,
            tasting_notes: stats.tasting_notes || 0,
            trivia_correct: stats.trivia_correct || 0,
            streak_days: stats.streak_days || 0,
            rank: stats.rank || 999,
            proof_tokens: stats.proof_tokens || 0,
            achievements_count: stats.achievements_count || 0,
          });
        }
        
        // Fetch user achievements
        const { data: userAchievements } = await supabase
          .from('bv_user_achievements')
          .select('*, bv_achievements(*)')
          .eq('user_id', user.id);
        
        // Fetch all achievements
        const { data: allAchievements } = await supabase
          .from('bv_achievements')
          .select('*')
          .order('rarity', { ascending: false });
        
        if (allAchievements) {
          const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
          const merged = allAchievements.map(a => ({
            ...a,
            earned_at: userAchievements?.find(ua => ua.achievement_id === a.id)?.earned_at,
          }));
          setAchievements(merged);
        }
      }
      
      // Fetch leaderboard
      const { data: leaderboardData } = await supabase
        .from('bv_profiles')
        .select('id, username, avatar_url, xp, level, achievements_count, streak_days')
        .order('xp', { ascending: false })
        .limit(50);
      
      if (leaderboardData) {
        const { data: { user } } = await supabase.auth.getUser();
        setLeaderboard(leaderboardData.map((entry, idx) => ({
          rank: idx + 1,
          user_id: entry.id,
          username: entry.username || `Spirit Lover #${idx + 1}`,
          avatar_url: entry.avatar_url,
          level: entry.level || calculateLevel(entry.xp || 0).level,
          xp: entry.xp || 0,
          achievements_count: entry.achievements_count || 0,
          streak_days: entry.streak_days || 0,
          is_current_user: user?.id === entry.id,
        })));
      }
      
      // Set sample certifications
      setCertifications([
        {
          id: 'bourbon',
          name: 'Bourbon Master',
          category: 'bourbon',
          icon: '🥃',
          color: '#8B4513',
          current_level: 2,
          max_level: 4,
          progress: 65,
          next_level_name: 'Connoisseur',
        },
        {
          id: 'scotch',
          name: 'Scotch Expert',
          category: 'scotch',
          icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
          color: '#2E4A62',
          current_level: 1,
          max_level: 4,
          progress: 40,
          next_level_name: 'Aficionado',
        },
        {
          id: 'tequila',
          name: 'Tequila Aficionado',
          category: 'tequila',
          icon: '🌵',
          color: '#4A7C59',
          current_level: 0,
          max_level: 4,
          progress: 15,
          next_level_name: 'Explorer',
        },
        {
          id: 'cocktails',
          name: 'Mixology Master',
          category: 'cocktails',
          icon: '🍸',
          color: '#E91E63',
          current_level: 1,
          max_level: 4,
          progress: 80,
          next_level_name: 'Bartender',
        },
      ]);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter achievements
  const filteredAchievements = achievements.filter(a => {
    if (achievementFilter === 'all') return true;
    if (achievementFilter === 'earned') return !!a.earned_at;
    if (achievementFilter === 'unearned') return !a.earned_at;
    return a.category === achievementFilter;
  });

  const earnedCount = achievements.filter(a => a.earned_at).length;
  const totalCount = achievements.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Rewards & Achievements</h1>
              <p className="text-amber-100 mt-1">Track your progress, earn rewards, climb the leaderboard</p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
          
          {/* User Stats Bar */}
          {userStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="bg-white/20 rounded-xl p-4">
                <p className="text-amber-100 text-xs uppercase">Level</p>
                <p className="text-2xl font-bold">{userStats.level}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <p className="text-amber-100 text-xs uppercase">Total XP</p>
                <p className="text-2xl font-bold">{formatNumber(userStats.xp)}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <p className="text-amber-100 text-xs uppercase">$PROOF Tokens</p>
                <p className="text-2xl font-bold">{formatNumber(userStats.proof_tokens)}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <p className="text-amber-100 text-xs uppercase">Rank</p>
                <p className="text-2xl font-bold">#{userStats.rank}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <p className="text-amber-100 text-xs uppercase">Achievements</p>
                <p className="text-2xl font-bold">{earnedCount}/{totalCount}</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <p className="text-amber-100 text-xs uppercase">Streak</p>
                <p className="text-2xl font-bold">🔥 {userStats.streak_days}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'achievements', label: 'Achievements', icon: '🏅' },
              { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
              { id: 'certifications', label: 'Certifications', icon: '📜' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`
                  px-6 py-4 font-medium transition-all relative
                  ${activeTab === tab.id ? 'text-amber-600' : 'text-gray-500 hover:text-gray-700'}
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* XP Progress */}
              {userStats && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Level Progress</h2>
                  <XPProgressBar
                    current={userStats.xp % (userStats.level * 1000)}
                    total={userStats.level * 1000}
                    level={userStats.level}
                  />
                </div>
              )}
              
              {/* Filter Chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'earned', label: '✅ Earned' },
                  { id: 'unearned', label: '🔒 Locked' },
                  ...Object.entries(CATEGORY_ICONS).map(([id, icon]) => ({
                    id,
                    label: `${icon} ${id.charAt(0).toUpperCase() + id.slice(1)}`,
                  })),
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setAchievementFilter(filter.id)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-all
                      ${achievementFilter === filter.id
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                    `}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              
              {/* Achievement Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAchievements.map(achievement => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    onClick={() => setSelectedAchievement(achievement)}
                  />
                ))}
              </div>
              
              {filteredAchievements.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No achievements found</p>
                </div>
              )}
            </motion.div>
          )}
          
          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Period Tabs */}
              <div className="flex gap-2 mb-6">
                {LEADERBOARD_TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setLeaderboardPeriod(tab.id)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${leaderboardPeriod === tab.id
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}
                    `}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
              
              {/* Leaderboard List */}
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <LeaderboardRow key={entry.user_id} entry={entry} index={index} />
                ))}
              </div>
              
              {leaderboard.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <p className="text-gray-500">No leaderboard data yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start collecting and tasting to appear here!</p>
                </div>
              )}
            </motion.div>
          )}
          
          {/* Certifications Tab */}
          {activeTab === 'certifications' && (
            <motion.div
              key="certifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Certification Paths</h2>
                <p className="text-gray-600 mt-1">Complete courses and challenges to earn official certifications</p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {certifications.map(cert => (
                  <CertificationCard key={cert.id} cert={cert} />
                ))}
              </div>
              
              <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">🎓 Become a Certified Expert</h3>
                <p className="text-purple-700 mb-4">
                  Complete certification paths to unlock exclusive badges, discounts, and invitations to special events.
                </p>
                <Link
                  href="/academy"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Start Learning →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className={`
                  w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-4xl mb-4
                  ${selectedAchievement.earned_at
                    ? `bg-gradient-to-br ${RARITY_COLORS[selectedAchievement.rarity]} text-white`
                    : 'bg-gray-200'}
                `}>
                  {selectedAchievement.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{selectedAchievement.name}</h2>
                <p className={`
                  text-sm font-medium mt-1 capitalize
                  ${selectedAchievement.rarity === 'legendary' ? 'text-amber-600' :
                    selectedAchievement.rarity === 'epic' ? 'text-purple-600' :
                    selectedAchievement.rarity === 'rare' ? 'text-blue-600' :
                    'text-gray-500'}
                `}>
                  {selectedAchievement.rarity} Achievement
                </p>
                <p className="text-gray-600 mt-4">{selectedAchievement.description}</p>
                
                <div className="flex justify-center gap-6 mt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-500">+{selectedAchievement.xp_reward}</p>
                    <p className="text-xs text-gray-500">XP Reward</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-500">+{selectedAchievement.proof_reward}</p>
                    <p className="text-xs text-gray-500">$PROOF Tokens</p>
                  </div>
                </div>
                
                {selectedAchievement.earned_at ? (
                  <div className="mt-6">
                    <p className="text-sm text-green-600 font-medium">
                      ✅ Earned on {new Date(selectedAchievement.earned_at).toLocaleDateString()}
                    </p>
                    <button className="mt-4 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                      Share Achievement
                    </button>
                  </div>
                ) : (
                  <div className="mt-6">
                    <p className="text-sm text-gray-500">🔒 Not yet earned</p>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setSelectedAchievement(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">Loading rewards...</p>
          </div>
        </div>
      )}
    </div>
  );
}

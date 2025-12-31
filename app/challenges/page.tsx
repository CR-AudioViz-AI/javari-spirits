// app/challenges/page.tsx
// Community Photo Challenge Page for Javari Spirits

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Types
interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  xp_reward: number;
  earned?: boolean;
  progress?: number;
  target?: number;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  requirement: number;
  current: number;
  xp_reward: number;
  credits_reward?: number;
  completed?: boolean;
  expires_at?: string;
}

interface LeaderboardEntry {
  rank: number;
  user: { id: string; name: string; avatar: string; level: number };
  submissions: number;
  photos: number;
  xp: number;
  badges: number;
}

// Badge tier colors
const TIER_COLORS: Record<string, string> = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-gray-300 to-gray-500',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-cyan-300 to-cyan-500',
  diamond: 'from-purple-400 to-pink-500',
};

const TIER_BG: Record<string, string> = {
  bronze: 'bg-amber-900/20 border-amber-600/50',
  silver: 'bg-gray-500/20 border-gray-400/50',
  gold: 'bg-yellow-500/20 border-yellow-400/50',
  platinum: 'bg-cyan-500/20 border-cyan-300/50',
  diamond: 'bg-purple-500/20 border-purple-400/50',
};

// Sample data
const SAMPLE_BADGES: Badge[] = [
  { id: 'first_pour', name: 'First Pour', icon: '🥃', description: 'Added your first spirit', tier: 'bronze', xp_reward: 10, earned: true, progress: 1, target: 1 },
  { id: 'photographer', name: 'Photographer', icon: '📸', description: 'Added your first photo', tier: 'bronze', xp_reward: 15, earned: true, progress: 1, target: 1 },
  { id: 'scout', name: 'Scout', icon: '🔍', description: 'Added 10 new spirits', tier: 'bronze', xp_reward: 50, earned: false, progress: 7, target: 10 },
  { id: 'contributor', name: 'Contributor', icon: '🏅', description: 'Added 50 spirits', tier: 'silver', xp_reward: 200, earned: false, progress: 7, target: 50 },
  { id: 'curator', name: 'Curator', icon: '🏆', description: 'Added 100 spirits', tier: 'gold', xp_reward: 500, earned: false, progress: 7, target: 100 },
  { id: 'lens_master', name: 'Lens Master', icon: '📷', description: 'Added 100 photos', tier: 'gold', xp_reward: 500, earned: false, progress: 12, target: 100 },
  { id: 'master_curator', name: 'Master Curator', icon: '👑', description: 'Added 500 spirits', tier: 'platinum', xp_reward: 2000, earned: false, progress: 7, target: 500 },
  { id: 'legend', name: 'Legend', icon: '💎', description: 'Added 1000+ spirits', tier: 'diamond', xp_reward: 5000, earned: false, progress: 7, target: 1000 },
];

const SAMPLE_CHALLENGES: Challenge[] = [
  { id: 'daily_snap', name: 'Daily Snap', description: 'Upload 1 spirit photo today', type: 'daily', requirement: 1, current: 0, xp_reward: 5, credits_reward: 1, expires_at: new Date(Date.now() + 8 * 3600000).toISOString() },
  { id: 'daily_submission', name: 'Daily Discovery', description: 'Add 1 new spirit today', type: 'daily', requirement: 1, current: 1, xp_reward: 10, credits_reward: 2, completed: true },
  { id: 'weekly_explorer', name: 'Weekly Explorer', description: 'Add 10 spirits this week', type: 'weekly', requirement: 10, current: 7, xp_reward: 100, credits_reward: 25 },
  { id: 'gallery_week', name: 'Gallery Week', description: 'Upload 20 photos this week', type: 'weekly', requirement: 20, current: 12, xp_reward: 150, credits_reward: 30 },
  { id: 'monthly_centurion', name: 'Monthly Centurion', description: 'Add 100 spirits this month', type: 'monthly', requirement: 100, current: 47, xp_reward: 1000, credits_reward: 200 },
];

const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user: { id: '1', name: 'BourbonKing', avatar: '👑', level: 42 }, submissions: 1247, photos: 892, xp: 45600, badges: 28 },
  { rank: 2, user: { id: '2', name: 'WhiskyHunter', avatar: '🥃', level: 38 }, submissions: 1089, photos: 756, xp: 38200, badges: 24 },
  { rank: 3, user: { id: '3', name: 'SpiritSeeker', avatar: '🔍', level: 35 }, submissions: 934, photos: 612, xp: 32100, badges: 21 },
  { rank: 4, user: { id: '4', name: 'BarrelRider', avatar: '🛢️', level: 31 }, submissions: 756, photos: 543, xp: 27800, badges: 18 },
  { rank: 5, user: { id: '5', name: 'DramQueen', avatar: '👸', level: 29 }, submissions: 687, photos: 498, xp: 24500, badges: 16 },
  { rank: 6, user: { id: '6', name: 'PeatMonster', avatar: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', level: 27 }, submissions: 612, photos: 445, xp: 21200, badges: 15 },
  { rank: 7, user: { id: '7', name: 'AgaveKing', avatar: '🌵', level: 25 }, submissions: 534, photos: 387, xp: 18900, badges: 13 },
  { rank: 8, user: { id: '8', name: 'RumRunner', avatar: '🏝️', level: 23 }, submissions: 478, photos: 334, xp: 16400, badges: 12 },
  { rank: 9, user: { id: '9', name: 'GinGuru', avatar: '🌿', level: 21 }, submissions: 412, photos: 289, xp: 14100, badges: 10 },
  { rank: 10, user: { id: '10', name: 'CognacKing', avatar: '🍇', level: 19 }, submissions: 356, photos: 245, xp: 11800, badges: 9 },
];

// Components
function BadgeCard({ badge }: { badge: Badge }) {
  const progress = badge.progress && badge.target ? (badge.progress / badge.target) * 100 : 0;
  
  return (
    <div className={`relative p-4 rounded-xl border ${TIER_BG[badge.tier]} ${badge.earned ? 'ring-2 ring-green-500' : 'opacity-75'}`}>
      {badge.earned && (
        <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      <div className="text-center">
        <div className={`text-4xl mb-2 ${badge.earned ? '' : 'grayscale'}`}>{badge.icon}</div>
        <h3 className="font-bold text-white">{badge.name}</h3>
        <p className="text-xs text-gray-400 mb-2">{badge.description}</p>
        
        <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${TIER_COLORS[badge.tier]} text-white`}>
          {badge.tier.toUpperCase()}
        </div>
        
        {!badge.earned && badge.progress !== undefined && badge.target && (
          <div className="mt-3">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${TIER_COLORS[badge.tier]}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{badge.progress}/{badge.target}</p>
          </div>
        )}
        
        <p className="text-xs text-amber-400 mt-2">+{badge.xp_reward} XP</p>
      </div>
    </div>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const progress = (challenge.current / challenge.requirement) * 100;
  const typeColors = {
    daily: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
    weekly: 'bg-purple-500/20 border-purple-500/50 text-purple-400',
    monthly: 'bg-amber-500/20 border-amber-500/50 text-amber-400',
  };
  
  return (
    <div className={`p-4 rounded-xl border ${challenge.completed ? 'bg-green-900/20 border-green-500/50' : 'bg-gray-800/50 border-gray-700'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[challenge.type]}`}>
            {challenge.type.toUpperCase()}
          </span>
          <h3 className="font-bold text-white mt-1">{challenge.name}</h3>
        </div>
        {challenge.completed && (
          <span className="text-green-400 text-2xl">✓</span>
        )}
      </div>
      
      <p className="text-sm text-gray-400 mb-3">{challenge.description}</p>
      
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full transition-all ${challenge.completed ? 'bg-green-500' : 'bg-amber-500'}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{challenge.current}/{challenge.requirement}</span>
        <div className="flex gap-2">
          <span className="text-amber-400">+{challenge.xp_reward} XP</span>
          {challenge.credits_reward && (
            <span className="text-green-400">+{challenge.credits_reward} credits</span>
          )}
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ entry, isCurrentUser }: { entry: LeaderboardEntry; isCurrentUser?: boolean }) {
  const rankColors: Record<number, string> = {
    1: 'text-yellow-400',
    2: 'text-gray-300',
    3: 'text-amber-600',
  };
  
  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg ${isCurrentUser ? 'bg-amber-900/30 border border-amber-500/50' : 'bg-gray-800/50'}`}>
      <div className={`w-8 text-center font-bold ${rankColors[entry.rank] || 'text-gray-400'}`}>
        {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
      </div>
      
      <div className="text-2xl">{entry.user.avatar}</div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">{entry.user.name}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">Lvl {entry.user.level}</span>
        </div>
        <div className="flex gap-3 text-xs text-gray-400">
          <span>🥃 {entry.submissions.toLocaleString()}</span>
          <span>📸 {entry.photos.toLocaleString()}</span>
          <span>🏅 {entry.badges}</span>
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-bold text-amber-400">{entry.xp.toLocaleString()} XP</div>
      </div>
    </div>
  );
}

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState<'challenges' | 'badges' | 'leaderboard'>('challenges');
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  
  // User stats (would come from API)
  const userStats = {
    xp: 1250,
    level: 8,
    nextLevelXp: 1500,
    submissions: 47,
    photos: 32,
    badges: 5,
    rank: 156,
    streak: 3,
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-amber-950/10 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/30 border-b border-amber-700/30">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🏆 Community Challenges
              </h1>
              <p className="text-amber-200/70">
                Earn XP, unlock badges, and climb the leaderboard by contributing to our spirits database!
              </p>
            </div>
            
            <Link href="/submit" className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-amber-500/25">
              + Add Spirit
            </Link>
          </div>
          
          {/* User Stats Bar */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-400">{userStats.level}</div>
              <div className="text-xs text-gray-400">Level</div>
              <div className="h-1 bg-gray-700 rounded mt-1">
                <div className="h-full bg-amber-500 rounded" style={{ width: `${(userStats.xp / userStats.nextLevelXp) * 100}%` }} />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{userStats.xp.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Total XP</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{userStats.submissions}</div>
              <div className="text-xs text-gray-400">Spirits Added</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{userStats.photos}</div>
              <div className="text-xs text-gray-400">Photos</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{userStats.badges}</div>
              <div className="text-xs text-gray-400">Badges</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-400">🔥 {userStats.streak}</div>
              <div className="text-xs text-gray-400">Day Streak</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {(['challenges', 'badges', 'leaderboard'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tab === 'challenges' && '🎯 '}
              {tab === 'badges' && '🏅 '}
              {tab === 'leaderboard' && '📊 '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            {/* Daily Challenges */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">📅</span> Daily Challenges
                <span className="text-sm font-normal text-gray-400">Resets in 8h 23m</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {SAMPLE_CHALLENGES.filter(c => c.type === 'daily').map(challenge => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            </div>
            
            {/* Weekly Challenges */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">📆</span> Weekly Challenges
                <span className="text-sm font-normal text-gray-400">Resets in 4d 8h</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {SAMPLE_CHALLENGES.filter(c => c.type === 'weekly').map(challenge => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            </div>
            
            {/* Monthly Challenges */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-amber-400">🗓️</span> Monthly Challenges
                <span className="text-sm font-normal text-gray-400">Resets in 18d</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {SAMPLE_CHALLENGES.filter(c => c.type === 'monthly').map(challenge => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">All Badges</h2>
              <div className="text-sm text-gray-400">
                {SAMPLE_BADGES.filter(b => b.earned).length}/{SAMPLE_BADGES.length} Earned
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {SAMPLE_BADGES.map(badge => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </div>
        )}
        
        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Top Contributors</h2>
              <div className="flex gap-2">
                {(['weekly', 'monthly', 'alltime'] as const).map(period => (
                  <button
                    key={period}
                    onClick={() => setLeaderboardPeriod(period)}
                    className={`px-4 py-1 rounded text-sm ${
                      leaderboardPeriod === period
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {period === 'alltime' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Your Rank */}
            <div className="mb-6 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
              <div className="text-sm text-amber-400 mb-2">Your Position</div>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-white">#{userStats.rank}</div>
                <div className="text-gray-400">
                  Keep contributing to climb the leaderboard! Top 10 earn bonus rewards.
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              {SAMPLE_LEADERBOARD.map(entry => (
                <LeaderboardRow key={entry.user.id} entry={entry} />
              ))}
            </div>
            
            {/* Rewards Info */}
            <div className="mt-8 p-6 bg-gradient-to-r from-amber-900/30 to-amber-800/20 border border-amber-700/30 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-4">🏆 Weekly Leaderboard Rewards</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                  <div className="text-2xl">🥇</div>
                  <div className="text-sm text-white font-bold">1st Place</div>
                  <div className="text-xs text-amber-400">+500 XP, 100 credits</div>
                </div>
                <div className="p-3 bg-gray-400/20 rounded-lg border border-gray-400/30">
                  <div className="text-2xl">🥈</div>
                  <div className="text-sm text-white font-bold">2nd Place</div>
                  <div className="text-xs text-amber-400">+300 XP, 50 credits</div>
                </div>
                <div className="p-3 bg-amber-600/20 rounded-lg border border-amber-600/30">
                  <div className="text-2xl">🥉</div>
                  <div className="text-sm text-white font-bold">3rd Place</div>
                  <div className="text-xs text-amber-400">+200 XP, 25 credits</div>
                </div>
                <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600/30">
                  <div className="text-lg">4-5th</div>
                  <div className="text-sm text-white font-bold">Top 5</div>
                  <div className="text-xs text-amber-400">+100 XP, 15 credits</div>
                </div>
                <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600/30">
                  <div className="text-lg">6-10th</div>
                  <div className="text-sm text-white font-bold">Top 10</div>
                  <div className="text-xs text-amber-400">+50 XP, 5 credits</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

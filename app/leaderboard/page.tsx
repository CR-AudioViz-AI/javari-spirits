'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// ============================================
// TYPES
// ============================================

interface Player {
  rank: number;
  id: string;
  username: string;
  avatar: string;
  xp: number;
  level: number;
  badges: string[];
  streak: number;
  joinedAt: string;
  stats: {
    gamesPlayed: number;
    spiritsTasted: number;
    reviewsWritten: number;
    collectionsValue: number;
  };
}

// ============================================
// MOCK DATA
// ============================================

const LEADERBOARD_DATA: Player[] = [
  { rank: 1, id: '1', username: 'WhiskeyMaster', avatar: '👨‍🍳', xp: 125000, level: 45, badges: ['🏆', '🥃', '⭐'], streak: 42, joinedAt: '2023-01-15', stats: { gamesPlayed: 523, spiritsTasted: 312, reviewsWritten: 89, collectionsValue: 45000 } },
  { rank: 2, id: '2', username: 'BourbonKing', avatar: '🤠', xp: 98500, level: 38, badges: ['🥈', '🔥', '📚'], streak: 28, joinedAt: '2023-03-22', stats: { gamesPlayed: 412, spiritsTasted: 256, reviewsWritten: 67, collectionsValue: 38000 } },
  { rank: 3, id: '3', username: 'ScotchLover', avatar: '🧔', xp: 87200, level: 35, badges: ['🥉', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🎯'], streak: 21, joinedAt: '2023-02-10', stats: { gamesPlayed: 378, spiritsTasted: 198, reviewsWritten: 54, collectionsValue: 52000 } },
  { rank: 4, id: '4', username: 'RumRunner', avatar: '🏴‍☠️', xp: 76400, level: 32, badges: ['🏝️', '⚓'], streak: 14, joinedAt: '2023-04-05', stats: { gamesPlayed: 298, spiritsTasted: 167, reviewsWritten: 43, collectionsValue: 21000 } },
  { rank: 5, id: '5', username: 'TequilaSunrise', avatar: '🌵', xp: 65300, level: 28, badges: ['🇲🇽', '🌮'], streak: 19, joinedAt: '2023-05-18', stats: { gamesPlayed: 256, spiritsTasted: 134, reviewsWritten: 38, collectionsValue: 15000 } },
  { rank: 6, id: '6', username: 'GinEnthusiast', avatar: '🌿', xp: 54200, level: 25, badges: ['🍸', '🌿'], streak: 11, joinedAt: '2023-06-01', stats: { gamesPlayed: 212, spiritsTasted: 98, reviewsWritten: 29, collectionsValue: 12000 } },
  { rank: 7, id: '7', username: 'CognacConnoisseur', avatar: '🍇', xp: 48900, level: 23, badges: ['🇫🇷', '🍷'], streak: 8, joinedAt: '2023-07-14', stats: { gamesPlayed: 187, spiritsTasted: 87, reviewsWritten: 24, collectionsValue: 28000 } },
  { rank: 8, id: '8', username: 'VodkaPurist', avatar: '❄️', xp: 42100, level: 21, badges: ['🇷🇺', '❄️'], streak: 6, joinedAt: '2023-08-22', stats: { gamesPlayed: 156, spiritsTasted: 72, reviewsWritten: 18, collectionsValue: 8000 } },
  { rank: 9, id: '9', username: 'MezcalMaven', avatar: '🌵', xp: 38500, level: 19, badges: ['🔥', '💨'], streak: 12, joinedAt: '2023-09-10', stats: { gamesPlayed: 134, spiritsTasted: 65, reviewsWritten: 21, collectionsValue: 9500 } },
  { rank: 10, id: '10', username: 'BarrelHunter', avatar: '🛢️', xp: 35200, level: 18, badges: ['🎯', '🔍'], streak: 5, joinedAt: '2023-10-05', stats: { gamesPlayed: 112, spiritsTasted: 58, reviewsWritten: 15, collectionsValue: 67000 } },
];

const TIME_PERIODS = ['all-time', 'monthly', 'weekly', 'daily'] as const;
const CATEGORIES = ['overall', 'games', 'tasting', 'reviews', 'collection'] as const;

// ============================================
// LEADERBOARD PAGE
// ============================================

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<typeof TIME_PERIODS[number]>('all-time');
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('overall');
  const [players, setPlayers] = useState<Player[]>(LEADERBOARD_DATA);
  const [loading, setLoading] = useState(false);
  const [userRank, setUserRank] = useState<Player | null>(null);

  // Simulate loading leaderboard
  useEffect(() => {
    setLoading(true);
    // In production, fetch from API
    setTimeout(() => {
      setPlayers(LEADERBOARD_DATA);
      // Simulate user's own rank
      setUserRank({
        rank: 156,
        id: 'current-user',
        username: 'You',
        avatar: '😎',
        xp: 3450,
        level: 8,
        badges: ['🌟'],
        streak: 5,
        joinedAt: '2024-11-01',
        stats: { gamesPlayed: 47, spiritsTasted: 23, reviewsWritten: 8, collectionsValue: 2500 },
      });
      setLoading(false);
    }, 500);
  }, [period, category]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white">
            <span className="text-2xl">🥃</span>
            <span className="font-bold">CravBarrels</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Leaderboard</h1>
          <Link href="/games" className="text-amber-500 hover:text-amber-400">
            🎮 Games
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Top 3 Podium */}
        <section className="mb-12">
          <div className="flex items-end justify-center gap-4">
            {/* Second Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto bg-gray-700 rounded-full flex items-center justify-center text-4xl mb-2 border-4 border-gray-500">
                {players[1]?.avatar}
              </div>
              <div className="text-gray-400 text-sm">{players[1]?.username}</div>
              <div className="text-amber-500 font-bold">{formatNumber(players[1]?.xp || 0)} XP</div>
              <div className="w-24 h-24 bg-gradient-to-t from-gray-600 to-gray-500 rounded-t-lg mt-2 flex items-center justify-center">
                <span className="text-4xl">🥈</span>
              </div>
            </motion.div>

            {/* First Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-28 h-28 mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-5xl mb-2 border-4 border-amber-400 shadow-lg shadow-amber-500/30">
                {players[0]?.avatar}
              </div>
              <div className="text-white font-bold text-lg">{players[0]?.username}</div>
              <div className="text-amber-500 font-bold text-xl">{formatNumber(players[0]?.xp || 0)} XP</div>
              <div className="w-28 h-32 bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-lg mt-2 flex items-center justify-center">
                <span className="text-5xl">🏆</span>
              </div>
            </motion.div>

            {/* Third Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto bg-gray-700 rounded-full flex items-center justify-center text-4xl mb-2 border-4 border-amber-700">
                {players[2]?.avatar}
              </div>
              <div className="text-gray-400 text-sm">{players[2]?.username}</div>
              <div className="text-amber-500 font-bold">{formatNumber(players[2]?.xp || 0)} XP</div>
              <div className="w-24 h-20 bg-gradient-to-t from-amber-800 to-amber-700 rounded-t-lg mt-2 flex items-center justify-center">
                <span className="text-4xl">🥉</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {TIME_PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  period === p
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {p.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  category === c
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                }`}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Your Rank Card */}
        {userRank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-amber-500">#{userRank.rank}</div>
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-2xl">
                  {userRank.avatar}
                </div>
                <div>
                  <div className="font-bold text-white">{userRank.username}</div>
                  <div className="text-sm text-gray-400">Level {userRank.level}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-amber-500">{formatNumber(userRank.xp)} XP</div>
                <div className="text-sm text-gray-400">🔥 {userRank.streak} day streak</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin text-4xl mb-4">🏆</div>
              <div className="text-gray-400">Loading leaderboard...</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {players.map((player, idx) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 hover:bg-gray-700/50 transition-colors ${
                    player.rank <= 3 ? 'bg-gray-700/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-12 text-center">
                      <span className={`text-xl ${player.rank <= 3 ? '' : 'text-gray-500'}`}>
                        {getRankBadge(player.rank)}
                      </span>
                    </div>

                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      player.rank === 1 ? 'bg-amber-500/20 ring-2 ring-amber-500' :
                      player.rank === 2 ? 'bg-gray-500/20 ring-2 ring-gray-400' :
                      player.rank === 3 ? 'bg-amber-700/20 ring-2 ring-amber-700' :
                      'bg-gray-700'
                    }`}>
                      {player.avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{player.username}</span>
                        {player.badges.slice(0, 3).map((badge, i) => (
                          <span key={i} className="text-sm">{badge}</span>
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">
                        Level {player.level} • 🔥 {player.streak} day streak
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex gap-8 text-center">
                      <div>
                        <div className="text-sm text-gray-500">Games</div>
                        <div className="font-medium text-white">{player.stats.gamesPlayed}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Tasted</div>
                        <div className="font-medium text-white">{player.stats.spiritsTasted}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Reviews</div>
                        <div className="font-medium text-white">{player.stats.reviewsWritten}</div>
                      </div>
                    </div>

                    {/* XP */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-amber-500">{formatNumber(player.xp)}</div>
                      <div className="text-xs text-gray-500">XP</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Load More */}
        <div className="text-center mt-6">
          <button className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-colors">
            Load More Rankings
          </button>
        </div>
      </main>
    </div>
  );
}

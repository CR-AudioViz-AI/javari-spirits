'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Wine, 
  Trophy, 
  Star, 
  Settings, 
  TrendingUp,
  BookOpen,
  Users,
  Gamepad2,
  LogOut
} from 'lucide-react';

interface UserStats {
  totalBottles: number;
  totalValue: number;
  proofTokens: number;
  gamesPlayed: number;
  achievementsUnlocked: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalBottles: 0,
    totalValue: 0,
    proofTokens: 0,
    gamesPlayed: 0,
    achievementsUnlocked: 0,
  });

  useEffect(() => {
    // Simulate loading user data
    const timer = setTimeout(() => {
      setStats({
        totalBottles: 12,
        totalValue: 2450,
        proofTokens: 1250,
        gamesPlayed: 47,
        achievementsUnlocked: 8,
      });
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/dashboard', active: true },
    { icon: Wine, label: 'My Collection', href: '/collection' },
    { icon: Gamepad2, label: 'Games', href: '/games' },
    { icon: Trophy, label: 'Achievements', href: '/rewards' },
    { icon: TrendingUp, label: 'Value Tracker', href: '/value' },
    { icon: BookOpen, label: 'Tasting Notes', href: '/tasting-notes' },
    { icon: Users, label: 'Community', href: '/community' },
    { icon: Settings, label: 'Settings', href: '/profile' },
  ];

  const quickActions = [
    { label: 'Add Bottle', href: '/collection?action=add', icon: '🥃' },
    { label: 'Play Trivia', href: '/games', icon: '🎮' },
    { label: 'Explore Spirits', href: '/explore', icon: '🔍' },
    { label: 'View Events', href: '/events', icon: '📅' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-black">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 min-h-screen flex-col border-r border-amber-900/30 bg-black/30">
          <div className="p-6 border-b border-amber-900/30">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl">🥃</span>
              <span className="text-xl font-bold text-amber-500">BarrelVerse</span>
            </Link>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    item.active
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-stone-400 hover:bg-amber-500/10 hover:text-amber-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-amber-900/30">
            <button className="flex items-center gap-3 px-4 py-3 w-full text-stone-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back, Collector</h1>
            <p className="text-stone-400">Here's what's happening with your spirits collection</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Bottles', value: stats.totalBottles, icon: '🥃', color: 'amber' },
              { label: 'Collection Value', value: `$${stats.totalValue.toLocaleString()}`, icon: '💰', color: 'green' },
              { label: '$PROOF Tokens', value: stats.proofTokens.toLocaleString(), icon: '🪙', color: 'yellow' },
              { label: 'Games Played', value: stats.gamesPlayed, icon: '🎮', color: 'purple' },
              { label: 'Achievements', value: stats.achievementsUnlocked, icon: '🏆', color: 'blue' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-stone-900/50 border border-stone-700 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {loading ? '...' : stat.value}
                </div>
                <div className="text-sm text-stone-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl hover:bg-amber-500/20 transition"
                >
                  <span className="text-2xl">{action.icon}</span>
                  <span className="font-medium text-amber-100">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity & Collection Preview */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-stone-900/50 border border-stone-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { action: 'Added to collection', item: 'Buffalo Trace', time: '2 hours ago' },
                  { action: 'Played trivia', item: 'Bourbon Masters', time: '5 hours ago' },
                  { action: 'Earned achievement', item: 'First Tasting Note', time: '1 day ago' },
                  { action: 'Joined community', item: 'Kentucky Enthusiasts', time: '2 days ago' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-stone-700 last:border-0">
                    <div>
                      <p className="text-stone-200">{activity.action}</p>
                      <p className="text-sm text-amber-400">{activity.item}</p>
                    </div>
                    <span className="text-xs text-stone-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Collection Preview */}
            <div className="bg-stone-900/50 border border-stone-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Your Collection</h2>
                <Link href="/collection" className="text-amber-400 text-sm hover:underline">
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Blanton\'s Single Barrel', type: 'Bourbon', value: '$65' },
                  { name: 'Pappy Van Winkle 15yr', type: 'Bourbon', value: '$1,200' },
                  { name: 'Yamazaki 12yr', type: 'Japanese Whisky', value: '$150' },
                  { name: 'Buffalo Trace', type: 'Bourbon', value: '$35' },
                ].map((bottle, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-stone-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🥃</span>
                      <div>
                        <p className="text-stone-200 font-medium">{bottle.name}</p>
                        <p className="text-xs text-stone-500">{bottle.type}</p>
                      </div>
                    </div>
                    <span className="text-amber-400 font-semibold">{bottle.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

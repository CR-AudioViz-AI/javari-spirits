'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// ============================================
// TYPES
// ============================================
type Spirit = {
  id: string
  name: string
  brand: string
  category: string
  msrp: number | null
  rarity: string
  image_url: string | null
}

type Stats = {
  totalSpirits: number
  totalTrivia: number
  totalCourses: number
  totalAchievements: number
  categoryCounts: Record<string, number>
}

// ============================================
// CONSTANTS
// ============================================
const CATEGORIES = [
  { id: 'bourbon', name: 'Bourbon', icon: '🥃', color: 'from-amber-600 to-amber-800' },
  { id: 'scotch', name: 'Scotch', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: 'from-amber-700 to-amber-900' },
  { id: 'irish', name: 'Irish', icon: '☘️', color: 'from-green-500 to-green-700' },
  { id: 'japanese', name: 'Japanese', icon: '🇯🇵', color: 'from-red-500 to-red-700' },
  { id: 'tequila', name: 'Tequila', icon: '🌵', color: 'from-lime-500 to-lime-700' },
  { id: 'rum', name: 'Rum', icon: '🏝️', color: 'from-orange-500 to-orange-700' },
  { id: 'gin', name: 'Gin', icon: '🫒', color: 'from-teal-500 to-teal-700' },
  { id: 'vodka', name: 'Vodka', icon: '🧊', color: 'from-blue-400 to-blue-600' },
  { id: 'cognac', name: 'Cognac', icon: '🍇', color: 'from-purple-500 to-purple-700' },
  { id: 'wine', name: 'Wine', icon: '🍷', color: 'from-red-600 to-red-800' },
  { id: 'beer', name: 'Beer', icon: '🍺', color: 'from-yellow-500 to-yellow-700' },
  { id: 'sake', name: 'Sake', icon: '🍶', color: 'from-pink-400 to-pink-600' },
]

const FEATURES = [
  { 
    icon: '📱', 
    title: 'Scan & Add', 
    desc: 'Scan any bottle barcode to add to your collection instantly',
    href: '/scan',
    color: 'bg-blue-600'
  },
  { 
    icon: '📚', 
    title: 'My Collection', 
    desc: 'Track what you own, what you\'ve tried, and what you want',
    href: '/collection',
    color: 'bg-amber-600'
  },
  { 
    icon: '🎮', 
    title: 'Games & Trivia', 
    desc: 'Test your spirits knowledge and climb the leaderboard',
    href: '/games',
    color: 'bg-green-600'
  },
  { 
    icon: '🎓', 
    title: 'Academy', 
    desc: 'Learn from beginner to expert with guided courses',
    href: '/academy',
    color: 'bg-purple-600'
  },
  { 
    icon: '📖', 
    title: 'History', 
    desc: 'Explore Prohibition, bootleggers, and spirits origins',
    href: '/history',
    color: 'bg-red-600'
  },
  { 
    icon: '🤖', 
    title: 'Ask Javari', 
    desc: 'Your AI spirits expert - ask anything about any bottle',
    href: '/javari',
    color: 'bg-indigo-600'
  },
]

// ============================================
// COMPONENT
// ============================================
export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    totalSpirits: 0,
    totalTrivia: 0,
    totalCourses: 0,
    totalAchievements: 0,
    categoryCounts: {}
  })
  const [featuredSpirits, setFeaturedSpirits] = useState<Spirit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      
      // Get counts
      const [spiritsRes, triviaRes, coursesRes, achievementsRes] = await Promise.all([
        supabase.from('bv_spirits').select('category', { count: 'exact' }),
        supabase.from('bv_trivia_questions').select('id', { count: 'exact' }),
        supabase.from('bv_courses').select('id', { count: 'exact' }),
        supabase.from('bv_achievements').select('id', { count: 'exact' }),
      ])

      // Calculate category counts
      const categoryCounts: Record<string, number> = {}
      spiritsRes.data?.forEach(s => {
        categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1
      })

      setStats({
        totalSpirits: spiritsRes.count || 0,
        totalTrivia: triviaRes.count || 0,
        totalCourses: coursesRes.count || 0,
        totalAchievements: achievementsRes.count || 0,
        categoryCounts
      })

      // Get featured spirits (random selection from rare+)
      const { data: featured } = await supabase
        .from('bv_spirits')
        .select('id, name, brand, category, msrp, rarity, image_url')
        .in('rarity', ['rare', 'very_rare', 'ultra_rare', 'legendary'])
        .limit(8)

      setFeaturedSpirits(featured || [])
      setLoading(false)
    }

    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grain.png')] opacity-20"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-amber-400">🥃</span> BarrelVerse
            </h1>
            <p className="text-2xl text-amber-200 mb-4">
              The Ultimate Spirits Collection & Education Platform
            </p>
            <p className="text-lg text-stone-300 mb-8">
              Track your collection, learn history, play games, and become a spirits expert
            </p>
            
            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-stone-800/50 rounded-xl p-4 border border-amber-600/30">
                <div className="text-3xl font-bold text-amber-400">
                  {loading ? '...' : stats.totalSpirits.toLocaleString()}
                </div>
                <div className="text-stone-400 text-sm">Spirits</div>
              </div>
              <div className="bg-stone-800/50 rounded-xl p-4 border border-amber-600/30">
                <div className="text-3xl font-bold text-green-400">
                  {loading ? '...' : stats.totalTrivia}
                </div>
                <div className="text-stone-400 text-sm">Trivia Questions</div>
              </div>
              <div className="bg-stone-800/50 rounded-xl p-4 border border-amber-600/30">
                <div className="text-3xl font-bold text-purple-400">
                  {loading ? '...' : stats.totalCourses}
                </div>
                <div className="text-stone-400 text-sm">Courses</div>
              </div>
              <div className="bg-stone-800/50 rounded-xl p-4 border border-amber-600/30">
                <div className="text-3xl font-bold text-blue-400">
                  {loading ? '...' : stats.totalAchievements}
                </div>
                <div className="text-stone-400 text-sm">Achievements</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/spirits"
                className="bg-amber-600 hover:bg-amber-700 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
              >
                🔍 Browse All Spirits
              </Link>
              <Link
                href="/auth/register"
                className="bg-stone-700 hover:bg-stone-600 border border-amber-600/50 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
              >
                ✨ Start Your Collection
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          Browse by Category
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/spirits?category=${cat.id}`}
              className={`bg-gradient-to-br ${cat.color} rounded-xl p-4 text-center hover:scale-105 transition-transform`}
            >
              <span className="text-4xl block mb-2">{cat.icon}</span>
              <span className="font-semibold">{cat.name}</span>
              {stats.categoryCounts[cat.id] && (
                <span className="block text-xs opacity-75 mt-1">
                  {stats.categoryCounts[cat.id]} spirits
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-stone-900/50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="bg-stone-800/50 border border-amber-600/20 rounded-xl p-6 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all group"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-stone-400">{feature.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Spirits */}
      {featuredSpirits.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Rare Bottles</h2>
            <Link href="/spirits?rarity=rare" className="text-amber-400 hover:text-amber-300">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredSpirits.map((spirit) => (
              <Link
                key={spirit.id}
                href={`/spirits?search=${encodeURIComponent(spirit.name)}`}
                className="bg-stone-800/50 border border-amber-600/20 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all group"
              >
                <div className="aspect-square bg-gradient-to-br from-stone-700 to-stone-800 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
                  🥃
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2">{spirit.name}</h3>
                  <p className="text-stone-400 text-xs">{spirit.brand}</p>
                  {spirit.msrp && (
                    <p className="text-amber-400 font-bold mt-1">${spirit.msrp}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/games"
              className="bg-stone-900/50 rounded-xl p-6 text-center hover:bg-stone-900/70 transition-all"
            >
              <span className="text-5xl block mb-4">🎮</span>
              <h3 className="text-xl font-bold mb-2">Play Trivia</h3>
              <p className="text-stone-400 text-sm">Test your knowledge and earn XP</p>
            </Link>
            <Link
              href="/academy"
              className="bg-stone-900/50 rounded-xl p-6 text-center hover:bg-stone-900/70 transition-all"
            >
              <span className="text-5xl block mb-4">🎓</span>
              <h3 className="text-xl font-bold mb-2">Take a Course</h3>
              <p className="text-stone-400 text-sm">Learn from beginner to expert</p>
            </Link>
            <Link
              href="/leaderboard"
              className="bg-stone-900/50 rounded-xl p-6 text-center hover:bg-stone-900/70 transition-all"
            >
              <span className="text-5xl block mb-4">🏆</span>
              <h3 className="text-xl font-bold mb-2">Leaderboard</h3>
              <p className="text-stone-400 text-sm">See top collectors and players</p>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-stone-900 border-t border-amber-600/20 py-8">
        <div className="container mx-auto px-4 text-center text-stone-400">
          <p className="mb-2">🥃 BarrelVerse - Your Story. Our Design.</p>
          <p className="text-sm">© 2025 CR AudioViz AI, LLC. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <Link href="/about" className="hover:text-amber-400">About</Link>
            <Link href="/privacy" className="hover:text-amber-400">Privacy</Link>
            <Link href="/terms" className="hover:text-amber-400">Terms</Link>
            <Link href="/contact" className="hover:text-amber-400">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

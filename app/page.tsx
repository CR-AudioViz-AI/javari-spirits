'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { getClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { id: 'bourbon', name: 'Bourbon', icon: '🥃', color: 'amber' },
  { id: 'scotch', name: 'Scotch', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: 'orange' },
  { id: 'irish', name: 'Irish', icon: '🍀', color: 'green' },
  { id: 'japanese', name: 'Japanese', icon: '🇯🇵', color: 'red' },
  { id: 'tequila', name: 'Tequila', icon: '🌵', color: 'lime' },
  { id: 'rum', name: 'Rum', icon: '🏝️', color: 'amber' },
  { id: 'wine', name: 'Wine', icon: '🍷', color: 'purple' },
  { id: 'beer', name: 'Beer', icon: '🍺', color: 'yellow' },
]

const FEATURES = [
  { icon: '🥃', title: '5,700+ Spirits', desc: 'The largest collection database' },
  { icon: '🎮', title: '4 Game Modes', desc: 'Learn while having fun' },
  { icon: '📚', title: '12+ Courses', desc: 'From beginner to expert' },
  { icon: '🏆', title: '600+ Trivia', desc: 'Test your knowledge' },
  { icon: '💰', title: '$PROOF Rewards', desc: 'Earn as you learn' },
  { icon: '📊', title: 'Leaderboards', desc: 'Compete globally' },
]

// Calculate user level from proof balance
function calculateLevel(proofBalance: number): number {
  if (proofBalance < 100) return 1
  if (proofBalance < 500) return 2
  if (proofBalance < 1000) return 3
  if (proofBalance < 2500) return 4
  if (proofBalance < 5000) return 5
  if (proofBalance < 10000) return 6
  if (proofBalance < 25000) return 7
  if (proofBalance < 50000) return 8
  if (proofBalance < 100000) return 9
  return 10 + Math.floor((proofBalance - 100000) / 50000)
}

export default function HomePage() {
  const { user, profile, loading } = useAuth()
  const [stats, setStats] = useState({ spirits: 0, trivia: 0, courses: 0, users: 0 })
  const [recentSpirits, setRecentSpirits] = useState<any[]>([])
  
  const supabase = getClient()

  useEffect(() => {
    async function fetchStats() {
      const [spiritsRes, triviaRes, coursesRes] = await Promise.all([
        supabase.from('bv_spirits').select('id', { count: 'exact', head: true }),
        supabase.from('bv_trivia_questions').select('id', { count: 'exact', head: true }),
        supabase.from('bv_courses').select('id', { count: 'exact', head: true }),
      ])
      
      setStats({
        spirits: spiritsRes.count || 0,
        trivia: triviaRes.count || 0,
        courses: coursesRes.count || 0,
        users: 1000,
      })

      const { data: spirits } = await supabase
        .from('bv_spirits')
        .select('id, name, brand, category, proof, rarity, msrp')
        .in('rarity', ['rare', 'very_rare', 'ultra_rare', 'legendary'])
        .limit(8)
      
      if (spirits) setRecentSpirits(spirits)
    }
    
    fetchStats()
  }, [supabase])

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'text-gray-400',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      very_rare: 'text-purple-400',
      ultra_rare: 'text-orange-400',
      legendary: 'text-yellow-400',
    }
    return colors[rarity] || 'text-gray-400'
  }

  const userLevel = profile ? calculateLevel(profile.proof_balance || 0) : 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-amber-600/20 bg-stone-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
              <span className="text-4xl">🥃</span>
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                BarrelVerse
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/collection" className="text-stone-300 hover:text-amber-400 transition-colors">
                Collection
              </Link>
              <Link href="/games" className="text-stone-300 hover:text-amber-400 transition-colors">
                Games
              </Link>
              <Link href="/academy" className="text-stone-300 hover:text-amber-400 transition-colors">
                Academy
              </Link>
              <Link href="/leaderboard" className="text-stone-300 hover:text-amber-400 transition-colors">
                Leaderboard
              </Link>
              <Link href="/rewards" className="text-stone-300 hover:text-amber-400 transition-colors">
                Rewards
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {loading ? (
                <div className="animate-pulse h-10 w-24 bg-stone-700 rounded-lg" />
              ) : user ? (
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm text-stone-400">Level {userLevel}</div>
                    <div className="text-amber-400 font-bold">{profile?.proof_balance || 0} $PROOF</div>
                  </div>
                  <Link
                    href="/profile"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold transition-colors"
                  >
                    My Profile
                  </Link>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-amber-600/20 border border-amber-600/50 rounded-full text-amber-400 text-sm mb-6">
              🎉 Now with {stats.spirits.toLocaleString()}+ spirits in our database!
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              The Ultimate
              <span className="block bg-gradient-to-r from-amber-400 via-orange-400 to-amber-600 bg-clip-text text-transparent">
                Spirits Platform
              </span>
            </h1>
            <p className="text-xl text-stone-300 mb-8 max-w-2xl mx-auto">
              Discover, collect, and master the world of spirits. Play games, earn rewards, 
              and become a certified connoisseur.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/collection"
                className="px-8 py-4 bg-amber-600 hover:bg-amber-700 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
              >
                Explore Collection
              </Link>
              <Link
                href="/games"
                className="px-8 py-4 bg-stone-700 hover:bg-stone-600 border border-amber-600/30 rounded-xl font-bold text-lg transition-all"
              >
                Play Games
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-amber-600/20 bg-stone-800/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-amber-400">{stats.spirits.toLocaleString()}+</div>
              <div className="text-stone-400">Spirits</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-400">{stats.trivia}+</div>
              <div className="text-stone-400">Trivia Questions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-400">{stats.courses}+</div>
              <div className="text-stone-400">Courses</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-amber-400">∞</div>
              <div className="text-stone-400">Fun to be had</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Browse */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/collection?category=${cat.id}`}
                className="bg-stone-800/50 border border-amber-600/20 rounded-xl p-6 text-center hover:border-amber-500/50 hover:bg-stone-800 transition-all group"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <div className="font-bold text-lg group-hover:text-amber-400 transition-colors">
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Spirits */}
      {recentSpirits.length > 0 && (
        <section className="py-16 bg-stone-800/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Featured Spirits</h2>
              <Link href="/collection" className="text-amber-400 hover:text-amber-300">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentSpirits.map((spirit) => (
                <div
                  key={spirit.id}
                  className="bg-stone-800/50 border border-amber-600/20 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all"
                >
                  <div className="h-24 bg-gradient-to-br from-amber-900/50 to-stone-800 flex items-center justify-center text-4xl">
                    🥃
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold truncate">{spirit.name}</h3>
                    <p className="text-stone-400 text-sm">{spirit.brand}</p>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span className={getRarityColor(spirit.rarity)}>
                        {spirit.rarity?.replace('_', ' ')}
                      </span>
                      <span className="text-amber-400">{spirit.proof}°</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="bg-stone-800/30 border border-amber-600/20 rounded-xl p-6 text-center hover:border-amber-500/50 transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-stone-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Modes Preview */}
      <section className="py-16 bg-gradient-to-r from-amber-900/20 to-stone-900/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Test Your Knowledge</h2>
          <p className="text-center text-stone-400 mb-12 max-w-2xl mx-auto">
            Four exciting game modes to challenge yourself and earn $PROOF rewards.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '⚡', name: 'Quick Play', desc: '10 questions, casual fun' },
              { icon: '⏱️', name: 'Time Attack', desc: 'Beat the clock' },
              { icon: '🎯', name: 'Expert Challenge', desc: 'Hardest questions only' },
              { icon: '💀', name: 'Survival', desc: 'One wrong = game over' },
            ].map((mode, i) => (
              <Link
                key={i}
                href="/games"
                className="bg-stone-800/50 border border-amber-600/20 rounded-xl p-6 text-center hover:border-amber-500/50 hover:bg-stone-800 transition-all group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {mode.icon}
                </div>
                <h3 className="font-bold mb-1 group-hover:text-amber-400 transition-colors">
                  {mode.name}
                </h3>
                <p className="text-sm text-stone-400">{mode.desc}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/games"
              className="inline-block px-8 py-3 bg-amber-600 hover:bg-amber-700 rounded-xl font-bold transition-colors"
            >
              Start Playing
            </Link>
          </div>
        </div>
      </section>

      {/* Academy Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">🎓 BarrelVerse Academy</h2>
              <p className="text-stone-300 mb-6">
                From beginner basics to expert certifications. Learn everything about 
                bourbon, scotch, wine, beer, and more from our comprehensive course library.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-amber-400">✓</span>
                  <span>{stats.courses}+ comprehensive courses</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-amber-400">✓</span>
                  <span>Earn $PROOF for completing lessons</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-amber-400">✓</span>
                  <span>Official certifications</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-amber-400">✓</span>
                  <span>Learn at your own pace</span>
                </li>
              </ul>
              <Link
                href="/academy"
                className="inline-block px-8 py-3 bg-stone-700 hover:bg-stone-600 border border-amber-600/30 rounded-xl font-bold transition-colors"
              >
                Browse Courses
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {['Bourbon 101', 'Scotch Regions', 'Wine Basics', 'Tasting Skills'].map((course, i) => (
                <div
                  key={i}
                  className="bg-stone-800/50 border border-amber-600/20 rounded-xl p-4 text-center"
                >
                  <div className="text-3xl mb-2">{['🥃', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🍷', '👅'][i]}</div>
                  <div className="font-medium">{course}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-gradient-to-r from-amber-900/30 to-orange-900/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Begin Your Journey?</h2>
            <p className="text-xl text-stone-300 mb-8 max-w-2xl mx-auto">
              Join thousands of spirit enthusiasts. Collect, learn, play, and earn.
            </p>
            <Link
              href="/auth/register"
              className="inline-block px-10 py-4 bg-amber-600 hover:bg-amber-700 rounded-xl font-bold text-xl transition-all transform hover:scale-105"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-amber-600/20 bg-stone-900/80">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 text-xl font-bold mb-4">
                <span className="text-2xl">🥃</span>
                <span>BarrelVerse</span>
              </div>
              <p className="text-stone-400 text-sm">
                The ultimate platform for spirit enthusiasts. Discover, collect, and master.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Explore</h4>
              <ul className="space-y-2 text-stone-400">
                <li><Link href="/collection" className="hover:text-amber-400">Collection</Link></li>
                <li><Link href="/games" className="hover:text-amber-400">Games</Link></li>
                <li><Link href="/academy" className="hover:text-amber-400">Academy</Link></li>
                <li><Link href="/leaderboard" className="hover:text-amber-400">Leaderboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Community</h4>
              <ul className="space-y-2 text-stone-400">
                <li><Link href="/rewards" className="hover:text-amber-400">Rewards</Link></li>
                <li><Link href="/find" className="hover:text-amber-400">Find Spirits</Link></li>
                <li><Link href="/business" className="hover:text-amber-400">For Business</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-stone-400">
                <li><Link href="/docs" className="hover:text-amber-400">Documentation</Link></li>
                <li><a href="#" className="hover:text-amber-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-amber-400">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-700 mt-8 pt-8 text-center text-stone-500 text-sm">
            <p>© 2025 BarrelVerse. All rights reserved. Must be 21+ to use this platform.</p>
            <p className="mt-2">A CR AudioViz AI Product</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

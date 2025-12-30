'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Footer from '@/components/Footer'
import NewsletterSignup from '@/components/NewsletterSignup'

// ============================================
// LIVE STATS (Would come from API)
// ============================================

const LIVE_STATS = {
  totalSpirits: 22951,
  totalCollectors: 15234,
  bottlesTracked: 89432,
  collectionValue: 12500000
}

// ============================================
// FEATURED SPIRITS
// ============================================

const FEATURED_SPIRITS = [
  { id: '1', name: 'Pappy Van Winkle 15', brand: 'Old Rip Van Winkle', rating: 97, msrp: 119, market: 1850, trend: 'up', image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400' },
  { id: '2', name: 'George T. Stagg 2023', brand: 'Buffalo Trace', rating: 96, msrp: 99, market: 650, trend: 'up', image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400' },
  { id: '3', name: 'William Larue Weller', brand: 'Buffalo Trace', rating: 95, msrp: 99, market: 950, trend: 'stable', image: 'https://images.unsplash.com/photo-1602934445884-da0fa1c9d3b3?w=400' },
  { id: '4', name: 'Blanton\'s Single Barrel', brand: 'Buffalo Trace', rating: 94, msrp: 65, market: 120, trend: 'up', image: 'https://images.unsplash.com/photo-1574023849379-88f285a43974?w=400' }
]

// ============================================
// QUICK LINKS
// ============================================

const QUICK_ACTIONS = [
  { icon: '🔍', label: 'Explore Spirits', href: '/explore', description: 'Browse our database' },
  { icon: '📷', label: 'Scan Bottle', href: '/scan', description: 'Identify any bottle' },
  { icon: '🍸', label: 'Cocktail Genius', href: '/cocktails/genius', description: 'AI recipe finder' },
  { icon: '🎮', label: 'Play Games', href: '/games', description: 'Test your knowledge' },
  { icon: '🏆', label: 'Rewards', href: '/rewards', description: 'Earn & redeem points' },
  { icon: '🛒', label: 'Marketplace', href: '/marketplace', description: 'Buy & sell bottles' },
]

// ============================================
// CATEGORIES
// ============================================

const CATEGORIES = [
  { name: 'Bourbon', icon: '🥃', count: 4521, color: 'from-amber-600 to-orange-600' },
  { name: 'Scotch', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', count: 3842, color: 'from-amber-700 to-stone-600' },
  { name: 'Whiskey', icon: '🍀', count: 2156, color: 'from-green-600 to-emerald-700' },
  { name: 'Tequila', icon: '🌵', count: 1823, color: 'from-lime-600 to-green-600' },
  { name: 'Rum', icon: '🏝️', count: 1654, color: 'from-amber-500 to-yellow-600' },
  { name: 'Vodka', icon: '❄️', count: 1432, color: 'from-blue-400 to-cyan-500' },
  { name: 'Gin', icon: '🌿', count: 1298, color: 'from-emerald-500 to-teal-600' },
  { name: 'Cognac', icon: '🍇', count: 876, color: 'from-purple-600 to-violet-700' },
]

// ============================================
// HOMEPAGE COMPONENT
// ============================================

export default function HomePage() {
  const [currentStat, setCurrentStat] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  
  const stats = [
    { value: LIVE_STATS.totalSpirits.toLocaleString() + '+', label: 'Spirits in Database' },
    { value: LIVE_STATS.totalCollectors.toLocaleString() + '+', label: 'Collectors Worldwide' },
    { value: LIVE_STATS.bottlesTracked.toLocaleString() + '+', label: 'Bottles Tracked' },
    { value: '$' + (LIVE_STATS.collectionValue / 1000000).toFixed(0) + 'M+', label: 'Collection Value' }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [stats.length])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500 flex items-center gap-2">
            <span className="text-3xl">🥃</span>
            <span>CravBarrels</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/explore" className="text-gray-300 hover:text-amber-400 transition-colors font-medium">
              Explore
            </Link>
            <Link href="/cocktails/genius" className="text-gray-300 hover:text-amber-400 transition-colors font-medium">
              Cocktails
            </Link>
            <Link href="/tasting" className="text-gray-300 hover:text-amber-400 transition-colors font-medium">
              Tasting Room
            </Link>
            <Link href="/games" className="text-gray-300 hover:text-amber-400 transition-colors font-medium">
              Games
            </Link>
            <Link href="/rewards" className="text-gray-300 hover:text-amber-400 transition-colors font-medium">
              Rewards
            </Link>
            <Link href="/marketplace" className="text-gray-300 hover:text-amber-400 transition-colors font-medium">
              Marketplace
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/scan" 
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span>📷</span>
              <span className="text-sm font-medium">Scan</span>
            </Link>
            <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link 
              href="/auth/signup" 
              className="bg-amber-600 hover:bg-amber-500 px-5 py-2 rounded-lg font-semibold transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-gray-950 to-black" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          {/* Animated Stat Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-8"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <AnimatePresence mode="wait">
              <motion.span 
                key={currentStat}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-amber-400"
              >
                <span className="font-bold">{stats[currentStat].value}</span> {stats[currentStat].label}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-transparent bg-clip-text">
              Discover
            </span>
            <br />
            <span className="text-white">Your Next</span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-transparent bg-clip-text">
              Favorite Spirit
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            The ultimate platform for spirit enthusiasts. Explore, collect, learn, 
            and connect with a community of passionate collectors.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link 
              href="/explore" 
              className="w-full sm:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-amber-600/25"
            >
              Start Exploring →
            </Link>
            <Link 
              href="/scan" 
              className="w-full sm:w-auto px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              <span>📷</span> Scan a Bottle
            </Link>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
                <div className="text-2xl font-bold text-amber-500">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-3 bg-amber-500 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            What would you like to do?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {QUICK_ACTIONS.map((action, idx) => (
              <Link
                key={idx}
                href={action.href}
                className="group bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-amber-500/50 rounded-2xl p-6 text-center transition-all"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
                <div className="font-semibold mb-1">{action.label}</div>
                <div className="text-sm text-gray-500">{action.description}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Browse by Category
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Explore our comprehensive database covering every major spirit category
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((category, idx) => (
              <Link
                key={idx}
                href={`/explore?category=${category.name.toLowerCase()}`}
                className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${category.color} group transition-transform hover:scale-105`}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="relative z-10">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <div className="font-bold text-lg">{category.name}</div>
                  <div className="text-white/70 text-sm">{category.count.toLocaleString()} bottles</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Spirits */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold">Trending Spirits</h2>
              <p className="text-gray-400 mt-2">What collectors are watching this week</p>
            </div>
            <Link href="/explore" className="text-amber-500 hover:text-amber-400 font-medium">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_SPIRITS.map((spirit, idx) => (
              <Link
                key={idx}
                href={`/spirits/${spirit.id}`}
                className="bg-gray-800/50 rounded-2xl overflow-hidden group hover:bg-gray-800 transition-all"
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img 
                    src={spirit.image} 
                    alt={spirit.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-amber-500 text-black font-bold px-2 py-1 rounded text-sm">
                    {spirit.rating}
                  </div>
                  {spirit.trend === 'up' && (
                    <div className="absolute top-3 left-3 bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium">
                      📈 Trending
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="text-sm text-amber-500 mb-1">{spirit.brand}</div>
                  <div className="font-semibold line-clamp-1">{spirit.name}</div>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="text-gray-500">MSRP: ${spirit.msrp}</span>
                    <span className="text-amber-500 font-medium">${spirit.market}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Hero Section */}
      <NewsletterSignup
        variant="hero"
        title="Join the Community"
        subtitle="Get weekly picks, exclusive deals, new releases, and tasting guides delivered straight to your inbox."
        source="homepage_hero"
      />

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            A comprehensive platform for discovering, learning, and enjoying premium spirits
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-3">Smart Discovery</h3>
              <p className="text-gray-400">
                Our AI-powered recommendation engine learns your preferences to suggest spirits you'll love.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
              <div className="text-4xl mb-4">📷</div>
              <h3 className="text-xl font-bold mb-3">Instant Identification</h3>
              <p className="text-gray-400">
                Point your camera at any bottle to instantly identify it and access detailed information.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-3">Gamified Experience</h3>
              <p className="text-gray-400">
                Earn XP, unlock badges, and compete on leaderboards while expanding your spirits knowledge.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
              <div className="text-4xl mb-4">🍸</div>
              <h3 className="text-xl font-bold mb-3">Cocktail Genius</h3>
              <p className="text-gray-400">
                Tell us what you have, and our AI bartender will suggest perfect cocktails you can make.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3">Price Tracking</h3>
              <p className="text-gray-400">
                Monitor market prices, track your collection value, and get alerts on deals.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-xl font-bold mb-3">Easy Purchasing</h3>
              <p className="text-gray-400">
                Compare prices across retailers and buy with confidence from trusted partners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Inline Newsletter Card */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <NewsletterSignup
            variant="card"
            title="Never Miss a Drop"
            subtitle="Be the first to know about limited releases, exclusive offers, and community events."
            source="homepage_card"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join thousands of spirit enthusiasts who are discovering, collecting, 
            and enjoying the world's finest spirits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/auth/signup" 
              className="w-full sm:w-auto px-10 py-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-lg transition-all"
            >
              Create Free Account
            </Link>
            <Link 
              href="/explore" 
              className="w-full sm:w-auto px-10 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-bold text-lg transition-all"
            >
              Explore First
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

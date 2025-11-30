'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const CATEGORIES = [
  { id: 'bourbon', name: 'Bourbon', icon: '🥃', color: 'bg-amber-600' },
  { id: 'scotch', name: 'Scotch', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: 'bg-amber-700' },
  { id: 'irish', name: 'Irish', icon: '☘️', color: 'bg-green-600' },
  { id: 'japanese', name: 'Japanese', icon: '🇯🇵', color: 'bg-red-500' },
  { id: 'tequila', name: 'Tequila', icon: '🌵', color: 'bg-lime-600' },
  { id: 'rum', name: 'Rum', icon: '🏝️', color: 'bg-orange-500' },
  { id: 'gin', name: 'Gin', icon: '🫒', color: 'bg-teal-500' },
  { id: 'cognac', name: 'Cognac', icon: '🍇', color: 'bg-indigo-600' },
]

const FEATURES = [
  {
    icon: '🎮',
    title: 'Trivia Games',
    description: '500+ questions across 4 game modes. Test your spirits knowledge!',
    link: '/games',
  },
  {
    icon: '📱',
    title: 'Spirit Collection',
    description: 'Browse 100+ premium spirits with detailed tasting notes',
    link: '/collection',
  },
  {
    icon: '🔍',
    title: 'Find Nearby',
    description: 'Search for bottles at local bars, restaurants & liquor stores',
    link: '/find',
  },
  {
    icon: '🏆',
    title: '$PROOF Rewards',
    description: 'Earn tokens and redeem for real merchandise and experiences',
    link: '/rewards',
  },
]

const STATS = [
  { value: '100+', label: 'Premium Spirits' },
  { value: '500+', label: 'Trivia Questions' },
  { value: '4', label: 'Game Modes' },
  { value: '8', label: 'Categories' },
]

export default function HomePage() {
  const [ageVerified, setAgeVerified] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const verified = sessionStorage.getItem('ageVerified')
      if (verified === 'true') {
        setAgeVerified(true)
      }
    }
  }, [])

  const handleAgeVerification = (verified: boolean) => {
    if (verified) {
      setAgeVerified(true)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ageVerified', 'true')
      }
    } else {
      window.location.href = 'https://google.com'
    }
  }

  if (!mounted) return null

  if (!ageVerified) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <div className="bg-stone-900 border border-amber-600/30 rounded-2xl max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">🥃</div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to BarrelVerse</h1>
          <p className="text-stone-300 mb-6">You must be of legal drinking age to access this site.</p>
          <div className="space-y-3">
            <button
              onClick={() => handleAgeVerification(true)}
              className="w-full py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors"
            >
              I am 21 or older - Enter
            </button>
            <button
              onClick={() => handleAgeVerification(false)}
              className="w-full py-3 border border-stone-600 text-stone-300 rounded-lg font-semibold hover:bg-stone-800 transition-colors"
            >
              I am under 21 - Exit
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-stone-900/80 backdrop-blur-lg border-b border-amber-600/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center text-2xl shadow-lg">
              🥃
            </div>
            <span className="text-xl font-bold text-white">
              Barrel<span className="text-amber-400">Verse</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/games" className="text-stone-300 hover:text-amber-400 transition-colors hidden md:block">
              Games
            </Link>
            <Link href="/collection" className="text-stone-300 hover:text-amber-400 transition-colors hidden md:block">
              Collection
            </Link>
            <Link href="/find" className="text-stone-300 hover:text-amber-400 transition-colors hidden md:block">
              Find Spirits
            </Link>
            <Link href="/leaderboard" className="text-stone-300 hover:text-amber-400 transition-colors hidden md:block">
              Leaderboard
            </Link>
            <Link 
              href="/auth/login" 
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/whiskey-bg.jpg')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto text-center relative">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Master the Art of
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600"> Fine Spirits</span>
          </h1>
          <p className="text-xl text-amber-200 mb-8 max-w-2xl mx-auto">
            Test your knowledge, build your collection, and earn rewards in the ultimate spirits enthusiast platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/games"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg hover:shadow-amber-500/25 transition-all"
            >
              🎮 Play Trivia Games
            </Link>
            <Link
              href="/collection"
              className="bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-600/30 font-bold py-4 px-8 rounded-xl text-lg transition-all"
            >
              📱 Browse Spirits
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-stone-800/50 border-y border-amber-600/20 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-amber-400">{stat.value}</div>
                <div className="text-stone-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories - Links to Collection with Filter */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Explore Spirit Categories</h2>
          <p className="text-stone-400 text-center mb-8">Click a category to browse all spirits of that type</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`/collection?category=${category.id}`}
                className={`${category.color} hover:opacity-90 rounded-xl p-6 text-center text-white transition-all hover:scale-105 shadow-lg`}
              >
                <span className="text-4xl block mb-2">{category.icon}</span>
                <span className="font-semibold">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-stone-800/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <Link
                key={feature.title}
                href={feature.link}
                className="bg-stone-800/50 border border-amber-600/20 rounded-xl p-6 hover:border-amber-500/50 hover:bg-stone-800/70 transition-all group"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-stone-400">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/50 border border-amber-600/30 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Own a Bar or Liquor Store?</h2>
            <p className="text-amber-200 mb-8 max-w-2xl mx-auto">
              List your inventory and reach thousands of spirits enthusiasts actively searching for bottles near them.
            </p>
            <Link
              href="/business/register"
              className="inline-block bg-white text-amber-900 font-bold py-3 px-8 rounded-lg hover:bg-amber-100 transition-colors"
            >
              List Your Business Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 border-t border-amber-600/20 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center text-xl">
                🥃
              </div>
              <span className="text-lg font-bold text-white">
                Barrel<span className="text-amber-400">Verse</span>
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/games" className="text-stone-400 hover:text-amber-400 transition-colors">Games</Link>
              <Link href="/collection" className="text-stone-400 hover:text-amber-400 transition-colors">Collection</Link>
              <Link href="/find" className="text-stone-400 hover:text-amber-400 transition-colors">Find Spirits</Link>
              <Link href="/rewards" className="text-stone-400 hover:text-amber-400 transition-colors">Rewards</Link>
              <Link href="/leaderboard" className="text-stone-400 hover:text-amber-400 transition-colors">Leaderboard</Link>
              <Link href="/business/register" className="text-stone-400 hover:text-amber-400 transition-colors">For Business</Link>
              <Link href="/auth/login" className="text-stone-400 hover:text-amber-400 transition-colors">Sign In</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-stone-800 text-center text-stone-500 text-sm">
            <p>© 2024 BarrelVerse. Drink responsibly. Must be 21+ to use this service.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

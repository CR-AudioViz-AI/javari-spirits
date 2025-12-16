'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Daily stats (would come from API)
const LIVE_STATS = {
  totalSpirits: 22951,
  totalCollectors: 15234,
  bottlesTracked: 89432,
  collectionValue: 12500000
}

// Featured content
const FEATURED_SPIRITS = [
  { name: 'Pappy Van Winkle 15', rating: 97, msrp: 119, market: 1850, trend: 'up' },
  { name: 'George T. Stagg 2023', rating: 96, msrp: 99, market: 650, trend: 'up' },
  { name: 'William Larue Weller', rating: 95, msrp: 99, market: 950, trend: 'stable' }
]

const TODAY_IN_HISTORY = {
  year: 1933,
  event: 'Prohibition Ends',
  description: 'The 21st Amendment was ratified, ending 13 years of Prohibition.'
}

export default function HomePage() {
  const [currentStat, setCurrentStat] = useState(0)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-stone-950 to-amber-950/30 text-white">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500 flex items-center gap-2">
            🥃 BarrelVerse
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/spirits" className="hover:text-amber-400 transition-colors">Spirits</Link>
            <Link href="/museum" className="hover:text-amber-400 transition-colors">Museum</Link>
            <Link href="/community" className="hover:text-amber-400 transition-colors">Community</Link>
            <Link href="/games" className="hover:text-amber-400 transition-colors">Games</Link>
            <Link href="/prices" className="hover:text-amber-400 transition-colors">Prices</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg font-semibold transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-stone-950 to-black" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-800/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          {/* Live Stat Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-900/50 border border-amber-500/30 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm">
              <span className="text-amber-400 font-bold">{stats[currentStat].value}</span>
              {' '}{stats[currentStat].label}
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            The World's Premier
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-transparent bg-clip-text">
              Spirits Platform
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto">
            Track your collection. Explore history. Connect with collectors. 
            Master your palate. Find the best deals. All in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/signup"
              className="group bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all transform hover:scale-105"
            >
              Start Free Today
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="/tours"
              className="bg-stone-800 hover:bg-stone-700 border border-stone-700 px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-colors"
            >
              <span>🏭</span> Take a Tour
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-500 text-sm">
            <span className="flex items-center gap-2">
              <span className="text-green-400">✓</span> Free forever tier
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-400">✓</span> No credit card required
            </span>
            <span className="flex items-center gap-2">
              <span className="text-green-400">✓</span> 47,000+ collectors trust us
            </span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <span className="text-3xl">↓</span>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400">
              One platform to rule your spirits journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '📦',
                title: 'Collection Tracking',
                description: 'Log every bottle, track values, manage your wishlist. Never lose sight of your collection.',
                link: '/collection',
                color: 'amber'
              },
              {
                icon: '🏛️',
                title: 'Virtual Museum',
                description: 'Walk through 500+ years of spirits history. Explore artifacts, stories, and legends.',
                link: '/museum',
                color: 'purple',
                badge: 'NEW'
              },
              {
                icon: '🏭',
                title: 'Distillery Tours',
                description: 'Experience famous distilleries from your couch. See the grain-to-glass journey.',
                link: '/tours',
                color: 'blue',
                badge: 'NEW'
              },
              {
                icon: '💰',
                title: 'Price Tracking',
                description: 'Find the best deals. Set price alerts. Never overpay for allocated bottles again.',
                link: '/prices',
                color: 'green'
              },
              {
                icon: '🎮',
                title: 'Games & Trivia',
                description: 'Test your knowledge with 1000+ questions. Compete globally. Earn XP and badges.',
                link: '/games',
                color: 'pink'
              },
              {
                icon: '📊',
                title: 'Investment Tools',
                description: 'Track collection ROI, compare to market trends, optimize your liquid assets.',
                link: '/value',
                color: 'cyan'
              },
              {
                icon: '🥃',
                title: 'Tasting Notes',
                description: 'Log detailed tastings with our flavor wheel. AI suggests similar spirits you\'ll love.',
                link: '/tastings',
                color: 'orange'
              },
              {
                icon: '👥',
                title: 'Community',
                description: 'Connect with collectors worldwide. Share finds, ask questions, make friends.',
                link: '/community',
                color: 'indigo'
              },
              {
                icon: '📸',
                title: 'Bottle Scanner',
                description: 'Scan any bottle to instantly log it. Get pricing, ratings, and tasting notes.',
                link: '/scanner',
                color: 'red',
                badge: 'BETA'
              }
            ].map((feature, i) => (
              <Link
                key={i}
                href={feature.link}
                className={`group bg-stone-800/50 rounded-2xl p-6 border border-stone-700/50 hover:border-${feature.color}-500/50 transition-all hover:bg-stone-800/80 relative overflow-hidden`}
              >
                {feature.badge && (
                  <span className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded bg-${feature.color}-600`}>
                    {feature.badge}
                  </span>
                )}
                <div className={`text-5xl mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
                <span className="inline-block mt-4 text-amber-400 group-hover:translate-x-2 transition-transform">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Today in History */}
      <section className="py-16 bg-gradient-to-r from-amber-900/30 via-stone-900 to-amber-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-black/30 rounded-2xl p-8 md:p-12 border border-amber-500/30 flex flex-col md:flex-row items-center gap-8">
            <div className="text-center md:text-left">
              <span className="text-amber-400 font-semibold">📅 TODAY IN SPIRITS HISTORY</span>
              <h3 className="text-4xl font-bold mt-2">{TODAY_IN_HISTORY.event}</h3>
              <p className="text-xl text-amber-400 mt-1">{TODAY_IN_HISTORY.year}</p>
              <p className="text-gray-400 mt-4 max-w-xl">{TODAY_IN_HISTORY.description}</p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/today"
                className="bg-amber-600 hover:bg-amber-500 px-8 py-4 rounded-xl font-bold text-lg transition-colors"
              >
                Read Full Story →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Most Wanted */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold">Most Wanted</h2>
              <p className="text-gray-400 mt-2">The spirits collectors are hunting</p>
            </div>
            <Link href="/spirits" className="text-amber-400 hover:text-amber-300 font-semibold">
              View All →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURED_SPIRITS.map((spirit, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-2xl overflow-hidden border border-stone-700/50 hover:border-amber-500/50 transition-all group"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-amber-900/30 to-stone-800 flex items-center justify-center relative">
                  <span className="text-8xl group-hover:scale-110 transition-transform">🥃</span>
                  <div className="absolute top-4 left-4 bg-amber-600 px-3 py-1 rounded-full text-sm font-bold">
                    #{i + 1}
                  </div>
                  {spirit.trend === 'up' && (
                    <div className="absolute top-4 right-4 bg-green-600 px-2 py-1 rounded text-xs font-bold">
                      📈 Hot
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{spirit.name}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="bg-amber-900/50 px-3 py-1 rounded-full text-amber-400">
                      {spirit.rating}/100
                    </span>
                    <div className="text-right">
                      <p className="text-gray-500 line-through text-xs">MSRP ${spirit.msrp}</p>
                      <p className="text-green-400 font-bold">${spirit.market}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-stone-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trusted by Collectors</h2>
            <p className="text-xl text-gray-400">
              Join the world's most passionate spirits community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Finally, a platform that understands bourbon collectors. My entire collection is tracked, valued, and organized perfectly.",
                name: "Mike T.",
                title: "325 bottles tracked",
                rating: 5
              },
              {
                quote: "The virtual museum is incredible. I've learned more about whiskey history in a week than I did in years of collecting.",
                name: "Sarah K.",
                title: "History enthusiast",
                rating: 5
              },
              {
                quote: "The price alerts saved me $400 on a bottle of Blanton's. Worth every penny of the subscription.",
                name: "James R.",
                title: "Deal hunter",
                rating: 5
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-stone-800/50 rounded-2xl p-8 border border-stone-700/50">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <span key={j} className="text-amber-400">⭐</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/50 via-stone-900 to-amber-900/50" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Ready to Elevate Your Collection?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join 47,000+ collectors who've transformed how they experience spirits.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 px-12 py-5 rounded-xl font-bold text-xl text-black transition-all transform hover:scale-105"
          >
            Start Free Today →
          </Link>
          <p className="text-gray-500 mt-6 text-sm">
            No credit card required • Free forever tier • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-stone-800 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="text-2xl font-bold text-amber-500 flex items-center gap-2 mb-4">
                🥃 BarrelVerse
              </Link>
              <p className="text-gray-500 mb-6">
                The world's premier spirits platform. Track, explore, connect, and master.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-500 hover:text-amber-400 text-2xl">📘</a>
                <a href="#" className="text-gray-500 hover:text-amber-400 text-2xl">🐦</a>
                <a href="#" className="text-gray-500 hover:text-amber-400 text-2xl">📸</a>
                <a href="#" className="text-gray-500 hover:text-amber-400 text-2xl">📺</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-500">
                <li><Link href="/spirits" className="hover:text-amber-400">Spirits Database</Link></li>
                <li><Link href="/collection" className="hover:text-amber-400">Collection Tracker</Link></li>
                <li><Link href="/museum" className="hover:text-amber-400">Virtual Museum</Link></li>
                <li><Link href="/prices" className="hover:text-amber-400">Price Tracker</Link></li>
                <li><Link href="/games" className="hover:text-amber-400">Games</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Business</h4>
              <ul className="space-y-2 text-gray-500">
                <li><Link href="/retailers" className="hover:text-amber-400">For Retailers</Link></li>
                <li><Link href="/maker" className="hover:text-amber-400">For Distilleries</Link></li>
                <li><Link href="/api" className="hover:text-amber-400">API Access</Link></li>
                <li><Link href="/pricing" className="hover:text-amber-400">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-500">
                <li><Link href="/about" className="hover:text-amber-400">About</Link></li>
                <li><Link href="/blog" className="hover:text-amber-400">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-amber-400">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-amber-400">Careers</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-500 text-sm">
              © 2024 BarrelVerse • A CR AudioViz AI Platform • Made with 🥃 in Florida
            </p>
            <div className="flex gap-6 text-sm text-gray-500 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-amber-400">Privacy</Link>
              <Link href="/terms" className="hover:text-amber-400">Terms</Link>
              <Link href="/cookies" className="hover:text-amber-400">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

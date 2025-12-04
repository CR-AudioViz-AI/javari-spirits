'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-amber-950/10 to-stone-950 text-white">
      {/* Navigation */}
      <header className="border-b border-amber-900/30 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold text-amber-500 flex items-center gap-2">
                🥃 BarrelVerse
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/spirits" className="hover:text-amber-400 transition-colors">Explore</Link>
                <Link href="/museum" className="hover:text-amber-400 transition-colors">Museum</Link>
                <Link href="/games" className="hover:text-amber-400 transition-colors">Games</Link>
                <Link href="/tour" className="hover:text-amber-400 transition-colors">Tours</Link>
                <Link href="/today" className="hover:text-amber-400 transition-colors">Today</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/scanner" className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <span>📸</span> Scan
              </Link>
              <Link href="/auth/signup" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg font-semibold transition-colors">
                Join Free
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-gradient-to-r from-amber-600 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-bold mb-6">
              🏆 THE WORLDS #1 SPIRITS PLATFORM
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Discover. Collect. <span className="text-amber-400">Experience.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Track your collection, explore 500+ years of history, walk through virtual distilleries, 
              and connect with 75,000+ spirits enthusiasts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="bg-amber-600 hover:bg-amber-500 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-amber-600/30">
                Start Your Collection
              </Link>
              <Link href="/museum" className="bg-white/10 hover:bg-white/20 backdrop-blur px-8 py-4 rounded-xl font-bold text-lg transition-all border border-white/20">
                🏛️ Explore Museum
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gradient-to-r from-amber-900/50 via-stone-800/50 to-amber-900/50 border-y border-amber-500/30 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-amber-400">12,847</div>
              <div className="text-xs md:text-sm text-gray-400">Spirits Catalogued</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-amber-400">75,432</div>
              <div className="text-xs md:text-sm text-gray-400">Collectors</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-amber-400">$47.8M</div>
              <div className="text-xs md:text-sm text-gray-400">Collection Value</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-amber-400">892,156</div>
              <div className="text-xs md:text-sm text-gray-400">Bottles Tracked</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-amber-400">200/day</div>
              <div className="text-xs md:text-sm text-gray-400">New Additions</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-amber-400">89</div>
              <div className="text-xs md:text-sm text-gray-400">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need in One Place</h2>
            <p className="text-xl text-gray-400">The ultimate platform for spirits enthusiasts</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link href="/museum" className="group bg-stone-800/50 rounded-2xl p-8 border border-stone-700/50 hover:border-amber-500/50 transition-all hover:scale-105">
              <div className="text-5xl mb-4">🏛️</div>
              <h3 className="text-xl font-bold mb-2">Virtual Museum</h3>
              <p className="text-gray-400 mb-4">Walk through 500+ years of spirits history. Explore artifacts, labels, and stories.</p>
              <span className="text-amber-400">Explore →</span>
            </Link>

            <Link href="/tour" className="group bg-stone-800/50 rounded-2xl p-8 border border-stone-700/50 hover:border-amber-500/50 transition-all hover:scale-105">
              <div className="text-5xl mb-4">🏭</div>
              <h3 className="text-xl font-bold mb-2">Distillery Tours</h3>
              <p className="text-gray-400 mb-4">Step inside legendary distilleries. Experience the sights, sounds, and stories.</p>
              <span className="text-amber-400">Explore →</span>
            </Link>

            <Link href="/scanner" className="group bg-stone-800/50 rounded-2xl p-8 border border-stone-700/50 hover:border-amber-500/50 transition-all hover:scale-105">
              <div className="text-5xl mb-4">📸</div>
              <h3 className="text-xl font-bold mb-2">Bottle Scanner</h3>
              <p className="text-gray-400 mb-4">Scan any bottle to instantly add it to your collection and check prices.</p>
              <span className="text-amber-400">Explore →</span>
            </Link>

            <Link href="/collection" className="group bg-stone-800/50 rounded-2xl p-8 border border-stone-700/50 hover:border-amber-500/50 transition-all hover:scale-105">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Collection Tracker</h3>
              <p className="text-gray-400 mb-4">Track every bottle you own. Monitor values and showcase your collection.</p>
              <span className="text-amber-400">Explore →</span>
            </Link>

            <Link href="/games" className="group bg-stone-800/50 rounded-2xl p-8 border border-stone-700/50 hover:border-amber-500/50 transition-all hover:scale-105">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-xl font-bold mb-2">Games and Trivia</h3>
              <p className="text-gray-400 mb-4">12+ games to test your knowledge. Earn XP, unlock badges, and compete.</p>
              <span className="text-amber-400">Explore →</span>
            </Link>

            <Link href="/flavors" className="group bg-stone-800/50 rounded-2xl p-8 border border-stone-700/50 hover:border-amber-500/50 transition-all hover:scale-105">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Flavor Explorer</h3>
              <p className="text-gray-400 mb-4">Discover your palate profile and find spirits that match your taste.</p>
              <span className="text-amber-400">Explore →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Daily Content */}
      <section className="py-20 bg-stone-800/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-amber-900/50 to-stone-800/50 rounded-2xl p-6 border border-amber-500/30">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📅</span>
                <h3 className="font-bold">Today in History</h3>
              </div>
              <div className="text-4xl font-bold text-amber-400 mb-2">1933</div>
              <h4 className="text-xl font-bold mb-2">Prohibition Ends!</h4>
              <p className="text-gray-400 text-sm mb-4">The 21st Amendment is ratified, ending 13 years of Prohibition.</p>
              <Link href="/today" className="text-amber-400 hover:text-amber-300 text-sm">See more history →</Link>
            </div>

            <div className="bg-gradient-to-br from-stone-800/50 to-amber-900/30 rounded-2xl p-6 border border-stone-700/50">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⭐</span>
                <h3 className="font-bold">Featured Spirit</h3>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-20 bg-amber-900/50 rounded-lg flex items-center justify-center text-3xl">🥃</div>
                <div>
                  <h4 className="font-bold">Blantons Original</h4>
                  <p className="text-sm text-gray-400">Buffalo Trace</p>
                  <span className="text-amber-400">★ 92</span>
                </div>
              </div>
              <Link href="/spirits" className="text-amber-400 hover:text-amber-300 text-sm">View all spirits →</Link>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-stone-800/50 rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🧠</span>
                <h3 className="font-bold">Daily Trivia</h3>
              </div>
              <p className="text-lg mb-4">What percentage of the worlds bourbon is made in Kentucky?</p>
              <div className="bg-black/30 rounded-lg p-3 text-center mb-4">
                <span className="text-gray-500 text-sm">Answer: 95%</span>
              </div>
              <Link href="/trivia" className="text-purple-400 hover:text-purple-300 text-sm">Play more trivia →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Business Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">For Business</h2>
            <p className="text-xl text-gray-400">Connect with 75,000+ engaged spirits enthusiasts</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link href="/retailers" className="bg-gradient-to-br from-green-900/50 to-stone-800/50 rounded-2xl p-8 border border-green-500/30 hover:border-green-400/50 transition-all">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-2xl font-bold mb-2">For Retailers</h3>
              <p className="text-gray-400 mb-4">Get discovered when collectors search for bottles. Sync inventory and grow your customer base.</p>
              <span className="text-green-400">Learn more →</span>
            </Link>

            <Link href="/maker" className="bg-gradient-to-br from-blue-900/50 to-stone-800/50 rounded-2xl p-8 border border-blue-500/30 hover:border-blue-400/50 transition-all">
              <div className="text-4xl mb-4">🏭</div>
              <h3 className="text-2xl font-bold mb-2">For Distilleries</h3>
              <p className="text-gray-400 mb-4">Showcase your products, announce releases, and access detailed analytics.</p>
              <span className="text-blue-400">Learn more →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-amber-900/50 via-stone-800/50 to-amber-900/50 rounded-3xl p-12 border border-amber-500/30">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl text-gray-300 mb-8">Join 75,000+ spirits enthusiasts today. It is free!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="bg-amber-600 hover:bg-amber-500 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105">
                Create Free Account
              </Link>
              <Link href="/museum" className="bg-stone-700 hover:bg-stone-600 px-8 py-4 rounded-xl font-bold text-lg transition-all">
                Explore as Guest
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <Link href="/" className="text-2xl font-bold text-amber-500 flex items-center gap-2 mb-4">
                🥃 BarrelVerse
              </Link>
              <p className="text-gray-400 text-sm mb-4">The worlds number 1 spirits platform. Discover, collect, and experience the finest spirits from around the world.</p>
              <p className="text-gray-500 text-xs">A CR AudioViz AI Platform</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/spirits" className="hover:text-amber-400">All Spirits</Link></li>
                <li><Link href="/museum" className="hover:text-amber-400">Virtual Museum</Link></li>
                <li><Link href="/tour" className="hover:text-amber-400">Distillery Tours</Link></li>
                <li><Link href="/today" className="hover:text-amber-400">Today in History</Link></li>
                <li><Link href="/labels" className="hover:text-amber-400">Label Gallery</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Learn and Play</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/trivia" className="hover:text-amber-400">Trivia</Link></li>
                <li><Link href="/games" className="hover:text-amber-400">Games</Link></li>
                <li><Link href="/flavors" className="hover:text-amber-400">Flavor Wheel</Link></li>
                <li><Link href="/cocktails" className="hover:text-amber-400">Cocktails</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Business</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/retailers" className="hover:text-amber-400">For Retailers</Link></li>
                <li><Link href="/maker" className="hover:text-amber-400">For Brands</Link></li>
                <li><Link href="/referral" className="hover:text-amber-400">Referral Program</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-800 pt-8 text-center text-gray-500 text-sm">
            <p>© 2024 BarrelVerse. All rights reserved. Drink responsibly. Must be 21+.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

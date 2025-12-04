'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Wrapped data - would come from actual user data
const WRAPPED_DATA = {
  year: 2024,
  user: {
    name: 'BourbonCollector',
    avatar: '👨'
  },
  stats: {
    totalBottles: 34,
    totalTastings: 89,
    totalSpent: 4250,
    avgRating: 87,
    favoriteDistillery: 'Buffalo Trace',
    topProof: 137.7,
    daysActive: 245,
    bottlesOpened: 12
  },
  topSpirits: [
    { name: 'George T. Stagg', rating: 96, times: 5 },
    { name: 'Blanton\'s Original', rating: 88, times: 12 },
    { name: 'Buffalo Trace', rating: 85, times: 18 },
    { name: 'E.H. Taylor Small Batch', rating: 89, times: 8 },
    { name: 'Eagle Rare 10 Year', rating: 87, times: 10 }
  ],
  flavorProfile: {
    dominant: 'Caramel',
    secondary: ['Vanilla', 'Oak', 'Cherry'],
    preferredProof: '100-120',
    preferredAge: '8-12 years'
  },
  highlights: {
    bestFind: { name: 'Pappy Van Winkle 15', price: 119, date: 'October 15' },
    biggestSplurge: { name: 'George T. Stagg', price: 99, date: 'November 2' },
    mostTasted: { name: 'Buffalo Trace', times: 18 },
    rarestBottle: { name: 'Pappy Van Winkle 15', rarity: 'Unicorn' }
  },
  journey: [
    { month: 'Jan', bottles: 2, tastings: 5, value: 180 },
    { month: 'Feb', bottles: 3, tastings: 8, value: 290 },
    { month: 'Mar', bottles: 2, tastings: 6, value: 150 },
    { month: 'Apr', bottles: 4, tastings: 9, value: 420 },
    { month: 'May', bottles: 2, tastings: 7, value: 180 },
    { month: 'Jun', bottles: 3, tastings: 8, value: 250 },
    { month: 'Jul', bottles: 4, tastings: 10, value: 380 },
    { month: 'Aug', bottles: 2, tastings: 6, value: 210 },
    { month: 'Sep', bottles: 3, tastings: 7, value: 290 },
    { month: 'Oct', bottles: 4, tastings: 8, value: 550 },
    { month: 'Nov', bottles: 3, tastings: 9, value: 890 },
    { month: 'Dec', bottles: 2, tastings: 6, value: 460 }
  ],
  personality: 'The Bourbon Connoisseur',
  personalityDescription: 'You have excellent taste with a preference for classic Kentucky bourbons. Your palate gravitates toward rich, full-bodied pours with notes of caramel and vanilla.',
  funFacts: [
    'You\'ve tasted more bourbon this year than 94% of collectors',
    'Your favorite pour day is Saturday',
    'You prefer your bourbon neat 78% of the time',
    'October was your biggest bourbon month',
    'You added more Buffalo Trace products than any other distillery'
  ],
  badges: ['Century Club', 'Pappy Hunter', 'MSRP King', 'Whiskey Sommelier']
}

// Slide configurations
const SLIDES = [
  { id: 'intro', bg: 'from-amber-900 to-stone-900' },
  { id: 'total-bottles', bg: 'from-blue-900 to-purple-900' },
  { id: 'total-tastings', bg: 'from-green-900 to-teal-900' },
  { id: 'top-spirit', bg: 'from-amber-800 to-orange-900' },
  { id: 'flavor-profile', bg: 'from-pink-900 to-red-900' },
  { id: 'best-find', bg: 'from-yellow-900 to-amber-900' },
  { id: 'journey', bg: 'from-indigo-900 to-blue-900' },
  { id: 'personality', bg: 'from-purple-900 to-pink-900' },
  { id: 'fun-facts', bg: 'from-teal-900 to-green-900' },
  { id: 'badges', bg: 'from-amber-900 to-yellow-900' },
  { id: 'summary', bg: 'from-stone-900 to-amber-900' }
]

export default function WrappedPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const goToSlide = (direction: 'next' | 'prev') => {
    if (isAnimating) return
    setIsAnimating(true)
    
    if (direction === 'next' && currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1)
    } else if (direction === 'prev' && currentSlide > 0) {
      setCurrentSlide(prev => prev - 1)
    }
    
    setTimeout(() => setIsAnimating(false), 500)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') goToSlide('next')
      if (e.key === 'ArrowLeft') goToSlide('prev')
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentSlide, isAnimating])

  const slide = SLIDES[currentSlide]

  const renderSlideContent = () => {
    switch (slide.id) {
      case 'intro':
        return (
          <div className="text-center">
            <div className="text-9xl mb-6">🥃</div>
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              Your {WRAPPED_DATA.year} Bourbon Year
            </h1>
            <p className="text-2xl text-gray-300">Wrapped</p>
            <p className="text-gray-500 mt-8">Tap or use arrows to continue</p>
          </div>
        )
      
      case 'total-bottles':
        return (
          <div className="text-center">
            <p className="text-2xl text-gray-400 mb-4">This year you added</p>
            <p className="text-9xl font-bold text-white mb-4 animate-bounce">
              {WRAPPED_DATA.stats.totalBottles}
            </p>
            <p className="text-3xl">bottles to your collection</p>
            <p className="text-gray-400 mt-8">
              That's ${WRAPPED_DATA.stats.totalSpent.toLocaleString()} invested in liquid gold
            </p>
          </div>
        )
      
      case 'total-tastings':
        return (
          <div className="text-center">
            <p className="text-2xl text-gray-400 mb-4">You logged</p>
            <p className="text-9xl font-bold text-white mb-4">
              {WRAPPED_DATA.stats.totalTastings}
            </p>
            <p className="text-3xl">tasting notes</p>
            <p className="text-gray-400 mt-8">
              With an average rating of {WRAPPED_DATA.stats.avgRating}/100
            </p>
          </div>
        )
      
      case 'top-spirit':
        return (
          <div className="text-center">
            <p className="text-2xl text-gray-400 mb-4">Your #1 spirit was</p>
            <div className="text-8xl mb-6">🏆</div>
            <p className="text-5xl font-bold mb-2">{WRAPPED_DATA.topSpirits[0].name}</p>
            <p className="text-2xl text-gray-400">
              Tasted {WRAPPED_DATA.topSpirits[0].times} times • Rated {WRAPPED_DATA.topSpirits[0].rating}/100
            </p>
            <div className="mt-8 flex justify-center gap-4">
              {WRAPPED_DATA.topSpirits.slice(1, 4).map((spirit, i) => (
                <div key={i} className="bg-black/30 rounded-xl p-4">
                  <p className="text-gray-400">#{i + 2}</p>
                  <p className="font-bold">{spirit.name.split(' ')[0]}</p>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'flavor-profile':
        return (
          <div className="text-center">
            <p className="text-2xl text-gray-400 mb-4">Your palate craves</p>
            <p className="text-7xl font-bold mb-6">{WRAPPED_DATA.flavorProfile.dominant}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {WRAPPED_DATA.flavorProfile.secondary.map((flavor, i) => (
                <span key={i} className="bg-white/20 px-4 py-2 rounded-full text-lg">
                  {flavor}
                </span>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-black/30 rounded-xl p-4">
                <p className="text-gray-400">Preferred Proof</p>
                <p className="font-bold text-xl">{WRAPPED_DATA.flavorProfile.preferredProof}</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4">
                <p className="text-gray-400">Preferred Age</p>
                <p className="font-bold text-xl">{WRAPPED_DATA.flavorProfile.preferredAge}</p>
              </div>
            </div>
          </div>
        )
      
      case 'best-find':
        return (
          <div className="text-center">
            <p className="text-2xl text-gray-400 mb-4">Your best find was</p>
            <div className="text-8xl mb-4">🦄</div>
            <p className="text-5xl font-bold mb-2">{WRAPPED_DATA.highlights.bestFind.name}</p>
            <p className="text-3xl text-green-400">at ${WRAPPED_DATA.highlights.bestFind.price}</p>
            <p className="text-gray-400 mt-4">{WRAPPED_DATA.highlights.bestFind.date}</p>
            <div className="mt-8 bg-black/30 rounded-xl p-4 max-w-md mx-auto">
              <p className="text-sm text-gray-400">Secondary market value: ~$1,850</p>
              <p className="text-green-400 font-bold">You saved $1,731! 🎉</p>
            </div>
          </div>
        )
      
      case 'journey':
        return (
          <div className="text-center">
            <p className="text-2xl text-gray-400 mb-6">Your {WRAPPED_DATA.year} journey</p>
            <div className="h-48 flex items-end justify-between gap-1 max-w-2xl mx-auto mb-4">
              {WRAPPED_DATA.journey.map((month, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-amber-600 to-yellow-400 rounded-t transition-all"
                    style={{ height: `${(month.value / 1000) * 100}%` }}
                  />
                  <span className="text-xs mt-2">{month.month}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-400">
              October was your biggest bourbon month with ${WRAPPED_DATA.journey[9].value} invested
            </p>
          </div>
        )
      
      case 'personality':
        return (
          <div className="text-center">
            <p className="text-2xl text-gray-400 mb-4">You are</p>
            <p className="text-5xl font-bold mb-6">{WRAPPED_DATA.personality}</p>
            <div className="text-8xl mb-6">🎩</div>
            <p className="text-xl text-gray-300 max-w-lg mx-auto">
              {WRAPPED_DATA.personalityDescription}
            </p>
          </div>
        )
      
      case 'fun-facts':
        return (
          <div className="text-center">
            <p className="text-2xl text-gray-400 mb-6">Fun facts about your year</p>
            <div className="space-y-4 max-w-lg mx-auto">
              {WRAPPED_DATA.funFacts.map((fact, i) => (
                <div key={i} className="bg-black/30 rounded-xl p-4 text-left flex items-start gap-3">
                  <span className="text-2xl">
                    {['📊', '📅', '🥃', '📈', '🏭'][i]}
                  </span>
                  <p>{fact}</p>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'badges':
        return (
          <div className="text-center">
            <p className="text-2xl text-gray-400 mb-6">Badges earned in {WRAPPED_DATA.year}</p>
            <div className="flex flex-wrap justify-center gap-4">
              {WRAPPED_DATA.badges.map((badge, i) => (
                <div key={i} className="bg-black/30 rounded-xl p-6">
                  <div className="text-5xl mb-2">
                    {['💯', '👴', '💰', '🎓'][i]}
                  </div>
                  <p className="font-bold">{badge}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-400 mt-8">
              You're in the top 6% of collectors!
            </p>
          </div>
        )
      
      case 'summary':
        return (
          <div className="text-center">
            <p className="text-2xl mb-4">That's a wrap on {WRAPPED_DATA.year}!</p>
            <div className="text-8xl mb-6">🥂</div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
              <div className="bg-black/30 rounded-xl p-4">
                <p className="text-4xl font-bold text-amber-400">{WRAPPED_DATA.stats.totalBottles}</p>
                <p className="text-sm text-gray-400">Bottles</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4">
                <p className="text-4xl font-bold text-amber-400">{WRAPPED_DATA.stats.totalTastings}</p>
                <p className="text-sm text-gray-400">Tastings</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4">
                <p className="text-4xl font-bold text-amber-400">${(WRAPPED_DATA.stats.totalSpent / 1000).toFixed(1)}k</p>
                <p className="text-sm text-gray-400">Invested</p>
              </div>
              <div className="bg-black/30 rounded-xl p-4">
                <p className="text-4xl font-bold text-amber-400">{WRAPPED_DATA.badges.length}</p>
                <p className="text-sm text-gray-400">Badges</p>
              </div>
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-amber-600 hover:bg-amber-500 px-8 py-4 rounded-xl font-bold text-lg transition-colors"
            >
              📤 Share Your Wrapped
            </button>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 text-white overflow-hidden">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex gap-1 p-2">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all ${
              i <= currentSlide ? 'bg-amber-400' : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Main Content */}
      <div 
        className={`min-h-screen bg-gradient-to-br ${slide.bg} flex items-center justify-center p-8 transition-all duration-500`}
        onClick={() => goToSlide('next')}
      >
        <div className={`max-w-4xl mx-auto transition-all duration-500 ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}>
          {renderSlideContent()}
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-4">
        <button
          onClick={(e) => { e.stopPropagation(); goToSlide('prev') }}
          disabled={currentSlide === 0}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            currentSlide === 0 ? 'bg-white/10 text-gray-600' : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          ←
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); goToSlide('next') }}
          disabled={currentSlide === SLIDES.length - 1}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            currentSlide === SLIDES.length - 1 ? 'bg-white/10 text-gray-600' : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          →
        </button>
      </div>

      {/* Exit Button */}
      <Link
        href="/"
        className="fixed top-4 right-4 z-50 bg-black/50 p-2 rounded-full hover:bg-black/70"
      >
        ✕
      </Link>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-800 rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Share Your Wrapped 📤</h2>
            
            {/* Preview Card */}
            <div className="bg-gradient-to-br from-amber-900 to-stone-900 rounded-xl p-6 mb-6 text-center">
              <p className="text-sm text-gray-400 mb-2">My {WRAPPED_DATA.year} Bourbon Wrapped</p>
              <div className="flex justify-around mb-4">
                <div>
                  <p className="text-2xl font-bold text-amber-400">{WRAPPED_DATA.stats.totalBottles}</p>
                  <p className="text-xs text-gray-500">Bottles</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">{WRAPPED_DATA.stats.totalTastings}</p>
                  <p className="text-xs text-gray-500">Tastings</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">{WRAPPED_DATA.badges.length}</p>
                  <p className="text-xs text-gray-500">Badges</p>
                </div>
              </div>
              <p className="text-sm">🥃 BarrelVerse</p>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-semibold">
                📘 Facebook
              </button>
              <button className="bg-sky-500 hover:bg-sky-400 py-3 rounded-xl font-semibold">
                𝕏 Twitter
              </button>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 py-3 rounded-xl font-semibold">
                📸 Instagram
              </button>
              <button className="bg-orange-600 hover:bg-orange-500 py-3 rounded-xl font-semibold">
                🤖 Reddit
              </button>
            </div>

            <button className="w-full bg-stone-700 hover:bg-stone-600 py-3 rounded-xl font-semibold mb-4">
              📥 Download as Image
            </button>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full text-gray-500 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

// Card templates
const CARD_TEMPLATES = [
  { id: 'classic', name: 'Classic', bg: 'from-amber-900 to-stone-900', accent: 'amber' },
  { id: 'dark', name: 'Dark Mode', bg: 'from-stone-900 to-black', accent: 'white' },
  { id: 'premium', name: 'Premium Gold', bg: 'from-yellow-700 via-amber-600 to-yellow-700', accent: 'black' },
  { id: 'vintage', name: 'Vintage', bg: 'from-amber-800 to-red-900', accent: 'cream' },
  { id: 'modern', name: 'Modern', bg: 'from-slate-800 to-slate-900', accent: 'cyan' },
  { id: 'bourbon', name: 'Bourbon Trail', bg: 'from-amber-950 via-amber-900 to-amber-950', accent: 'gold' }
]

// Mock user data
const MOCK_USER = {
  name: 'BourbonCollector',
  level: 42,
  memberSince: '2022',
  totalBottles: 127,
  totalValue: 28450,
  uniqueDistilleries: 34,
  rarest: 'Pappy Van Winkle 23 Year',
  favoriteCategory: 'Bourbon',
  topRated: { name: 'George T. Stagg 2021', rating: 97 },
  achievements: ['Century Club', 'Pappy Hunter', 'BTAC Complete'],
  badges: ['🏆', '👑', '💎', '🔥', '⭐']
}

const SHARE_STATS = [
  { label: 'Bottles', value: '127', icon: '🥃' },
  { label: 'Value', value: '$28.4K', icon: '💰' },
  { label: 'Distilleries', value: '34', icon: '🏭' },
  { label: 'Rating Avg', value: '89.2', icon: '⭐' }
]

export default function ShareCardsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('classic')
  const [cardType, setCardType] = useState<'collection' | 'bottle' | 'achievement' | 'stats'>('collection')
  const [showBadges, setShowBadges] = useState(true)
  const [showValue, setShowValue] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const template = CARD_TEMPLATES.find(t => t.id === selectedTemplate) || CARD_TEMPLATES[0]

  const generateCard = () => {
    setIsGenerating(true)
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false)
      // In production, this would use html2canvas or similar
      alert('Card generated! In production, this would download as PNG or share directly.')
    }, 1500)
  }

  const shareToSocial = (platform: string) => {
    const shareText = `Check out my whiskey collection on BarrelVerse! 🥃 ${MOCK_USER.totalBottles} bottles worth $${MOCK_USER.totalValue.toLocaleString()}. Join me!`
    const shareUrl = 'https://barrelverse.com/u/bourboncollector'
    
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    }
    
    window.open(urls[platform], '_blank', 'width=600,height=400')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-purple-950/20 to-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-purple-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-4">
            <Link href="/collection" className="hover:text-amber-400 transition-colors">Collection</Link>
            <Link href="/community" className="hover:text-amber-400 transition-colors">Community</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-4">
            📸 SHARE YOUR COLLECTION
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Create <span className="text-purple-400">Viral Share Cards</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Generate beautiful, shareable cards showcasing your collection, 
            achievements, and rare finds. Perfect for social media!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Card Preview */}
          <div>
            <h2 className="text-lg font-bold mb-4">Preview</h2>
            <div
              ref={cardRef}
              className={`aspect-square rounded-2xl bg-gradient-to-br ${template.bg} p-8 relative overflow-hidden`}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 text-9xl rotate-12">🥃</div>
                <div className="absolute bottom-4 left-4 text-6xl -rotate-12">🥃</div>
              </div>
              
              <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{MOCK_USER.name}</h3>
                      <p className="text-sm opacity-75">Level {MOCK_USER.level} Collector</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-amber-400">🥃 BarrelVerse</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 flex-1">
                  {SHARE_STATS.map((stat, i) => (
                    <div key={i} className="bg-black/30 rounded-xl p-4 flex flex-col justify-center">
                      <span className="text-3xl mb-1">{stat.icon}</span>
                      <span className="text-2xl font-bold">{stat.value}</span>
                      <span className="text-sm opacity-75">{stat.label}</span>
                    </div>
                  ))}
                </div>

                {/* Badges */}
                {showBadges && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    {MOCK_USER.badges.map((badge, i) => (
                      <span key={i} className="text-3xl">{badge}</span>
                    ))}
                  </div>
                )}

                {/* Rarest Bottle */}
                <div className="mt-4 bg-amber-500/20 rounded-lg p-3 text-center">
                  <span className="text-xs opacity-75">RAREST BOTTLE</span>
                  <p className="font-bold">{MOCK_USER.rarest}</p>
                </div>

                {/* Footer */}
                <div className="mt-4 text-center text-sm opacity-50">
                  barrelverse.com/u/{MOCK_USER.name.toLowerCase()}
                </div>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => shareToSocial('facebook')}
                className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                📘 Facebook
              </button>
              <button
                onClick={() => shareToSocial('twitter')}
                className="flex-1 bg-sky-500 hover:bg-sky-400 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                🐦 Twitter
              </button>
              <button
                onClick={() => shareToSocial('reddit')}
                className="flex-1 bg-orange-600 hover:bg-orange-500 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                🤖 Reddit
              </button>
            </div>
          </div>

          {/* Customization Options */}
          <div className="space-y-6">
            {/* Card Type */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4">Card Type</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'collection', name: 'Collection Stats', icon: '📊' },
                  { id: 'bottle', name: 'Single Bottle', icon: '🥃' },
                  { id: 'achievement', name: 'Achievement', icon: '🏆' },
                  { id: 'stats', name: 'Year in Review', icon: '📅' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setCardType(type.id as typeof cardType)}
                    className={`p-4 rounded-lg text-left transition-all ${
                      cardType === type.id
                        ? 'bg-purple-600 border-2 border-purple-400'
                        : 'bg-stone-700/50 hover:bg-stone-600/50 border-2 border-transparent'
                    }`}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <p className="font-medium mt-1">{type.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Selection */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4">Style Template</h3>
              <div className="grid grid-cols-3 gap-3">
                {CARD_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`p-3 rounded-lg transition-all ${
                      selectedTemplate === t.id
                        ? 'ring-2 ring-purple-400'
                        : ''
                    }`}
                  >
                    <div className={`w-full aspect-video rounded bg-gradient-to-br ${t.bg}`} />
                    <p className="text-xs mt-2 text-center">{t.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4">Options</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Show Badges</span>
                  <button
                    onClick={() => setShowBadges(!showBadges)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      showBadges ? 'bg-purple-600' : 'bg-stone-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      showBadges ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Show Value</span>
                  <button
                    onClick={() => setShowValue(!showValue)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      showValue ? 'bg-purple-600' : 'bg-stone-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      showValue ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateCard}
              disabled={isGenerating}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                isGenerating
                  ? 'bg-stone-700 cursor-wait'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
              }`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Generating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  📸 Download Card
                </span>
              )}
            </button>

            {/* Share Message Templates */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4">📝 Share Templates</h3>
              <div className="space-y-3">
                {[
                  "Just hit 100+ bottles in my collection! 🥃 Check out my stats on BarrelVerse!",
                  "My whiskey collection is now worth more than my car 😂 Track yours at BarrelVerse!",
                  "Finally found my white whale! 🐋🥃 #BourbonHunting",
                  "Who else is tracking their collection? Found the perfect app!"
                ].map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => navigator.clipboard.writeText(msg)}
                    className="w-full text-left bg-stone-700/50 hover:bg-stone-600/50 rounded-lg p-3 text-sm transition-colors"
                  >
                    {msg}
                    <span className="text-xs text-gray-500 block mt-1">Click to copy</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Inspiration Gallery */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">🔥 Community Cards</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gradient-to-br from-amber-900/50 to-stone-800 rounded-xl flex items-center justify-center">
                <span className="text-4xl opacity-50">📸</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

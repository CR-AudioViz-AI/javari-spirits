'use client'

// app/collection/page.tsx
// BarrelVerse Collection Page - REAL Database Integration

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCollection, CATEGORY_DISPLAY, RARITY_DISPLAY } from '@/lib/hooks/use-collection'
import { useAuth } from '@/lib/hooks/use-auth'
import type { SpiritCategory, Rarity } from '@/lib/types/database'

// Filter options
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'proof', label: 'Proof' },
  { value: 'age', label: 'Age' },
  { value: 'rarity', label: 'Rarity' },
  { value: 'collected', label: 'Recently Collected' },
]

export default function CollectionPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const {
    spirits,
    userCollection,
    loading: collectionLoading,
    error,
    refreshSpirits,
    addToCollection,
    removeFromCollection,
    isInCollection,
    getCollectionStats,
  } = useCollection()

  const [selectedCategory, setSelectedCategory] = useState<SpiritCategory | 'all'>('all')
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'all'>('all')
  const [sortBy, setSortBy] = useState('name')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showOnlyOwned, setShowOnlyOwned] = useState(false)

  const loading = authLoading || collectionLoading
  const stats = getCollectionStats()

  // Filter and sort spirits
  const filteredSpirits = spirits
    .filter((spirit) => {
      // Category filter
      if (selectedCategory !== 'all' && spirit.category !== selectedCategory) return false
      // Rarity filter
      if (selectedRarity !== 'all' && spirit.rarity !== selectedRarity) return false
      // Owned filter
      if (showOnlyOwned && !isInCollection(spirit.id)) return false
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          spirit.name.toLowerCase().includes(query) ||
          spirit.distillery.toLowerCase().includes(query) ||
          spirit.region?.toLowerCase().includes(query) ||
          spirit.flavor_notes?.some((note) => note.toLowerCase().includes(query))
        )
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'proof':
          return (b.proof || 0) - (a.proof || 0)
        case 'age':
          return (b.age_statement || 0) - (a.age_statement || 0)
        case 'rarity':
          const rarityOrder = ['common', 'uncommon', 'rare', 'ultra_rare', 'legendary']
          return rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity)
        case 'collected':
          const aCollected = userCollection.find((c) => c.spirit_id === a.id)?.collected_at || ''
          const bCollected = userCollection.find((c) => c.spirit_id === b.id)?.collected_at || ''
          return bCollected.localeCompare(aCollected)
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const handleCollectionToggle = async (spiritId: string) => {
    if (!user) return
    
    if (isInCollection(spiritId)) {
      await removeFromCollection(spiritId)
    } else {
      await addToCollection(spiritId)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <Link href="/" className="inline-flex items-center text-amber-300 hover:text-amber-200 mb-4">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold">🥃 Spirit Collection</h1>
            <p className="text-amber-200 mt-2">
              Discover and collect the world&apos;s finest spirits
            </p>
          </div>

          {/* Collection Stats */}
          {user && (
            <div className="flex gap-4 bg-stone-800/50 border border-amber-600/30 rounded-xl p-4">
              <div className="text-center px-4">
                <div className="text-2xl font-bold text-amber-400">{stats.owned}</div>
                <div className="text-xs text-stone-400">Collected</div>
              </div>
              <div className="text-center px-4 border-l border-stone-700">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-stone-400">Total</div>
              </div>
              <div className="text-center px-4 border-l border-stone-700">
                <div className="text-2xl font-bold text-green-400">{stats.percentage}%</div>
                <div className="text-xs text-stone-400">Complete</div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-stone-800/50 border border-amber-600/30 rounded-xl p-6 mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-amber-300 text-sm mb-1">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, distillery, region, or flavor..."
                className="w-full bg-stone-900 border border-amber-600/30 rounded-lg px-4 py-2 text-white placeholder-stone-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-amber-300 text-sm mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as SpiritCategory | 'all')}
                className="w-full bg-stone-900 border border-amber-600/30 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {Object.entries(CATEGORY_DISPLAY).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.icon} {info.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rarity Filter */}
            <div>
              <label className="block text-amber-300 text-sm mb-1">Rarity</label>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value as Rarity | 'all')}
                className="w-full bg-stone-900 border border-amber-600/30 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Rarities</option>
                {Object.entries(RARITY_DISPLAY).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.icon} {info.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-amber-300 text-sm mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-stone-900 border border-amber-600/30 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Controls */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-stone-700">
            {user && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyOwned}
                  onChange={(e) => setShowOnlyOwned(e.target.checked)}
                  className="w-4 h-4 rounded bg-stone-900 border-amber-600/30 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-stone-300">Show only collected</span>
              </label>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-amber-600 text-white' : 'bg-stone-700 text-stone-300'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-amber-600 text-white' : 'bg-stone-700 text-stone-300'}`}
              >
                List
              </button>
            </div>
            <span className="text-stone-400 text-sm">
              {filteredSpirits.length} spirits
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin text-5xl mb-4">🥃</div>
            <p className="text-xl text-amber-200">Loading spirits...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border border-red-600 rounded-xl p-6 mb-8 text-center">
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={refreshSpirits}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredSpirits.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">No spirits found</h3>
            <p className="text-stone-400">Try adjusting your filters or search query</p>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && !loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSpirits.map((spirit) => {
              const owned = isInCollection(spirit.id)
              const rarityInfo = RARITY_DISPLAY[spirit.rarity]
              const categoryInfo = CATEGORY_DISPLAY[spirit.category]

              return (
                <div
                  key={spirit.id}
                  className={`bg-stone-800/50 border rounded-xl overflow-hidden transition-all hover:scale-105 ${
                    owned ? 'border-amber-500' : 'border-stone-700'
                  }`}
                >
                  {/* Image Placeholder */}
                  <div className={`h-48 bg-gradient-to-br ${rarityInfo?.bgGradient || 'from-stone-700 to-stone-800'} flex items-center justify-center relative`}>
                    <span className="text-6xl">{categoryInfo?.icon || '🥃'}</span>
                    {owned && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded text-xs font-bold">
                        ✓ OWNED
                      </div>
                    )}
                    <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-bold ${rarityInfo?.bgColor || 'bg-stone-600'}`}>
                      {rarityInfo?.icon} {rarityInfo?.name}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate">{spirit.name}</h3>
                    <p className="text-stone-400 text-sm mb-2">{spirit.distillery}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3 text-xs">
                      {spirit.proof && (
                        <span className="bg-stone-700 px-2 py-1 rounded">{spirit.proof}° Proof</span>
                      )}
                      {spirit.age_statement && (
                        <span className="bg-stone-700 px-2 py-1 rounded">{spirit.age_statement} Years</span>
                      )}
                      {spirit.region && (
                        <span className="bg-stone-700 px-2 py-1 rounded">{spirit.region}</span>
                      )}
                    </div>

                    {/* Flavor Notes */}
                    {spirit.flavor_notes && spirit.flavor_notes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {spirit.flavor_notes.slice(0, 3).map((note, idx) => (
                          <span key={idx} className="text-xs bg-amber-600/20 text-amber-300 px-2 py-0.5 rounded">
                            {note}
                          </span>
                        ))}
                        {spirit.flavor_notes.length > 3 && (
                          <span className="text-xs text-stone-500">+{spirit.flavor_notes.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Collection Button */}
                    {user ? (
                      <button
                        onClick={() => handleCollectionToggle(spirit.id)}
                        className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                          owned
                            ? 'bg-stone-700 hover:bg-red-600/50 text-stone-300 hover:text-white'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}
                      >
                        {owned ? 'Remove' : 'Add to Collection'}
                      </button>
                    ) : (
                      <Link
                        href="/auth/login"
                        className="block w-full py-2 rounded-lg font-semibold text-center bg-stone-700 hover:bg-stone-600 text-stone-300 transition-colors"
                      >
                        Sign in to Collect
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && !loading && (
          <div className="space-y-4">
            {filteredSpirits.map((spirit) => {
              const owned = isInCollection(spirit.id)
              const rarityInfo = RARITY_DISPLAY[spirit.rarity]
              const categoryInfo = CATEGORY_DISPLAY[spirit.category]

              return (
                <div
                  key={spirit.id}
                  className={`bg-stone-800/50 border rounded-xl p-4 flex items-center gap-4 transition-all ${
                    owned ? 'border-amber-500' : 'border-stone-700'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${rarityInfo?.bgGradient || 'from-stone-700 to-stone-800'} flex items-center justify-center shrink-0`}>
                    <span className="text-3xl">{categoryInfo?.icon || '🥃'}</span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold truncate">{spirit.name}</h3>
                      {owned && (
                        <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-xs font-bold shrink-0">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-stone-400 text-sm">{spirit.distillery}</p>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs">
                      <span className={`px-2 py-0.5 rounded ${rarityInfo?.bgColor || 'bg-stone-600'}`}>
                        {rarityInfo?.name}
                      </span>
                      {spirit.proof && <span className="text-stone-400">{spirit.proof}°</span>}
                      {spirit.age_statement && <span className="text-stone-400">{spirit.age_statement}yr</span>}
                    </div>
                  </div>

                  {/* Action */}
                  {user && (
                    <button
                      onClick={() => handleCollectionToggle(spirit.id)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors shrink-0 ${
                        owned
                          ? 'bg-stone-700 hover:bg-red-600/50 text-stone-300'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
                      }`}
                    >
                      {owned ? 'Remove' : 'Add'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Sign In CTA */}
        {!user && !loading && (
          <div className="mt-12 bg-gradient-to-r from-amber-600/20 to-amber-800/20 border border-amber-600/30 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Start Your Collection</h3>
            <p className="text-stone-300 mb-6">
              Sign in to track your spirits, earn $PROOF tokens, and compete on the leaderboards!
            </p>
            <Link
              href="/auth/login"
              className="inline-block bg-amber-600 hover:bg-amber-700 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Sign In to Collect
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

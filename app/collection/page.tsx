'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useEffect, Suspense, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCollection, CATEGORY_DISPLAY, RARITY_DISPLAY } from '@/lib/hooks/use-collection'
import { useAuth } from '@/lib/hooks/use-auth'
import type { SpiritCategory, Rarity } from '@/lib/types/database'

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'proof', label: 'Proof' },
  { value: 'age', label: 'Age' },
  { value: 'rarity', label: 'Rarity' },
]

function getTastingNotes(spirit: { tasting_notes: unknown }): string[] {
  if (!spirit.tasting_notes) return []
  if (Array.isArray(spirit.tasting_notes)) return spirit.tasting_notes as string[]
  if (typeof spirit.tasting_notes === 'object') {
    const notes = spirit.tasting_notes as Record<string, unknown>
    return Object.values(notes).filter((v): v is string => typeof v === 'string')
  }
  return []
}

function CollectionContent() {
  const searchParams = useSearchParams()
  const { user, profile, loading: authLoading } = useAuth()
  const {
    items: collectionItems,
    spirits,
    isLoading: collectionLoading,
    error,
    stats,
    fetchSpirits,
    addToCollection,
    removeFromCollection,
  } = useCollection(user?.id)

  // Initialize from URL params
  const initialCategory = searchParams?.get('category') as SpiritCategory | null
  const [selectedCategory, setSelectedCategory] = useState<SpiritCategory | 'all'>(initialCategory || 'all')
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'all'>('all')
  const [sortBy, setSortBy] = useState('name')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showOnlyOwned, setShowOnlyOwned] = useState(false)
  const [selectedSpirit, setSelectedSpirit] = useState<typeof spirits[0] | null>(null)

  // Update category when URL changes
  useEffect(() => {
    const urlCategory = searchParams?.get('category') as SpiritCategory | null
    if (urlCategory && Object.keys(CATEGORY_DISPLAY).includes(urlCategory)) {
      setSelectedCategory(urlCategory)
    }
  }, [searchParams])

  const loading = authLoading || collectionLoading

  const collectedSpiritIds = useMemo(() => {
    return new Set(collectionItems.map(item => item.spirit_id))
  }, [collectionItems])

  const isInCollection = useCallback((spiritId: string) => collectedSpiritIds.has(spiritId), [collectedSpiritIds])

  const filteredSpirits = useMemo(() => {
    let result = [...spirits]

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(spirit => spirit.category === selectedCategory)
    }

    // Rarity filter
    if (selectedRarity !== 'all') {
      result = result.filter(spirit => spirit.rarity === selectedRarity)
    }

    // Owned filter
    if (showOnlyOwned) {
      result = result.filter(spirit => isInCollection(spirit.id))
    }

    // Search filter - THIS IS THE KEY FIX
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(spirit =>
        spirit.name.toLowerCase().includes(query) ||
        spirit.brand?.toLowerCase() || ''.includes(query) ||
        spirit.distillery?.toLowerCase() || ''.includes(query) ||
        spirit.category.toLowerCase().includes(query) ||
        spirit.country?.toLowerCase().includes(query) ||
        spirit.region?.toLowerCase().includes(query)
      )
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'proof':
          return (b.proof || 0) - (a.proof || 0)
        case 'age':
          return (b.age_statement || 0) - (a.age_statement || 0)
        case 'rarity':
          const rarityOrder = ['common', 'uncommon', 'rare', 'very_rare', 'ultra_rare', 'legendary']
          return rarityOrder.indexOf(b.rarity || 'common') - rarityOrder.indexOf(a.rarity || 'common')
        default:
          return 0
      }
    })

    return result
  }, [spirits, selectedCategory, selectedRarity, showOnlyOwned, searchQuery, sortBy, isInCollection])

  const handleAddToCollection = async (spiritId: string) => {
    if (!user) {
      window.location.href = '/auth/login?redirect=/collection'
      return
    }
    await addToCollection(spiritId)
  }

  const handleRemoveFromCollection = async (spiritId: string) => {
    await removeFromCollection(spiritId)
  }

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search happens automatically via filteredSpirits
  }

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'bg-gray-500',
      uncommon: 'bg-green-500',
      rare: 'bg-blue-500',
      very_rare: 'bg-purple-500',
      ultra_rare: 'bg-orange-500',
      legendary: 'bg-yellow-500',
    }
    return colors[rarity] || 'bg-gray-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/" className="text-amber-300 hover:text-amber-200 text-sm">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold mt-2">Spirit Collection</h1>
            <p className="text-stone-400">Browse {spirits.length} premium spirits</p>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <div className="bg-stone-800/50 border border-amber-600/30 rounded-lg px-4 py-2">
                <span className="text-stone-400 text-sm">Your Collection: </span>
                <span className="text-amber-400 font-bold">{collectionItems.length} bottles</span>
              </div>
            </div>
          )}
        </div>

        {/* Search Bar - FIXED */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spirits by name, brand, distillery, country..."
              className="flex-1 px-4 py-3 bg-stone-800 border border-amber-600/30 rounded-lg text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold transition-colors"
            >
              🔍 Search
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Category Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-stone-400 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as SpiritCategory | 'all')}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded-lg focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_DISPLAY).map(([key, { label, icon }]) => (
                <option key={key} value={key}>{icon} {label}</option>
              ))}
            </select>
          </div>

          {/* Rarity Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-stone-400 mb-1">Rarity</label>
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value as Rarity | 'all')}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded-lg focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Rarities</option>
              {Object.entries(RARITY_DISPLAY).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm text-stone-400 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded-lg focus:border-amber-500 focus:outline-none"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* My Collection Toggle */}
          {user && (
            <div className="flex items-end">
              <button
                onClick={() => setShowOnlyOwned(!showOnlyOwned)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  showOnlyOwned 
                    ? 'bg-amber-600 border-amber-500' 
                    : 'bg-stone-800 border-stone-600 hover:border-amber-600'
                }`}
              >
                {showOnlyOwned ? '✓ My Collection' : 'My Collection'}
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-stone-400">
          Showing {filteredSpirits.length} of {spirits.length} spirits
          {searchQuery && <span> matching "{searchQuery}"</span>}
        </div>

        {/* Spirit Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin text-5xl">🥃</div>
          </div>
        ) : filteredSpirits.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-xl text-stone-400">No spirits found</p>
            <p className="text-stone-500 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSpirits.map((spirit) => {
              const inCollection = isInCollection(spirit.id)
              const notes = getTastingNotes(spirit)

              return (
                <div
                  key={spirit.id}
                  className={`bg-stone-800/50 border rounded-xl overflow-hidden hover:border-amber-500/50 transition-all cursor-pointer ${
                    inCollection ? 'border-amber-500/50' : 'border-amber-600/20'
                  }`}
                  onClick={() => setSelectedSpirit(spirit)}
                >
                  {/* Spirit Image/Icon */}
                  <div className="h-32 bg-gradient-to-br from-stone-700 to-stone-800 flex items-center justify-center text-5xl relative">
                    🥃
                    {inCollection && (
                      <div className="absolute top-2 right-2 bg-amber-600 rounded-full p-1">
                        <span className="text-sm">✓</span>
                      </div>
                    )}
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs ${getRarityColor(spirit.rarity || 'common')}`}>
                      {spirit.rarity}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate">{spirit.name}</h3>
                    <p className="text-stone-400 text-sm mb-2">{spirit.brand}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-amber-400">{spirit.proof}° • {spirit.category}</span>
                      {spirit.msrp && <span className="text-stone-500">${spirit.msrp}</span>}
                    </div>
                    {notes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {notes.slice(0, 3).map((note, i) => (
                          <span key={i} className="px-2 py-0.5 bg-stone-700 rounded text-xs text-stone-300">
                            {note}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Spirit Detail Modal */}
        {selectedSpirit && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSpirit(null)}>
            <div className="bg-stone-800 border border-amber-600/30 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedSpirit.name}</h2>
                    <p className="text-stone-400">{selectedSpirit.brand}</p>
                  </div>
                  <button onClick={() => setSelectedSpirit(null)} className="text-stone-400 hover:text-white text-2xl">×</button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-stone-400 text-sm">Category</p>
                      <p className="font-semibold">{selectedSpirit.category}</p>
                    </div>
                    <div>
                      <p className="text-stone-400 text-sm">Proof</p>
                      <p className="font-semibold">{selectedSpirit.proof}° ({selectedSpirit.abv}% ABV)</p>
                    </div>
                    {selectedSpirit.age_statement && (
                      <div>
                        <p className="text-stone-400 text-sm">Age</p>
                        <p className="font-semibold">{selectedSpirit.age_statement} years</p>
                      </div>
                    )}
                    {selectedSpirit.distillery && (
                      <div>
                        <p className="text-stone-400 text-sm">Distillery</p>
                        <p className="font-semibold">{selectedSpirit.distillery}</p>
                      </div>
                    )}
                    {selectedSpirit.country && (
                      <div>
                        <p className="text-stone-400 text-sm">Origin</p>
                        <p className="font-semibold">{selectedSpirit.region ? `${selectedSpirit.region}, ` : ''}{selectedSpirit.country}</p>
                      </div>
                    )}
                    {selectedSpirit.msrp && (
                      <div>
                        <p className="text-stone-400 text-sm">MSRP</p>
                        <p className="font-semibold text-amber-400">${selectedSpirit.msrp}</p>
                      </div>
                    )}
                  </div>

                  {selectedSpirit.description && (
                    <div>
                      <p className="text-stone-400 text-sm mb-1">Description</p>
                      <p className="text-stone-200">{selectedSpirit.description}</p>
                    </div>
                  )}

                  {getTastingNotes(selectedSpirit).length > 0 && (
                    <div>
                      <p className="text-stone-400 text-sm mb-2">Tasting Notes</p>
                      <div className="flex flex-wrap gap-2">
                        {getTastingNotes(selectedSpirit).map((note, i) => (
                          <span key={i} className="px-3 py-1 bg-amber-600/20 border border-amber-600/30 rounded-full text-sm">
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-stone-700">
                    {isInCollection(selectedSpirit.id) ? (
                      <button
                        onClick={() => handleRemoveFromCollection(selectedSpirit.id)}
                        className="w-full py-3 bg-red-600/20 border border-red-600 text-red-400 rounded-lg hover:bg-red-600/30"
                      >
                        Remove from Collection
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddToCollection(selectedSpirit.id)}
                        className="w-full py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold"
                      >
                        + Add to My Collection
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CollectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white flex items-center justify-center">
        <div className="animate-spin text-5xl">🥃</div>
      </div>
    }>
      <CollectionContent />
    </Suspense>
  )
}

'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useEffect, Suspense } from 'react'
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

  const isInCollection = (spiritId: string) => collectedSpiritIds.has(spiritId)

  const filteredSpirits = useMemo(() => {
    let result = [...spirits]

    if (selectedCategory !== 'all') {
      result = result.filter(spirit => spirit.category === selectedCategory)
    }

    if (selectedRarity !== 'all') {
      result = result.filter(spirit => spirit.rarity === selectedRarity)
    }

    if (showOnlyOwned) {
      result = result.filter(spirit => isInCollection(spirit.id))
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(spirit => {
        const notes = getTastingNotes(spirit)
        return (
          spirit.name.toLowerCase().includes(query) ||
          spirit.brand?.toLowerCase().includes(query) ||
          spirit.distillery?.toLowerCase().includes(query) ||
          spirit.region?.toLowerCase().includes(query) ||
          notes.some(note => note.toLowerCase().includes(query))
        )
      })
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'proof':
          return (b.proof || 0) - (a.proof || 0)
        case 'age':
          const ageA = parseInt(a.age_statement || '0')
          const ageB = parseInt(b.age_statement || '0')
          return ageB - ageA
        case 'rarity':
          const rarityOrder = ['legendary', 'ultra_rare', 'very_rare', 'rare', 'uncommon', 'common']
          return rarityOrder.indexOf(a.rarity || 'common') - rarityOrder.indexOf(b.rarity || 'common')
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return result
  }, [spirits, selectedCategory, selectedRarity, sortBy, searchQuery, showOnlyOwned, collectionItems])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is already reactive via searchQuery state
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
            <h1 className="text-3xl font-bold mt-2">🥃 Spirit Collection</h1>
            <p className="text-amber-200">Browse {spirits.length} premium spirits</p>
          </div>
          {user && stats && (
            <div className="flex gap-4 text-sm">
              <div className="bg-stone-800/50 rounded-lg px-4 py-2">
                <span className="text-amber-400 font-bold">{stats.uniqueSpirits}</span>
                <span className="text-stone-400 ml-1">Collected</span>
              </div>
            </div>
          )}
        </div>

        {/* Search & Filters */}
        <div className="bg-stone-800/50 border border-amber-600/30 rounded-xl p-4 mb-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, distillery, region, or tasting notes..."
              className="flex-1 px-4 py-3 bg-stone-900 border border-stone-700 rounded-lg focus:border-amber-500 focus:outline-none text-white placeholder-stone-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold transition-colors"
            >
              Search
            </button>
          </form>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm text-stone-400 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as SpiritCategory | 'all')}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {Object.entries(CATEGORY_DISPLAY).map(([key, info]) => (
                  <option key={key} value={key}>{info.icon} {info.label}</option>
                ))}
              </select>
            </div>

            {/* Rarity Filter */}
            <div>
              <label className="block text-sm text-stone-400 mb-1">Rarity</label>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value as Rarity | 'all')}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="all">All Rarities</option>
                {Object.entries(RARITY_DISPLAY).map(([key, info]) => (
                  <option key={key} value={key}>{info.label}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm text-stone-400 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* View Toggle */}
            <div>
              <label className="block text-sm text-stone-400 mb-1">View</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 py-2 rounded-lg text-sm ${viewMode === 'grid' ? 'bg-amber-600' : 'bg-stone-700 hover:bg-stone-600'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-2 rounded-lg text-sm ${viewMode === 'list' ? 'bg-amber-600' : 'bg-stone-700 hover:bg-stone-600'}`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategory !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-700">
              <span className="text-sm text-stone-400">Active filters:</span>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="px-2 py-1 bg-amber-600/20 border border-amber-600/50 rounded text-amber-400 text-sm flex items-center gap-1"
                >
                  {CATEGORY_DISPLAY[selectedCategory]?.label} ×
                </button>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2 py-1 bg-amber-600/20 border border-amber-600/50 rounded text-amber-400 text-sm flex items-center gap-1"
                >
                  "{searchQuery}" ×
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <p className="text-stone-400 mb-4">
          Showing {filteredSpirits.length} spirit{filteredSpirits.length !== 1 ? 's' : ''}
        </p>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin text-5xl mb-4">🥃</div>
            <p>Loading spirits...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-8">
            <p className="text-red-200">{error instanceof Error ? error.message : String(error)}</p>
          </div>
        )}

        {/* Grid View */}
        {!loading && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSpirits.map((spirit) => {
              const categoryInfo = CATEGORY_DISPLAY[spirit.category]
              const rarityInfo = RARITY_DISPLAY[spirit.rarity || 'common']
              const notes = getTastingNotes(spirit)
              const inCollection = isInCollection(spirit.id)

              return (
                <div
                  key={spirit.id}
                  className={`bg-stone-800/50 border rounded-xl overflow-hidden hover:border-amber-500/50 transition-all ${inCollection ? 'border-green-500/50' : 'border-amber-600/30'}`}
                >
                  {/* Image placeholder */}
                  <div className="h-40 bg-gradient-to-br from-stone-700 to-stone-800 flex items-center justify-center">
                    <span className="text-6xl">{categoryInfo?.icon || '🥃'}</span>
                  </div>
                  
                  <div className="p-4">
                    {/* Badges */}
                    <div className="flex gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${rarityInfo?.bgClass || 'bg-stone-600'} ${rarityInfo?.color || 'text-white'}`}>
                        {rarityInfo?.label}
                      </span>
                      {inCollection && (
                        <span className="px-2 py-0.5 rounded text-xs bg-green-600 text-white">
                          ✓ Owned
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-lg mb-1 line-clamp-1">{spirit.name}</h3>
                    <p className="text-stone-400 text-sm mb-2">{spirit.brand}</p>
                    
                    <div className="flex gap-3 text-sm text-stone-400 mb-3">
                      {spirit.proof && <span>{spirit.proof}° proof</span>}
                      {spirit.age_statement && <span>{spirit.age_statement}</span>}
                    </div>

                    {notes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {notes.slice(0, 3).map((note, i) => (
                          <span key={i} className="px-2 py-0.5 bg-stone-700 rounded text-xs text-stone-300">
                            {note}
                          </span>
                        ))}
                      </div>
                    )}

                    {user && (
                      <button
                        onClick={() => inCollection ? removeFromCollection(spirit.id) : addToCollection(spirit.id)}
                        className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                          inCollection
                            ? 'bg-stone-700 hover:bg-red-600/50 text-stone-300'
                            : 'bg-amber-600 hover:bg-amber-700 text-white'
                        }`}
                      >
                        {inCollection ? 'Remove from Collection' : '+ Add to Collection'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* List View */}
        {!loading && viewMode === 'list' && (
          <div className="space-y-3">
            {filteredSpirits.map((spirit) => {
              const categoryInfo = CATEGORY_DISPLAY[spirit.category]
              const rarityInfo = RARITY_DISPLAY[spirit.rarity || 'common']
              const notes = getTastingNotes(spirit)
              const inCollection = isInCollection(spirit.id)

              return (
                <div
                  key={spirit.id}
                  className={`bg-stone-800/50 border rounded-xl p-4 flex items-center gap-4 hover:border-amber-500/50 transition-all ${inCollection ? 'border-green-500/50' : 'border-amber-600/30'}`}
                >
                  <div className="w-16 h-16 bg-stone-700 rounded-lg flex items-center justify-center text-3xl shrink-0">
                    {categoryInfo?.icon || '🥃'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold truncate">{spirit.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${rarityInfo?.bgClass || 'bg-stone-600'} ${rarityInfo?.color || 'text-white'}`}>
                        {rarityInfo?.label}
                      </span>
                      {inCollection && (
                        <span className="px-2 py-0.5 rounded text-xs bg-green-600 text-white">✓</span>
                      )}
                    </div>
                    <p className="text-stone-400 text-sm">{spirit.brand} • {categoryInfo?.label}</p>
                    <div className="flex gap-4 text-sm text-stone-500 mt-1">
                      {spirit.proof && <span>{spirit.proof}°</span>}
                      {spirit.age_statement && <span>{spirit.age_statement}</span>}
                      {spirit.region && <span>{spirit.region}</span>}
                    </div>
                  </div>

                  {user && (
                    <button
                      onClick={() => inCollection ? removeFromCollection(spirit.id) : addToCollection(spirit.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold shrink-0 ${
                        inCollection
                          ? 'bg-stone-700 hover:bg-red-600/50 text-stone-300'
                          : 'bg-amber-600 hover:bg-amber-700 text-white'
                      }`}
                    >
                      {inCollection ? 'Remove' : '+ Add'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredSpirits.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-xl mb-2">No spirits found</p>
            <p className="text-stone-400">Try adjusting your filters or search terms</p>
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

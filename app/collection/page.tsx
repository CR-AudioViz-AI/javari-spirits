// app/collection/page.tsx
// BarrelVerse Collection Page - REAL Database Integration

export const dynamic = 'force-dynamic'

'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCollection, CATEGORY_DISPLAY, RARITY_DISPLAY } from '@/lib/hooks/use-collection'
import { useAuth } from '@/lib/hooks/use-auth'
import type { SpiritCategory, Rarity, Spirit, CollectionItemWithSpirit } from '@/lib/types/database'

// Add Bottle Modal Component
function AddBottleModal({
  isOpen,
  onClose,
  spirits,
  onAdd,
  onSearch,
}: {
  isOpen: boolean
  onClose: () => void
  spirits: Spirit[]
  onAdd: (spiritId: string, details: { purchasePrice?: number; purchaseLocation?: string }) => Promise<{ success: boolean }>
  onSearch: (search: string, category?: SpiritCategory) => void
}) {
  const [selectedSpirit, setSelectedSpirit] = useState<Spirit | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [purchaseLocation, setPurchaseLocation] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<SpiritCategory | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    const debounce = setTimeout(() => {
      onSearch(searchQuery, selectedCategory || undefined)
    }, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, selectedCategory, onSearch])

  if (!isOpen) return null

  const handleAdd = async () => {
    if (!selectedSpirit) return
    setIsAdding(true)
    
    const result = await onAdd(selectedSpirit.id, {
      purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
      purchaseLocation: purchaseLocation || undefined,
    })

    if (result.success) {
      setSelectedSpirit(null)
      setPurchasePrice('')
      setPurchaseLocation('')
      setSearchQuery('')
      onClose()
    }
    setIsAdding(false)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Add to Collection</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {!selectedSpirit ? (
            <>
              {/* Search & Filter */}
              <div className="mb-4 flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search spirits..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                />
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value as SpiritCategory || null)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">All Categories</option>
                  {Object.keys(CATEGORY_DISPLAY).map(cat => (
                    <option key={cat} value={cat}>
                      {CATEGORY_DISPLAY[cat as SpiritCategory].icon} {CATEGORY_DISPLAY[cat as SpiritCategory].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Results */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {spirits.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Search for a spirit to add</p>
                ) : (
                  spirits.map(spirit => (
                    <button
                      key={spirit.id}
                      onClick={() => setSelectedSpirit(spirit)}
                      className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{CATEGORY_DISPLAY[spirit.category]?.icon}</span>
                        <div>
                          <p className="font-medium text-white">{spirit.name}</p>
                          <p className="text-sm text-gray-400">
                            {spirit.brand} • {spirit.distillery || spirit.region}
                            {spirit.msrp && ` • $${spirit.msrp}`}
                          </p>
                        </div>
                        <span className={`ml-auto px-2 py-0.5 rounded text-xs ${RARITY_DISPLAY[spirit.rarity].bgClass} text-white`}>
                          {RARITY_DISPLAY[spirit.rarity].label}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              {/* Selected Spirit Details */}
              <button
                onClick={() => setSelectedSpirit(null)}
                className="text-gray-400 hover:text-white mb-4"
              >
                ← Back to Search
              </button>

              <div className="bg-gray-800 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{CATEGORY_DISPLAY[selectedSpirit.category]?.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedSpirit.name}</h3>
                    <p className="text-gray-400">{selectedSpirit.brand}</p>
                    <div className="flex gap-2 mt-2">
                      {selectedSpirit.proof && (
                        <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                          {selectedSpirit.proof} proof
                        </span>
                      )}
                      {selectedSpirit.age_statement && (
                        <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                          {selectedSpirit.age_statement}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs ${RARITY_DISPLAY[selectedSpirit.rarity].bgClass} text-white`}>
                        {RARITY_DISPLAY[selectedSpirit.rarity].label}
                      </span>
                    </div>
                  </div>
                </div>
                {selectedSpirit.description && (
                  <p className="text-gray-400 text-sm mt-4">{selectedSpirit.description}</p>
                )}
              </div>

              {/* Purchase Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Purchase Price (optional)</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder={selectedSpirit.msrp ? `MSRP: $${selectedSpirit.msrp}` : 'Enter price'}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Purchase Location (optional)</label>
                  <input
                    type="text"
                    value={purchaseLocation}
                    onChange={(e) => setPurchaseLocation(e.target.value)}
                    placeholder="Where did you buy it?"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                onClick={handleAdd}
                disabled={isAdding}
                className="w-full mt-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 rounded-xl text-white font-medium transition-colors"
              >
                {isAdding ? 'Adding...' : 'Add to Collection'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Bottle Card Component
function BottleCard({
  item,
  onUpdate,
  onRemove,
}: {
  item: CollectionItemWithSpirit
  onUpdate: (id: string, updates: { isOpened?: boolean; personalRating?: number }) => void
  onRemove: (id: string) => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-amber-500/50 transition-all">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className="text-3xl">{CATEGORY_DISPLAY[item.spirit.category]?.icon}</span>
          <span className={`px-2 py-0.5 rounded text-xs ${RARITY_DISPLAY[item.spirit.rarity].bgClass} text-white`}>
            {RARITY_DISPLAY[item.spirit.rarity].label}
          </span>
        </div>
        
        <h3 className="font-bold text-white text-lg leading-tight mb-1">
          {item.spirit.name}
        </h3>
        <p className="text-sm text-gray-400">{item.spirit.brand}</p>
        
        <div className="flex gap-2 mt-3">
          {item.spirit.proof && (
            <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
              {item.spirit.proof}°
            </span>
          )}
          {item.is_opened && (
            <span className="px-2 py-0.5 bg-amber-900/50 rounded text-xs text-amber-300">
              Opened
            </span>
          )}
          {item.quantity > 1 && (
            <span className="px-2 py-0.5 bg-blue-900/50 rounded text-xs text-blue-300">
              x{item.quantity}
            </span>
          )}
        </div>

        {/* Fill Level Bar */}
        {item.is_opened && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Fill Level</span>
              <span>{item.current_fill_level}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${item.current_fill_level}%` }}
              />
            </div>
          </div>
        )}

        {/* Personal Rating */}
        {item.personal_rating && (
          <div className="mt-3 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < item.personal_rating! ? 'text-amber-400' : 'text-gray-600'}>
                ★
              </span>
            ))}
            <span className="text-sm text-gray-400 ml-1">{item.personal_rating}/5</span>
          </div>
        )}

        {/* Value */}
        <div className="mt-3 flex justify-between text-sm">
          <span className="text-gray-500">Value</span>
          <span className="text-green-400">
            ${(item.purchase_price || item.spirit.msrp || 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-700 p-3 flex gap-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
        >
          Details
        </button>
        {!item.is_opened && (
          <button
            onClick={() => onUpdate(item.id, { isOpened: true })}
            className="flex-1 py-2 bg-amber-600/20 hover:bg-amber-600/30 rounded-lg text-sm text-amber-400 transition-colors"
          >
            Open
          </button>
        )}
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="border-t border-gray-700 p-4 bg-gray-900/50">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {item.spirit.distillery && (
              <div>
                <p className="text-gray-500">Distillery</p>
                <p className="text-white">{item.spirit.distillery}</p>
              </div>
            )}
            {item.spirit.region && (
              <div>
                <p className="text-gray-500">Region</p>
                <p className="text-white">{item.spirit.region}</p>
              </div>
            )}
            {item.spirit.age_statement && (
              <div>
                <p className="text-gray-500">Age</p>
                <p className="text-white">{item.spirit.age_statement}</p>
              </div>
            )}
            {item.purchase_date && (
              <div>
                <p className="text-gray-500">Purchased</p>
                <p className="text-white">{new Date(item.purchase_date).toLocaleDateString()}</p>
              </div>
            )}
            {item.purchase_location && (
              <div className="col-span-2">
                <p className="text-gray-500">Location</p>
                <p className="text-white">{item.purchase_location}</p>
              </div>
            )}
            {item.personal_notes && (
              <div className="col-span-2">
                <p className="text-gray-500">Notes</p>
                <p className="text-white">{item.personal_notes}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              if (confirm('Remove this bottle from your collection?')) {
                onRemove(item.id)
              }
            }}
            className="mt-4 w-full py-2 bg-red-900/30 hover:bg-red-900/50 rounded-lg text-sm text-red-400 transition-colors"
          >
            Remove from Collection
          </button>
        </div>
      )}
    </div>
  )
}

export default function CollectionPage() {
  const { user, profile, isAuthenticated, isVerified } = useAuth()
  const collection = useCollection(user?.id)
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [filterCategory, setFilterCategory] = useState<SpiritCategory | ''>('')
  const [filterRarity, setFilterRarity] = useState<Rarity | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'value' | 'rating'>('date')

  // Filter and sort items
  const filteredItems = collection.filterCollection({
    category: filterCategory || undefined,
    rarity: filterRarity || undefined,
    search: searchQuery || undefined,
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.spirit.name.localeCompare(b.spirit.name)
      case 'value':
        return (b.purchase_price || b.spirit.msrp || 0) - (a.purchase_price || a.spirit.msrp || 0)
      case 'rating':
        return (b.personal_rating || 0) - (a.personal_rating || 0)
      case 'date':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  // Not authenticated view
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-6xl mb-6 block">📦</span>
          <h1 className="text-3xl font-bold text-white mb-4">Your Collection Awaits</h1>
          <p className="text-gray-400 mb-8">
            Sign in to start tracking your spirits collection, rate bottles, and discover new favorites.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-8 py-3 bg-amber-600 hover:bg-amber-700 rounded-xl text-white font-medium transition-colors"
          >
            Sign In to Get Started
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">📦 My Collection</h1>
            <p className="text-gray-400">
              {collection.stats.totalBottles} bottles • ${collection.stats.totalValue.toLocaleString()} estimated value
            </p>
          </div>
          <button
            onClick={() => {
              collection.fetchSpirits()
              setShowAddModal(true)
            }}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-xl text-white font-medium transition-colors"
          >
            + Add Bottle
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-3xl font-bold text-white">{collection.stats.uniqueSpirits}</p>
            <p className="text-sm text-gray-400">Unique Bottles</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-3xl font-bold text-green-400">${collection.stats.totalValue.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Total Value</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-3xl font-bold text-amber-400">{collection.stats.sealedCount}</p>
            <p className="text-sm text-gray-400">Sealed</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-3xl font-bold text-blue-400">{collection.stats.openedCount}</p>
            <p className="text-sm text-gray-400">Opened</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collection..."
            className="flex-1 min-w-[200px] bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as SpiritCategory | '')}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none"
          >
            <option value="">All Categories</option>
            {Object.keys(CATEGORY_DISPLAY).map(cat => (
              <option key={cat} value={cat}>
                {CATEGORY_DISPLAY[cat as SpiritCategory].icon} {CATEGORY_DISPLAY[cat as SpiritCategory].label}
              </option>
            ))}
          </select>
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value as Rarity | '')}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none"
          >
            <option value="">All Rarities</option>
            {Object.keys(RARITY_DISPLAY).map(rar => (
              <option key={rar} value={rar}>{RARITY_DISPLAY[rar as Rarity].label}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none"
          >
            <option value="date">Recently Added</option>
            <option value="name">Name A-Z</option>
            <option value="value">Highest Value</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Collection Grid */}
        {collection.isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your collection...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">🍾</span>
            <h2 className="text-2xl font-bold text-white mb-2">
              {collection.items.length === 0 ? 'Start Your Collection' : 'No Matches Found'}
            </h2>
            <p className="text-gray-400 mb-6">
              {collection.items.length === 0
                ? 'Add your first bottle to begin tracking your spirits journey.'
                : 'Try adjusting your filters or search query.'}
            </p>
            {collection.items.length === 0 && (
              <button
                onClick={() => {
                  collection.fetchSpirits()
                  setShowAddModal(true)
                }}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-xl text-white font-medium transition-colors"
              >
                + Add Your First Bottle
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <BottleCard
                key={item.id}
                item={item}
                onUpdate={async (id, updates) => {
                  await collection.updateCollectionItem(id, updates)
                }}
                onRemove={async (id) => {
                  await collection.removeFromCollection(id)
                }}
              />
            ))}
          </div>
        )}

        {/* Category Breakdown */}
        {collection.items.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-4">Collection by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(collection.stats.categoryCounts).map(([cat, count]) => (
                <div key={cat} className="bg-gray-800 rounded-xl p-4 text-center">
                  <span className="text-2xl block mb-1">{CATEGORY_DISPLAY[cat as SpiritCategory]?.icon}</span>
                  <p className="text-xl font-bold text-white">{count}</p>
                  <p className="text-xs text-gray-400">{CATEGORY_DISPLAY[cat as SpiritCategory]?.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Bottle Modal */}
      <AddBottleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        spirits={collection.spirits}
        onAdd={collection.addToCollection}
        onSearch={(search, category) => collection.fetchSpirits(category, search)}
      />
    </main>
  )
}

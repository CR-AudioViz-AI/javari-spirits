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

function CollectionContent() {
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const {
    items: collectionItems,
    spirits,
    isLoading: collectionLoading,
    addToCollection,
    removeFromCollection,
  } = useCollection(user?.id)

  const initialCategory = searchParams?.get('category') as SpiritCategory | null
  const [selectedCategory, setSelectedCategory] = useState<SpiritCategory | 'all'>(initialCategory || 'all')
  const [selectedRarity, setSelectedRarity] = useState<Rarity | 'all'>('all')
  const [sortBy, setSortBy] = useState('name')
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyOwned, setShowOnlyOwned] = useState(false)
  const [selectedSpirit, setSelectedSpirit] = useState<typeof spirits[0] | null>(null)

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

    if (selectedCategory !== 'all') {
      result = result.filter(spirit => spirit.category === selectedCategory)
    }

    if (selectedRarity !== 'all') {
      result = result.filter(spirit => spirit.rarity === selectedRarity)
    }

    if (showOnlyOwned) {
      result = result.filter(spirit => isInCollection(spirit.id))
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(spirit => {
        const name = (spirit.name || '').toLowerCase()
        const brand = (spirit.brand || '').toLowerCase()
        const distillery = (spirit.distillery || '').toLowerCase()
        const category = (spirit.category || '').toLowerCase()
        const country = (spirit.country || '').toLowerCase()
        const region = (spirit.region || '').toLowerCase()
        
        return name.includes(query) ||
          brand.includes(query) ||
          distillery.includes(query) ||
          category.includes(query) ||
          country.includes(query) ||
          region.includes(query)
      })
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'proof':
          return (Number(b.proof) || 0) - (Number(a.proof) || 0)
        case 'age':
          return (Number(b.age_statement) || 0) - (Number(a.age_statement) || 0)
        case 'rarity': {
          const rarityOrder = ['common', 'uncommon', 'rare', 'very_rare', 'ultra_rare', 'legendary']
          return rarityOrder.indexOf(b.rarity || 'common') - rarityOrder.indexOf(a.rarity || 'common')
        }
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

  const getRarityColor = (rarity: string | null | undefined) => {
    const colors: Record<string, string> = {
      common: 'bg-gray-500',
      uncommon: 'bg-green-500',
      rare: 'bg-blue-500',
      very_rare: 'bg-purple-500',
      ultra_rare: 'bg-orange-500',
      legendary: 'bg-yellow-500',
    }
    return colors[rarity || 'common'] || 'bg-gray-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/" className="text-amber-300 hover:text-amber-200 text-sm">← Back to Home</Link>
            <h1 className="text-3xl font-bold mt-2">Spirit Collection</h1>
            <p className="text-stone-400">Browse {spirits.length} premium spirits</p>
          </div>
          {user && (
            <div className="bg-stone-800/50 border border-amber-600/30 rounded-lg px-4 py-2">
              <span className="text-stone-400 text-sm">Your Collection: </span>
              <span className="text-amber-400 font-bold">{collectionItems.length} bottles</span>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spirits by name, brand, distillery, country..."
              className="flex-1 px-4 py-3 bg-stone-800 border border-amber-600/30 rounded-lg text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
            <button className="px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold">🔍 Search</button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
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

          {user && (
            <div className="flex items-end">
              <button
                onClick={() => setShowOnlyOwned(!showOnlyOwned)}
                className={`px-4 py-2 rounded-lg border ${showOnlyOwned ? 'bg-amber-600 border-amber-500' : 'bg-stone-800 border-stone-600 hover:border-amber-600'}`}
              >
                {showOnlyOwned ? '✓ My Collection' : 'My Collection'}
              </button>
            </div>
          )}
        </div>

        <div className="mb-4 text-stone-400">
          Showing {filteredSpirits.length} of {spirits.length} spirits
          {searchQuery && <span> matching &quot;{searchQuery}&quot;</span>}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin text-5xl">🥃</div></div>
        ) : filteredSpirits.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-xl text-stone-400">No spirits found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSpirits.map((spirit) => {
              const inCollection = isInCollection(spirit.id)
              return (
                <div
                  key={spirit.id}
                  className={`bg-stone-800/50 border rounded-xl overflow-hidden hover:border-amber-500/50 cursor-pointer ${inCollection ? 'border-amber-500/50' : 'border-amber-600/20'}`}
                  onClick={() => setSelectedSpirit(spirit)}
                >
                  <div className="h-32 bg-gradient-to-br from-stone-700 to-stone-800 flex items-center justify-center text-5xl relative">
                    🥃
                    {inCollection && <div className="absolute top-2 right-2 bg-amber-600 rounded-full p-1"><span className="text-sm">✓</span></div>}
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs ${getRarityColor(spirit.rarity)}`}>{spirit.rarity || 'common'}</div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1 truncate">{spirit.name}</h3>
                    <p className="text-stone-400 text-sm mb-2">{spirit.brand || 'Unknown'}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-amber-400">{spirit.proof || 0}° • {spirit.category}</span>
                      {spirit.msrp && <span className="text-stone-500">${spirit.msrp}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {selectedSpirit && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSpirit(null)}>
            <div className="bg-stone-800 border border-amber-600/30 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedSpirit.name}</h2>
                    <p className="text-stone-400">{selectedSpirit.brand || 'Unknown Brand'}</p>
                  </div>
                  <button onClick={() => setSelectedSpirit(null)} className="text-stone-400 hover:text-white text-2xl">×</button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-stone-400 text-sm">Category</p><p className="font-semibold">{selectedSpirit.category}</p></div>
                    <div><p className="text-stone-400 text-sm">Proof</p><p className="font-semibold">{selectedSpirit.proof || 0}° ({selectedSpirit.abv || 0}% ABV)</p></div>
                    {selectedSpirit.age_statement && <div><p className="text-stone-400 text-sm">Age</p><p className="font-semibold">{selectedSpirit.age_statement} years</p></div>}
                    {selectedSpirit.distillery && <div><p className="text-stone-400 text-sm">Distillery</p><p className="font-semibold">{selectedSpirit.distillery}</p></div>}
                    {selectedSpirit.country && <div><p className="text-stone-400 text-sm">Origin</p><p className="font-semibold">{selectedSpirit.region ? `${selectedSpirit.region}, ` : ''}{selectedSpirit.country}</p></div>}
                    {selectedSpirit.msrp && <div><p className="text-stone-400 text-sm">MSRP</p><p className="font-semibold text-amber-400">${selectedSpirit.msrp}</p></div>}
                  </div>
                  {selectedSpirit.description && <div><p className="text-stone-400 text-sm mb-1">Description</p><p className="text-stone-200">{selectedSpirit.description}</p></div>}
                  <div className="pt-4 border-t border-stone-700">
                    {isInCollection(selectedSpirit.id) ? (
                      <button onClick={() => handleRemoveFromCollection(selectedSpirit.id)} className="w-full py-3 bg-red-600/20 border border-red-600 text-red-400 rounded-lg hover:bg-red-600/30">Remove from Collection</button>
                    ) : (
                      <button onClick={() => handleAddToCollection(selectedSpirit.id)} className="w-full py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-semibold">+ Add to My Collection</button>
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
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white flex items-center justify-center"><div className="animate-spin text-5xl">🥃</div></div>}>
      <CollectionContent />
    </Suspense>
  )
}

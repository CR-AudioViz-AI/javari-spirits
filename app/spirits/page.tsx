'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Spirit {
  id: string
  name: string
  brand?: string
  category: string
  type?: string
  price?: number
  rating?: number
  description?: string
  image_url?: string
  proof?: number
  age?: string
  origin?: string
}

// FIXED: Generic spirit images that don't show branded products
// Using images that show glasses, barrels, or generic bottles - NOT specific brands
const SPIRIT_IMAGES: Record<string, string> = {
  bourbon: 'https://images.unsplash.com/photo-1598018553943-93a4a78f1e08?w=400&h=600&fit=crop',
  scotch: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=600&fit=crop',
  whiskey: 'https://images.unsplash.com/photo-1598018553943-93a4a78f1e08?w=400&h=600&fit=crop',
  wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=600&fit=crop',
  beer: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=600&fit=crop',
  rum: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=600&fit=crop',
  tequila: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=400&h=600&fit=crop',
  vodka: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=600&fit=crop',
  gin: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=600&fit=crop',
  cognac: 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400&h=600&fit=crop',
  brandy: 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=400&h=600&fit=crop',
  mezcal: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=400&h=600&fit=crop',
  sake: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=600&fit=crop',
  rye: 'https://images.unsplash.com/photo-1598018553943-93a4a78f1e08?w=400&h=600&fit=crop',
  irish: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=600&fit=crop',
  japanese: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=600&fit=crop',
  liqueur: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=600&fit=crop',
  other: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=600&fit=crop',
  default: 'https://images.unsplash.com/photo-1598018553943-93a4a78f1e08?w=400&h=600&fit=crop'
}

// Fallback featured spirits with real data
const FEATURED_SPIRITS: Spirit[] = [
  {
    id: 'bt-1',
    name: 'Buffalo Trace Kentucky Straight Bourbon',
    brand: 'Buffalo Trace',
    category: 'bourbon',
    type: 'Kentucky Straight Bourbon',
    price: 30,
    rating: 88,
    description: 'Sweet vanilla, caramel, and hints of mint with a smooth finish.',
    proof: 90,
    origin: 'Kentucky, USA'
  },
  {
    id: 'bl-1',
    name: "Blanton's Single Barrel",
    brand: "Blanton's",
    category: 'bourbon',
    type: 'Single Barrel Bourbon',
    price: 65,
    rating: 93,
    description: 'Complex with citrus, honey, vanilla, and a hint of nutmeg.',
    proof: 93,
    origin: 'Kentucky, USA'
  }
]

const CATEGORIES = [
  { id: 'all', name: 'All Spirits', icon: '🥃', color: 'amber' },
  { id: 'bourbon', name: 'Bourbon', icon: '🥃', color: 'amber' },
  { id: 'scotch', name: 'Scotch', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: 'amber' },
  { id: 'wine', name: 'Wine', icon: '🍷', color: 'red' },
  { id: 'beer', name: 'Beer', icon: '🍺', color: 'yellow' },
  { id: 'rum', name: 'Rum', icon: '🏝️', color: 'amber' },
  { id: 'tequila', name: 'Tequila', icon: '🌵', color: 'green' },
  { id: 'vodka', name: 'Vodka', icon: '❄️', color: 'blue' },
  { id: 'gin', name: 'Gin', icon: '🍸', color: 'green' },
  { id: 'cognac', name: 'Cognac', icon: '🍇', color: 'purple' },
  { id: 'other', name: 'Other', icon: '🍾', color: 'stone' },
]

export default function SpiritsPage() {
  const [spirits, setSpirits] = useState<Spirit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedSpirit, setSelectedSpirit] = useState<Spirit | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const ITEMS_PER_PAGE = 20

  const fetchSpirits = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/spirits?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch spirits')
      }

      const data = await response.json()
      
      if (data.spirits && data.spirits.length > 0) {
        setSpirits(data.spirits)
        setTotalCount(data.total)
        setCategoryCounts(data.categoryCounts || {})
      } else {
        const filtered = FEATURED_SPIRITS.filter(s => 
          selectedCategory === 'all' || s.category === selectedCategory
        ).filter(s =>
          !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setSpirits(filtered)
        setTotalCount(filtered.length)
        
        const counts: Record<string, number> = {}
        FEATURED_SPIRITS.forEach(s => {
          counts[s.category] = (counts[s.category] || 0) + 1
        })
        setCategoryCounts(counts)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      const filtered = FEATURED_SPIRITS.filter(s => 
        selectedCategory === 'all' || s.category === selectedCategory
      )
      setSpirits(filtered)
      setTotalCount(filtered.length)
      
      const counts: Record<string, number> = {}
      FEATURED_SPIRITS.forEach(s => {
        counts[s.category] = (counts[s.category] || 0) + 1
      })
      setCategoryCounts(counts)
    } finally {
      setLoading(false)
    }
  }, [page, selectedCategory, searchQuery])

  useEffect(() => {
    fetchSpirits()
  }, [fetchSpirits])

  // FIXED: Always return proper generic image based on category
  const getImageUrl = (spirit: Spirit) => {
    // Use the spirit's stored image_url if it's a valid generic URL
    // Otherwise fall back to our category defaults
    if (spirit.image_url && !spirit.image_url.includes('photo-1569529465841') && !spirit.image_url.includes('photo-1516535794938')) {
      return spirit.image_url
    }
    return SPIRIT_IMAGES[spirit.category] || SPIRIT_IMAGES.default
  }

  const sortedSpirits = [...spirits].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
    if (sortBy === 'price_low') return (a.price || 0) - (b.price || 0)
    if (sortBy === 'price_high') return (b.price || 0) - (a.price || 0)
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-amber-950/10 to-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-4">
            <Link href="/collection" className="hover:text-amber-400 transition-colors">My Collection</Link>
            <Link href="/stores" className="hover:text-amber-400 transition-colors">Find Stores</Link>
            <Link href="/auth/login" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg">Sign In</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-amber-900/20 to-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-amber-400 mb-4">Explore Our Spirit Collection</h1>
          <p className="text-stone-400 mb-8">{totalCount.toLocaleString()} spirits from around the world</p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search spirits..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="w-full px-4 py-3 bg-stone-800/50 border border-amber-900/30 rounded-lg focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id)
                setPage(1)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-800/50 hover:bg-stone-700/50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              <span className="text-sm opacity-70">
                {categoryCounts[cat.id] || (cat.id === 'all' ? totalCount : 0)}
              </span>
            </button>
          ))}
        </div>

        {/* Results Info & Sort */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-stone-400">
            Showing {sortedSpirits.length} spirits
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-stone-800 border border-stone-700 rounded-lg px-3 py-2"
          >
            <option value="rating">Highest Rated</option>
            <option value="name">Name A-Z</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        )}

        {/* Spirit Grid */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {sortedSpirits.map((spirit) => (
              <div
                key={spirit.id}
                className="bg-stone-800/50 rounded-lg overflow-hidden hover:bg-stone-700/50 transition-all cursor-pointer group"
                onClick={() => {
                  setSelectedSpirit(spirit)
                  setShowModal(true)
                }}
              >
                {/* Image */}
                <div className="aspect-[3/4] relative overflow-hidden bg-stone-900">
                  <img
                    src={getImageUrl(spirit)}
                    alt={spirit.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = SPIRIT_IMAGES.default
                    }}
                  />
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate">{spirit.name}</h3>
                  <p className="text-sm text-stone-400">{spirit.brand || spirit.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalCount > ITEMS_PER_PAGE && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-stone-800 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {Math.ceil(totalCount / ITEMS_PER_PAGE)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(totalCount / ITEMS_PER_PAGE)}
              className="px-4 py-2 bg-stone-800 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedSpirit && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-stone-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex gap-6">
                <img
                  src={getImageUrl(selectedSpirit)}
                  alt={selectedSpirit.name}
                  className="w-48 h-64 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-amber-400 mb-2">{selectedSpirit.name}</h2>
                  <p className="text-stone-400 mb-4">{selectedSpirit.brand}</p>
                  <p className="text-stone-300 mb-4">{selectedSpirit.description}</p>
                  {selectedSpirit.price && (
                    <p className="text-xl text-amber-500">${selectedSpirit.price}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="mt-6 w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

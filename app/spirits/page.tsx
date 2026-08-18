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

  // Seed from the URL. This page ignored ?search= and ?category= entirely, so
  // every link into it — the homepage search box, the category pills, any shared
  // or bookmarked result — landed on an unfiltered list of 1.5M rows. Read from
  // window rather than useSearchParams to avoid forcing a Suspense boundary on
  // an already-dynamic route.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const q = p.get('search')
    const c = p.get('category')
    if (q) setSearchQuery(q)
    if (c) setSelectedCategory(c.toLowerCase())
  }, [])

  const fetchSpirits = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        sortBy: sortBy === 'rating' ? 'msrp' : sortBy === 'price_low' ? 'msrp' : 'name',
        sortOrder: sortBy === 'price_low' ? 'asc' : 'desc',
      })
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/spirits?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch spirits')
      }

      const data = await response.json()
      setSpirits(data.spirits || [])
      setTotalCount(data.total || 0)
      setCategoryCounts(data.categoryCounts || {})
    } catch (err) {
      console.error('Error fetching spirits:', err)
      setError('Failed to load spirits. Please try again.')
      setSpirits(FEATURED_SPIRITS)
    } finally {
      setLoading(false)
    }
  }, [page, selectedCategory, searchQuery, sortBy])

  useEffect(() => {
    fetchSpirits()
  }, [fetchSpirits])

  // FIXED: Use the actual image_url from the database - NO FALLBACKS
  // The database contains REAL product images from OpenFoodFacts, Buffalo Trace Media Kit, etc.
  const getImageUrl = (spirit: Spirit) => {
    // Return the database image_url directly - it has real product photos
    return spirit.image_url || '/placeholder-bottle.png'
  }

  const sortedSpirits = [...spirits].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
    if (sortBy === 'price_low') return (a.price || 0) - (b.price || 0)
    if (sortBy === 'price_high') return (b.price || 0) - (a.price || 0)
    return a.name.localeCompare(b.name)
  })

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const allCount = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-stone-950/95 backdrop-blur-md border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🥃</span>
              <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                BarrelVerse
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-stone-400 hover:text-amber-400 transition-colors">Home</Link>
              <Link href="/spirits" className="text-amber-400">Spirits</Link>
              <Link href="/collection" className="text-stone-400 hover:text-amber-400 transition-colors">Collection</Link>
              <Link href="/games" className="text-stone-400 hover:text-amber-400 transition-colors">Games</Link>
              <Link href="/academy" className="text-stone-400 hover:text-amber-400 transition-colors">Academy</Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/collection" className="text-stone-400 hover:text-amber-400 transition-colors">
                My Collection
              </Link>
              <Link href="/stores" className="text-stone-400 hover:text-amber-400 transition-colors">
                Find Stores
              </Link>
              <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all font-medium">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <p className="text-stone-400">{totalCount.toLocaleString()} spirits from around the world</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search spirits..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="w-full px-6 py-4 bg-stone-800/50 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id)
                  setPage(1)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-white'
                    : 'bg-stone-800/50 text-stone-400 hover:bg-stone-700/50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="text-sm opacity-75">
                  {cat.id === 'all' ? allCount : categoryCounts[cat.id] || 0}
                </span>
              </button>
            ))}
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-stone-800 rounded-full mt-4">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${((page - 1) * ITEMS_PER_PAGE + spirits.length) / totalCount * 100}%` }}
            />
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-stone-400">
            Showing {spirits.length} spirits
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-stone-800/50 border border-stone-700 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="rating">Highest Rated</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchSpirits}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Spirits Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {sortedSpirits.map((spirit) => (
              <div
                key={spirit.id}
                onClick={() => {
                  setSelectedSpirit(spirit)
                  setShowModal(true)
                }}
                className="group cursor-pointer bg-stone-800/30 rounded-xl overflow-hidden border border-stone-700/50 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10"
              >
                {/* Image */}
                <div className="aspect-[3/4] relative overflow-hidden bg-stone-900">
                  <img
                    src={getImageUrl(spirit)}
                    alt={spirit.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // If image fails, try a simple placeholder
                      (e.target as HTMLImageElement).src = '/placeholder-bottle.png'
                    }}
                  />
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate">{spirit.name}</h3>
                  <p className="text-sm text-stone-400 truncate">{spirit.brand || spirit.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-stone-800/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-700/50 transition-colors"
            >
              Previous
            </button>
            <span className="text-stone-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-stone-800/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-700/50 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Detail Modal */}
        {showModal && selectedSpirit && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <div 
              className="bg-stone-900 rounded-2xl max-w-2xl w-full p-6 border border-stone-700"
              onClick={(e) => e.stopPropagation()}
            >
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
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-stone-500">Category:</span>
                      <span className="ml-2 text-white capitalize">{selectedSpirit.category}</span>
                    </div>
                    {selectedSpirit.proof && (
                      <div>
                        <span className="text-stone-500">Proof:</span>
                        <span className="ml-2 text-white">{selectedSpirit.proof}</span>
                      </div>
                    )}
                    {selectedSpirit.price && (
                      <div>
                        <span className="text-stone-500">MSRP:</span>
                        <span className="ml-2 text-amber-400">${selectedSpirit.price}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-700 transition-all">
                  Add to Collection
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

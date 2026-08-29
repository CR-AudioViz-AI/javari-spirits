'use client'

import { useState, useEffect } from 'react'
import { 
  Wine, Camera, BarChart3, Search, Star, Heart,
  Plus, Grid, List, Map, TrendingUp, Award,
  DollarSign, Calendar, Filter, Share2
} from 'lucide-react'

// Import all new components
import BottleScanner from '@/components/BottleScanner'
import CollectionTracker from '@/components/CollectionTracker'

type ActiveTab = 'collection' | 'scanner' | 'discover' | 'wishlist' | 'stats'

interface BottleInfo {
  name: string
  distillery: string
  type: string
  age?: number
  proof: number
  msrp: number
  marketPrice: number
  rating: number
  rarity: 'common' | 'uncommon' | 'rare' | 'ultra-rare' | 'allocated'
  notes: string[]
  imageUrl?: string
  confidence: number
}

export default function JavariSpiritsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('collection')
  const [collection, setCollection] = useState<any[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [lastScannedBottle, setLastScannedBottle] = useState<BottleInfo | null>(null)

  // Featured bottles for discovery
  const featuredBottles: BottleInfo[] = [
    { name: 'Eagle Rare 10 Year', distillery: 'Buffalo Trace', type: 'bourbon', age: 10, proof: 90, msrp: 35, marketPrice: 55, rating: 4.3, rarity: 'uncommon', notes: ['Cherry', 'Vanilla', 'Leather'], confidence: 100 },
    { name: 'Four Roses Single Barrel', distillery: 'Four Roses', type: 'bourbon', proof: 100, msrp: 50, marketPrice: 52, rating: 4.4, rarity: 'common', notes: ['Fruit', 'Spice', 'Honey'], confidence: 100 },
    { name: 'Michters Small Batch', distillery: 'Michters', type: 'bourbon', proof: 91.4, msrp: 50, marketPrice: 70, rating: 4.2, rarity: 'uncommon', notes: ['Caramel', 'Dried fruit', 'Cinnamon'], confidence: 100 },
    { name: 'Woodford Reserve Double Oaked', distillery: 'Woodford Reserve', type: 'bourbon', proof: 90.4, msrp: 55, marketPrice: 58, rating: 4.5, rarity: 'common', notes: ['Vanilla', 'Apple', 'Spice'], confidence: 100 },
    { name: 'Knob Creek 12 Year', distillery: 'Beam Suntory', type: 'bourbon', age: 12, proof: 100, msrp: 60, marketPrice: 65, rating: 4.4, rarity: 'common', notes: ['Oak', 'Caramel', 'Nutty'], confidence: 100 },
    { name: 'Elijah Craig Small Batch', distillery: 'Heaven Hill', type: 'bourbon', proof: 94, msrp: 30, marketPrice: 32, rating: 4.2, rarity: 'common', notes: ['Vanilla', 'Caramel', 'Smoke'], confidence: 100 },
  ]

  // Handle bottle identification from scanner
  const handleBottleIdentified = (bottle: BottleInfo) => {
    setLastScannedBottle(bottle)
    console.log('Bottle identified:', bottle)
  }

  // Add scanned bottle to collection
  const addToCollection = (bottle: BottleInfo) => {
    const collectionBottle = {
      id: Date.now().toString(),
      name: bottle.name,
      distillery: bottle.distillery,
      type: bottle.type,
      age: bottle.age,
      proof: bottle.proof,
      purchasePrice: bottle.msrp,
      currentValue: bottle.marketPrice,
      msrp: bottle.msrp,
      rating: bottle.rating,
      rarity: bottle.rarity,
      dateAdded: new Date().toISOString(),
      notes: '',
      status: 'sealed' as const,
      quantity: 1
    }
    
    setCollection(prev => {
      const updated = [collectionBottle, ...prev]
      localStorage.setItem('spiritsCollection', JSON.stringify(updated))
      return updated
    })
    
    setActiveTab('collection')
  }

  // Add to wishlist
  const addToWishlist = (bottleName: string) => {
    setWishlist(prev => {
      if (prev.includes(bottleName)) return prev
      const updated = [...prev, bottleName]
      localStorage.setItem('spiritsWishlist', JSON.stringify(updated))
      return updated
    })
  }

  // Collection stats
  const stats = {
    totalBottles: collection.reduce((sum, b) => sum + (b.quantity || 1), 0),
    totalValue: collection.reduce((sum, b) => sum + ((b.currentValue || 0) * (b.quantity || 1)), 0),
    avgRating: collection.length > 0 
      ? collection.reduce((sum, b) => sum + (b.rating || 0), 0) / collection.length 
      : 0,
    rareCount: collection.filter(b => ['rare', 'ultra-rare', 'allocated'].includes(b.rarity)).length
  }

  const tabs = [
    { id: 'collection', label: 'Collection', icon: Wine },
    { id: 'scanner', label: 'Scan', icon: Camera },
    { id: 'discover', label: 'Discover', icon: Search },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ]

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      'common': 'bg-gray-100 text-gray-700',
      'uncommon': 'bg-green-100 text-green-700',
      'rare': 'bg-blue-100 text-blue-700',
      'ultra-rare': 'bg-purple-100 text-purple-700',
      'allocated': 'bg-amber-100 text-amber-700',
    }
    return colors[rarity] || colors.common
  }

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-800 to-orange-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Wine className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Javari Spirits</h1>
                <p className="text-amber-200 text-sm">Your Spirits Collection</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.totalBottles}</p>
                <p className="text-amber-200">Bottles</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</p>
                <p className="text-amber-200">Value</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 border-b border-amber-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-amber-100 dark:hover:bg-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Collection Tab */}
        {activeTab === 'collection' && (
          <CollectionTracker 
            initialCollection={collection}
            onCollectionChange={setCollection}
          />
        )}

        {/* Scanner Tab */}
        {activeTab === 'scanner' && (
          <div className="max-w-2xl mx-auto">
            <BottleScanner 
              onBottleIdentified={handleBottleIdentified}
              onAddToCollection={addToCollection}
            />
          </div>
        )}

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Discover Bottles</h2>
              <div className="flex gap-2">
                <button className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <Filter className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <Grid className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredBottles.map((bottle, index) => (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden">
                  <div className="aspect-[4/3] bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center">
                    <Wine className="w-16 h-16 text-amber-600/30" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{bottle.name}</h3>
                        <p className="text-sm text-gray-500">{bottle.distillery}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(bottle.rarity)}`}>
                        {bottle.rarity}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      {bottle.age && <span>{bottle.age} Years</span>}
                      <span>{bottle.proof} Proof</span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <Star className="w-4 h-4 fill-current" />
                        {bottle.rating}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {bottle.notes.slice(0, 3).map((note, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded">
                          {note}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div>
                        <p className="text-xs text-gray-400">MSRP: ${bottle.msrp}</p>
                        <p className="font-bold text-amber-600">${bottle.marketPrice} market</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => addToWishlist(bottle.name)}
                          className={`p-2 rounded-lg ${
                            wishlist.includes(bottle.name)
                              ? 'bg-pink-100 text-pink-600'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-pink-500'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${wishlist.includes(bottle.name) ? 'fill-current' : ''}`} />
                        </button>
                        <button 
                          onClick={() => addToCollection(bottle)}
                          className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                My Wishlist ({wishlist.length})
              </h2>
            </div>
            {wishlist.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {wishlist.map((name, index) => (
                  <div key={index} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wine className="w-8 h-8 text-amber-500" />
                      <span className="font-medium text-gray-900 dark:text-white">{name}</span>
                    </div>
                    <button
                      onClick={() => setWishlist(prev => prev.filter(n => n !== name))}
                      className="text-sm text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Heart className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500">Your wishlist is empty</p>
                <button 
                  onClick={() => setActiveTab('discover')}
                  className="mt-4 text-amber-600 hover:text-amber-700"
                >
                  Discover bottles to add
                </button>
              </div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm text-center">
                <Wine className="w-8 h-8 mx-auto text-amber-600 mb-2" />
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalBottles}</p>
                <p className="text-sm text-gray-500">Total Bottles</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm text-center">
                <DollarSign className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="text-3xl font-bold text-gray-900 dark:text-white">${stats.totalValue.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Collection Value</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm text-center">
                <Star className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgRating.toFixed(1)}</p>
                <p className="text-sm text-gray-500">Avg Rating</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm text-center">
                <Award className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.rareCount}</p>
                <p className="text-sm text-gray-500">Rare Bottles</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Collection by Type</h3>
              <div className="space-y-3">
                {['bourbon', 'scotch', 'rye', 'irish', 'japanese'].map(type => {
                  const count = collection.filter(b => b.type === type).length
                  const percentage = collection.length > 0 ? (count / collection.length) * 100 : 0
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{type}</span>
                        <span className="text-sm text-gray-500">{count} bottles</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

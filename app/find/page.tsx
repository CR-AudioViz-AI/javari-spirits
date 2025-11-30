'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Spirit = {
  id: string
  name: string
  brand: string
  category: string
  rarity: string
  msrp: number
  image_url: string | null
}

type Business = {
  id: string
  name: string
  business_type: string
  city: string
  state: string
  address_line1: string
  distance_miles?: number
  price?: number
  is_in_stock?: boolean
  is_on_sale?: boolean
}

export default function FindSpiritsPage() {
  const [spirits, setSpirits] = useState<Spirit[]>([])
  const [selectedSpirit, setSelectedSpirit] = useState<Spirit | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchingNearby, setSearchingNearby] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationError, setLocationError] = useState('')

  // Search spirits as user types
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSpirits([])
      return
    }

    const searchSpirits = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('bv_spirits')
        .select('id, name, brand, category, rarity, msrp, image_url')
        .or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`)
        .limit(10)

      if (!error && data) {
        setSpirits(data)
      }
      setLoading(false)
    }

    const debounce = setTimeout(searchSpirits, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  // Get user location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setLocationError('')
      },
      (error) => {
        setLocationError('Unable to get location. Please enable location services.')
      }
    )
  }

  // Search for spirit nearby
  const findNearby = async (spirit: Spirit) => {
    setSelectedSpirit(spirit)
    setSearchingNearby(true)
    setBusinesses([])

    if (!userLocation) {
      getUserLocation()
      setSearchingNearby(false)
      return
    }

    const supabase = createClient()
    
    // Use RPC function for distance search
    const { data, error } = await supabase
      .rpc('find_spirits_nearby', {
        p_spirit_id: spirit.id,
        p_lat: userLocation.lat,
        p_lng: userLocation.lng,
        p_radius_miles: 50
      })

    if (!error && data) {
      setBusinesses(data)
    }
    setSearchingNearby(false)
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
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-amber-300 hover:text-amber-200">
            ← Back to Home
          </Link>
          <Link 
            href="/business/register" 
            className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg text-sm"
          >
            List Your Business
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🔍 Find Spirits Near You</h1>
          <p className="text-xl text-amber-200">Search for any spirit and see which stores have it in stock</p>
        </div>

        {/* Search Box */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a spirit (e.g., Blanton's, Pappy, Macallan...)"
              className="w-full px-6 py-4 bg-stone-800 border border-amber-600/30 rounded-xl text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="animate-spin text-amber-400">⏳</div>
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {spirits.length > 0 && (
            <div className="mt-2 bg-stone-800 border border-amber-600/30 rounded-xl overflow-hidden">
              {spirits.map((spirit) => (
                <button
                  key={spirit.id}
                  onClick={() => {
                    findNearby(spirit)
                    setSpirits([])
                    setSearchQuery(spirit.name)
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-stone-700 border-b border-stone-700 last:border-0 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{spirit.name}</p>
                    <p className="text-sm text-stone-400">{spirit.brand} • {spirit.category}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs ${getRarityColor(spirit.rarity)}`}>
                      {spirit.rarity}
                    </span>
                    {spirit.msrp && (
                      <p className="text-sm text-amber-400 mt-1">${spirit.msrp}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location Permission */}
        {!userLocation && (
          <div className="max-w-2xl mx-auto mb-8 text-center">
            <button
              onClick={getUserLocation}
              className="bg-stone-800 border border-amber-600/30 hover:border-amber-500 px-6 py-3 rounded-xl"
            >
              📍 Enable Location to Find Nearby Stores
            </button>
            {locationError && (
              <p className="text-red-400 mt-2 text-sm">{locationError}</p>
            )}
          </div>
        )}

        {/* Selected Spirit Results */}
        {selectedSpirit && (
          <div className="max-w-4xl mx-auto">
            {/* Spirit Info Card */}
            <div className="bg-stone-800/50 border border-amber-600/30 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-stone-700 rounded-lg flex items-center justify-center text-4xl">
                  🥃
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{selectedSpirit.name}</h2>
                  <p className="text-stone-400">{selectedSpirit.brand} • {selectedSpirit.category}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-2 py-1 rounded text-xs ${getRarityColor(selectedSpirit.rarity)}`}>
                      {selectedSpirit.rarity}
                    </span>
                    {selectedSpirit.msrp && (
                      <span className="text-amber-400">MSRP: ${selectedSpirit.msrp}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    // TODO: Add alert
                    alert('Spirit alerts coming soon! We\'ll notify you when this bottle is available.')
                  }}
                  className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg"
                >
                  🔔 Set Alert
                </button>
              </div>
            </div>

            {/* Results */}
            <h3 className="text-xl font-bold mb-4">
              {searchingNearby ? (
                'Searching nearby stores...'
              ) : businesses.length > 0 ? (
                `Found at ${businesses.length} location${businesses.length !== 1 ? 's' : ''} near you`
              ) : (
                'No stores found with this spirit'
              )}
            </h3>

            {searchingNearby && (
              <div className="text-center py-12">
                <div className="animate-spin text-5xl mb-4">🔍</div>
                <p>Searching stores near you...</p>
              </div>
            )}

            {!searchingNearby && businesses.length === 0 && (
              <div className="bg-stone-800/50 border border-amber-600/30 rounded-xl p-8 text-center">
                <div className="text-5xl mb-4">😔</div>
                <p className="text-xl mb-4">No stores near you have this spirit listed</p>
                <p className="text-stone-400 mb-6">
                  Set an alert and we'll notify you when it becomes available
                </p>
                <button className="bg-amber-600 hover:bg-amber-700 px-6 py-3 rounded-lg">
                  🔔 Alert Me When Available
                </button>
              </div>
            )}

            {businesses.length > 0 && (
              <div className="space-y-4">
                {businesses.map((business) => (
                  <div 
                    key={business.id}
                    className="bg-stone-800/50 border border-amber-600/30 rounded-xl p-4 hover:border-amber-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-lg">{business.name}</h4>
                        <p className="text-stone-400 text-sm">
                          {business.address_line1}, {business.city}, {business.state}
                        </p>
                        <p className="text-amber-400 text-sm mt-1">
                          {business.distance_miles?.toFixed(1)} miles away • {business.business_type.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        {business.price && (
                          <p className="text-2xl font-bold text-white">${business.price}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {business.is_in_stock ? (
                            <span className="px-2 py-1 bg-green-600 rounded text-xs">In Stock</span>
                          ) : (
                            <span className="px-2 py-1 bg-red-600 rounded text-xs">Out of Stock</span>
                          )}
                          {business.is_on_sale && (
                            <span className="px-2 py-1 bg-amber-600 rounded text-xs">On Sale!</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 bg-stone-700 hover:bg-stone-600 px-4 py-2 rounded-lg text-sm">
                        📞 Call
                      </button>
                      <button className="flex-1 bg-stone-700 hover:bg-stone-600 px-4 py-2 rounded-lg text-sm">
                        📍 Directions
                      </button>
                      <button className="flex-1 bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg text-sm">
                        View Store
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA for Businesses */}
        {!selectedSpirit && (
          <div className="max-w-2xl mx-auto mt-16">
            <div className="bg-gradient-to-r from-amber-900/50 to-amber-800/50 border border-amber-600/30 rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Own a Bar, Restaurant, or Liquor Store?</h2>
              <p className="text-stone-300 mb-6">
                List your inventory and reach thousands of spirits enthusiasts actively searching for bottles near them.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/business/register"
                  className="bg-amber-600 hover:bg-amber-700 px-8 py-3 rounded-lg font-semibold"
                >
                  List Your Business Free
                </Link>
                <Link 
                  href="/business/pricing"
                  className="border border-amber-600 hover:bg-amber-600/10 px-8 py-3 rounded-lg"
                >
                  View Pricing Plans
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

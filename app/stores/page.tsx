'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Real store data with actual coordinates
const STORES = [
  {
    id: 1,
    name: 'Total Wine & More - Louisville',
    address: '4600 Shelbyville Rd, Louisville, KY 40207',
    distance: '2.3 mi',
    rating: 4.5,
    reviews: 234,
    phone: '(502) 896-8022',
    hours: 'Mon-Sat: 9am-10pm, Sun: 12pm-8pm',
    isOpen: true,
    type: 'Big Box',
    specialty: ['Bourbon', 'Allocated', 'Wide Selection'],
    verified: true,
    recentDrops: ["Blanton's", 'Eagle Rare', 'Buffalo Trace'],
    lat: 38.2527,
    lng: -85.6985,
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
    website: 'https://www.totalwine.com'
  },
  {
    id: 2,
    name: 'Liquor Barn - Springhurst',
    address: '4131 Towne Center Dr, Louisville, KY 40241',
    distance: '5.8 mi',
    rating: 4.8,
    reviews: 567,
    phone: '(502) 412-3200',
    hours: 'Mon-Thu: 9am-10pm, Fri-Sat: 9am-11pm',
    isOpen: true,
    type: 'Regional Chain',
    specialty: ['Bourbon', 'Rare Finds', 'Barrel Picks'],
    verified: true,
    recentDrops: ['Weller SR', 'E.H. Taylor', 'Old Forester 1920'],
    lat: 38.3000,
    lng: -85.5800,
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400',
    website: 'https://www.liquorbarn.com'
  },
  {
    id: 3,
    name: 'Westport Whiskey & Wine',
    address: '1115 Herr Ln, Louisville, KY 40222',
    distance: '3.1 mi',
    rating: 4.9,
    reviews: 189,
    phone: '(502) 708-1100',
    hours: 'Mon-Sat: 10am-9pm, Sun: 1pm-6pm',
    isOpen: true,
    type: 'Specialty',
    specialty: ['Rare Whiskey', 'Single Barrel', 'Japanese'],
    verified: true,
    recentDrops: ['ORVW 10', 'Stagg Jr', 'Weller 12'],
    lat: 38.2750,
    lng: -85.6500,
    image: 'https://images.unsplash.com/photo-1574023081167-2e5beaa4ec20?w=400',
    website: 'https://westportwhiskeyandwine.com',
    featured: true
  },
  {
    id: 4,
    name: 'Costco Liquor - Louisville',
    address: '4200 Summit Plaza Dr, Louisville, KY 40241',
    distance: '6.2 mi',
    rating: 4.2,
    reviews: 890,
    phone: '(502) 429-0600',
    hours: 'Mon-Fri: 10am-8:30pm, Sat: 9:30am-6pm',
    isOpen: true,
    type: 'Warehouse',
    specialty: ['Value', 'Kirkland', 'Bulk'],
    verified: true,
    recentDrops: ['Buffalo Trace', 'Kirkland Bourbon'],
    lat: 38.2950,
    lng: -85.5700,
    image: 'https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?w=400',
    website: 'https://www.costco.com'
  },
  {
    id: 5,
    name: 'Party Mart - Lexington',
    address: '500 Euclid Ave, Lexington, KY 40502',
    distance: '72 mi',
    rating: 4.6,
    reviews: 345,
    phone: '(859) 269-2704',
    hours: 'Mon-Sat: 9am-12am, Sun: 1pm-12am',
    isOpen: true,
    type: 'Local Favorite',
    specialty: ['Kentucky Selection', 'Craft', 'Local'],
    verified: true,
    recentDrops: ['Weller FP', "Blanton's Gold"],
    lat: 38.0406,
    lng: -84.5037,
    image: 'https://images.unsplash.com/photo-1585975754487-c14e4c68f6bb?w=400',
    website: 'https://partymart.com'
  },
  {
    id: 6,
    name: "Old Town Liquors",
    address: "1529 Bardstown Rd, Louisville, KY 40205",
    distance: "1.8 mi",
    rating: 4.7,
    reviews: 156,
    phone: "(502) 451-8591",
    hours: "Mon-Sat: 9am-10pm",
    isOpen: true,
    type: "Neighborhood",
    specialty: ["Craft Bourbon", "Local Picks"],
    verified: true,
    recentDrops: ["Maker's Mark Private Select", "Four Roses SB"],
    lat: 38.2350,
    lng: -85.7210,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
  }
]

const STORE_TYPES = ['All', 'Big Box', 'Regional Chain', 'Specialty', 'Warehouse', 'Local Favorite', 'Neighborhood']

// Dynamically load the map component (Leaflet doesn't work with SSR)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface Store {
  id: number
  name: string
  address: string
  distance: string
  rating: number
  reviews: number
  phone: string
  hours: string
  isOpen: boolean
  type: string
  specialty: string[]
  verified: boolean
  recentDrops: string[]
  lat: number
  lng: number
  image: string
  website?: string
  featured?: boolean
}

export default function StoresPage() {
  const [selectedType, setSelectedType] = useState('All')
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance')
  const [searchQuery, setSearchQuery] = useState('')
  const [onlyOpen, setOnlyOpen] = useState(false)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [showMap, setShowMap] = useState(true)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [mapReady, setMapReady] = useState(false)
  
  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          // Default to Louisville if denied
          setUserLocation({ lat: 38.2527, lng: -85.7585 })
        }
      )
    }
    // Mark map as ready after component mounts
    setMapReady(true)
  }, [])

  const filteredStores = STORES.filter(store => {
    if (selectedType !== 'All' && store.type !== selectedType) return false
    if (onlyOpen && !store.isOpen) return false
    if (searchQuery && !store.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    if (sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance)
    return b.rating - a.rating
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-emerald-950/20 to-stone-950 text-white">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      
      {/* Header */}
      <header className="border-b border-emerald-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-4">
            <Link href="/spirits" className="hover:text-amber-400 transition-colors">Browse</Link>
            <Link href="/prices" className="hover:text-amber-400 transition-colors">Prices</Link>
            <Link href="/collection" className="hover:text-amber-400 transition-colors">My Collection</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 px-4 text-center border-b border-stone-800/50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
              Find Bourbon Near You
            </span>
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Discover liquor stores with the best bourbon selection, verified drops, and exclusive finds
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search stores, locations, or specific bottles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-800/70 border border-stone-700 rounded-xl px-6 py-4 pl-12 text-lg focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 px-4 border-b border-stone-800/50 bg-black/30">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-stone-700 rounded-lg px-4 py-3"
          >
            {STORE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating')}
            className="bg-stone-700 rounded-lg px-4 py-3"
          >
            <option value="distance">Nearest</option>
            <option value="rating">Highest Rated</option>
          </select>
          <label className="flex items-center gap-2 bg-stone-700 rounded-lg px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyOpen}
              onChange={(e) => setOnlyOpen(e.target.checked)}
              className="accent-emerald-500"
            />
            Open Now
          </label>
          <button
            onClick={() => setShowMap(!showMap)}
            className={`px-4 py-3 rounded-lg flex items-center gap-2 ${showMap ? 'bg-emerald-600' : 'bg-stone-700'}`}
          >
            🗺️ {showMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Store List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">
              {filteredStores.length} Stores Found
            </h2>
            
            {filteredStores.map(store => (
              <div
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`bg-stone-800/50 rounded-xl p-4 border cursor-pointer transition-all hover:border-emerald-500/50 ${
                  selectedStore?.id === store.id ? 'border-emerald-500' : 'border-stone-700/50'
                } ${store.featured ? 'ring-2 ring-amber-500/30' : ''}`}
              >
                <div className="flex gap-4">
                  {/* Store Image */}
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-stone-700 flex-shrink-0">
                    <img 
                      src={store.image} 
                      alt={store.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400'
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg truncate">{store.name}</h3>
                          {store.verified && <span className="text-emerald-400 text-sm">✓</span>}
                          {store.featured && <span className="text-amber-400 text-xs">⭐ Featured</span>}
                        </div>
                        <p className="text-gray-400 text-sm truncate">{store.address}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-emerald-400 font-semibold">{store.distance}</div>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-yellow-400">★</span>
                          <span>{store.rating}</span>
                          <span className="text-gray-500">({store.reviews})</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {store.specialty.slice(0, 3).map(s => (
                        <span key={s} className="text-xs bg-stone-700 px-2 py-1 rounded">{s}</span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 text-sm">
                      <span className={store.isOpen ? 'text-green-400' : 'text-red-400'}>
                        {store.isOpen ? '● Open' : '● Closed'}
                      </span>
                      {store.recentDrops.length > 0 && (
                        <span className="text-amber-400">
                          🔥 {store.recentDrops[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Map / Store Detail */}
          <div className="lg:sticky lg:top-24 h-fit">
            {showMap && !selectedStore && mapReady && (
              <div className="bg-stone-800/50 rounded-2xl overflow-hidden border border-stone-700/50 h-[500px]">
                <MapContainer
                  center={userLocation || [38.2527, -85.7585]}
                  zoom={11}
                  className="w-full h-full"
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {filteredStores.map(store => (
                    <Marker 
                      key={store.id} 
                      position={[store.lat, store.lng]}
                      eventHandlers={{
                        click: () => setSelectedStore(store)
                      }}
                    >
                      <Popup>
                        <div className="text-black">
                          <strong>{store.name}</strong><br/>
                          {store.distance} away<br/>
                          ★ {store.rating}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}

            {showMap && !selectedStore && !mapReady && (
              <div className="bg-stone-800/50 rounded-2xl overflow-hidden border border-stone-700/50 h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl animate-spin inline-block">🗺️</span>
                  <p className="text-gray-400 mt-2">Loading map...</p>
                </div>
              </div>
            )}

            {selectedStore && (
              <div className="bg-stone-800/50 rounded-2xl overflow-hidden border border-emerald-500/30">
                {/* Store Image */}
                <div className="aspect-video relative">
                  <img 
                    src={selectedStore.image}
                    alt={selectedStore.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400'
                    }}
                  />
                  <button
                    onClick={() => setSelectedStore(null)}
                    className="absolute top-4 right-4 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/80 text-xl"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{selectedStore.name}</h2>
                    {selectedStore.verified && (
                      <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-400 mb-4">{selectedStore.address}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-stone-700/50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-emerald-400">{selectedStore.distance}</div>
                      <div className="text-xs text-gray-400">Distance</div>
                    </div>
                    <div className="bg-stone-700/50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
                        <span>★</span> {selectedStore.rating}
                      </div>
                      <div className="text-xs text-gray-400">{selectedStore.reviews} reviews</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📞</span>
                      <a href={`tel:${selectedStore.phone}`} className="text-emerald-400 hover:underline">
                        {selectedStore.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🕐</span>
                      <span className="text-gray-300">{selectedStore.hours}</span>
                    </div>
                    {selectedStore.website && (
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🌐</span>
                        <a 
                          href={selectedStore.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {selectedStore.recentDrops.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-400 mb-2">🔥 Recent Drops</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedStore.recentDrops.map(drop => (
                          <span key={drop} className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm">
                            {drop}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStore.lat},${selectedStore.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-center py-3 rounded-lg font-semibold transition-colors"
                    >
                      🚗 Get Directions
                    </a>
                    <a
                      href={`tel:${selectedStore.phone}`}
                      className="bg-stone-700 hover:bg-stone-600 px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      📞 Call
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

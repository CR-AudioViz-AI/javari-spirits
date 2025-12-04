'use client'

import { useState } from 'react'
import Link from 'next/link'

interface MakerProfile {
  id: string
  name: string
  type: 'distillery' | 'brewery' | 'winery' | 'brand' | 'importer'
  logo: string
  coverImage: string
  description: string
  location: string
  website: string
  foundedYear: number
  isVerified: boolean
  isPremium: boolean
  stats: {
    products: number
    followers: number
    monthlyViews: number
    wishlistAdds: number
    collectionAdds: number
  }
  products: Product[]
  announcements: Announcement[]
  events: Event[]
  visitorStats: VisitorStats
}

interface Product {
  id: string
  name: string
  category: string
  status: 'available' | 'coming_soon' | 'limited' | 'sold_out'
  msrp: number
  releaseDate?: string
  description: string
  rating: number
  ratingCount: number
  wishlistCount: number
}

interface Announcement {
  id: string
  type: 'release' | 'event' | 'news' | 'promotion'
  title: string
  content: string
  image?: string
  date: string
  isPinned: boolean
}

interface Event {
  id: string
  name: string
  type: 'tasting' | 'tour' | 'release' | 'festival'
  date: string
  location: string
  ticketPrice?: number
  capacity?: number
  spotsRemaining?: number
}

interface VisitorStats {
  today: number
  thisWeek: number
  thisMonth: number
  topReferrers: Array<{ source: string; count: number }>
  topProducts: Array<{ name: string; views: number }>
  geography: Array<{ region: string; percentage: number }>
}

const sampleMaker: MakerProfile = {
  id: '1',
  name: 'Buffalo Trace Distillery',
  type: 'distillery',
  logo: '🦬',
  coverImage: '',
  description: 'America\'s oldest continuously operating distillery. Home to legendary brands including Buffalo Trace, Eagle Rare, Blanton\'s, Pappy Van Winkle, and more. Located in Frankfort, Kentucky.',
  location: 'Frankfort, Kentucky',
  website: 'https://buffalotracedistillery.com',
  foundedYear: 1773,
  isVerified: true,
  isPremium: true,
  stats: {
    products: 47,
    followers: 125000,
    monthlyViews: 450000,
    wishlistAdds: 28000,
    collectionAdds: 156000,
  },
  products: [
    { id: '1', name: 'Buffalo Trace Kentucky Straight', category: 'Bourbon', status: 'available', msrp: 30, rating: 88, ratingCount: 12500, wishlistCount: 8500, description: 'Our flagship bourbon, sweet and balanced.' },
    { id: '2', name: 'Blanton\'s Original Single Barrel', category: 'Bourbon', status: 'limited', msrp: 65, rating: 92, ratingCount: 8900, wishlistCount: 45000, description: 'The original single barrel bourbon.' },
    { id: '3', name: 'Eagle Rare 10 Year', category: 'Bourbon', status: 'available', msrp: 35, rating: 90, ratingCount: 9800, wishlistCount: 12000, description: 'Bold and complex with notes of toffee and oak.' },
    { id: '4', name: 'Pappy Van Winkle 15 Year', category: 'Bourbon', status: 'sold_out', msrp: 120, releaseDate: '2024-10-15', rating: 98, ratingCount: 3200, wishlistCount: 89000, description: 'The holy grail of bourbon.' },
    { id: '5', name: 'E.H. Taylor Small Batch', category: 'Bourbon', status: 'limited', msrp: 45, rating: 91, ratingCount: 6700, wishlistCount: 22000, description: 'Bottled in Bond bourbon with rich flavor.' },
    { id: '6', name: 'Weller Special Reserve', category: 'Wheated Bourbon', status: 'available', msrp: 28, rating: 85, ratingCount: 11200, wishlistCount: 15000, description: 'Smooth wheated bourbon, everyday sipper.' },
  ],
  announcements: [
    { id: '1', type: 'release', title: '2024 Antique Collection Now Available', content: 'The highly anticipated Buffalo Trace Antique Collection is now available at select retailers. This year\'s lineup includes George T. Stagg, William Larue Weller, Thomas H. Handy, Eagle Rare 17, and Sazerac 18.', date: '2024-10-15', isPinned: true },
    { id: '2', type: 'event', title: 'Holiday Tours & Tastings', content: 'Join us this holiday season for special tours featuring exclusive tastings and behind-the-scenes access to our aging warehouses.', date: '2024-11-20', isPinned: false },
    { id: '3', type: 'news', title: 'New Rickhouse Construction Complete', content: 'We\'ve completed construction on our newest rickhouse, expanding capacity by 58,000 barrels to meet growing demand.', date: '2024-11-01', isPinned: false },
  ],
  events: [
    { id: '1', name: 'Holiday Spirit Tasting', type: 'tasting', date: '2024-12-14', location: 'Buffalo Trace Distillery', ticketPrice: 25, capacity: 100, spotsRemaining: 23 },
    { id: '2', name: 'Behind the Scenes Tour', type: 'tour', date: '2024-12-21', location: 'Buffalo Trace Distillery', ticketPrice: 50, capacity: 30, spotsRemaining: 8 },
    { id: '3', name: '2025 Spring Release Preview', type: 'release', date: '2025-03-15', location: 'Virtual Event', ticketPrice: 0, capacity: 5000, spotsRemaining: 4200 },
  ],
  visitorStats: {
    today: 1542,
    thisWeek: 12847,
    thisMonth: 45230,
    topReferrers: [
      { source: 'Google Search', count: 18500 },
      { source: 'BarrelVerse Feed', count: 12300 },
      { source: 'Direct', count: 8900 },
      { source: 'Reddit', count: 3200 },
      { source: 'Facebook', count: 2100 },
    ],
    topProducts: [
      { name: 'Blanton\'s Original', views: 15400 },
      { name: 'Pappy Van Winkle 15', views: 12800 },
      { name: 'Buffalo Trace', views: 9600 },
      { name: 'Eagle Rare 10', views: 7200 },
    ],
    geography: [
      { region: 'United States', percentage: 72 },
      { region: 'Canada', percentage: 8 },
      { region: 'United Kingdom', percentage: 6 },
      { region: 'Australia', percentage: 4 },
      { region: 'Other', percentage: 10 },
    ],
  },
}

export default function MakerPortalPage() {
  const [maker] = useState<MakerProfile>(sampleMaker)
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'announcements' | 'events' | 'analytics'>('overview')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const statusColors = {
    available: 'bg-green-900/50 text-green-400',
    coming_soon: 'bg-blue-900/50 text-blue-400',
    limited: 'bg-amber-900/50 text-amber-400',
    sold_out: 'bg-red-900/50 text-red-400',
  }

  const statusLabels = {
    available: '✓ Available',
    coming_soon: '🔜 Coming Soon',
    limited: '⚡ Limited',
    sold_out: '❌ Sold Out',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-black text-white">
      {/* Cover Image Area */}
      <div className="h-64 bg-gradient-to-r from-amber-900 to-stone-800 relative">
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute top-4 right-4 flex gap-2">
          {isEditing && (
            <button className="bg-stone-800/80 hover:bg-stone-700 px-4 py-2 rounded-lg text-sm">
              📷 Change Cover
            </button>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
          {/* Logo */}
          <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-7xl border-4 border-stone-900 shadow-2xl">
            {maker.logo}
          </div>

          {/* Info */}
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{maker.name}</h1>
              {maker.isVerified && (
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  ✓ Verified
                </span>
              )}
              {maker.isPremium && (
                <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                  MAKER PRO
                </span>
              )}
            </div>
            <p className="text-gray-400 mb-2">
              {maker.type.charAt(0).toUpperCase() + maker.type.slice(1)} • Est. {maker.foundedYear} • {maker.location}
            </p>
            <p className="text-gray-300 max-w-2xl">{maker.description}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isFollowing ? 'bg-stone-700' : 'bg-amber-600 hover:bg-amber-500'
              }`}
            >
              {isFollowing ? '✓ Following' : '+ Follow'}
            </button>
            <a href={maker.website} target="_blank" rel="noopener noreferrer" className="bg-stone-700 hover:bg-stone-600 px-6 py-3 rounded-lg font-semibold transition-colors">
              🌐 Website
            </a>
            {isEditing && (
              <button className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-semibold transition-colors">
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Products', value: maker.stats.products, icon: '🥃' },
            { label: 'Followers', value: maker.stats.followers.toLocaleString(), icon: '👥' },
            { label: 'Monthly Views', value: (maker.stats.monthlyViews / 1000).toFixed(0) + 'k', icon: '👀' },
            { label: 'Wishlist Adds', value: (maker.stats.wishlistAdds / 1000).toFixed(0) + 'k', icon: '⭐' },
            { label: 'In Collections', value: (maker.stats.collectionAdds / 1000).toFixed(0) + 'k', icon: '📦' },
          ].map((stat, i) => (
            <div key={i} className="bg-stone-800/50 rounded-xl p-4 text-center border border-amber-900/20">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-amber-900/30 pb-4 mb-8">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'products', label: '🥃 Products' },
            { id: 'announcements', label: '📢 Announcements' },
            { id: 'events', label: '📅 Events' },
            { id: 'analytics', label: '📈 Analytics', ownerOnly: true },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-5 py-2 rounded-lg font-semibold transition-colors ${
                activeTab === tab.id ? 'bg-amber-600' : 'bg-stone-800/50 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Featured Products */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {maker.products.slice(0, 4).map((product) => (
                  <div key={product.id} className="bg-stone-800/50 rounded-xl p-4 border border-amber-900/20 hover:border-amber-600/40 transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold">{product.name}</h3>
                        <p className="text-sm text-gray-400">{product.category}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${statusColors[product.status]}`}>
                        {statusLabels[product.status]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-amber-400 font-semibold">${product.msrp}</span>
                      <div className="flex items-center gap-2">
                        <span>⭐ {product.rating}</span>
                        <span className="text-gray-500">({product.ratingCount.toLocaleString()})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-3 bg-stone-700/50 hover:bg-stone-600 rounded-lg font-semibold transition-colors">
                View All {maker.stats.products} Products →
              </button>
            </div>

            {/* Recent Announcements */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Latest News</h2>
              <div className="space-y-4">
                {maker.announcements.slice(0, 3).map((ann) => (
                  <div key={ann.id} className="bg-stone-800/50 rounded-xl p-4 border border-amber-900/20">
                    {ann.isPinned && (
                      <span className="text-xs bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded mb-2 inline-block">📌 Pinned</span>
                    )}
                    <h3 className="font-bold mb-1">{ann.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{ann.content}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(ann.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">All Products</h2>
              {isEditing && (
                <button className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg font-semibold">
                  + Add Product
                </button>
              )}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {maker.products.map((product) => (
                <div key={product.id} className="bg-stone-800/50 rounded-xl p-4 border border-amber-900/20 hover:border-amber-600/40 transition-all cursor-pointer group">
                  <div className="aspect-square bg-gradient-to-br from-amber-900/30 to-stone-800/30 rounded-lg mb-4 flex items-center justify-center text-6xl">
                    🥃
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold group-hover:text-amber-400 transition-colors">{product.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${statusColors[product.status]}`}>
                      {statusLabels[product.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{product.category}</p>
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-amber-400">${product.msrp}</span>
                    <div className="flex items-center gap-2 text-sm">
                      <span>⭐ {product.rating}</span>
                      <span className="text-gray-500">• {product.wishlistCount.toLocaleString()} wishlists</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Announcements</h2>
              {isEditing && (
                <button className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg font-semibold">
                  + New Announcement
                </button>
              )}
            </div>
            <div className="space-y-4">
              {maker.announcements.map((ann) => (
                <div key={ann.id} className="bg-stone-800/50 rounded-xl p-6 border border-amber-900/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {ann.isPinned && (
                        <span className="text-xs bg-amber-900/50 text-amber-400 px-2 py-0.5 rounded mr-2">📌 Pinned</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        ann.type === 'release' ? 'bg-green-900/50 text-green-400' :
                        ann.type === 'event' ? 'bg-blue-900/50 text-blue-400' :
                        ann.type === 'promotion' ? 'bg-purple-900/50 text-purple-400' :
                        'bg-gray-900/50 text-gray-400'
                      }`}>
                        {ann.type}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{new Date(ann.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{ann.title}</h3>
                  <p className="text-gray-300">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
              {isEditing && (
                <button className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg font-semibold">
                  + Create Event
                </button>
              )}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {maker.events.map((event) => (
                <div key={event.id} className="bg-stone-800/50 rounded-xl p-6 border border-amber-900/20">
                  <div className="text-3xl mb-3">
                    {event.type === 'tasting' ? '🍷' : event.type === 'tour' ? '🏭' : event.type === 'release' ? '🎉' : '🎪'}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{event.name}</h3>
                  <div className="space-y-2 text-sm text-gray-400 mb-4">
                    <p>📅 {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    <p>📍 {event.location}</p>
                    {event.ticketPrice !== undefined && (
                      <p>💰 {event.ticketPrice === 0 ? 'Free' : `$${event.ticketPrice}`}</p>
                    )}
                  </div>
                  {event.spotsRemaining !== undefined && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Spots remaining</span>
                        <span className="text-amber-400">{event.spotsRemaining} / {event.capacity}</span>
                      </div>
                      <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${((event.capacity! - event.spotsRemaining) / event.capacity!) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <button className="w-full bg-amber-600 hover:bg-amber-500 py-2 rounded-lg font-semibold transition-colors">
                    Register Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">📈 Analytics Dashboard</h2>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-stone-800/50 rounded-xl p-6 border border-amber-900/20">
                <div className="text-sm text-gray-400 mb-1">Today</div>
                <div className="text-4xl font-bold text-amber-400">{maker.visitorStats.today.toLocaleString()}</div>
                <div className="text-sm text-green-400">↑ 12% vs yesterday</div>
              </div>
              <div className="bg-stone-800/50 rounded-xl p-6 border border-amber-900/20">
                <div className="text-sm text-gray-400 mb-1">This Week</div>
                <div className="text-4xl font-bold text-amber-400">{maker.visitorStats.thisWeek.toLocaleString()}</div>
                <div className="text-sm text-green-400">↑ 8% vs last week</div>
              </div>
              <div className="bg-stone-800/50 rounded-xl p-6 border border-amber-900/20">
                <div className="text-sm text-gray-400 mb-1">This Month</div>
                <div className="text-4xl font-bold text-amber-400">{maker.visitorStats.thisMonth.toLocaleString()}</div>
                <div className="text-sm text-green-400">↑ 23% vs last month</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Top Referrers */}
              <div className="bg-stone-800/50 rounded-xl p-6 border border-amber-900/20">
                <h3 className="font-bold mb-4">Top Traffic Sources</h3>
                <div className="space-y-3">
                  {maker.visitorStats.topReferrers.map((ref, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-gray-300">{ref.source}</span>
                      <span className="text-amber-400 font-semibold">{ref.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-stone-800/50 rounded-xl p-6 border border-amber-900/20">
                <h3 className="font-bold mb-4">Most Viewed Products</h3>
                <div className="space-y-3">
                  {maker.visitorStats.topProducts.map((prod, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-gray-300">{prod.name}</span>
                      <span className="text-amber-400 font-semibold">{prod.views.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geography */}
              <div className="bg-stone-800/50 rounded-xl p-6 border border-amber-900/20">
                <h3 className="font-bold mb-4">Visitor Geography</h3>
                <div className="space-y-3">
                  {maker.visitorStats.geography.map((geo, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">{geo.region}</span>
                        <span className="text-amber-400">{geo.percentage}%</span>
                      </div>
                      <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${geo.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-amber-900/30 py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500">
          <p>Official Brand Page on <Link href="/" className="text-amber-400">🥃 BarrelVerse</Link></p>
        </div>
      </footer>
    </div>
  )
}

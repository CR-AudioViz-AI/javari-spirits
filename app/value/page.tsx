'use client'

import { useState } from 'react'
import Link from 'next/link'

// Mock collection data
const MOCK_COLLECTION = [
  {
    id: 1,
    name: 'Pappy Van Winkle 15 Year',
    category: 'Bourbon',
    purchaseDate: '2022-03-15',
    purchasePrice: 119,
    currentValue: 1850,
    msrp: 119,
    quantity: 1,
    status: 'sealed',
    image: '🥃',
    rarity: 'Unicorn',
    trend: 'up'
  },
  {
    id: 2,
    name: 'Blanton\'s Original',
    category: 'Bourbon',
    purchaseDate: '2023-08-20',
    purchasePrice: 65,
    currentValue: 120,
    msrp: 65,
    quantity: 2,
    status: 'sealed',
    image: '🥃',
    rarity: 'Allocated',
    trend: 'up'
  },
  {
    id: 3,
    name: 'Buffalo Trace',
    category: 'Bourbon',
    purchaseDate: '2024-01-10',
    purchasePrice: 28,
    currentValue: 30,
    msrp: 28,
    quantity: 3,
    status: 'sealed',
    image: '🥃',
    rarity: 'Available',
    trend: 'stable'
  },
  {
    id: 4,
    name: 'E.H. Taylor Small Batch',
    category: 'Bourbon',
    purchaseDate: '2023-05-12',
    purchasePrice: 45,
    currentValue: 85,
    msrp: 45,
    quantity: 1,
    status: 'opened',
    image: '🥃',
    rarity: 'Allocated',
    trend: 'up'
  },
  {
    id: 5,
    name: 'Weller Special Reserve',
    category: 'Bourbon',
    purchaseDate: '2023-11-05',
    purchasePrice: 30,
    currentValue: 55,
    msrp: 30,
    quantity: 2,
    status: 'sealed',
    image: '🥃',
    rarity: 'Allocated',
    trend: 'up'
  },
  {
    id: 6,
    name: 'Macallan 18 Sherry Oak',
    category: 'Scotch',
    purchaseDate: '2021-12-01',
    purchasePrice: 350,
    currentValue: 425,
    msrp: 350,
    quantity: 1,
    status: 'sealed',
    image: '🥃',
    rarity: 'Premium',
    trend: 'up'
  },
  {
    id: 7,
    name: 'Eagle Rare 10 Year',
    category: 'Bourbon',
    purchaseDate: '2024-02-28',
    purchasePrice: 35,
    currentValue: 45,
    msrp: 35,
    quantity: 1,
    status: 'sealed',
    image: '🥃',
    rarity: 'Allocated',
    trend: 'stable'
  }
]

// Historical value data for chart
const VALUE_HISTORY = [
  { month: 'Jul', value: 2100 },
  { month: 'Aug', value: 2250 },
  { month: 'Sep', value: 2400 },
  { month: 'Oct', value: 2350 },
  { month: 'Nov', value: 2580 },
  { month: 'Dec', value: 2800 }
]

export default function CollectionValuePage() {
  const [sortBy, setSortBy] = useState<'value' | 'gain' | 'name'>('value')
  const [filterRarity, setFilterRarity] = useState<string>('all')
  const [showInsights, setShowInsights] = useState(true)

  // Calculate totals
  const totalPurchase = MOCK_COLLECTION.reduce((sum, b) => sum + (b.purchasePrice * b.quantity), 0)
  const totalCurrent = MOCK_COLLECTION.reduce((sum, b) => sum + (b.currentValue * b.quantity), 0)
  const totalGain = totalCurrent - totalPurchase
  const gainPercent = ((totalGain / totalPurchase) * 100).toFixed(1)
  const totalBottles = MOCK_COLLECTION.reduce((sum, b) => sum + b.quantity, 0)

  // Sort and filter
  let displayCollection = [...MOCK_COLLECTION]
  if (filterRarity !== 'all') {
    displayCollection = displayCollection.filter(b => b.rarity === filterRarity)
  }
  displayCollection.sort((a, b) => {
    if (sortBy === 'value') return (b.currentValue * b.quantity) - (a.currentValue * a.quantity)
    if (sortBy === 'gain') return ((b.currentValue - b.purchasePrice) / b.purchasePrice) - ((a.currentValue - a.purchasePrice) / a.purchasePrice)
    return a.name.localeCompare(b.name)
  })

  // Top performers
  const topPerformers = [...MOCK_COLLECTION]
    .sort((a, b) => ((b.currentValue - b.purchasePrice) / b.purchasePrice) - ((a.currentValue - a.purchasePrice) / a.purchasePrice))
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-green-950/20 to-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-green-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-4">
            <Link href="/collection" className="hover:text-amber-400 transition-colors">Collection</Link>
            <Link href="/profile" className="hover:text-amber-400 transition-colors">Profile</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-900/50 to-stone-800/50 rounded-xl p-6 border border-green-500/30">
            <p className="text-gray-400 text-sm mb-1">Total Collection Value</p>
            <p className="text-4xl font-bold text-green-400">${totalCurrent.toLocaleString()}</p>
            <p className="text-sm text-green-400 mt-1">+${totalGain.toLocaleString()} ({gainPercent}%)</p>
          </div>
          <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
            <p className="text-gray-400 text-sm mb-1">Total Invested</p>
            <p className="text-3xl font-bold">${totalPurchase.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Original cost basis</p>
          </div>
          <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
            <p className="text-gray-400 text-sm mb-1">Total Bottles</p>
            <p className="text-3xl font-bold">{totalBottles}</p>
            <p className="text-sm text-gray-500 mt-1">{MOCK_COLLECTION.length} unique expressions</p>
          </div>
          <div className="bg-gradient-to-br from-amber-900/50 to-stone-800/50 rounded-xl p-6 border border-amber-500/30">
            <p className="text-gray-400 text-sm mb-1">ROI</p>
            <p className="text-3xl font-bold text-amber-400">+{gainPercent}%</p>
            <p className="text-sm text-gray-500 mt-1">vs. S&P 500: +12.3%</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Value Chart */}
            <div className="bg-stone-800/50 rounded-2xl p-6 border border-stone-700/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Collection Value Over Time</h2>
                <div className="flex gap-2">
                  {['6M', '1Y', 'ALL'].map((period) => (
                    <button
                      key={period}
                      className={`px-3 py-1 rounded text-sm ${
                        period === '6M' ? 'bg-green-600' : 'bg-stone-700'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Simple Chart Visualization */}
              <div className="h-48 flex items-end justify-between gap-2">
                {VALUE_HISTORY.map((point, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t"
                      style={{ height: `${(point.value / 3000) * 100}%` }}
                    />
                    <span className="text-xs text-gray-500 mt-2">{point.month}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                <span>6 months ago: $2,100</span>
                <span className="text-green-400">Today: $2,800 (+33%)</span>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'value' | 'gain' | 'name')}
                  className="bg-stone-800 rounded-lg px-3 py-2"
                >
                  <option value="value">Total Value</option>
                  <option value="gain">% Gain</option>
                  <option value="name">Name</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Filter:</span>
                <select
                  value={filterRarity}
                  onChange={(e) => setFilterRarity(e.target.value)}
                  className="bg-stone-800 rounded-lg px-3 py-2"
                >
                  <option value="all">All Bottles</option>
                  <option value="Unicorn">Unicorn</option>
                  <option value="Allocated">Allocated</option>
                  <option value="Premium">Premium</option>
                  <option value="Available">Available</option>
                </select>
              </div>
            </div>

            {/* Bottle List */}
            <div className="space-y-3">
              {displayCollection.map((bottle) => {
                const gain = bottle.currentValue - bottle.purchasePrice
                const gainPct = ((gain / bottle.purchasePrice) * 100).toFixed(0)
                const totalValue = bottle.currentValue * bottle.quantity
                
                return (
                  <div
                    key={bottle.id}
                    className="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50 hover:border-green-500/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {/* Bottle Icon */}
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-900/50 to-stone-800 rounded-lg flex items-center justify-center text-3xl">
                        {bottle.image}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{bottle.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            bottle.rarity === 'Unicorn' ? 'bg-purple-600' :
                            bottle.rarity === 'Allocated' ? 'bg-amber-600' :
                            bottle.rarity === 'Premium' ? 'bg-blue-600' : 'bg-stone-600'
                          }`}>
                            {bottle.rarity}
                          </span>
                          {bottle.status === 'opened' && (
                            <span className="text-xs text-gray-500">(Opened)</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{bottle.category} • Qty: {bottle.quantity}</p>
                        <p className="text-xs text-gray-500">
                          Purchased: {new Date(bottle.purchaseDate).toLocaleDateString()} @ ${bottle.purchasePrice}
                        </p>
                      </div>
                      
                      {/* Values */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">${totalValue.toLocaleString()}</p>
                        <p className={`text-sm ${Number(gainPct) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {bottle.trend === 'up' ? '↑' : bottle.trend === 'down' ? '↓' : '→'}
                          {' '}+{gainPct}% (${gain * bottle.quantity})
                        </p>
                        <p className="text-xs text-gray-500">
                          ${bottle.currentValue}/bottle
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Performers */}
            <div className="bg-gradient-to-br from-green-900/30 to-stone-800/30 rounded-xl p-6 border border-green-500/30">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span>🏆</span> Top Performers
              </h3>
              <div className="space-y-3">
                {topPerformers.map((bottle, i) => {
                  const gainPct = (((bottle.currentValue - bottle.purchasePrice) / bottle.purchasePrice) * 100).toFixed(0)
                  return (
                    <div key={bottle.id} className="flex items-center gap-3">
                      <span className={`text-lg ${
                        i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : 'text-amber-600'
                      }`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{bottle.name}</p>
                        <p className="text-xs text-gray-500">${bottle.purchasePrice} → ${bottle.currentValue}</p>
                      </div>
                      <span className="text-green-400 font-bold">+{gainPct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Portfolio Breakdown */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4">📊 Portfolio Breakdown</h3>
              <div className="space-y-3">
                {[
                  { category: 'Bourbon', value: 2250, percent: 80, color: 'amber' },
                  { category: 'Scotch', value: 425, percent: 15, color: 'blue' },
                  { category: 'Other', value: 125, percent: 5, color: 'gray' }
                ].map((cat) => (
                  <div key={cat.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{cat.category}</span>
                      <span className="text-gray-400">${cat.value.toLocaleString()} ({cat.percent}%)</span>
                    </div>
                    <div className="w-full bg-stone-700 rounded-full h-2">
                      <div
                        className={`bg-${cat.color}-500 h-2 rounded-full`}
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Insights */}
            {showInsights && (
              <div className="bg-gradient-to-br from-amber-900/30 to-stone-800/30 rounded-xl p-6 border border-amber-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <span>💡</span> Market Insights
                  </h3>
                  <button
                    onClick={() => setShowInsights(false)}
                    className="text-gray-500 hover:text-gray-400"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-amber-400 font-medium">🔥 Hot Right Now</p>
                    <p className="text-gray-400">Pappy 15 Year prices up 15% this month</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-green-400 font-medium">📈 Your Opportunity</p>
                    <p className="text-gray-400">Your Blanton's is 85% above MSRP - consider selling</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-blue-400 font-medium">📅 Coming Soon</p>
                    <p className="text-gray-400">Buffalo Trace Antique Collection drops next month</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-green-600 hover:bg-green-500 py-2 rounded-lg text-sm font-semibold transition-colors">
                  + Add Bottle
                </button>
                <button className="w-full bg-stone-700 hover:bg-stone-600 py-2 rounded-lg text-sm font-semibold transition-colors">
                  📤 Export to CSV
                </button>
                <button className="w-full bg-stone-700 hover:bg-stone-600 py-2 rounded-lg text-sm font-semibold transition-colors">
                  📊 Full Report
                </button>
              </div>
            </div>

            {/* Compare */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50 text-center">
              <p className="text-3xl mb-2">📈</p>
              <h3 className="font-bold mb-2">Compare Performance</h3>
              <p className="text-sm text-gray-400 mb-4">
                See how your collection stacks up against stocks, crypto, and other investors
              </p>
              <button className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                View Comparison
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

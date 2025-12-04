'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Distillery data with virtual tour stops
const DISTILLERIES = {
  'buffalo-trace': {
    name: 'Buffalo Trace Distillery',
    location: 'Frankfort, Kentucky',
    founded: 1773,
    slogan: 'The World\'s Most Award-Winning Distillery',
    description: 'America\'s oldest continuously operating distillery, home to legendary brands like Pappy Van Winkle, Eagle Rare, and Blanton\'s.',
    stats: {
      barrels: '500,000+',
      brands: '20+',
      awards: '1,000+',
      tours: '250,000/year'
    },
    tourStops: [
      {
        id: 'entrance',
        name: 'Historic Entrance',
        position: 0,
        image: '🏛️',
        ambience: 'Morning mist rises over the Kentucky River as you approach the limestone gates...',
        description: 'Welcome to Buffalo Trace, established in 1773. These grounds have witnessed every major moment in American whiskey history - from the Revolutionary War to Prohibition to the modern bourbon boom.',
        facts: [
          'This is the oldest continuously operating distillery in America',
          'The name "Buffalo Trace" comes from the ancient buffalo migration path that crossed here',
          'Over 250,000 visitors tour these grounds each year'
        ],
        audio: 'gate-creaking-birds-chirping',
        duration: '2 min'
      },
      {
        id: 'grain-delivery',
        name: 'Grain Delivery',
        position: 1,
        image: '🌾',
        ambience: 'Trucks rumble as tons of Kentucky corn are unloaded...',
        description: 'Every great bourbon starts with grain. Buffalo Trace receives shipments of corn, rye, and malted barley - the three grains that make bourbon.',
        facts: [
          'Bourbon must contain at least 51% corn',
          'Buffalo Trace uses locally sourced non-GMO corn',
          'They process over 60,000 bushels of grain per week'
        ],
        audio: 'truck-engines-grain-pouring',
        duration: '3 min'
      },
      {
        id: 'mash-house',
        name: 'The Mash House',
        position: 2,
        image: '🏭',
        ambience: 'Steam billows from massive cookers, the sweet smell of cooking grain fills the air...',
        description: 'Here, grains are ground and cooked with pure Kentucky limestone water. The result is a sweet, porridge-like mixture called mash - the foundation of all bourbon.',
        facts: [
          'Water is filtered through 100 feet of limestone',
          'Each cooker holds 10,000 gallons',
          'The mash is cooked at precise temperatures for optimal sugar extraction'
        ],
        audio: 'steam-hissing-bubbling',
        duration: '4 min'
      },
      {
        id: 'fermentation',
        name: 'Fermentation Tanks',
        position: 3,
        image: '🧪',
        ambience: 'Bubbling sounds echo through the room as yeast works its magic...',
        description: 'Massive cypress wood tanks hold the fermenting mash. Buffalo Trace\'s proprietary yeast strains, some dating back generations, convert sugars into alcohol.',
        facts: [
          'Fermentation takes 3-5 days',
          'The yeast strain is a closely guarded secret',
          'Each tank holds 92,000 gallons',
          'The "distiller\'s beer" reaches about 8-10% alcohol'
        ],
        audio: 'bubbling-fizzing',
        duration: '4 min'
      },
      {
        id: 'still-house',
        name: 'The Still House',
        position: 4,
        image: '⚗️',
        ambience: 'Copper gleams in the light as clear spirit flows from the condensers...',
        description: 'The heart of the operation. Towering copper column stills and doublers transform the fermented mash into "white dog" - unaged bourbon at 125-140 proof.',
        facts: [
          'The column still is over 50 feet tall',
          'Copper removes sulfur compounds, creating smoother spirit',
          'The "heads" and "tails" are removed, keeping only the "heart"',
          'White dog must enter the barrel at no more than 125 proof'
        ],
        audio: 'liquid-dripping-machinery',
        duration: '5 min'
      },
      {
        id: 'barrel-making',
        name: 'Barrel Cooperage',
        position: 5,
        image: '🛢️',
        ambience: 'The crack of hammers on wood, the roar of flames charring barrels...',
        description: 'Every bourbon barrel is made from American white oak and charred on the inside. Buffalo Trace has its own cooperage, giving them complete control over this crucial element.',
        facts: [
          'Each barrel takes about 1 hour to make',
          'Barrels are charred for 55 seconds at 500°F',
          'A #4 char (the deepest) creates the most caramelization',
          'Each barrel costs $200-250 to produce'
        ],
        audio: 'hammering-fire-crackling',
        duration: '5 min'
      },
      {
        id: 'filling',
        name: 'Barrel Filling',
        position: 6,
        image: '🍾',
        ambience: 'Clear spirit cascades into charred oak barrels...',
        description: 'Fresh white dog is pumped into new charred oak barrels. From this moment, the clock starts on years of patient aging.',
        facts: [
          'Barrels are filled to exactly 53 gallons',
          'Each barrel is hand-bunged with a wooden stopper',
          'A barrel gains 1/3 of its flavor in the first year',
          'The wood contributes up to 60% of the final flavor'
        ],
        audio: 'liquid-pouring-splashing',
        duration: '3 min'
      },
      {
        id: 'rickhouse',
        name: 'Historic Rickhouse',
        position: 7,
        image: '🏚️',
        ambience: 'Wooden floors creak beneath your feet, the rich smell of aging bourbon surrounds you...',
        description: 'Nine stories of bourbon heaven. Each of Buffalo Trace\'s 100+ rickhouses holds up to 20,000 barrels. Temperature variations between floors create different flavor profiles.',
        facts: [
          'Top floors reach 120°F in summer, creating more extraction',
          'Bottom floors stay cooler, producing gentler aging',
          'Barrels are rotated for consistency in some expressions',
          'The "angel\'s share" - evaporation - takes 3-5% per year'
        ],
        audio: 'creaking-wood-whiskey-breathing',
        duration: '6 min'
      },
      {
        id: 'warehouse-c',
        name: 'Warehouse C (Pappy Van Winkle)',
        position: 8,
        image: '👑',
        ambience: 'Security is tight. You\'re in bourbon royalty territory now...',
        description: 'The legendary Warehouse C - home to the most sought-after bourbon in the world. Pappy Van Winkle ages here, along with other ultra-premium expressions.',
        facts: [
          'Pappy Van Winkle 23 Year can sell for $5,000+ per bottle',
          'Only about 7,000 cases are released annually',
          'The Van Winkle family recipe dates to the 1800s',
          'This warehouse has 24/7 security monitoring'
        ],
        audio: 'reverent-silence-occasional-creak',
        duration: '5 min'
      },
      {
        id: 'tasting-room',
        name: 'Tasting Room',
        position: 9,
        image: '🥃',
        ambience: 'Leather chairs, warm lighting, and the gentle clink of glassware...',
        description: 'The culmination of your journey. Sample the fruits of centuries of craftsmanship in Buffalo Trace\'s elegant tasting room.',
        facts: [
          'Tasters evaluate over 100 samples daily',
          'Each barrel is tasted before selection',
          'The master distiller has final say on all releases',
          'Some barrels age for 20+ years before being deemed ready'
        ],
        audio: 'glasses-clinking-murmured-conversations',
        duration: '10 min',
        tasting: [
          { name: 'Buffalo Trace', proof: 90, notes: 'Vanilla, caramel, mint' },
          { name: 'Eagle Rare 10', proof: 90, notes: 'Oak, honey, leather' },
          { name: 'Blanton\'s', proof: 93, notes: 'Citrus, toffee, spice' },
          { name: 'E.H. Taylor Small Batch', proof: 100, notes: 'Caramel, maple, tobacco' }
        ]
      }
    ],
    famousBrands: ['Pappy Van Winkle', 'Buffalo Trace', 'Eagle Rare', 'Blanton\'s', 'E.H. Taylor', 'Weller', 'Stagg']
  },
  'makers-mark': {
    name: 'Maker\'s Mark Distillery',
    location: 'Loretto, Kentucky',
    founded: 1953,
    slogan: 'It is what it isn\'t',
    description: 'A National Historic Landmark and pioneer of the premium bourbon movement. Famous for its red wax seal and wheated mash bill.',
    stats: {
      barrels: '150,000+',
      brands: '5',
      awards: '100+',
      tours: '150,000/year'
    },
    tourStops: [
      {
        id: 'entrance',
        name: 'Star Hill Farm',
        position: 0,
        image: '⭐',
        ambience: 'Rolling hills, black fences, and a picture-perfect distillery campus...',
        description: 'Welcome to Star Hill Farm, home of Maker\'s Mark since 1953. This entire campus is a National Historic Landmark.',
        facts: [
          'The distillery sits on a natural spring',
          'Bill Samuels Sr. chose this site for its limestone-filtered water',
          'The red shutters match the famous red wax'
        ],
        audio: 'birdsong-gentle-breeze',
        duration: '3 min'
      },
      {
        id: 'quart-house',
        name: 'The Quart House',
        position: 1,
        image: '🏠',
        ambience: 'A tiny house with big history...',
        description: 'The original tax collector\'s office where farmers paid their whiskey tax. Now a museum of Maker\'s Mark history.',
        facts: [
          'Built in the 1800s for the whiskey tax collector',
          'Farmers paid taxes with actual whiskey',
          'Contains original Maker\'s documents and artifacts'
        ],
        audio: 'old-door-creaking',
        duration: '4 min'
      },
      {
        id: 'roller-mill',
        name: 'The Roller Mill',
        position: 2,
        image: '🌾',
        ambience: 'Grain dust in the air, the rumble of massive rollers...',
        description: 'Maker\'s uses a roller mill instead of a hammer mill - a gentler process that preserves the grain\'s natural flavors.',
        facts: [
          'Red winter wheat replaces rye in the mash bill',
          'This creates Maker\'s signature smooth, sweet profile',
          'The same grain recipe since 1953'
        ],
        audio: 'grain-processing-machinery',
        duration: '3 min'
      },
      {
        id: 'still',
        name: 'The Still House',
        position: 3,
        image: '⚗️',
        ambience: 'Gleaming copper, the smell of fresh distillate...',
        description: 'Three pot stills create Maker\'s distinctive flavor. The copper was hand-selected from Scotland.',
        facts: [
          'Pot stills create heavier, more flavorful spirit than column stills',
          'The stills are named after the Samuels family',
          'Each still produces about 100 gallons per hour'
        ],
        audio: 'copper-humming-steam',
        duration: '4 min'
      },
      {
        id: 'dipping',
        name: 'The Dipping Room',
        position: 4,
        image: '🔴',
        ambience: 'Bottles moving slowly, hands dipping each one in brilliant red wax...',
        description: 'The iconic red wax seal - every single bottle is still hand-dipped by dedicated team members.',
        facts: [
          'Each dipper handles about 23 bottles per minute',
          'The wax recipe is a closely guarded secret',
          'Margie Samuels invented the look to stand out on shelves',
          'Visitors can dip their own bottles!'
        ],
        audio: 'bottles-clinking-wax-dripping',
        duration: '5 min'
      }
    ],
    famousBrands: ['Maker\'s Mark', 'Maker\'s 46', 'Maker\'s Mark Cask Strength', 'Maker\'s Mark Private Select']
  }
}

const DISTILLERY_LIST = [
  { id: 'buffalo-trace', name: 'Buffalo Trace', location: 'Frankfort, KY', available: true },
  { id: 'makers-mark', name: 'Maker\'s Mark', location: 'Loretto, KY', available: true },
  { id: 'woodford-reserve', name: 'Woodford Reserve', location: 'Versailles, KY', available: false },
  { id: 'wild-turkey', name: 'Wild Turkey', location: 'Lawrenceburg, KY', available: false },
  { id: 'four-roses', name: 'Four Roses', location: 'Lawrenceburg, KY', available: false },
  { id: 'heaven-hill', name: 'Heaven Hill', location: 'Bardstown, KY', available: false },
  { id: 'jim-beam', name: 'Jim Beam', location: 'Clermont, KY', available: false },
  { id: 'jack-daniels', name: 'Jack Daniel\'s', location: 'Lynchburg, TN', available: false },
  { id: 'glenfiddich', name: 'Glenfiddich', location: 'Dufftown, Scotland', available: false },
  { id: 'macallan', name: 'The Macallan', location: 'Craigellachie, Scotland', available: false },
  { id: 'patron', name: 'Patrón', location: 'Jalisco, Mexico', available: false },
  { id: 'hennessy', name: 'Hennessy', location: 'Cognac, France', available: false }
]

export default function DistilleryToursPage() {
  const [selectedDistillery, setSelectedDistillery] = useState<string | null>(null)
  const [currentStop, setCurrentStop] = useState(0)
  const [isTouring, setIsTouring] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [showMap, setShowMap] = useState(false)

  const distillery = selectedDistillery ? DISTILLERIES[selectedDistillery as keyof typeof DISTILLERIES] : null
  const stop = distillery?.tourStops[currentStop]

  const startTour = (id: string) => {
    setSelectedDistillery(id)
    setCurrentStop(0)
    setIsTouring(true)
  }

  const nextStop = () => {
    if (distillery && currentStop < distillery.tourStops.length - 1) {
      setCurrentStop(prev => prev + 1)
    }
  }

  const prevStop = () => {
    if (currentStop > 0) {
      setCurrentStop(prev => prev - 1)
    }
  }

  const exitTour = () => {
    setIsTouring(false)
    setSelectedDistillery(null)
    setCurrentStop(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-amber-950/20 to-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isTouring && (
              <button onClick={exitTour} className="text-amber-400 hover:text-amber-300">
                ← Exit Tour
              </button>
            )}
            <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          </div>
          <nav className="flex items-center gap-4">
            {isTouring && (
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-2 rounded-full ${audioEnabled ? 'bg-amber-600' : 'bg-stone-700'}`}
              >
                {audioEnabled ? '🔊' : '🔇'}
              </button>
            )}
            <Link href="/museum" className="hover:text-amber-400 transition-colors">Museum</Link>
          </nav>
        </div>
      </header>

      {/* Tour Selection */}
      {!isTouring && (
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-block bg-gradient-to-r from-amber-600 to-yellow-500 text-black px-4 py-1 rounded-full text-sm font-bold mb-4">
              🏭 VIRTUAL DISTILLERY TOURS
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Walk Through <span className="text-amber-400">World-Famous Distilleries</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience the magic of whiskey-making from anywhere. Explore grain to glass 
              in immersive virtual tours of legendary distilleries.
            </p>
          </div>

          {/* Map Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-stone-800 rounded-lg p-1 flex">
              <button
                onClick={() => setShowMap(false)}
                className={`px-4 py-2 rounded transition-colors ${!showMap ? 'bg-amber-600' : ''}`}
              >
                Grid View
              </button>
              <button
                onClick={() => setShowMap(true)}
                className={`px-4 py-2 rounded transition-colors ${showMap ? 'bg-amber-600' : ''}`}
              >
                Map View
              </button>
            </div>
          </div>

          {/* Distillery Grid */}
          {!showMap && (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {DISTILLERY_LIST.map((d) => (
                <div
                  key={d.id}
                  className={`rounded-2xl overflow-hidden border transition-all ${
                    d.available
                      ? 'bg-gradient-to-br from-amber-900/40 to-stone-800/40 border-amber-500/30 hover:border-amber-400/50 cursor-pointer hover:scale-105'
                      : 'bg-stone-800/30 border-stone-700/30 opacity-60'
                  }`}
                  onClick={() => d.available && startTour(d.id)}
                >
                  <div className="aspect-video bg-gradient-to-br from-amber-800/50 to-stone-900 flex items-center justify-center">
                    <span className="text-6xl">{d.available ? '🏭' : '🔒'}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{d.name}</h3>
                    <p className="text-gray-400 text-sm">{d.location}</p>
                    {d.available ? (
                      <button className="mt-3 text-amber-400 text-sm font-semibold">
                        Start Tour →
                      </button>
                    ) : (
                      <span className="mt-3 inline-block text-gray-500 text-sm">Coming Soon</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Map View */}
          {showMap && (
            <div className="bg-stone-800/50 rounded-2xl p-8 border border-amber-900/30">
              <div className="aspect-video bg-gradient-to-br from-green-900/30 to-stone-800 rounded-xl flex items-center justify-center relative">
                <div className="text-center">
                  <span className="text-8xl">🗺️</span>
                  <p className="mt-4 text-gray-400">Interactive map coming soon!</p>
                  <p className="text-sm text-gray-500">Plot your own bourbon trail</p>
                </div>
                {/* Map pins would go here */}
                <div className="absolute top-1/4 left-1/3 animate-bounce">
                  <span className="text-2xl cursor-pointer" title="Buffalo Trace">📍</span>
                </div>
                <div className="absolute top-1/3 left-1/4 animate-bounce delay-100">
                  <span className="text-2xl cursor-pointer" title="Maker's Mark">📍</span>
                </div>
              </div>
            </div>
          )}

          {/* Featured Tour */}
          <div className="mt-12 bg-gradient-to-r from-amber-900/40 via-stone-800/40 to-amber-900/40 rounded-2xl p-8 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">⭐ FEATURED</span>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Buffalo Trace Distillery</h2>
                <p className="text-gray-300 mb-4">
                  Experience America's oldest continuously operating distillery. Walk through 
                  the legendary grounds where Pappy Van Winkle, Eagle Rare, and Blanton's are made.
                </p>
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-black/30 px-4 py-2 rounded-lg">
                    <div className="text-2xl font-bold text-amber-400">10</div>
                    <div className="text-xs text-gray-500">Tour Stops</div>
                  </div>
                  <div className="bg-black/30 px-4 py-2 rounded-lg">
                    <div className="text-2xl font-bold text-amber-400">45min</div>
                    <div className="text-xs text-gray-500">Duration</div>
                  </div>
                  <div className="bg-black/30 px-4 py-2 rounded-lg">
                    <div className="text-2xl font-bold text-amber-400">4</div>
                    <div className="text-xs text-gray-500">Tastings</div>
                  </div>
                </div>
                <button
                  onClick={() => startTour('buffalo-trace')}
                  className="bg-amber-600 hover:bg-amber-500 px-8 py-4 rounded-lg font-bold text-lg transition-colors"
                >
                  🚶 Start Virtual Tour
                </button>
              </div>
              <div className="aspect-video bg-gradient-to-br from-amber-800/50 to-stone-900 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <span className="text-8xl">🏛️</span>
                  <p className="mt-4 text-gray-400">America's Oldest Distillery</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Active Tour View */}
      {isTouring && distillery && stop && (
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Tour Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">{distillery.name}</span>
              <span className="text-sm text-gray-400">
                Stop {currentStop + 1} of {distillery.tourStops.length}
              </span>
            </div>
            <div className="flex gap-1">
              {distillery.tourStops.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStop(i)}
                  className={`flex-1 h-2 rounded-full transition-colors ${
                    i === currentStop ? 'bg-amber-500' :
                    i < currentStop ? 'bg-amber-700' : 'bg-stone-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Main Tour Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Scene Display */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-amber-900/40 to-stone-800/40 rounded-2xl overflow-hidden border border-amber-500/30">
                {/* Scene Image */}
                <div className="aspect-video bg-gradient-to-br from-amber-800/30 to-stone-900 flex items-center justify-center relative">
                  <div className="text-center">
                    <span className="text-9xl animate-float">{stop.image}</span>
                    <h2 className="text-3xl font-bold mt-4">{stop.name}</h2>
                  </div>
                  
                  {/* Ambience overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Ambience text */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-gray-300 italic text-lg">{stop.ambience}</p>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full text-sm">
                    ⏱️ {stop.duration}
                  </div>
                </div>

                {/* Description */}
                <div className="p-6">
                  <p className="text-lg text-gray-300 mb-6">{stop.description}</p>
                  
                  {/* Facts */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-amber-400 flex items-center gap-2">
                      <span>💡</span> Did You Know?
                    </h3>
                    {stop.facts.map((fact, i) => (
                      <div key={i} className="flex items-start gap-3 bg-black/30 rounded-lg p-3">
                        <span className="text-amber-500">•</span>
                        <span className="text-gray-400">{fact}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tasting Section (if available) */}
                  {stop.tasting && (
                    <div className="mt-6 bg-amber-900/30 rounded-xl p-4 border border-amber-500/30">
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        <span>🥃</span> Tasting Flight
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {stop.tasting.map((spirit, i) => (
                          <div key={i} className="bg-black/30 rounded-lg p-3">
                            <p className="font-semibold">{spirit.name}</p>
                            <p className="text-sm text-amber-400">{spirit.proof} proof</p>
                            <p className="text-xs text-gray-500">{spirit.notes}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="p-4 border-t border-stone-700/50 flex items-center justify-between">
                  <button
                    onClick={prevStop}
                    disabled={currentStop === 0}
                    className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 ${
                      currentStop === 0
                        ? 'bg-stone-800 text-gray-600 cursor-not-allowed'
                        : 'bg-stone-700 hover:bg-stone-600'
                    }`}
                  >
                    ← Previous
                  </button>
                  
                  <span className="text-gray-400">
                    {currentStop + 1} / {distillery.tourStops.length}
                  </span>

                  {currentStop < distillery.tourStops.length - 1 ? (
                    <button
                      onClick={nextStop}
                      className="bg-amber-600 hover:bg-amber-500 px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={exitTour}
                      className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                    >
                      Complete Tour ✓
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Distillery Info */}
              <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
                <h3 className="font-bold mb-4">{distillery.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{distillery.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-amber-400">{distillery.stats.barrels}</div>
                    <div className="text-xs text-gray-500">Barrels Aging</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-400">{distillery.stats.brands}</div>
                    <div className="text-xs text-gray-500">Brands</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-400">{distillery.stats.awards}</div>
                    <div className="text-xs text-gray-500">Awards Won</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-400">{distillery.stats.tours}</div>
                    <div className="text-xs text-gray-500">Visitors/Year</div>
                  </div>
                </div>
              </div>

              {/* Tour Stops List */}
              <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
                <h3 className="font-bold mb-4">Tour Stops</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {distillery.tourStops.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentStop(i)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                        i === currentStop
                          ? 'bg-amber-900/50 border border-amber-500/50'
                          : i < currentStop
                            ? 'bg-green-900/30'
                            : 'bg-stone-700/30 hover:bg-stone-700/50'
                      }`}
                    >
                      <span className="text-2xl">{s.image}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.duration}</p>
                      </div>
                      {i < currentStop && <span className="text-green-400">✓</span>}
                      {i === currentStop && <span className="text-amber-400">→</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Famous Brands */}
              <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
                <h3 className="font-bold mb-4">🥃 Brands Made Here</h3>
                <div className="flex flex-wrap gap-2">
                  {distillery.famousBrands.map((brand, i) => (
                    <span key={i} className="bg-amber-900/50 px-3 py-1 rounded-full text-sm text-amber-400">
                      {brand}
                    </span>
                  ))}
                </div>
              </div>

              {/* Share */}
              <div className="bg-gradient-to-br from-amber-900/30 to-stone-800/30 rounded-xl p-6 border border-amber-500/30 text-center">
                <p className="text-sm text-gray-400 mb-3">Share this tour with friends!</p>
                <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm transition-colors">
                  🐦 Tweet This Tour
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

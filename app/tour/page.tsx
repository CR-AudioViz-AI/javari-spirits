'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Virtual Distillery Tours
const DISTILLERY_TOURS = {
  'buffalo-trace': {
    name: 'Buffalo Trace Distillery',
    location: 'Frankfort, Kentucky',
    founded: 1773,
    tagline: 'America\'s Oldest Continuously Operating Distillery',
    atmosphere: 'Rolling Kentucky hills, limestone warehouses, copper stills gleaming',
    famousFor: ['Buffalo Trace', 'Eagle Rare', 'Blanton\'s', 'Pappy Van Winkle', 'W.L. Weller'],
    rooms: [
      {
        id: 'entrance',
        name: 'The Welcome Center',
        icon: '🚪',
        description: 'You step through the historic entrance gates, the smell of aging bourbon fills the air...',
        ambiance: 'Oak and vanilla notes drift on the Kentucky breeze. The limestone buildings stand as silent witnesses to 250 years of history.',
        artifacts: [
          { name: 'Original Charter', year: 1773, description: 'The land grant that started it all' },
          { name: 'Prohibition Certificate', year: 1920, description: 'Permission to sell medicinal whiskey' },
          { name: 'National Historic Landmark Plaque', year: 2013, description: 'Official recognition' }
        ],
        funFact: 'Buffalo Trace is one of only four distilleries that operated during Prohibition with a permit to produce medicinal whiskey.',
        sounds: ['Distant barrel rolling', 'Birds chirping', 'Tour guide voices'],
        nextRooms: ['mash-room', 'history-hall']
      },
      {
        id: 'history-hall',
        name: 'Hall of History',
        icon: '🏛️',
        description: 'Walk through 250 years of bourbon-making history...',
        ambiance: 'Sepia photographs line the walls. Display cases hold century-old bottles and equipment.',
        artifacts: [
          { name: 'Pre-Prohibition Bottle', year: 1910, description: 'One of the last bottles before the dry years' },
          { name: 'Original Copper Still', year: 1857, description: 'The grandfather of modern bourbon production' },
          { name: 'Master Distiller Photos', year: '1870-Present', description: 'The faces behind the bourbon' }
        ],
        timeline: [
          { year: 1773, event: 'Hancock Lee builds first distillery on the site' },
          { year: 1857, event: 'Colonel Edmund Haynes Taylor Jr. takes over' },
          { year: 1870, event: 'O.F.C. (Old Fire Copper) Distillery officially named' },
          { year: 1897, event: 'Taylor helps pass Bottled-in-Bond Act' },
          { year: 1920, event: 'Survives Prohibition as medicinal whiskey producer' },
          { year: 1999, event: 'Renamed Buffalo Trace Distillery' },
          { year: 2013, event: 'Named National Historic Landmark' }
        ],
        nextRooms: ['mash-room', 'still-house']
      },
      {
        id: 'mash-room',
        name: 'The Mash Room',
        icon: '🌾',
        description: 'Where corn, rye, and barley become the foundation of bourbon...',
        ambiance: 'Steam rises from massive cookers. The sweet smell of cooking grain fills the air.',
        process: [
          { step: 1, title: 'Milling', description: 'Corn, rye, and malted barley are ground to precise specifications' },
          { step: 2, title: 'Cooking', description: 'Grains are cooked at specific temperatures to release starches' },
          { step: 3, title: 'Mashing', description: 'Enzymes convert starches to fermentable sugars' },
          { step: 4, title: 'Sour Mash', description: 'Spent mash from previous batches is added for consistency' }
        ],
        artifacts: [
          { name: 'Original Mash Bill Recipe', year: 1897, description: 'The secret proportions' },
          { name: 'Copper Mash Rake', year: 1920, description: 'Hand-stirring tool from pre-automation days' }
        ],
        funFact: 'Buffalo Trace uses a "sour mash" process - adding some of yesterday\'s mash to today\'s batch. This has been continuous since 1775!',
        nextRooms: ['fermentation', 'still-house']
      },
      {
        id: 'fermentation',
        name: 'Fermentation Hall',
        icon: '🧪',
        description: 'Giant cypress fermenters bubble with living yeast...',
        ambiance: 'The room hums with activity. Foam rises and falls like breathing. The air is thick with CO2 and alcohol vapors.',
        process: [
          { step: 1, title: 'Yeast Addition', description: 'Proprietary yeast strains are added to cooled mash' },
          { step: 2, title: 'Fermentation', description: '3-5 days of yeast converting sugars to alcohol' },
          { step: 3, title: 'Distiller\'s Beer', description: 'The result: ~8% alcohol "beer" ready for distillation' }
        ],
        artifacts: [
          { name: 'Original Cypress Fermenter', year: 1933, description: '90+ year old fermenting vessel still in use' },
          { name: 'Yeast Culture Sample', year: 1940, description: 'The same strain used for 80+ years' }
        ],
        funFact: 'The yeast strain used at Buffalo Trace has been maintained since the end of Prohibition - making each batch genetically connected to 1933!',
        nextRooms: ['still-house']
      },
      {
        id: 'still-house',
        name: 'The Still House',
        icon: '⚗️',
        description: 'Towering copper stills transform beer into "white dog" spirit...',
        ambiance: 'Copper gleams under industrial lights. The warmth from the stills is palpable. Clear liquid flows from the spirit safe.',
        process: [
          { step: 1, title: 'Column Still', description: 'First distillation strips alcohol from the beer' },
          { step: 2, title: 'Doubler', description: 'Second distillation refines and concentrates' },
          { step: 3, title: 'Cuts', description: 'Master distiller selects only the "hearts" of the run' },
          { step: 4, title: 'White Dog', description: 'Clear spirit at 125 proof, ready for the barrel' }
        ],
        artifacts: [
          { name: 'Original Column Still', year: 1936, description: 'The grandmother still that shaped generations' },
          { name: 'Spirit Safe', year: 1950, description: 'Where the distillate is tested and approved' }
        ],
        funFact: 'The "white dog" that comes off the still is already bourbon - it just hasn\'t aged yet. Some distilleries sell this unaged spirit!',
        nextRooms: ['barrel-filling', 'warehouse']
      },
      {
        id: 'barrel-filling',
        name: 'Barrel Filling Station',
        icon: '🛢️',
        description: 'Watch new-make spirit enter its charred oak home for years of aging...',
        ambiance: 'The char of fresh barrels mingles with white dog spirit. Workers roll barrels with practiced precision.',
        process: [
          { step: 1, title: 'Barrel Selection', description: 'New charred American white oak barrels only' },
          { step: 2, title: 'Char Level', description: 'Level 4 char (55 seconds of fire) is standard' },
          { step: 3, title: 'Filling', description: 'Spirit enters at 125 proof (62.5% ABV)' },
          { step: 4, title: 'Bunging', description: 'The barrel is sealed with an oak bung' }
        ],
        artifacts: [
          { name: 'Charring Torch', year: 1960, description: 'The flame that creates the magic' },
          { name: 'Filling Hose', year: 1970, description: 'Modern but unchanged in principle' }
        ],
        funFact: 'A new barrel costs about $200-250. Each can only be used ONCE for bourbon (by law), then it\'s sold to scotch or rum makers!',
        nextRooms: ['warehouse']
      },
      {
        id: 'warehouse',
        name: 'Warehouse H (The Haunted Warehouse)',
        icon: '🏚️',
        description: 'Step into the legendary Warehouse H, where ghosts and great bourbon coexist...',
        ambiance: 'Rows of barrels stretch into darkness. The wood creaks. Temperature swings create the "breathing" that makes bourbon.',
        features: [
          { name: 'Rick Houses', description: '9 floors of aging barrels' },
          { name: 'Honey Spots', description: 'Locations that produce the best bourbon' },
          { name: 'Angel\'s Share', description: '3-5% evaporates each year to the "angels"' }
        ],
        artifacts: [
          { name: 'Oldest Barrel', year: 1985, description: 'Nearly 40 years aging, destined for special release' },
          { name: 'First Blanton\'s Barrel', year: 1984, description: 'The barrel that started single barrel bourbon' },
          { name: 'Ghost Story Collection', year: 'Various', description: 'Workers report unexplained footsteps and cold spots' }
        ],
        funFact: 'Warehouse H is reportedly haunted! Workers have reported strange sounds, cold spots, and the feeling of being watched. The distillery embraces its supernatural reputation.',
        nextRooms: ['tasting-room', 'gift-shop']
      },
      {
        id: 'tasting-room',
        name: 'The Tasting Room',
        icon: '🥃',
        description: 'The moment you\'ve been waiting for - sample the fruits of 250 years of expertise...',
        ambiance: 'Warm wood panels, soft lighting, gleaming glasses. The bar is lined with bottles spanning decades.',
        tastings: [
          { name: 'Buffalo Trace', age: 'NAS', notes: 'Vanilla, caramel, gentle spice' },
          { name: 'Eagle Rare 10', age: '10 years', notes: 'Oak, toffee, orange peel, leather' },
          { name: 'Blanton\'s Original', age: 'NAS', notes: 'Brown sugar, nutmeg, orange, honey' },
          { name: 'E.H. Taylor Small Batch', age: 'NAS', notes: 'Caramel corn, butterscotch, licorice' },
          { name: 'W.L. Weller Special Reserve', age: 'NAS', notes: 'Wheat sweetness, honey, cherry' }
        ],
        funFact: 'Pappy Van Winkle is made here but aged at a separate facility. Only distillery employees can taste it during production!',
        nextRooms: ['gift-shop']
      },
      {
        id: 'gift-shop',
        name: 'The Gift Shop',
        icon: '🎁',
        description: 'Take home a piece of bourbon history...',
        ambiance: 'Bottles line the walls, some available nowhere else. Merchandise and memorabilia abound.',
        exclusives: [
          { name: 'Buffalo Trace Distillery Only Releases', description: 'Special bottlings only sold on-site' },
          { name: 'Single Barrel Selections', description: 'Hand-picked barrels for the gift shop' },
          { name: 'Experimental Collection', description: 'Limited releases from their experimental program' }
        ],
        funFact: 'The gift shop sometimes has bottles that are impossible to find elsewhere - but you have to be there on the right day!',
        nextRooms: ['entrance']
      }
    ]
  },
  'makers-mark': {
    name: 'Maker\'s Mark Distillery',
    location: 'Loretto, Kentucky',
    founded: 1953,
    tagline: 'The First Bourbon National Historic Landmark',
    atmosphere: 'Rolling hills, red shutters, and that iconic red wax',
    famousFor: ['Maker\'s Mark', 'Maker\'s 46', 'Maker\'s Mark Cask Strength', 'Private Select'],
    rooms: [
      {
        id: 'entrance',
        name: 'The Star Hill Farm',
        icon: '⭐',
        description: 'You arrive at the picturesque Star Hill Farm, home of Maker\'s Mark since 1953...',
        ambiance: 'Black painted buildings with red shutters. The iconic star emblem greets you. The property looks more like a historic farm than an industrial distillery.',
        artifacts: [
          { name: 'Margie Samuels\' Sketches', year: 1953, description: 'Original designs for the bottle and label' },
          { name: 'First Bottle', year: 1958, description: 'The first red-wax-dipped Maker\'s Mark ever sold' }
        ],
        funFact: 'Margie Samuels, Bill\'s wife, designed everything - the bottle, label, name, and the signature red wax. She even hand-dipped the first bottles herself!',
        nextRooms: ['history-room', 'grain-room']
      },
      {
        id: 'grain-room',
        name: 'The Grain Room',
        icon: '🌾',
        description: 'Discover why Maker\'s uses red winter wheat instead of rye...',
        ambiance: 'Bins of corn, wheat, and malted barley. The sweet smell of grain.',
        process: [
          { step: 1, title: 'Soft Red Winter Wheat', description: 'Instead of rye, creating a smoother, sweeter bourbon' },
          { step: 2, title: 'Non-GMO Corn', description: '70% of the mash bill' },
          { step: 3, title: 'Malted Barley', description: 'For enzyme conversion' }
        ],
        funFact: 'Bill Samuels Sr. spent 6 years perfecting the recipe before making a single batch. He baked bread with different grain combinations and ate them to judge the flavors!',
        nextRooms: ['still-house', 'wax-room']
      },
      {
        id: 'wax-room',
        name: 'The Wax Room',
        icon: '🔴',
        description: 'Watch bottles get hand-dipped in that famous red wax...',
        ambiance: 'Workers rotate bottles by hand through molten red wax. Each one is unique.',
        process: [
          { step: 1, title: 'Hand Rotation', description: 'Each bottle is dipped and rotated by hand' },
          { step: 2, title: 'Drip Pattern', description: 'The unique drips make every bottle one-of-a-kind' },
          { step: 3, title: 'Quality Check', description: 'Each bottle is inspected for proper seal' }
        ],
        funFact: 'It takes 9 years of practice before a wax dipper is considered fully trained. The most experienced dippers can do about 23 bottles per minute!',
        nextRooms: ['tasting-room', 'gift-shop']
      }
    ]
  }
}

export default function DistilleryTourPage() {
  const [selectedDistillery, setSelectedDistillery] = useState<string>('buffalo-trace')
  const [currentRoom, setCurrentRoom] = useState<string>('entrance')
  const [visitedRooms, setVisitedRooms] = useState<string[]>(['entrance'])
  const [showMap, setShowMap] = useState(false)
  const [ambientMode, setAmbientMode] = useState(true)

  const distillery = DISTILLERY_TOURS[selectedDistillery as keyof typeof DISTILLERY_TOURS]
  const room = distillery?.rooms.find(r => r.id === currentRoom)

  const navigateToRoom = (roomId: string) => {
    setCurrentRoom(roomId)
    if (!visitedRooms.includes(roomId)) {
      setVisitedRooms([...visitedRooms, roomId])
    }
  }

  const tourProgress = distillery ? Math.round((visitedRooms.length / distillery.rooms.length) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-amber-950/20 to-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMap(!showMap)}
              className={`px-4 py-2 rounded-lg transition-colors ${showMap ? 'bg-amber-600' : 'bg-stone-700'}`}
            >
              🗺️ Map
            </button>
            <button
              onClick={() => setAmbientMode(!ambientMode)}
              className={`px-4 py-2 rounded-lg transition-colors ${ambientMode ? 'bg-amber-600' : 'bg-stone-700'}`}
            >
              {ambientMode ? '🔊' : '🔇'} Ambiance
            </button>
            <Link href="/museum" className="hover:text-amber-400 transition-colors">Museum</Link>
          </div>
        </div>
      </header>

      {/* Distillery Selector */}
      <div className="bg-stone-800/50 border-b border-stone-700/50 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Select Distillery:</span>
            {Object.entries(DISTILLERY_TOURS).map(([id, d]) => (
              <button
                key={id}
                onClick={() => {
                  setSelectedDistillery(id)
                  setCurrentRoom('entrance')
                  setVisitedRooms(['entrance'])
                }}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedDistillery === id
                    ? 'bg-amber-600 scale-105'
                    : 'bg-stone-700 hover:bg-stone-600'
                }`}
              >
                {d.name}
              </button>
            ))}
            <span className="text-xs text-gray-500 ml-4">(More coming soon!)</span>
          </div>
        </div>
      </div>

      {distillery && room && (
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Tour Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">{distillery.name} Virtual Tour</h2>
              <span className="text-amber-400">{tourProgress}% Complete</span>
            </div>
            <div className="w-full bg-stone-800 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${tourProgress}%` }}
              />
            </div>
            <div className="flex gap-2 mt-3">
              {distillery.rooms.map((r) => (
                <div
                  key={r.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer transition-all ${
                    r.id === currentRoom
                      ? 'bg-amber-500 scale-110'
                      : visitedRooms.includes(r.id)
                        ? 'bg-green-600'
                        : 'bg-stone-700'
                  }`}
                  onClick={() => visitedRooms.includes(r.id) && navigateToRoom(r.id)}
                  title={r.name}
                >
                  {r.icon}
                </div>
              ))}
            </div>
          </div>

          {/* Main Experience */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Room View - 2 columns */}
            <div className="lg:col-span-2">
              {/* Room Header */}
              <div className="bg-gradient-to-br from-amber-900/50 via-stone-800/50 to-amber-950/50 rounded-3xl p-8 border border-amber-500/30 mb-6 relative overflow-hidden">
                {/* Ambient background */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/30 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-6xl mb-4">{room.icon}</div>
                      <h1 className="text-4xl font-bold mb-2">{room.name}</h1>
                      <p className="text-amber-400">{distillery.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-amber-600 px-3 py-1 rounded-full text-sm">Room {distillery.rooms.findIndex(r => r.id === room.id) + 1} of {distillery.rooms.length}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xl text-gray-200 mb-6 italic">"{room.description}"</p>

                  {/* Ambiance */}
                  {ambientMode && room.ambiance && (
                    <div className="bg-black/30 rounded-xl p-4 mb-6">
                      <p className="text-gray-400 flex items-start gap-2">
                        <span>🎧</span>
                        <span className="italic">{room.ambiance}</span>
                      </p>
                      {room.sounds && (
                        <div className="flex gap-2 mt-3">
                          {room.sounds.map((sound, i) => (
                            <span key={i} className="bg-stone-700/50 px-2 py-1 rounded text-xs text-gray-400">
                              🔊 {sound}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Process Steps (if any) */}
                  {room.process && (
                    <div className="mb-6">
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        <span>⚙️</span> The Process
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {room.process.map((step) => (
                          <div key={step.step} className="bg-stone-800/50 rounded-lg p-4 border border-stone-700/50">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-sm font-bold">{step.step}</span>
                              <span className="font-semibold">{step.title}</span>
                            </div>
                            <p className="text-sm text-gray-400">{step.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline (if any) */}
                  {room.timeline && (
                    <div className="mb-6">
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        <span>📅</span> Timeline
                      </h3>
                      <div className="space-y-2">
                        {room.timeline.map((item, i) => (
                          <div key={i} className="flex items-center gap-4 bg-stone-800/30 rounded-lg p-3">
                            <span className="text-amber-400 font-bold w-16">{item.year}</span>
                            <span className="text-gray-300">{item.event}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tastings (if any) */}
                  {room.tastings && (
                    <div className="mb-6">
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        <span>🥃</span> Available Tastings
                      </h3>
                      <div className="grid gap-3">
                        {room.tastings.map((tasting, i) => (
                          <div key={i} className="bg-stone-800/50 rounded-lg p-4 border border-amber-500/30 flex items-center justify-between">
                            <div>
                              <h4 className="font-bold">{tasting.name}</h4>
                              <p className="text-sm text-gray-400">{tasting.notes}</p>
                            </div>
                            <span className="bg-amber-900/50 px-3 py-1 rounded text-amber-400 text-sm">{tasting.age}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fun Fact */}
                  {room.funFact && (
                    <div className="bg-amber-900/30 rounded-xl p-4 border border-amber-500/30">
                      <p className="text-sm text-amber-400 font-semibold mb-1">💡 Did You Know?</p>
                      <p className="text-gray-300">{room.funFact}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="bg-stone-800/50 rounded-2xl p-6 border border-stone-700/50">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span>🚶</span> Where would you like to go next?
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {room.nextRooms?.map((nextRoomId) => {
                    const nextRoom = distillery.rooms.find(r => r.id === nextRoomId)
                    if (!nextRoom) return null
                    return (
                      <button
                        key={nextRoomId}
                        onClick={() => navigateToRoom(nextRoomId)}
                        className="bg-gradient-to-r from-amber-900/50 to-stone-800/50 hover:from-amber-800/50 hover:to-stone-700/50 rounded-xl p-4 text-left transition-all border border-stone-700/50 hover:border-amber-500/50 group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl group-hover:scale-110 transition-transform">{nextRoom.icon}</span>
                          <div>
                            <h4 className="font-bold">{nextRoom.name}</h4>
                            <p className="text-sm text-gray-400">Continue the tour →</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Artifacts */}
              {room.artifacts && (
                <div className="bg-stone-800/50 rounded-2xl p-6 border border-amber-900/30">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <span>🖼️</span> Artifacts in This Room
                  </h3>
                  <div className="space-y-3">
                    {room.artifacts.map((artifact, i) => (
                      <div key={i} className="bg-stone-700/50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-sm">{artifact.name}</h4>
                          <span className="text-xs text-amber-400">{artifact.year}</span>
                        </div>
                        <p className="text-xs text-gray-400">{artifact.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Distillery Info */}
              <div className="bg-stone-800/50 rounded-2xl p-6 border border-stone-700/50">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span>🏭</span> About {distillery.name}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location</span>
                    <span>{distillery.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Founded</span>
                    <span>{distillery.founded}</span>
                  </div>
                  <div className="border-t border-stone-700 pt-3">
                    <p className="text-gray-400 mb-2">Famous For:</p>
                    <div className="flex flex-wrap gap-1">
                      {distillery.famousFor.map((brand, i) => (
                        <span key={i} className="bg-amber-900/50 px-2 py-1 rounded text-xs">{brand}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Share */}
              <div className="bg-gradient-to-br from-amber-900/30 to-stone-800/30 rounded-2xl p-6 border border-amber-500/30 text-center">
                <div className="text-4xl mb-3">📸</div>
                <h3 className="font-bold mb-2">Share Your Tour</h3>
                <p className="text-sm text-gray-400 mb-4">Let friends know you're exploring {distillery.name}!</p>
                <button className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-lg font-semibold transition-colors">
                  Share on Twitter
                </button>
              </div>

              {/* Complete Tour Badge */}
              {tourProgress === 100 && (
                <div className="bg-gradient-to-br from-yellow-900/50 to-amber-900/50 rounded-2xl p-6 border border-yellow-500/50 text-center">
                  <div className="text-5xl mb-3">🏆</div>
                  <h3 className="font-bold text-xl mb-2">Tour Complete!</h3>
                  <p className="text-gray-400 text-sm mb-4">You've explored all of {distillery.name}</p>
                  <div className="bg-yellow-600 text-black py-2 rounded-lg font-bold">
                    +100 XP Earned!
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* Tour Map Modal */}
      {showMap && distillery && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowMap(false)}>
          <div className="bg-stone-800 rounded-2xl p-8 max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">🗺️ Tour Map</h2>
              <button onClick={() => setShowMap(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {distillery.rooms.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    if (visitedRooms.includes(r.id)) {
                      navigateToRoom(r.id)
                      setShowMap(false)
                    }
                  }}
                  disabled={!visitedRooms.includes(r.id)}
                  className={`p-4 rounded-xl text-center transition-all ${
                    r.id === currentRoom
                      ? 'bg-amber-600 scale-105'
                      : visitedRooms.includes(r.id)
                        ? 'bg-green-900/50 hover:bg-green-800/50 cursor-pointer'
                        : 'bg-stone-700/50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="text-3xl mb-2">{r.icon}</div>
                  <div className="text-sm font-semibold">{r.name}</div>
                  {visitedRooms.includes(r.id) && r.id !== currentRoom && (
                    <div className="text-xs text-green-400 mt-1">✓ Visited</div>
                  )}
                  {r.id === currentRoom && (
                    <div className="text-xs text-amber-200 mt-1">📍 You are here</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

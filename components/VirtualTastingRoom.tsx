'use client'

import { useState, useEffect } from 'react'
import {
  Wine, Users, Video, Calendar, Star, Clock, MapPin,
  Mic, MicOff, Video as VideoIcon, VideoOff, MessageSquare,
  ThumbsUp, Share2, Gift, Crown, Sparkles, Globe, Award
} from 'lucide-react'

interface TastingEvent {
  id: string
  title: string
  host: string
  hostTitle: string
  hostAvatar: string
  date: string
  time: string
  duration: string
  spirits: Spirit[]
  attendees: number
  maxAttendees: number
  price: number
  isPremium: boolean
  isLive: boolean
  rating: number
  tags: string[]
}

interface Spirit {
  id: string
  name: string
  type: string
  distillery: string
  age?: number
  proof: number
  price: number
  rating: number
  image: string
}

interface TastingNote {
  odor: string[]
  palate: string[]
  finish: string[]
  rating: number
  comment: string
}

const UPCOMING_EVENTS: TastingEvent[] = [
  {
    id: '1', title: 'Japanese Whisky Masterclass', host: 'Takeshi Yamamoto', hostTitle: 'Master Blender, Yamazaki',
    hostAvatar: '🎌', date: '2025-01-05', time: '7:00 PM EST', duration: '90 min',
    spirits: [
      { id: 's1', name: 'Yamazaki 12', type: 'Single Malt', distillery: 'Yamazaki', age: 12, proof: 86, price: 150, rating: 4.8, image: '🥃' },
      { id: 's2', name: 'Hibiki Harmony', type: 'Blended', distillery: 'Suntory', proof: 86, price: 80, rating: 4.6, image: '🥃' },
      { id: 's3', name: 'Nikka Coffey Grain', type: 'Grain Whisky', distillery: 'Nikka', proof: 90, price: 65, rating: 4.5, image: '🥃' },
    ],
    attendees: 45, maxAttendees: 50, price: 49, isPremium: true, isLive: false, rating: 4.9,
    tags: ['Japanese', 'Whisky', 'Masterclass']
  },
  {
    id: '2', title: 'Bourbon 101: Kentucky Heritage', host: 'Sarah Mitchell', hostTitle: 'Head Distiller, Buffalo Trace',
    hostAvatar: '🤠', date: '2025-01-08', time: '8:00 PM EST', duration: '60 min',
    spirits: [
      { id: 's4', name: 'Buffalo Trace', type: 'Bourbon', distillery: 'Buffalo Trace', proof: 90, price: 30, rating: 4.5, image: '🥃' },
      { id: 's5', name: 'Eagle Rare 10', type: 'Bourbon', distillery: 'Buffalo Trace', age: 10, proof: 90, price: 45, rating: 4.7, image: '🥃' },
    ],
    attendees: 82, maxAttendees: 100, price: 0, isPremium: false, isLive: false, rating: 4.7,
    tags: ['Bourbon', 'Kentucky', 'Beginner']
  },
  {
    id: '3', title: 'LIVE: Scotch & Stories', host: 'Ian MacGregor', hostTitle: 'Brand Ambassador, Glenfiddich',
    hostAvatar: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', date: 'NOW', time: 'LIVE', duration: '75 min',
    spirits: [
      { id: 's6', name: 'Glenfiddich 15 Solera', type: 'Single Malt', distillery: 'Glenfiddich', age: 15, proof: 80, price: 65, rating: 4.6, image: '🥃' },
    ],
    attendees: 127, maxAttendees: 200, price: 29, isPremium: true, isLive: true, rating: 4.8,
    tags: ['Scotch', 'Live', 'Stories']
  },
]

export default function VirtualTastingRoom() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'past' | 'host'>('upcoming')
  const [selectedEvent, setSelectedEvent] = useState<TastingEvent | null>(null)
  const [inRoom, setInRoom] = useState(false)
  const [micOn, setMicOn] = useState(false)
  const [videoOn, setVideoOn] = useState(true)
  const [tastingNotes, setTastingNotes] = useState<TastingNote>({
    odor: [], palate: [], finish: [], rating: 0, comment: ''
  })

  const flavorOptions = {
    odor: ['Vanilla', 'Caramel', 'Oak', 'Smoke', 'Fruit', 'Spice', 'Honey', 'Floral', 'Leather', 'Tobacco'],
    palate: ['Sweet', 'Spicy', 'Oaky', 'Fruity', 'Nutty', 'Smoky', 'Creamy', 'Peppery', 'Citrus', 'Chocolate'],
    finish: ['Long', 'Short', 'Warm', 'Dry', 'Sweet', 'Spicy', 'Smooth', 'Complex', 'Clean', 'Lingering']
  }

  const toggleFlavor = (category: 'odor' | 'palate' | 'finish', flavor: string) => {
    setTastingNotes(prev => ({
      ...prev,
      [category]: prev[category].includes(flavor)
        ? prev[category].filter(f => f !== flavor)
        : [...prev[category], flavor]
    }))
  }

  if (inRoom && selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Live Room Header */}
        <div className="bg-gradient-to-r from-amber-900 to-orange-900 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-red-500 rounded text-xs font-bold animate-pulse">🔴 LIVE</span>
              <h1 className="font-bold">{selectedEvent.title}</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-sm"><Users className="w-4 h-4" />{selectedEvent.attendees}</span>
              <button onClick={() => setInRoom(false)} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm">
                Leave Room
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
          {/* Video Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center relative">
              <div className="text-center">
                <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
                  {selectedEvent.hostAvatar}
                </div>
                <p className="font-bold text-lg">{selectedEvent.host}</p>
                <p className="text-amber-400 text-sm">{selectedEvent.hostTitle}</p>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-4">
                <button onClick={() => setMicOn(!micOn)} className={`p-3 rounded-full ${micOn ? 'bg-gray-700' : 'bg-red-600'}`}>
                  {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
                <button onClick={() => setVideoOn(!videoOn)} className={`p-3 rounded-full ${videoOn ? 'bg-gray-700' : 'bg-red-600'}`}>
                  {videoOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
                <button className="p-3 rounded-full bg-gray-700"><MessageSquare className="w-5 h-5" /></button>
                <button className="p-3 rounded-full bg-gray-700"><Share2 className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Current Spirit */}
            <div className="bg-gray-900 rounded-xl p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Wine className="w-5 h-5 text-amber-400" /> Currently Tasting
              </h3>
              {selectedEvent.spirits[0] && (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-amber-500/20 rounded-xl flex items-center justify-center text-4xl">
                    {selectedEvent.spirits[0].image}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{selectedEvent.spirits[0].name}</h4>
                    <p className="text-gray-400">{selectedEvent.spirits[0].distillery} • {selectedEvent.spirits[0].type}</p>
                    <p className="text-amber-400">{selectedEvent.spirits[0].proof} proof {selectedEvent.spirits[0].age && `• ${selectedEvent.spirits[0].age} years`}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tasting Notes Panel */}
          <div className="bg-gray-900 rounded-xl p-4 h-fit">
            <h3 className="font-semibold mb-4">📝 Your Tasting Notes</h3>
            
            {['odor', 'palate', 'finish'].map(category => (
              <div key={category} className="mb-4">
                <p className="text-sm text-gray-400 mb-2 capitalize">{category === 'odor' ? 'Nose' : category}</p>
                <div className="flex flex-wrap gap-1">
                  {flavorOptions[category as keyof typeof flavorOptions].map(flavor => (
                    <button
                      key={flavor}
                      onClick={() => toggleFlavor(category as 'odor' | 'palate' | 'finish', flavor)}
                      className={`px-2 py-1 text-xs rounded ${
                        // 2026-09-01: Array.isArray narrows before .includes. The indexed value is
                        // 'string | null | string[]', and string has .includes while null
                        // does not — the optional-call `?.includes?.()` hid that from the
                        // reader without satisfying the checker.
                        (Array.isArray(tastingNotes[category as keyof TastingNote])
                          ? (tastingNotes[category as keyof TastingNote] as string[]).includes(flavor)
                          : false)
                          ? 'bg-amber-500 text-white'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setTastingNotes(prev => ({ ...prev, rating: star }))}
                    className={`text-2xl ${tastingNotes.rating >= star ? 'text-yellow-400' : 'text-gray-600'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={tastingNotes.comment}
              onChange={(e) => setTastingNotes(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Add your notes..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
              rows={3}
            />

            <button className="w-full mt-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg font-medium">
              Save to Collection
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 to-orange-900 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <Wine className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Virtual Tasting Room</h1>
            <p className="text-amber-200">Join live tastings with master distillers and experts</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'upcoming', label: 'Upcoming', icon: Calendar },
          { id: 'live', label: 'Live Now', icon: Video, badge: '1' },
          { id: 'past', label: 'Recordings', icon: Clock },
          { id: 'host', label: 'Host a Tasting', icon: Mic },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              activeTab === tab.id ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.badge && <span className="px-1.5 py-0.5 bg-red-500 text-xs rounded-full">{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {UPCOMING_EVENTS.filter(e => activeTab === 'live' ? e.isLive : !e.isLive).map(event => (
          <div key={event.id} className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden hover:border-amber-500/50 transition-all">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center text-2xl">
                    {event.hostAvatar}
                  </div>
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-gray-400">{event.host}</p>
                  </div>
                </div>
                {event.isLive && <span className="px-2 py-1 bg-red-500 rounded text-xs font-bold animate-pulse">LIVE</span>}
                {event.isPremium && !event.isLive && <Crown className="w-5 h-5 text-yellow-400" />}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{event.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {event.spirits.slice(0, 3).map(spirit => (
                  <div key={spirit.id} className="px-2 py-1 bg-gray-800 rounded text-xs">{spirit.name}</div>
                ))}
                {event.spirits.length > 3 && <span className="text-xs text-gray-500">+{event.spirits.length - 3} more</span>}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{event.attendees}/{event.maxAttendees}</span>
                </div>
                <div className="flex items-center gap-2">
                  {event.price === 0 ? (
                    <span className="text-green-400 font-bold">FREE</span>
                  ) : (
                    <span className="font-bold">${event.price}</span>
                  )}
                  <button
                    onClick={() => { setSelectedEvent(event); setInRoom(true); }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-sm font-medium"
                  >
                    {event.isLive ? 'Join Now' : 'Register'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

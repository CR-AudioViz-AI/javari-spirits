'use client'

import { useState } from 'react'
import Link from 'next/link'

// Mock events data
const EVENTS = [
  {
    id: 1,
    title: 'Virtual Bourbon Tasting: Buffalo Trace Mashbills',
    type: 'Virtual Tasting',
    date: '2024-12-15',
    time: '7:00 PM EST',
    host: 'BarrelVerse Academy',
    image: '🥃',
    price: 'Free',
    attendees: 234,
    maxAttendees: 500,
    description: 'Join us for a guided tasting of Buffalo Trace\'s different mashbill expressions. We\'ll compare #1 (Buffalo Trace, Eagle Rare) and #2 (Blanton\'s, Elmer T. Lee) mashbills.',
    requirements: ['Buffalo Trace', 'Eagle Rare', 'Blanton\'s (optional)'],
    featured: true
  },
  {
    id: 2,
    title: 'Pappy Van Winkle Release Day Meet-Up',
    type: 'In-Person',
    date: '2024-12-18',
    time: '6:00 AM EST',
    location: 'Total Wine Louisville, KY',
    host: 'Louisville Bourbon Society',
    image: '🎉',
    price: 'Free',
    attendees: 45,
    maxAttendees: 100,
    description: 'Join fellow hunters for the annual Pappy drop! We\'ll line up together, share stories, and celebrate (or commiserate) afterward.',
    featured: true
  },
  {
    id: 3,
    title: 'Scotch 101: Introduction to Single Malts',
    type: 'Virtual Class',
    date: '2024-12-20',
    time: '8:00 PM EST',
    host: 'Highland Expert Sarah',
    image: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    price: '$20',
    attendees: 89,
    maxAttendees: 200,
    description: 'Perfect for bourbon drinkers curious about Scotch. We\'ll explore the five regions and taste representative expressions from each.',
    requirements: ['Glenfiddich 12', 'Laphroaig 10'],
    featured: false
  },
  {
    id: 4,
    title: 'Cocktail Workshop: Classic Whiskey Cocktails',
    type: 'Virtual Workshop',
    date: '2024-12-22',
    time: '6:00 PM EST',
    host: 'Mixologist Maria',
    image: '🍸',
    price: '$15',
    attendees: 156,
    maxAttendees: 300,
    description: 'Learn to make the perfect Old Fashioned, Whiskey Sour, and Manhattan. Live instruction with Q&A.',
    requirements: ['Bourbon', 'Bitters', 'Simple syrup', 'Fresh citrus'],
    featured: false
  },
  {
    id: 5,
    title: 'New Year\'s Eve Whiskey Celebration',
    type: 'Virtual Tasting',
    date: '2024-12-31',
    time: '10:00 PM EST',
    host: 'BarrelVerse Community',
    image: '🎆',
    price: 'Free',
    attendees: 890,
    maxAttendees: 2000,
    description: 'Ring in the new year with fellow enthusiasts! Share your favorite pour of the year and toast to 2025.',
    featured: true
  },
  {
    id: 6,
    title: 'Kentucky Bourbon Trail Group Trip',
    type: 'In-Person Trip',
    date: '2025-03-15',
    time: 'All Day',
    location: 'Kentucky',
    host: 'BarrelVerse Adventures',
    image: '🚌',
    price: '$450',
    attendees: 22,
    maxAttendees: 40,
    description: '3-day guided tour of the Kentucky Bourbon Trail. Visit Buffalo Trace, Maker\'s Mark, Woodford Reserve, and more. Includes hotels and transportation.',
    featured: true
  }
]

const EVENT_TYPES = ['All', 'Virtual Tasting', 'Virtual Class', 'Virtual Workshop', 'In-Person', 'In-Person Trip']

const CALENDAR_DAYS = [
  { day: 15, events: 1 },
  { day: 18, events: 1 },
  { day: 20, events: 1 },
  { day: 22, events: 1 },
  { day: 25, events: 0 },
  { day: 31, events: 1 }
]

export default function EventsPage() {
  const [selectedType, setSelectedType] = useState('All')
  const [selectedEvent, setSelectedEvent] = useState<typeof EVENTS[0] | null>(null)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [myEvents, setMyEvents] = useState<number[]>([1])

  const filteredEvents = EVENTS.filter(e => 
    selectedType === 'All' || e.type === selectedType
  )

  const isRegistered = (eventId: number) => myEvents.includes(eventId)

  const toggleRegistration = (eventId: number) => {
    setMyEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-orange-950/20 to-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-orange-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-4">
            <Link href="/community" className="hover:text-amber-400 transition-colors">Community</Link>
            <Link href="/academy" className="hover:text-amber-400 transition-colors">Academy</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-orange-600 to-red-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-4">
            📅 EVENTS & TASTINGS
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Experience Spirits <span className="text-orange-400">Together</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Virtual tastings, in-person meetups, distillery trips, and more. 
            Connect with the community.
          </p>
        </div>

        {/* View Toggle & Filters */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
          <div className="flex gap-2">
            {['list', 'calendar'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v as 'list' | 'calendar')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  view === v ? 'bg-orange-600' : 'bg-stone-800 hover:bg-stone-700'
                }`}
              >
                {v === 'list' ? '📋 List' : '📅 Calendar'}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedType === type ? 'bg-orange-600' : 'bg-stone-800 hover:bg-stone-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {view === 'list' && (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`bg-stone-800/50 rounded-xl border transition-all cursor-pointer overflow-hidden ${
                      event.featured 
                        ? 'border-orange-500/50 bg-gradient-to-r from-orange-900/20 to-stone-800/50' 
                        : 'border-stone-700/50 hover:border-orange-500/50'
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Date Badge */}
                        <div className="bg-orange-600 rounded-lg p-3 text-center min-w-16">
                          <p className="text-2xl font-bold">
                            {new Date(event.date).getDate()}
                          </p>
                          <p className="text-xs uppercase">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                          </p>
                        </div>
                        
                        {/* Event Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{event.image}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              event.type.includes('Virtual') ? 'bg-blue-600' :
                              event.type.includes('Trip') ? 'bg-purple-600' : 'bg-green-600'
                            }`}>
                              {event.type}
                            </span>
                            {event.featured && (
                              <span className="text-xs px-2 py-0.5 rounded bg-orange-600">⭐ Featured</span>
                            )}
                          </div>
                          <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                          <p className="text-sm text-gray-400">
                            {event.time} • Hosted by {event.host}
                          </p>
                          {event.location && (
                            <p className="text-sm text-orange-400">📍 {event.location}</p>
                          )}
                        </div>
                        
                        {/* Price & Register */}
                        <div className="text-right">
                          <p className={`text-xl font-bold ${
                            event.price === 'Free' ? 'text-green-400' : 'text-orange-400'
                          }`}>
                            {event.price}
                          </p>
                          <p className="text-xs text-gray-500">
                            {event.attendees}/{event.maxAttendees} registered
                          </p>
                          {isRegistered(event.id) && (
                            <span className="text-xs text-green-400">✓ Registered</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {view === 'calendar' && (
              <div className="bg-stone-800/50 rounded-2xl p-6 border border-stone-700/50">
                <div className="flex items-center justify-between mb-6">
                  <button className="text-gray-400 hover:text-white">← Previous</button>
                  <h2 className="text-xl font-bold">December 2024</h2>
                  <button className="text-gray-400 hover:text-white">Next →</button>
                </div>
                
                <div className="grid grid-cols-7 gap-2 mb-4 text-center text-sm text-gray-500">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day}>{day}</div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty cells for month start */}
                  {[...Array(6)].map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {/* Days */}
                  {[...Array(31)].map((_, i) => {
                    const day = i + 1
                    const hasEvent = CALENDAR_DAYS.some(d => d.day === day && d.events > 0)
                    return (
                      <div
                        key={day}
                        className={`aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transition-colors ${
                          hasEvent 
                            ? 'bg-orange-600 hover:bg-orange-500' 
                            : 'bg-stone-700/50 hover:bg-stone-600/50'
                        }`}
                      >
                        <span className="font-medium">{day}</span>
                        {hasEvent && <span className="text-xs">🥃</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Events */}
            <div className="bg-gradient-to-br from-orange-900/30 to-stone-800/30 rounded-xl p-6 border border-orange-500/30">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span>🎟️</span> My Registered Events
              </h3>
              {myEvents.length > 0 ? (
                <div className="space-y-3">
                  {EVENTS.filter(e => myEvents.includes(e.id)).map(event => (
                    <div key={event.id} className="bg-black/30 rounded-lg p-3">
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString()} • {event.time}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No events registered yet</p>
              )}
            </div>

            {/* Upcoming */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span>⏰</span> Coming Up
              </h3>
              <div className="space-y-3">
                {EVENTS.slice(0, 3).map(event => (
                  <div key={event.id} className="flex items-center gap-3">
                    <div className="bg-orange-900/50 w-10 h-10 rounded flex items-center justify-center text-lg">
                      {event.image}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{event.title.substring(0, 30)}...</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Host an Event */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50 text-center">
              <p className="text-3xl mb-2">🎤</p>
              <h3 className="font-bold mb-2">Host an Event</h3>
              <p className="text-sm text-gray-400 mb-4">
                Share your expertise with the community
              </p>
              <button className="bg-orange-600 hover:bg-orange-500 px-6 py-2 rounded-lg text-sm font-semibold transition-colors">
                Submit Event
              </button>
            </div>

            {/* Add to Calendar */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4">📅 Sync Calendar</h3>
              <p className="text-sm text-gray-400 mb-4">
                Add events directly to your calendar
              </p>
              <div className="space-y-2">
                <button className="w-full bg-stone-700 hover:bg-stone-600 py-2 rounded-lg text-sm">
                  Google Calendar
                </button>
                <button className="w-full bg-stone-700 hover:bg-stone-600 py-2 rounded-lg text-sm">
                  Apple Calendar
                </button>
                <button className="w-full bg-stone-700 hover:bg-stone-600 py-2 rounded-lg text-sm">
                  Outlook
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-stone-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="aspect-video bg-gradient-to-br from-orange-900/50 to-stone-800 flex items-center justify-center relative">
              <span className="text-9xl">{selectedEvent.image}</span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/80"
              >
                ✕
              </button>
              <span className={`absolute top-4 left-4 text-sm px-3 py-1 rounded ${
                selectedEvent.type.includes('Virtual') ? 'bg-blue-600' :
                selectedEvent.type.includes('Trip') ? 'bg-purple-600' : 'bg-green-600'
              }`}>
                {selectedEvent.type}
              </span>
            </div>
            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-orange-600 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold">
                    {new Date(selectedEvent.date).getDate()}
                  </p>
                  <p className="text-xs uppercase">
                    {new Date(selectedEvent.date).toLocaleDateString('en-US', { month: 'short' })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">{selectedEvent.time}</p>
                  <p className="text-gray-400">Hosted by {selectedEvent.host}</p>
                  {selectedEvent.location && (
                    <p className="text-orange-400">📍 {selectedEvent.location}</p>
                  )}
                </div>
              </div>
              
              <h2 className="text-3xl font-bold mb-4">{selectedEvent.title}</h2>
              <p className="text-gray-400 mb-6">{selectedEvent.description}</p>
              
              {selectedEvent.requirements && (
                <div className="bg-stone-800/50 rounded-lg p-4 mb-6">
                  <h3 className="font-bold mb-2">🥃 What You'll Need</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {selectedEvent.requirements.map((req, i) => (
                      <li key={i}>• {req}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-3xl font-bold text-orange-400">{selectedEvent.price}</p>
                  <p className="text-sm text-gray-500">
                    {selectedEvent.attendees}/{selectedEvent.maxAttendees} registered
                  </p>
                </div>
                <div className="w-1/2 bg-stone-700 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${(selectedEvent.attendees / selectedEvent.maxAttendees) * 100}%` }}
                  />
                </div>
              </div>
              
              <button
                onClick={() => {
                  toggleRegistration(selectedEvent.id)
                  setSelectedEvent(null)
                }}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
                  isRegistered(selectedEvent.id)
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-orange-600 hover:bg-orange-500'
                }`}
              >
                {isRegistered(selectedEvent.id) ? 'Cancel Registration' : 'Register Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

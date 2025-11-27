'use client'

import Link from 'next/link'
import { useState } from 'react'

const CATEGORIES = [
  { 
    id: 'bourbon', 
    name: 'Bourbon', 
    icon: '🥃', 
    color: 'from-amber-500 to-amber-700',
    description: 'America\'s native spirit. Must be 51% corn, aged in new charred oak.',
    facts: ['95% made in Kentucky', 'Must be made in USA', 'No age minimum for straight bourbon'],
    topBottles: ['Buffalo Trace', 'Blanton\'s', 'Pappy Van Winkle', 'Eagle Rare'],
    games: 8,
    trivia: 150,
  },
  { 
    id: 'scotch', 
    name: 'Scotch', 
    icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 
    color: 'from-amber-700 to-amber-900',
    description: 'Scottish whisky aged minimum 3 years. Five distinct regions.',
    facts: ['5 whisky regions', 'Must be made in Scotland', 'Minimum 3 years aging'],
    topBottles: ['Macallan', 'Lagavulin', 'Glenfiddich', 'Laphroaig'],
    games: 8,
    trivia: 150,
  },
  { 
    id: 'irish', 
    name: 'Irish Whiskey', 
    icon: '☘️', 
    color: 'from-green-500 to-green-700',
    description: 'Triple distilled for smoothness. Ireland\'s oldest spirit tradition.',
    facts: ['Triple distilled', 'Oldest licensed distillery: 1608', 'Renaissance since 2010s'],
    topBottles: ['Jameson', 'Redbreast', 'Green Spot', 'Midleton'],
    games: 6,
    trivia: 100,
  },
  { 
    id: 'japanese', 
    name: 'Japanese Whisky', 
    icon: '🇯🇵', 
    color: 'from-red-500 to-red-700',
    description: 'Precision craftsmanship influenced by Scottish tradition.',
    facts: ['Started 1923 with Suntory', 'Influenced by Scotch', 'World\'s best in 2001'],
    topBottles: ['Yamazaki', 'Hibiki', 'Nikka', 'Hakushu'],
    games: 5,
    trivia: 80,
  },
  { 
    id: 'wine', 
    name: 'Wine', 
    icon: '🍷', 
    color: 'from-purple-500 to-purple-700',
    description: 'Fermented grapes with thousands of years of tradition.',
    facts: ['8000+ years of history', '1976 Judgment of Paris', '10,000+ grape varieties'],
    topBottles: ['Opus One', 'Dom Pérignon', 'Screaming Eagle', 'Penfolds Grange'],
    games: 9,
    trivia: 150,
  },
  { 
    id: 'beer', 
    name: 'Beer', 
    icon: '🍺', 
    color: 'from-yellow-500 to-yellow-700',
    description: 'The world\'s oldest and most consumed alcoholic beverage.',
    facts: ['7000+ years old', 'Reinheitsgebot 1516', '9,000+ US craft breweries'],
    topBottles: ['Pliny the Elder', 'Westvleteren 12', 'Heady Topper', 'KBS'],
    games: 8,
    trivia: 150,
  },
  { 
    id: 'tequila', 
    name: 'Tequila & Mezcal', 
    icon: '🌵', 
    color: 'from-lime-500 to-lime-700',
    description: 'Mexican agave spirits with ancient roots.',
    facts: ['Blue agave only for tequila', 'Jalisco region', '5 types by aging'],
    topBottles: ['Clase Azul', 'Don Julio 1942', 'Fortaleza', 'Casamigos'],
    games: 7,
    trivia: 100,
  },
  { 
    id: 'rum', 
    name: 'Rum', 
    icon: '🏝️', 
    color: 'from-orange-500 to-orange-700',
    description: 'Caribbean sugarcane spirit with colonial history.',
    facts: ['Made from sugarcane', 'Caribbean origins', 'Navy rum rations until 1970'],
    topBottles: ['Appleton Estate', 'Diplomatico', 'Mount Gay', 'Havana Club'],
    games: 7,
    trivia: 100,
  },
  { 
    id: 'gin', 
    name: 'Gin', 
    icon: '🫒', 
    color: 'from-teal-500 to-teal-700',
    description: 'Juniper-forward spirit with botanical complexity.',
    facts: ['Juniper required', 'London Dry is a style', 'Gin craze 1700s England'],
    topBottles: ['Hendrick\'s', 'Tanqueray', 'Monkey 47', 'The Botanist'],
    games: 7,
    trivia: 100,
  },
  { 
    id: 'vodka', 
    name: 'Vodka', 
    icon: '🧊', 
    color: 'from-blue-400 to-blue-600',
    description: 'Neutral spirit distilled for purity.',
    facts: ['Russia or Poland origins', 'Must be 40% ABV minimum', 'Most consumed spirit'],
    topBottles: ['Grey Goose', 'Belvedere', 'Tito\'s', 'Ketel One'],
    games: 5,
    trivia: 80,
  },
  { 
    id: 'cognac', 
    name: 'Cognac & Brandy', 
    icon: '🍇', 
    color: 'from-indigo-500 to-indigo-700',
    description: 'French grape brandy from the Cognac region.',
    facts: ['Cognac region only', 'VS, VSOP, XO classifications', 'Double distilled in copper'],
    topBottles: ['Hennessy', 'Rémy Martin', 'Courvoisier', 'Louis XIII'],
    games: 6,
    trivia: 100,
  },
  { 
    id: 'sake', 
    name: 'Sake & Asian Spirits', 
    icon: '🍶', 
    color: 'from-pink-400 to-pink-600',
    description: 'Japanese rice wine and Asian spirit traditions.',
    facts: ['Rice fermentation', 'Koji mold essential', '2300+ years of history'],
    topBottles: ['Dassai', 'Hakkaisan', 'Kubota', 'Born'],
    games: 5,
    trivia: 80,
  },
  { 
    id: 'liqueurs', 
    name: 'Liqueurs', 
    icon: '🧪', 
    color: 'from-fuchsia-500 to-fuchsia-700',
    description: 'Sweetened spirits with herbs, fruits, and botanicals.',
    facts: ['Minimum 2.5% sugar', 'Monks pioneered them', 'Bitter and sweet types'],
    topBottles: ['Chartreuse', 'Cointreau', 'Grand Marnier', 'Amaretto'],
    games: 5,
    trivia: 80,
  },
]

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  const category = CATEGORIES.find(c => c.id === selectedCategory)
  
  if (category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button 
          onClick={() => setSelectedCategory(null)}
          className="mb-6 text-barrel-500 hover:text-barrel-700 flex items-center gap-2"
        >
          ← Back to all categories
        </button>
        
        <div className={`bg-gradient-to-br ${category.color} rounded-2xl p-8 text-white mb-8`}>
          <span className="text-6xl mb-4 block">{category.icon}</span>
          <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
          <p className="text-xl opacity-90">{category.description}</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">📊 Quick Facts</h2>
            <ul className="space-y-2">
              {category.facts.map((fact, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-barrel-500">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">🏆 Top Bottles</h2>
            <ul className="space-y-2">
              {category.topBottles.map((bottle, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-whiskey-500 font-bold">{i + 1}.</span>
                  <span>{bottle}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Link 
            href={`/games?category=${category.id}`}
            className="bg-barrel-500 text-white rounded-xl p-6 hover:bg-barrel-600 transition-colors"
          >
            <span className="text-3xl mb-2 block">🎮</span>
            <h3 className="text-xl font-bold mb-1">Play {category.games}+ Games</h3>
            <p className="opacity-80">Test your {category.name} knowledge</p>
          </Link>
          
          <Link 
            href={`/docs/${category.id}`}
            className="bg-gray-100 rounded-xl p-6 hover:bg-gray-200 transition-colors"
          >
            <span className="text-3xl mb-2 block">📚</span>
            <h3 className="text-xl font-bold mb-1">Read the Guide</h3>
            <p className="text-gray-600">Complete {category.name} documentation</p>
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">🔍 Explore Spirits</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Dive deep into all 13 spirit categories. Equal coverage, equal love. 
          From bourbon to sake, we've got comprehensive content for every enthusiast.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`bg-gradient-to-br ${cat.color} rounded-2xl p-6 text-white text-left hover:scale-105 transition-transform`}
          >
            <span className="text-5xl mb-4 block">{cat.icon}</span>
            <h2 className="text-2xl font-bold mb-2">{cat.name}</h2>
            <p className="opacity-80 text-sm mb-4">{cat.description}</p>
            <div className="flex gap-4 text-sm">
              <span>🎮 {cat.games}+ games</span>
              <span>❓ {cat.trivia}+ trivia</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

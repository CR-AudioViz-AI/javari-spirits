'use client'

import { useState } from 'react'
import Link from 'next/link'

// Blog post data
const BLOG_POSTS = [
  {
    id: 1,
    slug: 'pappy-van-winkle-complete-guide',
    title: 'Pappy Van Winkle: The Complete Guide to America\'s Most Sought-After Bourbon',
    excerpt: 'Everything you need to know about Pappy Van Winkle - history, how to find it, what it tastes like, and whether it\'s worth the hype.',
    category: 'Guides',
    readTime: '15 min',
    date: 'December 1, 2024',
    author: 'BarrelVerse Team',
    image: '🥃',
    featured: true,
    views: 45230,
    tags: ['Pappy', 'Buffalo Trace', 'Allocated', 'Unicorn']
  },
  {
    id: 2,
    slug: 'buffalo-trace-antique-collection-2024',
    title: 'BTAC 2024: Complete Release Guide & Tasting Notes',
    excerpt: 'Our comprehensive breakdown of the 2024 Buffalo Trace Antique Collection release - George T. Stagg, William Larue Weller, Eagle Rare 17, and more.',
    category: 'Reviews',
    readTime: '12 min',
    date: 'November 15, 2024',
    author: 'BarrelVerse Team',
    image: '🦬',
    featured: true,
    views: 38540,
    tags: ['BTAC', 'Stagg', 'Weller', 'Eagle Rare']
  },
  {
    id: 3,
    slug: 'best-bourbons-under-50',
    title: '25 Best Bourbons Under $50 in 2024',
    excerpt: 'You don\'t need to spend hundreds to enjoy great bourbon. Here are 25 bottles that prove quality doesn\'t require a premium price.',
    category: 'Lists',
    readTime: '10 min',
    date: 'November 10, 2024',
    author: 'BarrelVerse Team',
    image: '💰',
    views: 67890,
    tags: ['Budget', 'Value', 'Recommendations']
  },
  {
    id: 4,
    slug: 'bourbon-vs-whiskey-difference',
    title: 'Bourbon vs Whiskey: What\'s the Difference?',
    excerpt: 'The definitive guide to understanding the difference between bourbon and whiskey - legally, historically, and in your glass.',
    category: 'Education',
    readTime: '8 min',
    date: 'November 5, 2024',
    author: 'BarrelVerse Team',
    image: '📚',
    views: 124500,
    tags: ['Basics', 'Education', 'Beginner']
  },
  {
    id: 5,
    slug: 'starting-bourbon-collection',
    title: 'How to Start a Bourbon Collection: Complete Beginner\'s Guide',
    excerpt: 'From your first bottle to building a collection you\'re proud of. Everything beginners need to know about collecting bourbon.',
    category: 'Guides',
    readTime: '20 min',
    date: 'October 28, 2024',
    author: 'BarrelVerse Team',
    image: '📦',
    views: 89340,
    tags: ['Beginner', 'Collection', 'Getting Started']
  },
  {
    id: 6,
    slug: 'allocated-bourbon-guide',
    title: 'The Complete Guide to Finding Allocated Bourbon',
    excerpt: 'Strategies for finding Blanton\'s, Weller, Buffalo Trace, and other allocated bottles without paying secondary prices.',
    category: 'Guides',
    readTime: '12 min',
    date: 'October 20, 2024',
    author: 'BarrelVerse Team',
    image: '🎯',
    views: 56780,
    tags: ['Allocated', 'Hunting', 'Tips']
  },
  {
    id: 7,
    slug: 'bourbon-tasting-notes-guide',
    title: 'How to Write Bourbon Tasting Notes Like a Pro',
    excerpt: 'Master the art of describing bourbon. Learn the vocabulary, technique, and format for writing tasting notes that impress.',
    category: 'Education',
    readTime: '10 min',
    date: 'October 15, 2024',
    author: 'BarrelVerse Team',
    image: '📝',
    views: 34560,
    tags: ['Tasting', 'Education', 'Skills']
  },
  {
    id: 8,
    slug: 'kentucky-bourbon-trail-guide',
    title: 'Kentucky Bourbon Trail 2024: Ultimate Planning Guide',
    excerpt: 'Plan the perfect bourbon trail trip. Best distilleries to visit, optimal routes, booking tips, and insider secrets.',
    category: 'Travel',
    readTime: '18 min',
    date: 'October 10, 2024',
    author: 'BarrelVerse Team',
    image: '🗺️',
    views: 78900,
    tags: ['Travel', 'Kentucky', 'Distillery Tours']
  }
]

const CATEGORIES = [
  { id: 'all', name: 'All Posts', count: 124 },
  { id: 'guides', name: 'Guides', count: 34 },
  { id: 'reviews', name: 'Reviews', count: 45 },
  { id: 'education', name: 'Education', count: 23 },
  { id: 'lists', name: 'Lists', count: 12 },
  { id: 'travel', name: 'Travel', count: 10 }
]

const POPULAR_TAGS = [
  'Bourbon', 'Pappy', 'BTAC', 'Buffalo Trace', 'Beginner', 'Allocated',
  'Tasting Notes', 'Collection', 'Weller', 'Eagle Rare', 'Blanton\'s'
]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCategory = selectedCategory === 'all' || 
      post.category.toLowerCase() === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredPosts = BLOG_POSTS.filter(p => p.featured)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    setSubscribed(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-4">
            <Link href="/spirits" className="hover:text-amber-400 transition-colors">Spirits</Link>
            <Link href="/museum" className="hover:text-amber-400 transition-colors">Museum</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-amber-900/30 via-stone-900 to-amber-900/30 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            The <span className="text-amber-400">Bourbon Blog</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Expert guides, in-depth reviews, collecting tips, and everything you need 
            to master the world of bourbon and whiskey.
          </p>
          <div className="max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-800 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Featured Posts */}
            {selectedCategory === 'all' && !searchQuery && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="bg-gradient-to-br from-amber-900/40 to-stone-800/40 rounded-2xl overflow-hidden border border-amber-500/30 hover:border-amber-400/50 transition-all group"
                    >
                      <div className="aspect-video bg-gradient-to-br from-amber-800/50 to-stone-900 flex items-center justify-center">
                        <span className="text-8xl group-hover:scale-110 transition-transform">{post.image}</span>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-amber-600 px-2 py-1 rounded text-xs font-bold">
                            {post.category}
                          </span>
                          <span className="text-gray-500 text-sm">{post.readTime} read</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-amber-400 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{post.excerpt}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filters */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-amber-600'
                      : 'bg-stone-800 hover:bg-stone-700'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>

            {/* Posts Grid */}
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50 hover:border-amber-500/50 transition-all flex gap-6 group"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-900/50 to-stone-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-5xl group-hover:scale-110 transition-transform">{post.image}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-stone-700 px-2 py-1 rounded text-xs">
                        {post.category}
                      </span>
                      <span className="text-gray-500 text-sm">{post.readTime}</span>
                      <span className="text-gray-500 text-sm">•</span>
                      <span className="text-gray-500 text-sm">{post.date}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-amber-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>👁️ {post.views.toLocaleString()} views</span>
                      <div className="flex gap-1">
                        {post.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-amber-400">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="bg-stone-800 hover:bg-stone-700 px-8 py-3 rounded-xl font-semibold transition-colors">
                Load More Articles
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Newsletter */}
            <div className="bg-gradient-to-br from-amber-900/40 to-stone-800/40 rounded-xl p-6 border border-amber-500/30">
              <h3 className="font-bold mb-2 text-lg">📧 The Weekly Pour</h3>
              <p className="text-gray-400 text-sm mb-4">
                Get the latest articles, release news, and bourbon tips delivered weekly.
              </p>
              {!subscribed ? (
                <form onSubmit={handleSubscribe}>
                  <input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-800 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <button className="w-full bg-amber-600 hover:bg-amber-500 py-3 rounded-lg font-semibold transition-colors">
                    Subscribe Free
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <span className="text-4xl">✅</span>
                  <p className="font-bold mt-2">You're subscribed!</p>
                </div>
              )}
            </div>

            {/* Popular Tags */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4">🏷️ Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TAGS.map((tag, i) => (
                  <button
                    key={i}
                    className="bg-stone-700 hover:bg-amber-900/50 px-3 py-1 rounded-full text-sm transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Top Posts */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4">📈 Most Read</h3>
              <div className="space-y-4">
                {BLOG_POSTS.sort((a, b) => b.views - a.views).slice(0, 5).map((post, i) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="flex items-start gap-3 group">
                    <span className="text-2xl font-bold text-amber-600">{i + 1}</span>
                    <div>
                      <p className="font-medium text-sm group-hover:text-amber-400 transition-colors line-clamp-2">
                        {post.title}
                      </p>
                      <p className="text-xs text-gray-500">{post.views.toLocaleString()} views</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-stone-800/50 rounded-xl p-6 border border-stone-700/50">
              <h3 className="font-bold mb-4">🔗 Quick Links</h3>
              <div className="space-y-2">
                <Link href="/spirits" className="block bg-stone-700/50 hover:bg-stone-600/50 p-3 rounded-lg transition-colors">
                  📊 Spirits Database
                </Link>
                <Link href="/museum" className="block bg-stone-700/50 hover:bg-stone-600/50 p-3 rounded-lg transition-colors">
                  🏛️ Virtual Museum
                </Link>
                <Link href="/tours" className="block bg-stone-700/50 hover:bg-stone-600/50 p-3 rounded-lg transition-colors">
                  🏭 Distillery Tours
                </Link>
                <Link href="/trivia" className="block bg-stone-700/50 hover:bg-stone-600/50 p-3 rounded-lg transition-colors">
                  🧠 Bourbon Trivia
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SEO Footer */}
      <div className="border-t border-stone-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Browse by Topic</h2>
          <div className="grid md:grid-cols-4 gap-6 text-sm">
            <div>
              <h3 className="font-bold text-amber-400 mb-3">Bourbon Guides</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">How to Taste Bourbon</Link></li>
                <li><Link href="#" className="hover:text-white">Starting a Collection</Link></li>
                <li><Link href="#" className="hover:text-white">Finding Allocated Bottles</Link></li>
                <li><Link href="#" className="hover:text-white">Bourbon vs Whiskey</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-amber-400 mb-3">Distilleries</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Buffalo Trace</Link></li>
                <li><Link href="#" className="hover:text-white">Maker's Mark</Link></li>
                <li><Link href="#" className="hover:text-white">Wild Turkey</Link></li>
                <li><Link href="#" className="hover:text-white">Four Roses</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-amber-400 mb-3">Reviews</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Best Bourbons Under $50</Link></li>
                <li><Link href="#" className="hover:text-white">BTAC Reviews</Link></li>
                <li><Link href="#" className="hover:text-white">Pappy Van Winkle</Link></li>
                <li><Link href="#" className="hover:text-white">Blind Tastings</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-amber-400 mb-3">Travel</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Kentucky Bourbon Trail</Link></li>
                <li><Link href="#" className="hover:text-white">Tennessee Whiskey Trail</Link></li>
                <li><Link href="#" className="hover:text-white">Scotland Whisky Tours</Link></li>
                <li><Link href="#" className="hover:text-white">Best Bourbon Bars</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

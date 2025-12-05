'use client';

/**
 * BARRELVERSE HELP CENTER
 * =======================
 * Self-service knowledge base and support portal
 * 
 * Features:
 * - Search knowledge base
 * - Browse by category
 * - Submit tickets
 * - Feature requests
 * - Live chat with Javari
 * - Popular articles
 * - Video tutorials
 * 
 * Built by Claude + Roy Henderson
 * CR AudioViz AI, LLC - BarrelVerse
 * 2025-12-04
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, Book, MessageCircle, Lightbulb, Bug, PlayCircle,
  ChevronRight, ThumbsUp, ThumbsDown, ExternalLink, Sparkles,
  HelpCircle, Ticket, TrendingUp, Clock
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  helpful_count: number;
  view_count: number;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  articleCount: number;
}

const CATEGORIES: Category[] = [
  { id: 'getting-started', name: 'Getting Started', icon: <Book />, description: 'New to BarrelVerse? Start here!', articleCount: 12 },
  { id: 'collection', name: 'My Collection', icon: <Book />, description: 'Managing your bottles', articleCount: 18 },
  { id: 'games', name: 'Games & Trivia', icon: <PlayCircle />, description: 'Playing and earning rewards', articleCount: 8 },
  { id: 'marketplace', name: 'Marketplace', icon: <TrendingUp />, description: 'Buying, selling, and trading', articleCount: 15 },
  { id: 'account', name: 'Account & Billing', icon: <Ticket />, description: 'Subscriptions and settings', articleCount: 10 },
  { id: 'troubleshooting', name: 'Troubleshooting', icon: <Bug />, description: 'Common issues and fixes', articleCount: 22 },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetchPopularArticles();
    fetchRecentArticles();
  }, []);

  async function fetchPopularArticles() {
    try {
      const response = await fetch('/api/help/articles?sort=popular&limit=5');
      const data = await response.json();
      setPopularArticles(data.articles || []);
    } catch (error) {
      console.error('Failed to fetch popular articles:', error);
    }
  }

  async function fetchRecentArticles() {
    try {
      const response = await fetch('/api/help/articles?sort=recent&limit=5');
      const data = await response.json();
      setRecentArticles(data.articles || []);
    } catch (error) {
      console.error('Failed to fetch recent articles:', error);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/help/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setSearchResults(data.articles || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 to-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-900 to-amber-800 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            How can we help you?
          </h1>
          <p className="text-xl text-amber-100 mb-8">
            Search our knowledge base or ask Javari for instant assistance
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for help..."
              className="w-full pl-14 pr-4 py-4 rounded-xl bg-white text-stone-900 
                placeholder-stone-500 text-lg focus:outline-none focus:ring-4 focus:ring-amber-500/50"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-600 hover:bg-amber-500 
                text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <a href="#categories" className="text-amber-200 hover:text-white flex items-center gap-1">
              <Book className="w-4 h-4" /> Browse Categories
            </a>
            <a href="/support/ticket" className="text-amber-200 hover:text-white flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> Submit Ticket
            </a>
            <a href="/support/feature" className="text-amber-200 hover:text-white flex items-center gap-1">
              <Lightbulb className="w-4 h-4" /> Request Feature
            </a>
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Search Results ({searchResults.length})
          </h2>
          <div className="space-y-4">
            {searchResults.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Categories */}
        <section id="categories" className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <Book className="w-6 h-6 text-amber-500" />
            Browse by Category
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((category) => (
              <a
                key={category.id}
                href={`/help/category/${category.id}`}
                className="bg-stone-900 border border-stone-700 rounded-xl p-6 
                  hover:border-amber-500 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-amber-900/30 rounded-lg flex items-center justify-center 
                    text-amber-500 group-hover:bg-amber-900/50 transition-colors">
                    {category.icon}
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-amber-500 transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-white mt-4">{category.name}</h3>
                <p className="text-stone-400 text-sm mt-1">{category.description}</p>
                <p className="text-amber-500 text-sm mt-3">{category.articleCount} articles</p>
              </a>
            ))}
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Popular Articles */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Popular Articles
            </h2>
            <div className="space-y-4">
              {popularArticles.length > 0 ? (
                popularArticles.map((article) => (
                  <ArticleListItem key={article.id} article={article} />
                ))
              ) : (
                <div className="text-stone-500">Loading...</div>
              )}
            </div>
          </section>

          {/* Recently Updated */}
          <section>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Recently Updated
            </h2>
            <div className="space-y-4">
              {recentArticles.length > 0 ? (
                recentArticles.map((article) => (
                  <ArticleListItem key={article.id} article={article} />
                ))
              ) : (
                <div className="text-stone-500">Loading...</div>
              )}
            </div>
          </section>
        </div>

        {/* Contact Options */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Still need help?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Ask Javari */}
            <div className="bg-gradient-to-br from-amber-900/50 to-amber-950/50 border border-amber-700 
              rounded-xl p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-amber-600/20 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ask Javari</h3>
              <p className="text-stone-400 text-sm mb-4">
                Get instant answers from our AI assistant
              </p>
              <button 
                onClick={() => {
                  // Trigger Javari widget
                  const event = new CustomEvent('openJavari');
                  window.dispatchEvent(event);
                }}
                className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg 
                  font-semibold transition-colors"
              >
                Chat Now
              </button>
            </div>

            {/* Submit Ticket */}
            <div className="bg-stone-900 border border-stone-700 rounded-xl p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-stone-700/50 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Submit a Ticket</h3>
              <p className="text-stone-400 text-sm mb-4">
                Get help from our support team (24hr response)
              </p>
              <a 
                href="/support/ticket"
                className="inline-block bg-stone-700 hover:bg-stone-600 text-white px-6 py-2 
                  rounded-lg font-semibold transition-colors"
              >
                Create Ticket
              </a>
            </div>

            {/* Request Feature */}
            <div className="bg-stone-900 border border-stone-700 rounded-xl p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <Lightbulb className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Suggest a Feature</h3>
              <p className="text-stone-400 text-sm mb-4">
                Help us improve with your ideas
              </p>
              <a 
                href="/support/feature"
                className="inline-block bg-purple-700 hover:bg-purple-600 text-white px-6 py-2 
                  rounded-lg font-semibold transition-colors"
              >
                Share Idea
              </a>
            </div>
          </div>
        </section>

        {/* Video Tutorials */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <PlayCircle className="w-6 h-6 text-amber-500" />
            Video Tutorials
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Getting Started with BarrelVerse', duration: '5:32' },
              { title: 'Adding Bottles to Your Collection', duration: '3:15' },
              { title: 'Using the Marketplace', duration: '7:48' },
            ].map((video, idx) => (
              <div 
                key={idx}
                className="bg-stone-900 border border-stone-700 rounded-xl overflow-hidden 
                  hover:border-amber-500 transition-colors cursor-pointer group"
              >
                <div className="aspect-video bg-stone-800 flex items-center justify-center relative">
                  <PlayCircle className="w-16 h-16 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white group-hover:text-amber-500 transition-colors">
                    {video.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="border-t border-stone-800 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-stone-500">
            Can't find what you're looking for?{' '}
            <a href="/support/ticket" className="text-amber-500 hover:underline">
              Contact us directly
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Article Card Component
function ArticleCard({ article }: { article: Article }) {
  return (
    <a
      href={`/help/article/${article.id}`}
      className="block bg-stone-900 border border-stone-700 rounded-lg p-4 
        hover:border-amber-500 transition-colors"
    >
      <h3 className="text-lg font-semibold text-white mb-2">{article.title}</h3>
      <p className="text-stone-400 text-sm line-clamp-2">{article.content}</p>
      <div className="flex items-center gap-4 mt-3 text-xs text-stone-500">
        <span className="bg-stone-800 px-2 py-1 rounded">{article.category}</span>
        <span>{article.view_count} views</span>
        <span>{article.helpful_count} found helpful</span>
      </div>
    </a>
  );
}

// Article List Item Component
function ArticleListItem({ article }: { article: Article }) {
  return (
    <a
      href={`/help/article/${article.id}`}
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-stone-800/50 transition-colors group"
    >
      <HelpCircle className="w-5 h-5 text-stone-500 group-hover:text-amber-500 flex-shrink-0" />
      <span className="text-stone-300 group-hover:text-white flex-1">{article.title}</span>
      <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-amber-500" />
    </a>
  );
}

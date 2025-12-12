'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { 
  BookOpen, Clock, MapPin, Award, ChevronRight,
  Search, Filter, Bookmark, Share2, History,
  Flame, Droplets, Wheat, Building2
} from 'lucide-react';
import Image from 'next/image';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
  is_featured: boolean;
  view_count: number;
  created_at: string;
}

interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  category: string;
}

const spiritTimeline: TimelineEvent[] = [
  { year: 1494, title: 'First Recorded Whisky', description: 'Scottish Exchequer Rolls mention "aqua vitae" for King James IV', category: 'scotch' },
  { year: 1608, title: 'Old Bushmills Founded', description: 'Worlds oldest licensed whiskey distillery established in Ireland', category: 'irish' },
  { year: 1783, title: 'Bourbon County Created', description: 'Kentucky county that would give bourbon its name is established', category: 'bourbon' },
  { year: 1789, title: 'Elijah Craig', description: 'Legend says Baptist minister ages whiskey in charred barrels', category: 'bourbon' },
  { year: 1823, title: 'Excise Act', description: 'British Act makes legal distilling more accessible in Scotland', category: 'scotch' },
  { year: 1831, title: 'Column Still Invented', description: 'Aeneas Coffey patents the continuous still, revolutionizing production', category: 'history' },
  { year: 1870, title: 'Phylloxera Crisis', description: 'Grape blight devastates French vineyards, whisky fills the gap', category: 'history' },
  { year: 1920, title: 'Prohibition Begins', description: 'US bans alcohol production; only medicinal whiskey allowed', category: 'bourbon' },
  { year: 1933, title: 'Prohibition Repealed', description: 'The 21st Amendment ends the noble experiment', category: 'bourbon' },
  { year: 1964, title: 'Bourbon Declared', description: 'US Congress declares bourbon a distinctive product of USA', category: 'bourbon' },
  { year: 1973, title: 'Yamazaki Opens', description: 'Suntory opens Japans first whisky distillery', category: 'japanese' },
  { year: 2003, title: 'Japanese Whisky Wins', description: 'Yamazaki 12 named Best Japanese Whisky at ISC', category: 'japanese' },
  { year: 2015, title: 'Japanese Boom', description: 'Japanese whisky shortages as global demand explodes', category: 'japanese' },
];

const categories = [
  { id: 'all', name: 'All', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'bourbon', name: 'Bourbon', icon: <Wheat className="w-4 h-4" /> },
  { id: 'scotch', name: 'Scotch', icon: <Flame className="w-4 h-4" /> },
  { id: 'irish', name: 'Irish', icon: <Droplets className="w-4 h-4" /> },
  { id: 'japanese', name: 'Japanese', icon: <Building2 className="w-4 h-4" /> },
  { id: 'history', name: 'History', icon: <History className="w-4 h-4" /> },
];

export default function HistoryMuseumPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeTab, setActiveTab] = useState<'articles' | 'timeline' | 'glossary'>('articles');
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadArticles();
  }, [selectedCategory]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('bv_knowledge_base')
        .select('*')
        .order('view_count', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    }
    setLoading(false);
  };

  const filteredArticles = articles.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredArticles = articles.filter(a => a.is_featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-b border-amber-900/50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm mb-4">
              <BookOpen className="w-4 h-4" />
              CRAVBarrels Museum
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              The History of Spirits
            </h1>
            <p className="text-xl text-amber-200/80 max-w-2xl mx-auto">
              Explore centuries of distilling history, from ancient origins to modern craft movements
            </p>
          </motion.div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-800 pb-4">
          {[
            { id: 'articles', label: 'Articles', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
            { id: 'glossary', label: 'Glossary', icon: <Search className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-black'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <>
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500 text-black'
                        : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat.icon}
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Articles */}
            {featuredArticles.length > 0 && !searchQuery && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  Featured
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {featuredArticles.slice(0, 2).map((article) => (
                    <motion.div
                      key={article.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedArticle(article)}
                      className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-xl p-6 cursor-pointer border border-amber-900/50"
                    >
                      <span className="text-amber-400 text-sm uppercase">{article.category}</span>
                      <h3 className="text-xl font-bold text-white mt-2 mb-2">{article.title}</h3>
                      <p className="text-gray-400 line-clamp-2">{article.content?.slice(0, 150)}...</p>
                      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                        <span>{article.view_count} views</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Articles Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-1/4 mb-4" />
                    <div className="h-6 bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-700 rounded w-full" />
                  </div>
                ))
              ) : filteredArticles.length === 0 ? (
                <div className="col-span-3 text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No articles found</p>
                </div>
              ) : (
                filteredArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedArticle(article)}
                    className="bg-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-750 transition group"
                  >
                    <span className="text-amber-400 text-xs uppercase">{article.category}</span>
                    <h3 className="text-lg font-semibold text-white mt-2 mb-2 group-hover:text-amber-400 transition">
                      {article.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {article.content?.slice(0, 100)}...
                    </p>
                    <ChevronRight className="w-5 h-5 text-gray-600 mt-4 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-amber-900/50" />
            
            <div className="space-y-8">
              {spiritTimeline.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-20"
                >
                  {/* Year marker */}
                  <div className="absolute left-0 w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-sm">{event.year}</span>
                  </div>
                  
                  <div className="bg-gray-800 rounded-xl p-6">
                    <span className={`text-xs uppercase px-2 py-1 rounded ${
                      event.category === 'bourbon' ? 'bg-orange-500/20 text-orange-400' :
                      event.category === 'scotch' ? 'bg-amber-500/20 text-amber-400' :
                      event.category === 'irish' ? 'bg-green-500/20 text-green-400' :
                      event.category === 'japanese' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {event.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-2">{event.title}</h3>
                    <p className="text-gray-400 mt-1">{event.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Glossary Tab */}
        {activeTab === 'glossary' && (
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { term: 'Mash Bill', definition: 'The recipe of grains used to make whiskey, typically corn, rye, wheat, and malted barley' },
              { term: 'Angel\'s Share', definition: 'The portion of whiskey lost to evaporation during barrel aging, typically 2-4% per year' },
              { term: 'Proof', definition: 'A measure of alcohol content. In the US, proof is twice the alcohol by volume (ABV)' },
              { term: 'Single Malt', definition: 'Whisky made from 100% malted barley at a single distillery' },
              { term: 'Cask Strength', definition: 'Whiskey bottled directly from the barrel without dilution' },
              { term: 'Char Level', definition: 'The degree of charring inside bourbon barrels, typically #3 or #4' },
              { term: 'Small Batch', definition: 'Whiskey blended from a select number of barrels, typically under 100' },
              { term: 'Single Barrel', definition: 'Whiskey from one individual barrel, offering unique characteristics' },
              { term: 'Peat', definition: 'Decomposed organic matter burned to dry malted barley, creating smoky flavors' },
              { term: 'Finish', definition: 'The lingering taste and sensation after swallowing whiskey' },
              { term: 'Age Statement', definition: 'The minimum age of whiskey in a bottle, based on youngest spirit' },
              { term: 'Non-Age Statement (NAS)', definition: 'Whiskey without a declared minimum age' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-bold text-amber-400 mb-2">{item.term}</h3>
                <p className="text-gray-400">{item.definition}</p>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Article Modal */}
      {selectedArticle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 text-sm uppercase">{selectedArticle.category}</span>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition">
                    <Bookmark className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition">
                    <Share2 className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mt-2">{selectedArticle.title}</h2>
            </div>
            
            <div className="p-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap">{selectedArticle.content}</p>
              </div>
              
              {selectedArticle.keywords && selectedArticle.keywords.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-sm text-gray-500 mb-2">Related Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.keywords.map((keyword, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-700">
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

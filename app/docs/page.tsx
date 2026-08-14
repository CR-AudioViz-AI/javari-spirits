import Link from 'next/link'

// Documentation structure based on all our deliverables
const DOCUMENTATION = {
  gettingStarted: [
    { title: 'Welcome to BarrelVerse', href: '/docs/welcome', description: 'Overview of the platform and how to get started', icon: '👋' },
    { title: 'Creating Your Account', href: '/docs/account', description: 'Sign up, verify age, and set preferences', icon: '👤' },
    { title: 'Your First Collection', href: '/docs/first-collection', description: 'Start tracking your bottles', icon: '🗄️' },
    { title: '$PROOF Token Guide', href: '/docs/proof', description: 'How to earn and spend $PROOF tokens', icon: '🪙' },
  ],
  
  features: [
    { title: 'Games Guide', href: '/docs/games', description: '100+ games across all 13 categories', icon: '🎮' },
    { title: 'Collection Tracking', href: '/docs/collection', description: 'Barcode scanning, inventory, valuations', icon: '📱' },
    { title: 'Price Tracking', href: '/docs/pricing', description: 'Market values, alerts, secondary market', icon: '💰' },
    { title: 'Community Features', href: '/docs/community', description: 'Reviews, clubs, messaging', icon: '👥' },
    { title: 'Academy Courses', href: '/docs/academy', description: 'Learn and earn certifications', icon: '📚' },
    { title: 'Marketplace', href: '/docs/marketplace', description: 'Buy, sell, and trade bottles', icon: '🛒' },
  ],
  
  categories: [
    { title: 'Bourbon Guide', href: '/docs/bourbon', description: 'Complete bourbon history, producers, games', icon: '🥃' },
    { title: 'Scotch Guide', href: '/docs/scotch', description: 'Regions, distilleries, tasting notes', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
    { title: 'Irish Whiskey Guide', href: '/docs/irish', description: 'History and modern renaissance', icon: '☘️' },
    { title: 'Japanese Whisky Guide', href: '/docs/japanese', description: 'From Suntory to world acclaim', icon: '🇯🇵' },
    { title: 'Wine Guide', href: '/docs/wine', description: 'Regions, varietals, vintages', icon: '🍷' },
    { title: 'Beer Guide', href: '/docs/beer', description: 'Styles, breweries, craft revolution', icon: '🍺' },
    { title: 'Tequila & Mezcal Guide', href: '/docs/tequila', description: 'Agave spirits explained', icon: '🌵' },
    { title: 'Rum Guide', href: '/docs/rum', description: 'Caribbean and beyond', icon: '🏝️' },
    { title: 'Gin Guide', href: '/docs/gin', description: 'Botanicals and styles', icon: '🫒' },
    { title: 'Vodka Guide', href: '/docs/vodka', description: 'Origins and production', icon: '🧊' },
    { title: 'Cognac & Brandy Guide', href: '/docs/cognac', description: 'French excellence', icon: '🍇' },
    { title: 'Sake & Asian Spirits Guide', href: '/docs/sake', description: 'Rice wines and beyond', icon: '🍶' },
    { title: 'Liqueurs Guide', href: '/docs/liqueurs', description: 'Sweet and bitter spirits', icon: '🧪' },
  ],
  
  history: [
    { title: 'Prohibition Era', href: '/docs/prohibition', description: 'Bootlegging, speakeasies, organized crime', icon: '🚫' },
    { title: 'State-by-State Guide', href: '/docs/states', description: 'Laws, history, and craft scenes for all 50 states', icon: '🗺️' },
    { title: 'Famous People & Events', href: '/docs/people', description: 'Celebrities, legends, and historic moments', icon: '⭐' },
  ],
  
  technical: [
    { title: 'API Reference', href: '/docs/api', description: 'REST API documentation', icon: '🔌' },
    { title: 'Database Schema', href: '/docs/schema', description: '54 tables explained', icon: '🗃️' },
    { title: 'Integration Guide', href: '/docs/integrations', description: 'External APIs and services', icon: '🔗' },
    { title: 'Contributing', href: '/docs/contributing', description: 'How to contribute to BarrelVerse', icon: '🤝' },
  ],
  
  legal: [
    { title: 'Terms of Service', href: '/terms', description: 'Platform usage terms', icon: '📜' },
    { title: 'Privacy Policy', href: '/privacy', description: 'How we handle your data', icon: '🔒' },
    { title: 'Age Verification', href: '/docs/age-verification', description: 'Legal requirements', icon: '🔞' },
    { title: 'Responsible Drinking', href: '/responsible-drinking', description: 'Resources and guidelines', icon: '⚠️' },
  ],
}

export default function DocsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">📖 Documentation</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Everything you need to know about BarrelVerse. From getting started to API integration,
          plus comprehensive guides for all 13 spirit categories.
        </p>
      </div>
      
      {/* Quick Links */}
      <div className="bg-gradient-to-r from-barrel-500 to-barrel-700 rounded-2xl p-6 mb-12 text-white">
        <h2 className="text-xl font-bold mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/docs/welcome" className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
            🚀 Get Started
          </Link>
          <Link href="/docs/games" className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
            🎮 Games Guide
          </Link>
          <Link href="/docs/api" className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
            🔌 API Docs
          </Link>
          <a href="https://github.com/javariai/barrelverse" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
            📦 GitHub
          </a>
        </div>
      </div>
      
      {/* Getting Started */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">🚀 Getting Started</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {DOCUMENTATION.gettingStarted.map((doc) => (
            <Link 
              key={doc.href}
              href={doc.href}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-barrel-200 transition-all"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{doc.icon}</span>
                <div>
                  <h3 className="font-semibold text-lg">{doc.title}</h3>
                  <p className="text-gray-600 text-sm">{doc.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">✨ Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOCUMENTATION.features.map((doc) => (
            <Link 
              key={doc.href}
              href={doc.href}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-barrel-200 transition-all"
            >
              <span className="text-3xl mb-3 block">{doc.icon}</span>
              <h3 className="font-semibold text-lg">{doc.title}</h3>
              <p className="text-gray-600 text-sm">{doc.description}</p>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Spirit Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">🍾 Spirit Category Guides</h2>
        <p className="text-gray-600 mb-6">
          Comprehensive guides for all 13 spirit categories - equal coverage for everything from bourbon to sake.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {DOCUMENTATION.categories.map((doc) => (
            <Link 
              key={doc.href}
              href={doc.href}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:border-barrel-200 transition-all text-center"
            >
              <span className="text-3xl mb-2 block">{doc.icon}</span>
              <h3 className="font-medium text-sm">{doc.title.replace(' Guide', '')}</h3>
            </Link>
          ))}
        </div>
      </section>
      
      {/* History */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">📜 History & Culture</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {DOCUMENTATION.history.map((doc) => (
            <Link 
              key={doc.href}
              href={doc.href}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-barrel-200 transition-all"
            >
              <span className="text-3xl mb-3 block">{doc.icon}</span>
              <h3 className="font-semibold text-lg">{doc.title}</h3>
              <p className="text-gray-600 text-sm">{doc.description}</p>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Technical */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">🔧 Technical Documentation</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DOCUMENTATION.technical.map((doc) => (
            <Link 
              key={doc.href}
              href={doc.href}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-barrel-200 transition-all"
            >
              <span className="text-3xl mb-3 block">{doc.icon}</span>
              <h3 className="font-semibold">{doc.title}</h3>
              <p className="text-gray-600 text-sm">{doc.description}</p>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Legal */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">⚖️ Legal & Compliance</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DOCUMENTATION.legal.map((doc) => (
            <Link 
              key={doc.href}
              href={doc.href}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-barrel-200 transition-all"
            >
              <span className="text-3xl mb-3 block">{doc.icon}</span>
              <h3 className="font-semibold">{doc.title}</h3>
              <p className="text-gray-600 text-sm">{doc.description}</p>
            </Link>
          ))}
        </div>
      </section>
      
      {/* Javari AI */}
      <section className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 text-white text-center">
        <div className="text-5xl mb-4">🤖</div>
        <h2 className="text-3xl font-bold mb-4">Powered by Javari AI</h2>
        <p className="text-xl opacity-90 mb-6 max-w-2xl mx-auto">
          Can't find what you're looking for? Ask Javari! Our AI assistant has deep knowledge
          of all 13 spirit categories and can answer any question.
        </p>
        <Link 
          href="/javari"
          className="inline-block px-8 py-4 bg-white text-purple-700 font-bold rounded-lg hover:bg-gray-100 transition-colors"
        >
          Chat with Javari
        </Link>
      </section>
      
      {/* GitHub Banner */}
      <div className="mt-12 bg-gray-900 rounded-2xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">📦 Open Source</h2>
        <p className="text-gray-400 mb-6">
          BarrelVerse is built in the open. View the source code, report issues, or contribute.
        </p>
        <a 
          href="https://github.com/javariai/barrelverse"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-4 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition-colors"
        >
          View on GitHub
        </a>
      </div>
    </div>
  )
}

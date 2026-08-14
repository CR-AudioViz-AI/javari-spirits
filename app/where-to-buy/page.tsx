'use client';

import { useState } from 'react';
import { 
  ExternalLink, 
  Wine, 
  Beer, 
  GlassWater,
  Gift,
  Truck,
  Map,
  GraduationCap,
  Sparkles,
  Star,
  ArrowRight,
  Info
} from 'lucide-react';

// Affiliate Partners organized by category
const AFFILIATE_CATEGORIES = [
  {
    id: 'spirits-clubs',
    name: 'Premium Spirit Clubs',
    icon: Wine,
    description: 'Curated subscriptions for whiskey, bourbon, and premium spirits',
    partners: [
      {
        name: 'Flaviar',
        description: 'Premium spirits subscription with curated tastings and exclusive bottles',
        logo: '🥃',
        rating: 4.8,
        features: ['Monthly Curated Box', 'Exclusive Bottles', 'Tasting Notes', 'Members Events'],
        cta: 'Join Flaviar',
        url: 'https://www.flaviar.com/?ref=javarispirits', // Replace with actual affiliate link
        badge: 'Editor\'s Choice'
      },
      {
        name: 'PourMore',
        description: 'Explore whiskey, rum, tequila and more with customizable subscriptions',
        logo: '🍷',
        rating: 4.6,
        features: ['Multiple Spirit Types', 'Flexible Plans', 'Rare Releases', 'Gift Options'],
        cta: 'Explore PourMore',
        url: 'https://pourmore.com/?ref=javarispirits',
        badge: null
      },
      {
        name: 'Spirit Hub',
        description: 'Craft spirits from 200+ independent distilleries',
        logo: '✨',
        rating: 4.5,
        features: ['Small-Batch Spirits', 'Craft Focus', 'Discovery Box', 'Free Shipping'],
        cta: 'Shop Spirit Hub',
        url: 'https://spirithub.com/?ref=javarispirits',
        badge: null
      }
    ]
  },
  {
    id: 'wine-clubs',
    name: 'Wine Clubs',
    icon: Wine,
    description: 'Discover exceptional wines from around the world',
    partners: [
      {
        name: 'California Wine Club',
        description: 'Award-winning small-production wines since 1990',
        logo: '🍇',
        rating: 4.9,
        features: ['Award-Winning Wines', 'Small Producers', 'Monthly or Quarterly', 'Wine Notes'],
        cta: 'Join Wine Club',
        url: 'https://www.cawineclub.com/?ref=javarispirits',
        badge: 'Best Value'
      },
      {
        name: 'Plonk Wine Club',
        description: 'Organic, biodynamic, and limited-production wines',
        logo: '🌿',
        rating: 4.7,
        features: ['Organic Wines', 'Sustainable', 'Hand-Selected', 'Sommelier Picks'],
        cta: 'Explore Plonk',
        url: 'https://www.plonkwineclub.com/?ref=javarispirits',
        badge: 'Eco-Friendly'
      },
      {
        name: 'Wine.com',
        description: '17,000+ wines from around the world with expert reviews',
        logo: '🍾',
        rating: 4.6,
        features: ['Largest Selection', 'Expert Reviews', 'StewardShip Club', 'Gift Options'],
        cta: 'Shop Wine.com',
        url: 'https://www.wine.com/?ref=javarispirits',
        badge: null
      }
    ]
  },
  {
    id: 'delivery',
    name: 'Alcohol Delivery',
    icon: Truck,
    description: 'Get your favorite spirits delivered to your door',
    partners: [
      {
        name: 'Drizly',
        description: '#1 alcohol delivery app - beer, wine, and spirits in under 60 minutes',
        logo: '🚚',
        rating: 4.7,
        features: ['Fast Delivery', 'Local Selection', 'Gift Sending', 'Wide Coverage'],
        cta: 'Order on Drizly',
        url: 'https://drizly.com/?ref=javarispirits',
        badge: 'Fastest Delivery'
      },
      {
        name: 'Saucey',
        description: '30-minute delivery, no minimums, incredible selection',
        logo: '⚡',
        rating: 4.5,
        features: ['30-Min Delivery', 'No Minimums', 'Craft Selection', 'Multiple Cities'],
        cta: 'Try Saucey',
        url: 'https://saucey.com/?ref=javarispirits',
        badge: null
      },
      {
        name: 'Total Wine',
        description: 'America\'s largest independent wine retailer',
        logo: '🏪',
        rating: 4.6,
        features: ['Huge Selection', 'Great Prices', 'In-Store Pickup', 'Wine Classes'],
        cta: 'Shop Total Wine',
        url: 'https://www.totalwine.com/?ref=javarispirits',
        badge: null
      }
    ]
  },
  {
    id: 'barware',
    name: 'Barware & Accessories',
    icon: GlassWater,
    description: 'Everything you need for the perfect home bar',
    partners: [
      {
        name: 'Home Wet Bar',
        description: 'Personalized glassware, decanters, and bar accessories',
        logo: '🥂',
        rating: 4.8,
        features: ['Custom Engraving', 'Gift Sets', 'Bar Tools', 'Unique Gifts'],
        cta: 'Shop Home Wet Bar',
        url: 'https://www.homewetbar.com/?ref=javarispirits',
        badge: 'Best for Gifts'
      },
      {
        name: 'The Bro Basket',
        description: 'Premium gift baskets with craft beer, whiskey, and snacks',
        logo: '🎁',
        rating: 4.6,
        features: ['Gift Baskets', 'Corporate Gifts', 'Customizable', 'Premium Quality'],
        cta: 'Shop Bro Basket',
        url: 'https://thebrobasket.com/?ref=javarispirits',
        badge: null
      },
      {
        name: 'Wine Enthusiast',
        description: 'Wine storage, accessories, and premium glassware',
        logo: '🍷',
        rating: 4.7,
        features: ['Wine Storage', 'Premium Glass', 'Aerators', 'Expert Selection'],
        cta: 'Shop Wine Enthusiast',
        url: 'https://www.wineenthusiast.com/?ref=javarispirits',
        badge: null
      }
    ]
  },
  {
    id: 'tours',
    name: 'Distillery Tours',
    icon: Map,
    description: 'Experience bourbon country and beyond',
    partners: [
      {
        name: 'Viator',
        description: '300,000+ tours and experiences worldwide including bourbon trail',
        logo: '🗺️',
        rating: 4.7,
        features: ['Bourbon Trail Tours', 'Skip-the-Line', 'Free Cancellation', 'Best Prices'],
        cta: 'Book on Viator',
        url: 'https://www.viator.com/searchResults/all?text=bourbon&ref=javarispirits',
        badge: 'Most Options'
      },
      {
        name: 'GetYourGuide',
        description: 'Curated distillery tours and tastings experiences',
        logo: '🎫',
        rating: 4.6,
        features: ['Verified Reviews', 'Instant Booking', 'Local Guides', 'Price Match'],
        cta: 'Explore Tours',
        url: 'https://www.getyourguide.com/?ref=javarispirits',
        badge: null
      }
    ]
  },
  {
    id: 'education',
    name: 'Education & Certification',
    icon: GraduationCap,
    description: 'Level up your spirits knowledge',
    partners: [
      {
        name: 'LIQUORexam',
        description: 'Online alcohol server training and certification courses',
        logo: '📜',
        rating: 4.5,
        features: ['Online Courses', 'All 50 States', 'Instant Certificate', 'Affordable'],
        cta: 'Get Certified',
        url: 'https://liquorexam.com/?ref=javarispirits',
        badge: null
      }
    ]
  },
  {
    id: 'beer',
    name: 'Craft Beer',
    icon: Beer,
    description: 'Discover exceptional craft beers',
    partners: [
      {
        name: 'Craft Beer Club',
        description: 'Curated American craft beers delivered monthly',
        logo: '🍺',
        rating: 4.4,
        features: ['Craft Selection', 'Brewery Info', 'Monthly Delivery', 'Gift Options'],
        cta: 'Join Beer Club',
        url: 'https://www.craftbeerclub.com/?ref=javarispirits',
        badge: null
      }
    ]
  }
];

export default function WhereToByPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = selectedCategory 
    ? AFFILIATE_CATEGORIES.filter(c => c.id === selectedCategory)
    : AFFILIATE_CATEGORIES;

  return (
    <div className="min-h-screen bg-stone-950 pt-20">
      {/* Hero */}
      <section className="py-12 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-white mb-4">
              Where to Buy & <span className="text-amber-400">Experience</span>
            </h1>
            <p className="text-stone-300 text-lg mb-6">
              Our curated partners for spirits, wine, barware, and experiences. 
              Shop with confidence through our vetted recommendations.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/30">
              <Info className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm">
                We may earn commission from purchases made through these links
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 border-b border-stone-800 sticky top-16 bg-stone-950/95 backdrop-blur-sm z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              All Partners
            </button>
            {AFFILIATE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === cat.id 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 space-y-16">
          {filteredCategories.map((category) => (
            <div key={category.id} id={category.id}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <category.icon className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                  <p className="text-stone-400">{category.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.partners.map((partner) => (
                  <div 
                    key={partner.name}
                    className="bg-stone-900/50 rounded-xl border border-stone-800 overflow-hidden hover:border-amber-500/30 transition-colors"
                  >
                    {partner.badge && (
                      <div className="bg-amber-500 text-white text-xs font-semibold px-3 py-1 text-center">
                        {partner.badge}
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{partner.logo}</span>
                          <div>
                            <h3 className="text-xl font-semibold text-white">{partner.name}</h3>
                            <div className="flex items-center gap-1 text-amber-400">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-sm">{partner.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-stone-300 text-sm mb-4">
                        {partner.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {partner.features.map((feature, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-stone-800 text-stone-400 rounded text-xs"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      <a
                        href={partner.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {partner.cta}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Disclosure */}
      <section className="py-12 border-t border-stone-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold text-white mb-4">Affiliate Disclosure</h3>
          <p className="text-stone-400 text-sm">
            Javari Spirits participates in various affiliate programs. This means we may earn 
            a commission when you make a purchase through links on our site. This comes at 
            no additional cost to you and helps support our platform. We only recommend 
            products and services we genuinely believe in and that align with our mission 
            to help spirit enthusiasts discover exceptional experiences.
          </p>
        </div>
      </section>
    </div>
  );
}

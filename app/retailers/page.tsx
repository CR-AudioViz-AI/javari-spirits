'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RetailerPortalPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    email: '',
    phone: '',
    website: '',
    locations: '',
    message: ''
  })

  const benefits = [
    {
      icon: '👥',
      title: '75,000+ Active Collectors',
      description: 'Reach enthusiasts actively searching for spirits to buy'
    },
    {
      icon: '📍',
      title: 'Store Locator Integration',
      description: 'When users search for bottles, show them YOUR store as a buying option'
    },
    {
      icon: '🔔',
      title: 'Inventory Alerts',
      description: 'Alert collectors when you get allocated bottles they\'re looking for'
    },
    {
      icon: '📊',
      title: 'Customer Insights',
      description: 'See what your local collectors are searching for and buying'
    },
    {
      icon: '🎯',
      title: 'Targeted Advertising',
      description: 'Promote your store and events to engaged local collectors'
    },
    {
      icon: '🏷️',
      title: 'Pricing Data',
      description: 'Access market pricing to optimize your shelf prices'
    }
  ]

  const pricingTiers = [
    {
      name: 'Basic',
      price: 49,
      period: 'month',
      features: [
        'Store listing on BarrelVerse',
        'Basic store profile page',
        'Hours & contact info',
        'Up to 50 product listings',
        'Monthly analytics report'
      ],
      cta: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Professional',
      price: 149,
      period: 'month',
      features: [
        'Everything in Basic',
        'Priority store placement',
        'Unlimited product listings',
        'Real-time inventory sync',
        'Customer wishlists visibility',
        'Event promotion tools',
        '5 targeted ad campaigns/month',
        'Weekly analytics'
      ],
      cta: 'Most Popular',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 399,
      period: 'month',
      features: [
        'Everything in Professional',
        'Multi-location support',
        'API access for inventory',
        'Custom branding options',
        'Dedicated account manager',
        'Unlimited ad campaigns',
        'Priority customer support',
        'Quarterly business reviews',
        'Beta feature access'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ]

  const testimonials = [
    {
      quote: 'Since joining BarrelVerse, our allocated bottle sales have increased 40%. Collectors come in knowing exactly what they want.',
      name: 'Mike Johnson',
      business: 'Johnson\'s Fine Spirits',
      location: 'Louisville, KY'
    },
    {
      quote: 'The inventory alert feature is incredible. We sold out our Blanton\'s allocation in 2 hours after posting.',
      name: 'Sarah Chen',
      business: 'The Whiskey Shop',
      location: 'Nashville, TN'
    }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for your interest! Our team will contact you within 24 hours.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-amber-500">🥃 BarrelVerse</Link>
          <nav className="flex items-center gap-4">
            <Link href="/maker" className="hover:text-amber-400 transition-colors">For Brands</Link>
            <Link href="/pricing" className="hover:text-amber-400 transition-colors">Pricing</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 via-transparent to-amber-900/20" />
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-block bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold mb-6">
                🏪 FOR RETAILERS
              </div>
              <h1 className="text-5xl font-bold mb-6">
                Connect Your Store to <span className="text-amber-400">75,000+ Spirits Collectors</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                BarrelVerse isn't just for collectors - it's a powerful tool for retailers. 
                Get discovered by enthusiasts actively hunting for their next bottle.
              </p>
              <div className="flex gap-4">
                <a href="#pricing" className="bg-amber-600 hover:bg-amber-500 px-8 py-4 rounded-lg font-bold text-lg transition-colors">
                  See Pricing
                </a>
                <a href="#contact" className="bg-stone-700 hover:bg-stone-600 px-8 py-4 rounded-lg font-bold text-lg transition-colors">
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-stone-800/50 border-y border-stone-700/50 py-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-4 gap-8 text-center">
              {[
                { value: '75k+', label: 'Active Collectors' },
                { value: '$45M+', label: 'Collection Value Tracked' },
                { value: '250+', label: 'Retail Partners' },
                { value: '12M', label: 'Monthly Page Views' }
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl font-bold text-amber-400">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Why Retailers Love BarrelVerse</h2>
              <p className="text-xl text-gray-400">Turn collectors into customers</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, i) => (
                <div key={i} className="bg-stone-800/50 rounded-2xl p-6 border border-stone-700/50 hover:border-amber-500/50 transition-all">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-stone-800/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '1', title: 'Sign Up', desc: 'Create your retailer account and verify your business' },
                { step: '2', title: 'Set Up Store', desc: 'Add your location, hours, and specialty areas' },
                { step: '3', title: 'List Inventory', desc: 'Add your products manually or sync via our API' },
                { step: '4', title: 'Get Found', desc: 'Collectors discover your store when searching' }
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Retailer Plans</h2>
              <p className="text-xl text-gray-400">Start with a 14-day free trial</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingTiers.map((tier, i) => (
                <div
                  key={i}
                  className={`rounded-2xl p-8 border ${
                    tier.popular
                      ? 'bg-gradient-to-br from-amber-900/50 to-stone-800/50 border-amber-500/50 scale-105'
                      : 'bg-stone-800/50 border-stone-700/50'
                  }`}
                >
                  {tier.popular && (
                    <div className="text-center -mt-12 mb-4">
                      <span className="bg-amber-500 text-black px-4 py-1 rounded-full text-sm font-bold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-gray-400">/{tier.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <span className="text-green-400">✓</span>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-3 rounded-lg font-bold transition-colors ${
                      tier.popular
                        ? 'bg-amber-600 hover:bg-amber-500'
                        : 'bg-stone-700 hover:bg-stone-600'
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-stone-800/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Retailer Success Stories</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {testimonials.map((testimonial, i) => (
                <div key={i} className="bg-stone-800/50 rounded-2xl p-8 border border-stone-700/50">
                  <div className="text-4xl text-amber-500 mb-4">"</div>
                  <p className="text-gray-300 text-lg mb-6">{testimonial.quote}</p>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-gray-400">{testimonial.business}</p>
                    <p className="text-gray-500 text-sm">{testimonial.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact" className="py-20">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Get Started Today</h2>
              <p className="text-xl text-gray-400">Fill out the form and we'll be in touch within 24 hours</p>
            </div>
            <form onSubmit={handleSubmit} className="bg-stone-800/50 rounded-2xl p-8 border border-stone-700/50">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full bg-stone-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Business Type *</label>
                  <select
                    required
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full bg-stone-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select type</option>
                    <option value="liquor-store">Liquor Store</option>
                    <option value="wine-shop">Wine Shop</option>
                    <option value="grocery">Grocery/Supermarket</option>
                    <option value="bar">Bar/Restaurant</option>
                    <option value="online">Online Retailer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-stone-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-stone-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-stone-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Locations</label>
                  <select
                    value={formData.locations}
                    onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                    className="w-full bg-stone-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select</option>
                    <option value="1">1 location</option>
                    <option value="2-5">2-5 locations</option>
                    <option value="6-20">6-20 locations</option>
                    <option value="20+">20+ locations</option>
                  </select>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Anything else we should know?</label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-stone-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 py-4 rounded-lg font-bold text-lg transition-colors"
              >
                Request Demo
              </button>
              <p className="text-center text-gray-500 text-sm mt-4">
                14-day free trial • No credit card required • Cancel anytime
              </p>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>© 2024 BarrelVerse • A CR AudioViz AI Platform</p>
        </div>
      </footer>
    </div>
  )
}

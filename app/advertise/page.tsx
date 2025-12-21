'use client';

import { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  TrendingUp, 
  Users, 
  Target,
  Award,
  BarChart3,
  Megaphone,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Download
} from 'lucide-react';

const AUDIENCE_STATS = {
  monthlyVisitors: '50,000+',
  pageviews: '200,000+',
  avgSessionDuration: '4:32',
  spiritsDatabase: '22,000+',
  emailSubscribers: '5,000+',
  socialFollowers: '12,000+'
};

const DEMOGRAPHICS = [
  { label: 'Age 25-34', percentage: 35 },
  { label: 'Age 35-44', percentage: 30 },
  { label: 'Age 45-54', percentage: 20 },
  { label: 'Age 55+', percentage: 15 }
];

const INTERESTS = [
  'Whiskey & Bourbon',
  'Wine & Champagne', 
  'Craft Cocktails',
  'Spirit Collecting',
  'Distillery Tours',
  'Home Bar Setup'
];

const SPONSOR_PACKAGES = [
  {
    name: 'Brand Banner',
    price: '$500-2,000',
    duration: 'per month',
    features: [
      'Homepage banner placement',
      '300x250 or 728x90 ad sizes',
      'Guaranteed impressions',
      'Click tracking & reporting'
    ],
    highlight: false
  },
  {
    name: 'Spirit Spotlight',
    price: '$1,000-3,000',
    duration: 'per month',
    features: [
      'Featured product page',
      'Editorial write-up',
      'Social media promotion',
      'Newsletter inclusion',
      'Homepage feature'
    ],
    highlight: true
  },
  {
    name: 'Category Sponsor',
    price: '$2,000-5,000',
    duration: 'per month',
    features: [
      'Entire category ownership',
      'Custom landing page',
      'Exclusive placements',
      'Email newsletter feature',
      'Social media campaign'
    ],
    highlight: false
  },
  {
    name: 'Platform Partner',
    price: '$5,000-15,000',
    duration: 'per month',
    features: [
      'Sitewide presence',
      'Co-branded content',
      'Newsletter sponsorship',
      'Social takeovers',
      'Custom integrations',
      'Dedicated account manager'
    ],
    highlight: false
  }
];

const AD_PLACEMENTS = [
  { name: 'Homepage Hero', size: '1200x400', cpm: '$25-50' },
  { name: 'Sidebar Banner', size: '300x250', cpm: '$10-20' },
  { name: 'In-Feed Native', size: '600x400', cpm: '$15-30' },
  { name: 'Spirit Page', size: '728x90', cpm: '$12-25' },
  { name: 'Newsletter Header', size: '600x200', cpm: '$20-40' },
  { name: 'Mobile Interstitial', size: '320x480', cpm: '$30-60' }
];

export default function AdvertisePage() {
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    website: '',
    budget: '',
    interest: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to Supabase to store leads
    console.log('Advertising inquiry:', formData);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-stone-950 pt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-stone-950 to-stone-950" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/30 mb-6">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">Partner With CRAVBarrels</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Reach <span className="text-amber-400">Passionate</span> Spirit Enthusiasts
            </h1>
            <p className="text-xl text-stone-300 mb-8">
              Connect your brand with our engaged community of whiskey lovers, wine connoisseurs, 
              and cocktail enthusiasts. Premium placements, measurable results.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="#packages" 
                className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors"
              >
                View Packages
              </a>
              <a 
                href="#contact" 
                className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white font-semibold rounded-lg transition-colors"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">{AUDIENCE_STATS.monthlyVisitors}</div>
              <div className="text-stone-400 text-sm">Monthly Visitors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">{AUDIENCE_STATS.pageviews}</div>
              <div className="text-stone-400 text-sm">Monthly Pageviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">{AUDIENCE_STATS.avgSessionDuration}</div>
              <div className="text-stone-400 text-sm">Avg Session</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">{AUDIENCE_STATS.spiritsDatabase}</div>
              <div className="text-stone-400 text-sm">Spirits Database</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">{AUDIENCE_STATS.emailSubscribers}</div>
              <div className="text-stone-400 text-sm">Email Subscribers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400">{AUDIENCE_STATS.socialFollowers}</div>
              <div className="text-stone-400 text-sm">Social Followers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience Demographics */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Audience</h2>
            <p className="text-stone-400 max-w-2xl mx-auto">
              Engaged, affluent spirit enthusiasts who trust CRAVBarrels for discovery and recommendations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Demographics */}
            <div className="bg-stone-900/50 rounded-xl p-8 border border-stone-800">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Age Distribution
              </h3>
              <div className="space-y-4">
                {DEMOGRAPHICS.map((demo) => (
                  <div key={demo.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-stone-300">{demo.label}</span>
                      <span className="text-amber-400">{demo.percentage}%</span>
                    </div>
                    <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                        style={{ width: `${demo.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-stone-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">65%</div>
                  <div className="text-stone-400 text-sm">Male</div>
                </div>
                <div className="bg-stone-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">35%</div>
                  <div className="text-stone-400 text-sm">Female</div>
                </div>
                <div className="bg-stone-800/50 rounded-lg p-4 text-center col-span-2">
                  <div className="text-2xl font-bold text-white">$95K+</div>
                  <div className="text-stone-400 text-sm">Average HH Income</div>
                </div>
              </div>
            </div>

            {/* Interests */}
            <div className="bg-stone-900/50 rounded-xl p-8 border border-stone-800">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                Audience Interests
              </h3>
              <div className="flex flex-wrap gap-3">
                {INTERESTS.map((interest) => (
                  <span 
                    key={interest}
                    className="px-4 py-2 bg-stone-800 text-stone-300 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-stone-300">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>High purchase intent audience</span>
                </div>
                <div className="flex items-center gap-3 text-stone-300">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Active collectors & enthusiasts</span>
                </div>
                <div className="flex items-center gap-3 text-stone-300">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>78% US-based traffic</span>
                </div>
                <div className="flex items-center gap-3 text-stone-300">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>12% return visitor rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsor Packages */}
      <section id="packages" className="py-16 bg-stone-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Sponsorship Packages</h2>
            <p className="text-stone-400 max-w-2xl mx-auto">
              Flexible options to fit your marketing goals and budget
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SPONSOR_PACKAGES.map((pkg) => (
              <div 
                key={pkg.name}
                className={`rounded-xl p-6 border ${
                  pkg.highlight 
                    ? 'bg-gradient-to-b from-amber-900/30 to-stone-900 border-amber-500/50' 
                    : 'bg-stone-900/50 border-stone-800'
                }`}
              >
                {pkg.highlight && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 text-xs font-medium mb-4">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold text-white mb-2">{pkg.name}</h3>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-amber-400">{pkg.price}</span>
                  <span className="text-stone-400 text-sm"> {pkg.duration}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-stone-300">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a 
                  href="#contact"
                  className={`w-full py-2 rounded-lg font-medium text-center block transition-colors ${
                    pkg.highlight
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-stone-800 hover:bg-stone-700 text-white'
                  }`}
                >
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Placements */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ad Placements & Rates</h2>
            <p className="text-stone-400 max-w-2xl mx-auto">
              Premium inventory across our platform
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-800">
                  <th className="text-left py-4 px-4 text-stone-400 font-medium">Placement</th>
                  <th className="text-left py-4 px-4 text-stone-400 font-medium">Size</th>
                  <th className="text-left py-4 px-4 text-stone-400 font-medium">CPM Range</th>
                </tr>
              </thead>
              <tbody>
                {AD_PLACEMENTS.map((placement) => (
                  <tr key={placement.name} className="border-b border-stone-800/50 hover:bg-stone-900/30">
                    <td className="py-4 px-4 text-white">{placement.name}</td>
                    <td className="py-4 px-4 text-stone-400">{placement.size}</td>
                    <td className="py-4 px-4 text-amber-400 font-medium">{placement.cpm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-center">
            <a 
              href="/media-kit.pdf" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-800 hover:bg-stone-700 text-white font-medium rounded-lg transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Media Kit
            </a>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-16 bg-stone-900/30">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Let&apos;s Talk</h2>
            <p className="text-stone-400">
              Tell us about your brand and advertising goals
            </p>
          </div>

          {submitted ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
              <p className="text-stone-300">
                We&apos;ve received your inquiry and will be in touch within 24-48 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-stone-900/50 rounded-xl p-8 border border-stone-800">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">
                    Company Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                      placeholder="Your Company"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                    placeholder="Your Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-500" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">
                    Monthly Budget
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select budget range</option>
                    <option value="under-1000">Under $1,000</option>
                    <option value="1000-5000">$1,000 - $5,000</option>
                    <option value="5000-10000">$5,000 - $10,000</option>
                    <option value="10000-plus">$10,000+</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-300 mb-2">
                    What are you interested in?
                  </label>
                  <select
                    value={formData.interest}
                    onChange={(e) => setFormData({...formData, interest: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select option</option>
                    <option value="banner">Banner Advertising</option>
                    <option value="sponsorship">Sponsorship Package</option>
                    <option value="native">Native/Sponsored Content</option>
                    <option value="newsletter">Newsletter Sponsorship</option>
                    <option value="partnership">Brand Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-300 mb-2">
                    Tell us about your goals
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 resize-none"
                    placeholder="What would you like to achieve with CRAVBarrels advertising?"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Submit Inquiry
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-stone-400 mb-8">Trusted by Leading Brands</h3>
            <div className="flex flex-wrap justify-center gap-12 opacity-50">
              {/* Placeholder for brand logos */}
              <div className="text-2xl font-bold text-stone-600">Buffalo Trace</div>
              <div className="text-2xl font-bold text-stone-600">Woodford Reserve</div>
              <div className="text-2xl font-bold text-stone-600">Angel&apos;s Envy</div>
              <div className="text-2xl font-bold text-stone-600">Four Roses</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-stone-400 mb-4">
            Questions? Contact our advertising team directly:
          </p>
          <a 
            href="mailto:advertising@cravbarrels.com"
            className="text-amber-400 hover:text-amber-300 font-medium text-lg"
          >
            advertising@cravbarrels.com
          </a>
        </div>
      </section>
    </div>
  );
}

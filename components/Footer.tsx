import Link from 'next/link';
import { Wine, Twitter, Instagram, Youtube, Mail, ExternalLink } from 'lucide-react';

const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://craudiovizai.com';

const footerLinks = {
  explore: [
    { label: 'Spirits Database', href: '/spirits' },
    { label: 'Distillery Map', href: '/distilleries' },
    { label: 'Barcode Scanner', href: '/scan' },
    { label: 'AI Sommelier', href: '/sommelier' },
  ],
  learn: [
    { label: 'Academy', href: '/academy' },
    { label: 'Spirit Museum', href: '/museum' },
    { label: 'Tasting Guide', href: '/learn' },
    { label: 'Cocktail Recipes', href: '/cocktails' },
  ],
  community: [
    { label: 'Games', href: '/games' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'My Collection', href: '/collection' },
    { label: 'Reviews', href: '/reviews' },
  ],
  platform: [
    { label: 'Javari AI', href: 'https://javariai.com', external: true },
    { label: 'All Apps', href: `${PLATFORM_URL}/apps`, external: true },
    { label: 'Get Credits', href: `${PLATFORM_URL}/credits`, external: true },
    { label: 'Support', href: `${PLATFORM_URL}/support`, external: true },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-stone-950 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Wine className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                CRAV<span className="text-amber-400">Barrels</span>
              </span>
            </Link>
            <p className="text-stone-400 text-sm mb-4">
              Discover 22,000+ spirits. AI-powered recommendations. Barcode scanning. Collection tracking.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com/craudiovizai" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-amber-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/craudiovizai" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-amber-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@craudiovizai" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-amber-400 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="mailto:support@craudiovizai.com" className="text-stone-400 hover:text-amber-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-white font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-stone-400 hover:text-amber-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h3 className="text-white font-semibold mb-4">Learn</h3>
            <ul className="space-y-2">
              {footerLinks.learn.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-stone-400 hover:text-amber-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-white font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-stone-400 hover:text-amber-400 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>🎨</span> Platform
            </h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a 
                      href={link.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-stone-400 hover:text-amber-400 text-sm transition-colors inline-flex items-center gap-1"
                    >
                      {link.label}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Link href={link.href} className="text-stone-400 hover:text-amber-400 text-sm transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Platform Banner */}
        <div className="mt-12 p-6 bg-gradient-to-r from-amber-900/20 to-orange-900/20 rounded-xl border border-amber-800/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🎨</span>
              <div>
                <p className="text-white font-semibold">Part of CR AudioViz AI</p>
                <p className="text-stone-400 text-sm">60+ creative tools • 1,200+ games • Universal credits</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a 
                href={PLATFORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Explore Platform
              </a>
              <a 
                href={`${PLATFORM_URL}/auth/signup`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Get 1,000 Free Credits
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-500 text-sm">
            © {new Date().getFullYear()} CRAVBarrels by{' '}
            <a href={PLATFORM_URL} className="text-amber-500 hover:underline">CR AudioViz AI</a>
            . All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-stone-400 hover:text-amber-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-stone-400 hover:text-amber-400 transition-colors">
              Terms of Service
            </Link>
            <a href={`${PLATFORM_URL}/support`} className="text-stone-400 hover:text-amber-400 transition-colors">
              Help Center
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

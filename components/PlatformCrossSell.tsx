'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Sparkles, ChevronRight } from 'lucide-react';

const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://craudiovizai.com';

interface PlatformApp {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  url: string;
  gradient: string;
  highlight?: boolean;
}

const PLATFORM_APPS: PlatformApp[] = [
  {
    id: 'javari',
    name: 'Javari AI',
    tagline: '60+ AI Creative Tools',
    icon: '🤖',
    url: 'https://javariai.com',
    gradient: 'from-blue-600 to-cyan-500',
    highlight: true,
  },
  {
    id: 'games',
    name: 'CRAV Games',
    tagline: '1,200+ Free Games',
    icon: '🎮',
    url: `${PLATFORM_URL}/apps/games`,
    gradient: 'from-green-600 to-emerald-500',
  },
  {
    id: 'cardverse',
    name: 'CardVerse',
    tagline: 'Digital Collectibles',
    icon: '🃏',
    url: `${PLATFORM_URL}/apps/cardverse`,
    gradient: 'from-purple-600 to-pink-500',
  },
  {
    id: 'market-oracle',
    name: 'Market Oracle',
    tagline: 'AI Stock Analysis',
    icon: '📈',
    url: `${PLATFORM_URL}/apps/market-oracle`,
    gradient: 'from-amber-600 to-orange-500',
  },
];

export function PlatformCrossSell() {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Don't show if dismissed this session
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('platform_crosssell_dismissed');
    if (wasDismissed) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('platform_crosssell_dismissed', 'true');
  };

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border-t border-stone-700">
      <div className="max-w-7xl mx-auto px-4">
        {/* Collapsed View */}
        {!expanded && (
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎨</span>
              <div>
                <p className="text-sm text-white font-medium">
                  Part of CR AudioViz AI
                </p>
                <p className="text-xs text-stone-400">
                  60+ tools, 1,200+ games with one account
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setExpanded(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-600/20 text-amber-400 rounded-full text-sm hover:bg-amber-600/30 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explore Apps</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleDismiss}
                className="p-1 text-stone-500 hover:text-stone-300 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Expanded View */}
        {expanded && (
          <div className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎨</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    CR AudioViz AI Platform
                  </h3>
                  <p className="text-sm text-stone-400">
                    Your credits work across all these apps • 1,000 free to start
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setExpanded(false)}
                className="p-2 text-stone-500 hover:text-stone-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PLATFORM_APPS.map((app) => (
                <a
                  key={app.id}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                    app.highlight
                      ? 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-700/50 hover:border-blue-500/70'
                      : 'bg-stone-800/50 border-stone-700/50 hover:border-stone-600'
                  }`}
                >
                  {app.highlight && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-blue-600 text-xs text-white rounded-full">
                      Featured
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{app.icon}</span>
                    <div>
                      <h4 className="font-medium text-white group-hover:text-amber-400 transition-colors">
                        {app.name}
                      </h4>
                      <p className="text-xs text-stone-400">{app.tagline}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-4 flex justify-center">
              <a
                href={`${PLATFORM_URL}/apps`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <span>View All 60+ Apps</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlatformCrossSell;

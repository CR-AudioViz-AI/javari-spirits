'use client';

import React from 'react';
import { CardDiscoveryProvider, CardCollectionGrid, useCardDiscoveryTriggers } from '@/components/hidden-card-components';

function DigitalCardsContent() {
  const { visitCount } = useCardDiscoveryTriggers();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-black">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/barrel-texture.png')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-amber-100 mb-4">
              🥃 Digital Card Collection
            </h1>
            <p className="text-xl text-amber-400 mb-2">
              Discover rare cards hidden throughout BarrelVerse
            </p>
            <p className="text-amber-600">
              Visit #{visitCount} • Explore to unlock more cards
            </p>
          </div>
        </div>
      </div>

      {/* Collection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CardCollectionGrid />
      </div>

      {/* How to Find Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-amber-950/50 rounded-2xl p-8 border border-amber-800/30">
          <h2 className="text-2xl font-bold text-amber-100 mb-6 text-center">
            How to Discover Cards
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="font-bold text-amber-200 mb-2">Daily Visits</h3>
              <p className="text-amber-500 text-sm">
                Visit BarrelVerse daily to unlock Age Statement Series cards. 
                Build your streak for rarer finds!
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-bold text-amber-200 mb-2">Explore & Search</h3>
              <p className="text-amber-500 text-sm">
                Navigate different sections and try unique searches. 
                Some cards hide in unexpected places.
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="text-4xl mb-3">🎮</div>
              <h3 className="font-bold text-amber-200 mb-2">Easter Eggs</h3>
              <p className="text-amber-500 text-sm">
                Classic codes, hidden clicks, and late-night visits 
                reveal the rarest Secret Stash cards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Series Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl font-bold text-amber-100 mb-6 text-center">
          Card Series
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Distiller Series', count: 10, desc: 'Early adopter & founder rewards', icon: '🏭' },
            { name: 'Barrel Room Series', count: 15, desc: 'Exploration & discovery', icon: '🛢️' },
            { name: 'Age Statement Series', count: 12, desc: 'Time-based streak rewards', icon: '📅' },
            { name: 'Tasting Notes Series', count: 10, desc: 'Knowledge & expertise', icon: '📝' },
            { name: 'Bourbon Trail Series', count: 8, desc: 'Regional exploration', icon: '🗺️' },
            { name: 'Secret Stash', count: 5, desc: 'Ultra-rare easter eggs', icon: '🔐' },
          ].map(series => (
            <div 
              key={series.name}
              className="bg-amber-900/30 rounded-xl p-4 border border-amber-800/30"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{series.icon}</span>
                <div>
                  <h3 className="font-bold text-amber-200">{series.name}</h3>
                  <p className="text-amber-500 text-sm">{series.desc}</p>
                  <p className="text-amber-600 text-xs">{series.count} cards</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DigitalCardsPage() {
  return (
    <CardDiscoveryProvider>
      <DigitalCardsContent />
    </CardDiscoveryProvider>
  );
}

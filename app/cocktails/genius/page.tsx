'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================

interface Ingredient {
  id: string;
  name: string;
  category: 'spirit' | 'mixer' | 'garnish' | 'syrup' | 'juice' | 'bitter' | 'liqueur' | 'other';
  icon: string;
}

interface Cocktail {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  ingredients: {
    name: string;
    amount: string;
    unit: string;
    optional?: boolean;
  }[];
  instructions: string[];
  glass_type?: string;
  garnish?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prep_time_minutes: number;
  tags: string[];
  match_score?: number;
  missing_ingredients?: string[];
}

// ============================================
// INGREDIENT DATA
// ============================================

const COMMON_INGREDIENTS: Ingredient[] = [
  // Spirits
  { id: 'bourbon', name: 'Bourbon', category: 'spirit', icon: '🥃' },
  { id: 'rye', name: 'Rye Whiskey', category: 'spirit', icon: '🥃' },
  { id: 'scotch', name: 'Scotch', category: 'spirit', icon: '🥃' },
  { id: 'vodka', name: 'Vodka', category: 'spirit', icon: '🍸' },
  { id: 'gin', name: 'Gin', category: 'spirit', icon: '🍸' },
  { id: 'rum-white', name: 'White Rum', category: 'spirit', icon: '🍹' },
  { id: 'rum-dark', name: 'Dark Rum', category: 'spirit', icon: '🍹' },
  { id: 'tequila-blanco', name: 'Tequila Blanco', category: 'spirit', icon: '🌵' },
  { id: 'tequila-reposado', name: 'Tequila Reposado', category: 'spirit', icon: '🌵' },
  { id: 'mezcal', name: 'Mezcal', category: 'spirit', icon: '🌵' },
  { id: 'cognac', name: 'Cognac', category: 'spirit', icon: '🍷' },
  { id: 'brandy', name: 'Brandy', category: 'spirit', icon: '🍷' },
  
  // Liqueurs
  { id: 'triple-sec', name: 'Triple Sec', category: 'liqueur', icon: '🍊' },
  { id: 'cointreau', name: 'Cointreau', category: 'liqueur', icon: '🍊' },
  { id: 'grand-marnier', name: 'Grand Marnier', category: 'liqueur', icon: '🍊' },
  { id: 'amaretto', name: 'Amaretto', category: 'liqueur', icon: '🥜' },
  { id: 'kahlua', name: 'Kahlúa', category: 'liqueur', icon: '☕' },
  { id: 'baileys', name: "Bailey's", category: 'liqueur', icon: '🥛' },
  { id: 'campari', name: 'Campari', category: 'liqueur', icon: '🔴' },
  { id: 'aperol', name: 'Aperol', category: 'liqueur', icon: '🟠' },
  { id: 'sweet-vermouth', name: 'Sweet Vermouth', category: 'liqueur', icon: '🍷' },
  { id: 'dry-vermouth', name: 'Dry Vermouth', category: 'liqueur', icon: '🍷' },
  { id: 'chartreuse', name: 'Chartreuse', category: 'liqueur', icon: '💚' },
  { id: 'benedictine', name: 'Bénédictine', category: 'liqueur', icon: '🍯' },
  { id: 'st-germain', name: 'St-Germain', category: 'liqueur', icon: '🌸' },
  { id: 'maraschino', name: 'Maraschino', category: 'liqueur', icon: '🍒' },
  
  // Mixers
  { id: 'soda-water', name: 'Soda Water', category: 'mixer', icon: '💧' },
  { id: 'tonic', name: 'Tonic Water', category: 'mixer', icon: '💧' },
  { id: 'ginger-beer', name: 'Ginger Beer', category: 'mixer', icon: '🍺' },
  { id: 'ginger-ale', name: 'Ginger Ale', category: 'mixer', icon: '🍺' },
  { id: 'cola', name: 'Cola', category: 'mixer', icon: '🥤' },
  { id: 'cream', name: 'Heavy Cream', category: 'mixer', icon: '🥛' },
  { id: 'coconut-cream', name: 'Coconut Cream', category: 'mixer', icon: '🥥' },
  { id: 'prosecco', name: 'Prosecco', category: 'mixer', icon: '🥂' },
  { id: 'champagne', name: 'Champagne', category: 'mixer', icon: '🥂' },
  
  // Juices
  { id: 'lime-juice', name: 'Lime Juice', category: 'juice', icon: '🍋' },
  { id: 'lemon-juice', name: 'Lemon Juice', category: 'juice', icon: '🍋' },
  { id: 'orange-juice', name: 'Orange Juice', category: 'juice', icon: '🍊' },
  { id: 'grapefruit-juice', name: 'Grapefruit Juice', category: 'juice', icon: '🍊' },
  { id: 'pineapple-juice', name: 'Pineapple Juice', category: 'juice', icon: '🍍' },
  { id: 'cranberry-juice', name: 'Cranberry Juice', category: 'juice', icon: '🍒' },
  { id: 'tomato-juice', name: 'Tomato Juice', category: 'juice', icon: '🍅' },
  
  // Syrups
  { id: 'simple-syrup', name: 'Simple Syrup', category: 'syrup', icon: '🍯' },
  { id: 'honey-syrup', name: 'Honey Syrup', category: 'syrup', icon: '🍯' },
  { id: 'agave', name: 'Agave Nectar', category: 'syrup', icon: '🌵' },
  { id: 'grenadine', name: 'Grenadine', category: 'syrup', icon: '🍒' },
  { id: 'orgeat', name: 'Orgeat', category: 'syrup', icon: '🥜' },
  { id: 'demerara-syrup', name: 'Demerara Syrup', category: 'syrup', icon: '🍯' },
  
  // Bitters
  { id: 'angostura', name: 'Angostura Bitters', category: 'bitter', icon: '💧' },
  { id: 'orange-bitters', name: 'Orange Bitters', category: 'bitter', icon: '🍊' },
  { id: 'peychauds', name: "Peychaud's Bitters", category: 'bitter', icon: '💧' },
  
  // Garnishes
  { id: 'lime-wedge', name: 'Lime', category: 'garnish', icon: '🍋' },
  { id: 'lemon-twist', name: 'Lemon', category: 'garnish', icon: '🍋' },
  { id: 'orange-slice', name: 'Orange', category: 'garnish', icon: '🍊' },
  { id: 'cherry', name: 'Maraschino Cherry', category: 'garnish', icon: '🍒' },
  { id: 'olives', name: 'Olives', category: 'garnish', icon: '🫒' },
  { id: 'mint', name: 'Fresh Mint', category: 'garnish', icon: '🌿' },
  { id: 'basil', name: 'Fresh Basil', category: 'garnish', icon: '🌿' },
  { id: 'cucumber', name: 'Cucumber', category: 'garnish', icon: '🥒' },
  
  // Other
  { id: 'egg-white', name: 'Egg White', category: 'other', icon: '🥚' },
  { id: 'sugar', name: 'Sugar', category: 'other', icon: '🧂' },
  { id: 'salt', name: 'Salt', category: 'other', icon: '🧂' },
  { id: 'ice', name: 'Ice', category: 'other', icon: '🧊' },
];

// ============================================
// SAMPLE COCKTAILS (to be replaced by DB)
// ============================================

const COCKTAIL_DATABASE: Cocktail[] = [
  {
    id: '1',
    name: 'Old Fashioned',
    description: 'The quintessential whiskey cocktail, simple yet sophisticated.',
    image_url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400',
    ingredients: [
      { name: 'bourbon', amount: '2', unit: 'oz' },
      { name: 'simple-syrup', amount: '0.25', unit: 'oz' },
      { name: 'angostura', amount: '2', unit: 'dashes' },
      { name: 'orange-slice', amount: '1', unit: 'slice', optional: true },
      { name: 'cherry', amount: '1', unit: 'piece', optional: true },
    ],
    instructions: [
      'Add simple syrup and bitters to a rocks glass',
      'Add bourbon and stir',
      'Add a large ice cube',
      'Express orange peel over drink and drop in',
      'Garnish with cherry'
    ],
    glass_type: 'Rocks',
    garnish: 'Orange peel, cherry',
    difficulty: 'easy',
    prep_time_minutes: 3,
    tags: ['classic', 'whiskey', 'stirred', 'strong'],
  },
  {
    id: '2',
    name: 'Margarita',
    description: 'The perfect balance of tequila, lime, and orange liqueur.',
    image_url: 'https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=400',
    ingredients: [
      { name: 'tequila-blanco', amount: '2', unit: 'oz' },
      { name: 'lime-juice', amount: '1', unit: 'oz' },
      { name: 'triple-sec', amount: '0.5', unit: 'oz' },
      { name: 'agave', amount: '0.5', unit: 'oz', optional: true },
      { name: 'salt', amount: '1', unit: 'rim', optional: true },
    ],
    instructions: [
      'Salt the rim of a coupe or rocks glass (optional)',
      'Add all ingredients to a shaker with ice',
      'Shake vigorously for 15 seconds',
      'Strain into glass',
      'Garnish with lime wheel'
    ],
    glass_type: 'Coupe or Rocks',
    garnish: 'Lime wheel, salt rim',
    difficulty: 'easy',
    prep_time_minutes: 4,
    tags: ['classic', 'tequila', 'shaken', 'citrus'],
  },
  {
    id: '3',
    name: 'Negroni',
    description: 'A perfectly balanced bitter Italian aperitif.',
    image_url: 'https://images.unsplash.com/photo-1551751299-1b51cab2694c?w=400',
    ingredients: [
      { name: 'gin', amount: '1', unit: 'oz' },
      { name: 'campari', amount: '1', unit: 'oz' },
      { name: 'sweet-vermouth', amount: '1', unit: 'oz' },
      { name: 'orange-slice', amount: '1', unit: 'slice' },
    ],
    instructions: [
      'Add all ingredients to a mixing glass with ice',
      'Stir for 30 seconds',
      'Strain into a rocks glass with fresh ice',
      'Garnish with orange slice'
    ],
    glass_type: 'Rocks',
    garnish: 'Orange slice',
    difficulty: 'easy',
    prep_time_minutes: 3,
    tags: ['classic', 'bitter', 'stirred', 'aperitif'],
  },
  {
    id: '4',
    name: 'Whiskey Sour',
    description: 'A timeless sour with optional egg white for silky texture.',
    image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400',
    ingredients: [
      { name: 'bourbon', amount: '2', unit: 'oz' },
      { name: 'lemon-juice', amount: '0.75', unit: 'oz' },
      { name: 'simple-syrup', amount: '0.75', unit: 'oz' },
      { name: 'egg-white', amount: '1', unit: 'piece', optional: true },
      { name: 'angostura', amount: '2', unit: 'dashes', optional: true },
    ],
    instructions: [
      'Add all ingredients to shaker without ice (dry shake) if using egg white',
      'Add ice and shake vigorously',
      'Strain into a rocks glass',
      'Garnish with cherry and optional bitters drops on foam'
    ],
    glass_type: 'Rocks',
    garnish: 'Cherry, bitters',
    difficulty: 'medium',
    prep_time_minutes: 5,
    tags: ['classic', 'whiskey', 'shaken', 'sour'],
  },
  {
    id: '5',
    name: 'Moscow Mule',
    description: 'Refreshing vodka cocktail with ginger and lime.',
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400',
    ingredients: [
      { name: 'vodka', amount: '2', unit: 'oz' },
      { name: 'lime-juice', amount: '0.5', unit: 'oz' },
      { name: 'ginger-beer', amount: '4', unit: 'oz' },
      { name: 'lime-wedge', amount: '1', unit: 'wedge' },
    ],
    instructions: [
      'Fill copper mug with ice',
      'Add vodka and lime juice',
      'Top with ginger beer',
      'Stir gently',
      'Garnish with lime wedge'
    ],
    glass_type: 'Copper Mug',
    garnish: 'Lime wedge',
    difficulty: 'easy',
    prep_time_minutes: 2,
    tags: ['refreshing', 'vodka', 'built', 'ginger'],
  },
  {
    id: '6',
    name: 'Mojito',
    description: 'Refreshing rum cocktail with mint and lime.',
    image_url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400',
    ingredients: [
      { name: 'rum-white', amount: '2', unit: 'oz' },
      { name: 'lime-juice', amount: '1', unit: 'oz' },
      { name: 'simple-syrup', amount: '0.75', unit: 'oz' },
      { name: 'mint', amount: '8', unit: 'leaves' },
      { name: 'soda-water', amount: '2', unit: 'oz' },
    ],
    instructions: [
      'Gently muddle mint leaves with simple syrup',
      'Add rum and lime juice',
      'Add ice and shake briefly',
      'Strain into highball glass with fresh ice',
      'Top with soda water',
      'Garnish with mint sprig'
    ],
    glass_type: 'Highball',
    garnish: 'Mint sprig',
    difficulty: 'medium',
    prep_time_minutes: 5,
    tags: ['refreshing', 'rum', 'muddled', 'mint'],
  },
  {
    id: '7',
    name: 'Manhattan',
    description: 'Elegant whiskey cocktail with vermouth and bitters.',
    image_url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400',
    ingredients: [
      { name: 'rye', amount: '2', unit: 'oz' },
      { name: 'sweet-vermouth', amount: '1', unit: 'oz' },
      { name: 'angostura', amount: '2', unit: 'dashes' },
      { name: 'cherry', amount: '1', unit: 'piece' },
    ],
    instructions: [
      'Add all ingredients to mixing glass with ice',
      'Stir for 30 seconds',
      'Strain into chilled coupe',
      'Garnish with cherry'
    ],
    glass_type: 'Coupe',
    garnish: 'Luxardo cherry',
    difficulty: 'easy',
    prep_time_minutes: 3,
    tags: ['classic', 'whiskey', 'stirred', 'elegant'],
  },
  {
    id: '8',
    name: 'Daiquiri',
    description: 'A perfectly balanced rum sour - the original.',
    image_url: 'https://images.unsplash.com/photo-1587223075055-82e9a937ddff?w=400',
    ingredients: [
      { name: 'rum-white', amount: '2', unit: 'oz' },
      { name: 'lime-juice', amount: '1', unit: 'oz' },
      { name: 'simple-syrup', amount: '0.75', unit: 'oz' },
    ],
    instructions: [
      'Add all ingredients to shaker with ice',
      'Shake vigorously for 15 seconds',
      'Strain into chilled coupe',
      'Garnish with lime wheel'
    ],
    glass_type: 'Coupe',
    garnish: 'Lime wheel',
    difficulty: 'easy',
    prep_time_minutes: 3,
    tags: ['classic', 'rum', 'shaken', 'sour'],
  },
  {
    id: '9',
    name: 'Gin & Tonic',
    description: 'Simple, refreshing, and endlessly customizable.',
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400',
    ingredients: [
      { name: 'gin', amount: '2', unit: 'oz' },
      { name: 'tonic', amount: '4', unit: 'oz' },
      { name: 'lime-wedge', amount: '1', unit: 'wedge' },
    ],
    instructions: [
      'Fill highball glass with ice',
      'Add gin',
      'Top with tonic water',
      'Gently stir',
      'Garnish with lime wedge'
    ],
    glass_type: 'Highball',
    garnish: 'Lime wedge',
    difficulty: 'easy',
    prep_time_minutes: 2,
    tags: ['refreshing', 'gin', 'built', 'simple'],
  },
  {
    id: '10',
    name: 'Espresso Martini',
    description: 'The ultimate coffee cocktail for vodka lovers.',
    image_url: 'https://images.unsplash.com/photo-1545438102-799c3991ffb2?w=400',
    ingredients: [
      { name: 'vodka', amount: '1.5', unit: 'oz' },
      { name: 'kahlua', amount: '0.5', unit: 'oz' },
      { name: 'simple-syrup', amount: '0.25', unit: 'oz' },
    ],
    instructions: [
      'Brew fresh espresso and let cool slightly',
      'Add all ingredients to shaker with ice',
      'Shake very hard for 20 seconds to create foam',
      'Double strain into chilled martini glass',
      'Garnish with coffee beans'
    ],
    glass_type: 'Martini',
    garnish: '3 coffee beans',
    difficulty: 'medium',
    prep_time_minutes: 5,
    tags: ['coffee', 'vodka', 'shaken', 'after-dinner'],
  },
  {
    id: '11',
    name: 'Aperol Spritz',
    description: 'Light, bubbly Italian aperitif perfect for warm weather.',
    image_url: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=400',
    ingredients: [
      { name: 'aperol', amount: '2', unit: 'oz' },
      { name: 'prosecco', amount: '3', unit: 'oz' },
      { name: 'soda-water', amount: '1', unit: 'oz' },
      { name: 'orange-slice', amount: '1', unit: 'slice' },
    ],
    instructions: [
      'Fill wine glass with ice',
      'Add Aperol',
      'Add prosecco',
      'Top with splash of soda',
      'Garnish with orange slice'
    ],
    glass_type: 'Wine Glass',
    garnish: 'Orange slice',
    difficulty: 'easy',
    prep_time_minutes: 2,
    tags: ['aperitif', 'bubbly', 'built', 'refreshing'],
  },
  {
    id: '12',
    name: 'Dark & Stormy',
    description: 'Bold rum meets spicy ginger beer.',
    image_url: 'https://images.unsplash.com/photo-1536935338788-846e56bd41bb?w=400',
    ingredients: [
      { name: 'rum-dark', amount: '2', unit: 'oz' },
      { name: 'ginger-beer', amount: '4', unit: 'oz' },
      { name: 'lime-juice', amount: '0.5', unit: 'oz' },
      { name: 'lime-wedge', amount: '1', unit: 'wedge' },
    ],
    instructions: [
      'Fill highball glass with ice',
      'Add lime juice and ginger beer',
      'Float dark rum on top',
      'Garnish with lime wedge'
    ],
    glass_type: 'Highball',
    garnish: 'Lime wedge',
    difficulty: 'easy',
    prep_time_minutes: 2,
    tags: ['rum', 'ginger', 'built', 'refreshing'],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateMatchScore(cocktail: Cocktail, selectedIngredients: string[]): { score: number; missing: string[] } {
  const required = cocktail.ingredients.filter(i => !i.optional);
  const optional = cocktail.ingredients.filter(i => i.optional);
  
  let matchedRequired = 0;
  let matchedOptional = 0;
  const missing: string[] = [];
  
  for (const ing of required) {
    if (selectedIngredients.includes(ing.name)) {
      matchedRequired++;
    } else {
      missing.push(ing.name);
    }
  }
  
  for (const ing of optional) {
    if (selectedIngredients.includes(ing.name)) {
      matchedOptional++;
    }
  }
  
  // Score: 0-100
  // Required ingredients are weighted heavily
  const requiredScore = required.length > 0 ? (matchedRequired / required.length) * 80 : 80;
  const optionalScore = optional.length > 0 ? (matchedOptional / optional.length) * 20 : 20;
  
  return {
    score: Math.round(requiredScore + optionalScore),
    missing,
  };
}

function getIngredientName(id: string): string {
  const ing = COMMON_INGREDIENTS.find(i => i.id === id);
  return ing?.name || id;
}

// ============================================
// COMPONENTS
// ============================================

function IngredientSelector({
  ingredients,
  selected,
  onToggle,
  category,
}: {
  ingredients: Ingredient[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  category: string;
}) {
  const filtered = ingredients.filter(i => i.category === category);
  
  if (filtered.length === 0) return null;
  
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-500 mb-2 capitalize">{category}s</h4>
      <div className="flex flex-wrap gap-2">
        {filtered.map(ing => (
          <button
            key={ing.id}
            onClick={() => onToggle(ing.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
              selected.has(ing.id)
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{ing.icon}</span>
            <span>{ing.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CocktailCard({ cocktail, onSelect }: { cocktail: Cocktail; onSelect: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onSelect}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {cocktail.image_url ? (
          <img
            src={cocktail.image_url}
            alt={cocktail.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🍸</div>
        )}
        
        {/* Match Score Badge */}
        {cocktail.match_score !== undefined && (
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${
            cocktail.match_score >= 80 ? 'bg-green-500 text-white' :
            cocktail.match_score >= 50 ? 'bg-amber-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {cocktail.match_score}% match
          </div>
        )}
        
        {/* Difficulty */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            cocktail.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
            cocktail.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {cocktail.difficulty}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-amber-600 transition-colors">
          {cocktail.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{cocktail.description}</p>
        
        {/* Missing Ingredients */}
        {cocktail.missing_ingredients && cocktail.missing_ingredients.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-red-500 font-medium">
              Missing: {cocktail.missing_ingredients.map(getIngredientName).join(', ')}
            </p>
          </div>
        )}
        
        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>🕐 {cocktail.prep_time_minutes} min</span>
          <span>🥃 {cocktail.glass_type}</span>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {cocktail.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function CocktailDetailModal({ cocktail, onClose }: { cocktail: Cocktail; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-64 bg-gray-100">
          {cocktail.image_url ? (
            <img
              src={cocktail.image_url}
              alt={cocktail.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">🍸</div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{cocktail.name}</h2>
              <p className="text-gray-500 mt-1">{cocktail.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              cocktail.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
              cocktail.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              {cocktail.difficulty}
            </span>
          </div>
          
          {/* Quick Info */}
          <div className="flex gap-4 mb-6 text-sm">
            <div className="flex items-center gap-1">
              <span>🕐</span>
              <span>{cocktail.prep_time_minutes} min</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🥃</span>
              <span>{cocktail.glass_type}</span>
            </div>
            {cocktail.garnish && (
              <div className="flex items-center gap-1">
                <span>🍋</span>
                <span>{cocktail.garnish}</span>
              </div>
            )}
          </div>
          
          {/* Ingredients */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Ingredients</h3>
            <ul className="space-y-2">
              {cocktail.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className={`${ing.optional ? 'text-gray-400' : 'text-gray-700'}`}>
                    {getIngredientName(ing.name)}
                    {ing.optional && ' (optional)'}
                  </span>
                  <span className="text-gray-500">{ing.amount} {ing.unit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Instructions */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
            <ol className="space-y-3">
              {cocktail.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-sm flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {cocktail.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function CocktailGeniusPage() {
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [matchedCocktails, setMatchedCocktails] = useState<Cocktail[]>([]);
  const [selectedCocktail, setSelectedCocktail] = useState<Cocktail | null>(null);
  const [showOnlyPerfectMatch, setShowOnlyPerfectMatch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Toggle ingredient selection
  const toggleIngredient = (id: string) => {
    const newSelected = new Set(selectedIngredients);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIngredients(newSelected);
  };
  
  // Calculate matches whenever selection changes
  useEffect(() => {
    if (selectedIngredients.size === 0) {
      setMatchedCocktails([]);
      return;
    }
    
    const selectedArray = Array.from(selectedIngredients);
    
    const matches = COCKTAIL_DATABASE
      .map(cocktail => {
        const { score, missing } = calculateMatchScore(cocktail, selectedArray);
        return {
          ...cocktail,
          match_score: score,
          missing_ingredients: missing,
        };
      })
      .filter(c => c.match_score! > 0)
      .sort((a, b) => b.match_score! - a.match_score!);
    
    setMatchedCocktails(showOnlyPerfectMatch ? matches.filter(c => c.match_score === 100) : matches);
  }, [selectedIngredients, showOnlyPerfectMatch]);
  
  // Filter by search
  const filteredCocktails = searchQuery
    ? matchedCocktails.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : matchedCocktails;
  
  const categories: Ingredient['category'][] = ['spirit', 'liqueur', 'mixer', 'juice', 'syrup', 'bitter', 'garnish', 'other'];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span>🍸</span>
                AI Cocktail Genius
              </h1>
              <p className="text-white/80 mt-1">Tell us what's in your bar and we'll find your perfect cocktail</p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors w-fit"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredient Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What's in Your Bar?</h2>
              <p className="text-sm text-gray-500 mb-6">Select the ingredients you have available</p>
              
              {/* Selected Count */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <span className="text-sm text-gray-600">
                  <strong>{selectedIngredients.size}</strong> ingredients selected
                </span>
                {selectedIngredients.size > 0 && (
                  <button
                    onClick={() => setSelectedIngredients(new Set())}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Clear all
                  </button>
                )}
              </div>
              
              {/* Category Sections */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {categories.map(cat => (
                  <IngredientSelector
                    key={cat}
                    ingredients={COMMON_INGREDIENTS}
                    selected={selectedIngredients}
                    onToggle={toggleIngredient}
                    category={cat}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Results */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search cocktails..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyPerfectMatch}
                  onChange={e => setShowOnlyPerfectMatch(e.target.checked)}
                  className="rounded text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">Only perfect matches</span>
              </label>
            </div>
            
            {/* Results Grid */}
            {selectedIngredients.size === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <div className="text-6xl mb-4">🍾</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Start by selecting ingredients</h3>
                <p className="text-gray-500">Choose what you have in your bar and we'll find matching cocktails</p>
              </div>
            ) : filteredCocktails.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <div className="text-6xl mb-4">🤔</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
                <p className="text-gray-500">Try adding more ingredients or adjust your filters</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Found <strong>{filteredCocktails.length}</strong> cocktails you can make
                </p>
                <div className="grid gap-6 sm:grid-cols-2">
                  {filteredCocktails.map(cocktail => (
                    <CocktailCard
                      key={cocktail.id}
                      cocktail={cocktail}
                      onSelect={() => setSelectedCocktail(cocktail)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Cocktail Detail Modal */}
      <AnimatePresence>
        {selectedCocktail && (
          <CocktailDetailModal
            cocktail={selectedCocktail}
            onClose={() => setSelectedCocktail(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

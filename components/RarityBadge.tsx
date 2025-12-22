'use client';

import { cn } from '@/lib/utils';

type RarityTier = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'ultra_rare' | 'grail';

interface RarityBadgeProps {
  score: number;
  tier?: RarityTier;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  showLabel?: boolean;
  className?: string;
}

const RARITY_CONFIG: Record<RarityTier, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  glow?: string;
}> = {
  common: {
    label: 'Common',
    color: 'text-gray-400',
    bgColor: 'bg-gray-800',
    borderColor: 'border-gray-600',
    icon: '⚪'
  },
  uncommon: {
    label: 'Uncommon',
    color: 'text-green-400',
    bgColor: 'bg-green-900/30',
    borderColor: 'border-green-600',
    icon: '🟢'
  },
  rare: {
    label: 'Rare',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/30',
    borderColor: 'border-blue-500',
    icon: '🔵'
  },
  very_rare: {
    label: 'Very Rare',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/30',
    borderColor: 'border-purple-500',
    icon: '🟣'
  },
  ultra_rare: {
    label: 'Ultra Rare',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/30',
    borderColor: 'border-yellow-500',
    icon: '🟡',
    glow: 'shadow-lg shadow-yellow-500/20'
  },
  grail: {
    label: 'Grail',
    color: 'text-orange-400',
    bgColor: 'bg-gradient-to-r from-orange-900/40 to-red-900/40',
    borderColor: 'border-orange-500',
    icon: '🔴',
    glow: 'shadow-xl shadow-orange-500/30 animate-pulse'
  }
};

function getTierFromScore(score: number): RarityTier {
  if (score >= 96) return 'grail';
  if (score >= 81) return 'ultra_rare';
  if (score >= 61) return 'very_rare';
  if (score >= 41) return 'rare';
  if (score >= 21) return 'uncommon';
  return 'common';
}

export default function RarityBadge({
  score,
  tier,
  size = 'md',
  showScore = true,
  showLabel = true,
  className
}: RarityBadgeProps) {
  const actualTier = tier || getTierFromScore(score);
  const config = RARITY_CONFIG[actualTier];

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border',
        config.bgColor,
        config.borderColor,
        config.glow,
        sizeClasses[size],
        className
      )}
    >
      <span className="text-base">{config.icon}</span>
      
      {showScore && (
        <span className={cn('font-bold', config.color)}>
          {score}
        </span>
      )}
      
      {showLabel && (
        <span className={cn('font-medium', config.color)}>
          {config.label}
        </span>
      )}
    </div>
  );
}

// Compact version for lists
export function RarityDot({ score, className }: { score: number; className?: string }) {
  const tier = getTierFromScore(score);
  const config = RARITY_CONFIG[tier];

  return (
    <div
      className={cn(
        'w-3 h-3 rounded-full',
        tier === 'grail' && 'animate-pulse',
        className
      )}
      style={{
        backgroundColor: 
          tier === 'common' ? '#9CA3AF' :
          tier === 'uncommon' ? '#34D399' :
          tier === 'rare' ? '#60A5FA' :
          tier === 'very_rare' ? '#A78BFA' :
          tier === 'ultra_rare' ? '#FBBF24' :
          '#F97316',
        boxShadow: tier === 'grail' || tier === 'ultra_rare' 
          ? `0 0 10px ${tier === 'grail' ? '#F97316' : '#FBBF24'}` 
          : 'none'
      }}
      title={`${config.label} (${score}/100)`}
    />
  );
}

// Score bar visualization
export function RarityScoreBar({ 
  score, 
  showLabels = true,
  className 
}: { 
  score: number; 
  showLabels?: boolean;
  className?: string;
}) {
  const tier = getTierFromScore(score);
  const config = RARITY_CONFIG[tier];

  return (
    <div className={cn('w-full', className)}>
      {showLabels && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Rarity Score</span>
          <span className={cn('text-sm font-bold', config.color)}>
            {score}/100
          </span>
        </div>
      )}
      
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            tier === 'common' && 'bg-gray-500',
            tier === 'uncommon' && 'bg-green-500',
            tier === 'rare' && 'bg-blue-500',
            tier === 'very_rare' && 'bg-purple-500',
            tier === 'ultra_rare' && 'bg-yellow-500',
            tier === 'grail' && 'bg-gradient-to-r from-orange-500 to-red-500'
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      
      {showLabels && (
        <div className="flex justify-center mt-1">
          <span className={cn('text-xs font-medium', config.color)}>
            {config.icon} {config.label}
          </span>
        </div>
      )}
    </div>
  );
}

// Investment potential badge
export function InvestmentPotentialBadge({ 
  potential 
}: { 
  potential: 'low' | 'medium' | 'high' | 'exceptional' 
}) {
  const config = {
    low: { label: 'Low', color: 'text-gray-400', bg: 'bg-gray-800' },
    medium: { label: 'Medium', color: 'text-blue-400', bg: 'bg-blue-900/30' },
    high: { label: 'High', color: 'text-green-400', bg: 'bg-green-900/30' },
    exceptional: { label: 'Exceptional', color: 'text-yellow-400', bg: 'bg-yellow-900/30' }
  };

  const c = config[potential];

  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
      c.bg, c.color
    )}>
      📈 {c.label} Investment Potential
    </span>
  );
}

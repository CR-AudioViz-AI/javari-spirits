/**
 * CRAV Barrels - Rarity Scoring Engine
 * 
 * Calculates rarity scores (0-100) for spirits based on 10 factors.
 * Used for investment insights and collection valuation.
 */

export interface RarityFactors {
  production_quantity: number;      // 1-10: Lower production = higher score
  age_statement: number;            // 1-10: Older = higher score
  distillery_reputation: number;    // 1-10: Prestigious = higher score
  region_scarcity: number;          // 1-10: Limited regions = higher score
  release_type: number;             // 1-10: Limited/single barrel = higher
  secondary_market_price: number;   // 1-10: Higher premium = higher score
  auction_frequency: number;        // 1-10: Rarely appears = higher score
  historical_significance: number;  // 1-10: Important to history = higher
  packaging_variations: number;     // 1-10: Special packaging = higher
  discontinued_status: number;      // 1-10: Discontinued = higher score
}

export interface RarityResult {
  score: number;
  tier: RarityTier;
  factors: RarityFactors;
  investment_potential: 'low' | 'medium' | 'high' | 'exceptional';
  analysis: string;
  estimated_value_range: {
    low: number;
    high: number;
  };
}

export type RarityTier = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'ultra_rare' | 'grail';

// Weights for each factor (adjust based on market research)
const FACTOR_WEIGHTS: Record<keyof RarityFactors, number> = {
  production_quantity: 1.5,
  age_statement: 1.2,
  distillery_reputation: 1.0,
  region_scarcity: 0.8,
  release_type: 1.3,
  secondary_market_price: 1.4,
  auction_frequency: 1.1,
  historical_significance: 0.9,
  packaging_variations: 0.6,
  discontinued_status: 1.2
};

// Tier thresholds and metadata
export const RARITY_TIERS: Record<RarityTier, {
  range: [number, number];
  label: string;
  color: string;
  icon: string;
  description: string;
}> = {
  common: {
    range: [0, 20],
    label: 'Common',
    color: '#808080',
    icon: '⚪',
    description: 'Widely available, easy to find at retail'
  },
  uncommon: {
    range: [21, 40],
    label: 'Uncommon',
    color: '#2E8B57',
    icon: '🟢',
    description: 'Available but may require searching'
  },
  rare: {
    range: [41, 60],
    label: 'Rare',
    color: '#4169E1',
    icon: '🔵',
    description: 'Limited availability, sought after by collectors'
  },
  very_rare: {
    range: [61, 80],
    label: 'Very Rare',
    color: '#9932CC',
    icon: '🟣',
    description: 'Hard to find, considered a serious collector\'s item'
  },
  ultra_rare: {
    range: [81, 95],
    label: 'Ultra Rare',
    color: '#FFD700',
    icon: '🟡',
    description: 'Extremely scarce, investment grade'
  },
  grail: {
    range: [96, 100],
    label: 'Grail',
    color: '#FF4500',
    icon: '🔴',
    description: 'Legendary, once-in-a-lifetime find'
  }
};

/**
 * Calculate rarity score from factors
 */
export function calculateRarityScore(factors: RarityFactors): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [factor, value] of Object.entries(factors)) {
    const weight = FACTOR_WEIGHTS[factor as keyof RarityFactors];
    weightedSum += value * weight;
    totalWeight += weight * 10; // Max possible per factor is 10
  }

  return Math.round((weightedSum / totalWeight) * 100);
}

/**
 * Determine rarity tier from score
 */
export function getRarityTier(score: number): RarityTier {
  for (const [tier, config] of Object.entries(RARITY_TIERS)) {
    if (score >= config.range[0] && score <= config.range[1]) {
      return tier as RarityTier;
    }
  }
  return 'common';
}

/**
 * Determine investment potential
 */
export function getInvestmentPotential(
  score: number,
  factors: RarityFactors
): 'low' | 'medium' | 'high' | 'exceptional' {
  const marketFactor = (factors.secondary_market_price + factors.auction_frequency) / 2;
  const scarcityFactor = (factors.production_quantity + factors.discontinued_status) / 2;
  
  if (score >= 80 && marketFactor >= 7 && scarcityFactor >= 7) {
    return 'exceptional';
  }
  if (score >= 60 && marketFactor >= 5) {
    return 'high';
  }
  if (score >= 40 || marketFactor >= 6) {
    return 'medium';
  }
  return 'low';
}

/**
 * Generate analysis text
 */
export function generateAnalysis(
  factors: RarityFactors,
  score: number,
  tier: RarityTier
): string {
  const highlights: string[] = [];
  const concerns: string[] = [];
  
  // Identify strengths (factors >= 7)
  if (factors.production_quantity >= 7) highlights.push('Very limited production');
  if (factors.age_statement >= 7) highlights.push('Exceptional age statement');
  if (factors.distillery_reputation >= 7) highlights.push('Prestigious distillery');
  if (factors.release_type >= 7) highlights.push('Special limited release');
  if (factors.secondary_market_price >= 7) highlights.push('Strong secondary market demand');
  if (factors.discontinued_status >= 7) highlights.push('Discontinued/no longer produced');
  if (factors.historical_significance >= 7) highlights.push('Historically significant');
  
  // Identify weaknesses (factors <= 3)
  if (factors.production_quantity <= 3) concerns.push('High production volume');
  if (factors.distillery_reputation <= 3) concerns.push('Lesser-known producer');
  if (factors.secondary_market_price <= 3) concerns.push('Limited resale market');
  
  let analysis = `This spirit scores ${score}/100, placing it in the "${RARITY_TIERS[tier].label}" tier. `;
  
  if (highlights.length > 0) {
    analysis += `Key strengths: ${highlights.join(', ')}. `;
  }
  
  if (concerns.length > 0 && tier !== 'grail' && tier !== 'ultra_rare') {
    analysis += `Considerations: ${concerns.join(', ')}. `;
  }
  
  switch (tier) {
    case 'grail':
      analysis += 'This is a legendary bottle that represents the pinnacle of collecting. Expect significant competition for acquisition.';
      break;
    case 'ultra_rare':
      analysis += 'An investment-grade spirit with strong appreciation potential. Document provenance carefully.';
      break;
    case 'very_rare':
      analysis += 'A serious collector\'s item worth pursuing. May require patience and networking to acquire.';
      break;
    case 'rare':
      analysis += 'A solid addition to any collection with good long-term value retention.';
      break;
    case 'uncommon':
      analysis += 'Available with some effort. Good entry point for collectors interested in this category.';
      break;
    case 'common':
      analysis += 'Readily available at retail. Best enjoyed rather than held for investment.';
      break;
  }
  
  return analysis;
}

/**
 * Estimate value range based on rarity and market factors
 */
export function estimateValueRange(
  msrp: number,
  score: number,
  factors: RarityFactors
): { low: number; high: number } {
  let baseMultiplier = 1;
  
  if (score >= 96) baseMultiplier = 15;
  else if (score >= 81) baseMultiplier = 8;
  else if (score >= 61) baseMultiplier = 4;
  else if (score >= 41) baseMultiplier = 2;
  else if (score >= 21) baseMultiplier = 1.3;
  else baseMultiplier = 1;
  
  const marketAdjustment = (factors.secondary_market_price - 5) * 0.2;
  const finalMultiplier = baseMultiplier * (1 + marketAdjustment);
  
  const midpoint = msrp * finalMultiplier;
  const variance = score >= 60 ? 0.25 : 0.15;
  
  return {
    low: Math.round(midpoint * (1 - variance)),
    high: Math.round(midpoint * (1 + variance))
  };
}

/**
 * Full rarity calculation
 */
export function calculateRarity(
  factors: RarityFactors,
  msrp: number = 50
): RarityResult {
  const score = calculateRarityScore(factors);
  const tier = getRarityTier(score);
  const investment_potential = getInvestmentPotential(score, factors);
  const analysis = generateAnalysis(factors, score, tier);
  const estimated_value_range = estimateValueRange(msrp, score, factors);
  
  return {
    score,
    tier,
    factors,
    investment_potential,
    analysis,
    estimated_value_range
  };
}

/**
 * Auto-calculate factors from spirit data
 */
export function autoCalculateFactors(spirit: {
  name: string;
  brand?: string;
  distillery?: string;
  age_statement?: number;
  spirit_type?: string;
  msrp?: number;
  current_price?: number;
  limited_edition?: boolean;
  discontinued?: boolean;
  production_quantity?: number;
}): RarityFactors {
  const factors: RarityFactors = {
    production_quantity: 5,
    age_statement: 3,
    distillery_reputation: 5,
    region_scarcity: 5,
    release_type: 4,
    secondary_market_price: 5,
    auction_frequency: 5,
    historical_significance: 3,
    packaging_variations: 3,
    discontinued_status: 2
  };
  
  // Age statement scoring
  if (spirit.age_statement) {
    if (spirit.age_statement >= 25) factors.age_statement = 10;
    else if (spirit.age_statement >= 21) factors.age_statement = 9;
    else if (spirit.age_statement >= 18) factors.age_statement = 8;
    else if (spirit.age_statement >= 15) factors.age_statement = 7;
    else if (spirit.age_statement >= 12) factors.age_statement = 6;
    else if (spirit.age_statement >= 10) factors.age_statement = 5;
    else if (spirit.age_statement >= 8) factors.age_statement = 4;
    else factors.age_statement = 3;
  }
  
  // Release type
  factors.release_type = spirit.limited_edition ? 8 : 4;
  
  // Discontinued status
  factors.discontinued_status = spirit.discontinued ? 9 : 2;
  
  // Secondary market price
  if (spirit.msrp && spirit.current_price) {
    const priceRatio = spirit.current_price / spirit.msrp;
    if (priceRatio >= 10) factors.secondary_market_price = 10;
    else if (priceRatio >= 5) factors.secondary_market_price = 8;
    else if (priceRatio >= 3) factors.secondary_market_price = 7;
    else if (priceRatio >= 2) factors.secondary_market_price = 6;
    else if (priceRatio >= 1.5) factors.secondary_market_price = 5;
    else factors.secondary_market_price = 3;
  }
  
  // Production quantity
  if (spirit.production_quantity) {
    if (spirit.production_quantity <= 100) factors.production_quantity = 10;
    else if (spirit.production_quantity <= 500) factors.production_quantity = 9;
    else if (spirit.production_quantity <= 1000) factors.production_quantity = 8;
    else if (spirit.production_quantity <= 5000) factors.production_quantity = 7;
    else if (spirit.production_quantity <= 10000) factors.production_quantity = 6;
    else factors.production_quantity = 4;
  }
  
  // Known prestigious distilleries/brands
  const prestigeBrands = [
    'pappy van winkle', 'buffalo trace antique', 'george t stagg',
    'william larue weller', 'thomas h handy', 'sazerac 18',
    'macallan', 'glenfiddich', 'dalmore', 'highland park',
    'yamazaki', 'hibiki', 'hakushu', 'nikka', 'blanton',
    'eagle rare', 'weller', 'elijah craig', 'four roses'
  ];
  
  const nameLower = (spirit.name + ' ' + (spirit.brand || '')).toLowerCase();
  factors.distillery_reputation = prestigeBrands.some(b => nameLower.includes(b)) ? 9 : 5;
  
  return factors;
}

/**
 * Get tier display info
 */
export function getTierDisplay(tier: RarityTier) {
  return RARITY_TIERS[tier];
}

/**
 * Format score for display
 */
export function formatRarityScore(score: number): string {
  const tier = getRarityTier(score);
  const display = RARITY_TIERS[tier];
  return `${display.icon} ${score}/100 - ${display.label}`;
}

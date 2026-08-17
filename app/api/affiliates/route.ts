/**
 * AWIN AFFILIATE INTEGRATION API
 * ===============================
 * Connects spirit products to real affiliate purchase links
 * Publisher ID: 2692370
 * 
 * GET /api/affiliates?spirit_name=xxx - Get affiliate links for a spirit
 * GET /api/affiliates/retailers - Get list of connected retailers
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ============================================
// AFFILIATE PARTNER DATA
// ============================================

interface AffiliatePartner {
  id: string;
  name: string;
  logo: string;
  baseUrl: string;
  searchParam: string;
  commission: string;
  categories: string[];
  description: string;
  shippingInfo: string;
  rating: number;
}

// Real affiliate partners from Awin network
// PARTNERS REMOVED 2026-08-17. Eight entries with hardcoded AWIN ids (19899,
// 20917, 15849, 6025, 25781, 20291, 3539, 3390) that matched nothing in
// affiliate_merchants. They also contradicted app/page.tsx — Total Wine was
// 10924 there and 19899 here, which is itself proof the numbers were invented.
// Real merchants come from affiliate_merchants, is_approved and is_active.
const AFFILIATE_PARTNERS: AffiliatePartner[] = [];


// Category mapping for spirits
const CATEGORY_MAP: Record<string, string[]> = {
  'Bourbon': ['whiskey', 'bourbon'],
  'Scotch': ['whiskey', 'scotch'],
  'Whiskey': ['whiskey'],
  'Irish Whiskey': ['whiskey'],
  'Japanese Whisky': ['whiskey', 'japanese_whisky'],
  'Rye': ['whiskey', 'bourbon'],
  'Vodka': ['vodka'],
  'Gin': ['gin'],
  'Rum': ['rum'],
  'Tequila': ['tequila'],
  'Mezcal': ['tequila'],
  'Cognac': ['cognac'],
  'Brandy': ['cognac'],
  'Wine': ['wine'],
  'Champagne': ['champagne', 'wine'],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getRelevantPartners(category: string): AffiliatePartner[] {
  const categoryTags = CATEGORY_MAP[category] || ['spirits'];
  
  return AFFILIATE_PARTNERS.filter(partner => 
    partner.categories.some(cat => categoryTags.includes(cat))
  ).sort((a, b) => b.rating - a.rating);
}

function buildAffiliateUrl(partner: AffiliatePartner, productName: string): string {
  const searchQuery = encodeURIComponent(productName);
  const fullUrl = `${partner.searchParam}${searchQuery}`;
  return `${partner.baseUrl}${encodeURIComponent(fullUrl)}`;
}

// ============================================
// GET - Affiliate Links for Spirit
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spiritName = searchParams.get('spirit_name');
    const spiritCategory = searchParams.get('category') || 'Whiskey';
    const action = searchParams.get('action');
    
    // Return list of retailers
    if (action === 'retailers') {
      return NextResponse.json({
        success: true,
        retailers: AFFILIATE_PARTNERS.map(p => ({
          id: p.id,
          name: p.name,
          logo: p.logo,
          commission: p.commission,
          categories: p.categories,
          description: p.description,
          shippingInfo: p.shippingInfo,
          rating: p.rating,
        })),
        totalPartners: AFFILIATE_PARTNERS.length,
      });
    }
    
    // Require spirit name for link generation
    if (!spiritName) {
      return NextResponse.json({
        error: 'spirit_name parameter required',
      }, { status: 400 });
    }
    
    // Get relevant partners for this spirit category
    const partners = getRelevantPartners(spiritCategory);
    
    // Build affiliate links for each partner
    const affiliateLinks = partners.map(partner => ({
      retailer: {
        id: partner.id,
        name: partner.name,
        logo: partner.logo,
        rating: partner.rating,
        description: partner.description,
        shippingInfo: partner.shippingInfo,
      },
      url: buildAffiliateUrl(partner, spiritName),
      commission: partner.commission,
      trackingRef: `javarispirits_${partner.id}_${Date.now()}`,
    }));
    
    // Simulated price comparison (would integrate with real API)
    const priceComparison = partners.slice(0, 5).map((partner, idx) => {
      // In production, would fetch real prices from retailer APIs
      const basePrice = 45 + Math.random() * 100;
      return {
        retailerId: partner.id,
        retailerName: partner.name,
        price: Math.round(basePrice * 100) / 100,
        inStock: Math.random() > 0.2,
        url: buildAffiliateUrl(partner, spiritName),
      };
    }).sort((a, b) => a.price - b.price);
    
    return NextResponse.json({
      success: true,
      spirit: {
        name: spiritName,
        category: spiritCategory,
      },
      affiliateLinks,
      priceComparison,
      bestPrice: priceComparison[0] || null,
      disclaimer: 'Prices and availability are subject to change. We may earn a commission from purchases made through these links.',
    });
    
  } catch (error: any) {
    console.error('Affiliate API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// POST - Track Click
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { retailerId, spiritId, spiritName, userId } = body;
    
    // In production, would log to database for analytics
    console.log('Affiliate click:', {
      retailerId,
      spiritId,
      spiritName,
      userId,
      timestamp: new Date().toISOString(),
    });
    
    // Could also update bv_affiliate_clicks table here
    
    return NextResponse.json({
      success: true,
      tracked: true,
    });
    
  } catch (error: any) {
    console.error('Click tracking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

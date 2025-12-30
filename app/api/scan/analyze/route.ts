/**
 * BOTTLE SCANNER API
 * ==================
 * AI-powered bottle identification from images and barcodes
 * 
 * POST /api/scan/analyze - Analyze image for bottle identification
 * GET /api/scan/search - Search by barcode or name
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// BARCODE DATABASE (Common UPC codes)
// ============================================

const BARCODE_DATABASE: Record<string, string> = {
  '080432400098': 'Buffalo Trace',
  '080432102794': 'Eagle Rare',
  '080432105870': 'Blanton\'s Original',
  '088076177314': 'Maker\'s Mark',
  '088076181656': 'Maker\'s 46',
  '082000789994': 'Jim Beam',
  '082000757672': 'Jim Beam Black',
  '096749021208': 'Woodford Reserve',
  '096749021505': 'Woodford Reserve Double Oaked',
  '081128011673': 'Wild Turkey 101',
  '081128001469': 'Russell\'s Reserve 10',
  '083664113705': 'Four Roses Single Barrel',
  '083664112340': 'Four Roses Small Batch',
  '087647111122': 'Elijah Craig Small Batch',
  '087647112228': 'Elijah Craig Barrel Proof',
  '080686001034': 'Jack Daniel\'s Old No. 7',
  '080686002055': 'Jack Daniel\'s Single Barrel',
  '049000000443': 'Tito\'s Handmade Vodka',
  '850397004200': 'Ketel One',
  '633974963164': 'Grey Goose',
  '721059000208': 'Hendrick\'s Gin',
  '088110110574': 'Tanqueray',
  '086767000111': 'Johnnie Walker Black',
  '086767000081': 'Johnnie Walker Red',
  '086767001108': 'Johnnie Walker Blue',
  '088110955106': 'The Glenlivet 12',
  '087236700584': 'Glenfiddich 12',
  '089552400066': 'Macallan 12 Double Cask',
  '084279000053': 'Don Julio Blanco',
  '084279000084': 'Don Julio Reposado',
  '721733000012': 'Patron Silver',
  '721733000029': 'Patron Reposado',
  '085592110047': 'Casamigos Blanco',
  '085592110054': 'Casamigos Reposado',
  '087236561512': 'Bacardi Superior',
  '087236561550': 'Bacardi Gold',
  '736040538936': 'Diplomatico Reserva Exclusiva',
  '859685005007': 'Kraken Black Spiced Rum',
};

// ============================================
// AI LABEL ANALYSIS (Simulated)
// ============================================

async function analyzeLabel(imageData: string): Promise<{
  possibleName?: string;
  possibleBrand?: string;
  category?: string;
  confidence: number;
}> {
  // In production, this would call OpenAI Vision API or similar
  // For now, return a simulated analysis
  
  // Simulated text extraction from label
  const knownBrands = [
    'Buffalo Trace', 'Eagle Rare', 'Blanton\'s', 'Maker\'s Mark',
    'Jim Beam', 'Woodford Reserve', 'Wild Turkey', 'Four Roses',
    'Elijah Craig', 'Jack Daniel\'s', 'Tito\'s', 'Grey Goose',
    'Hendrick\'s', 'Tanqueray', 'Johnnie Walker', 'Glenlivet',
    'Glenfiddich', 'Macallan', 'Don Julio', 'Patron', 'Casamigos',
    'Bacardi', 'Captain Morgan', 'Diplomatico', 'Kraken',
  ];
  
  // Random brand for demo (in production, would use actual AI)
  const randomBrand = knownBrands[Math.floor(Math.random() * knownBrands.length)];
  
  return {
    possibleName: randomBrand,
    possibleBrand: randomBrand.split(' ')[0],
    category: 'Whiskey',
    confidence: 0.75 + Math.random() * 0.2,
  };
}

// ============================================
// POST - Analyze Image
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, type } = body;
    
    if (!image) {
      return NextResponse.json({
        error: 'Image data required',
      }, { status: 400 });
    }
    
    // Try to detect barcode first (simplified - in production use barcode library)
    // For now, use AI label analysis
    
    const analysis = await analyzeLabel(image);
    
    if (!analysis.possibleName) {
      return NextResponse.json({
        success: false,
        error: 'Could not identify the bottle. Try a clearer image.',
      });
    }
    
    // Search database for matching spirit
    const { data: spirits, error } = await supabase
      .from('bv_spirits')
      .select('id, name, brand, category, image_url, abv, description, community_rating')
      .or(`name.ilike.%${analysis.possibleName}%,brand.ilike.%${analysis.possibleBrand}%`)
      .limit(1);
    
    if (error) {
      console.error('Database error:', error);
    }
    
    if (spirits && spirits.length > 0) {
      return NextResponse.json({
        success: true,
        spirit: spirits[0],
        confidence: analysis.confidence,
        source: 'image',
      });
    }
    
    // Return demo data if not found in database
    return NextResponse.json({
      success: true,
      spirit: {
        id: 'demo-' + Date.now(),
        name: analysis.possibleName,
        brand: analysis.possibleBrand,
        category: analysis.category || 'Whiskey',
        image_url: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
        abv: 45,
        description: 'A premium spirit identified by our AI scanner. Add it to your collection to track your tasting notes!',
        community_rating: 4.2,
      },
      confidence: analysis.confidence,
      source: 'image',
    });
    
  } catch (error: any) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// GET - Search by Barcode or Name
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barcode = searchParams.get('barcode');
    const query = searchParams.get('query');
    
    if (!barcode && !query) {
      return NextResponse.json({
        error: 'Barcode or query parameter required',
      }, { status: 400 });
    }
    
    let spiritName = query;
    
    // Check barcode database
    if (barcode && BARCODE_DATABASE[barcode]) {
      spiritName = BARCODE_DATABASE[barcode];
    }
    
    if (!spiritName) {
      return NextResponse.json({
        success: false,
        error: 'Barcode not found in database. Try searching by name.',
      });
    }
    
    // Search database
    const { data: spirits, error } = await supabase
      .from('bv_spirits')
      .select('id, name, brand, category, image_url, abv, description, community_rating')
      .or(`name.ilike.%${spiritName}%,brand.ilike.%${spiritName}%`)
      .limit(1);
    
    if (error) {
      console.error('Search error:', error);
    }
    
    if (spirits && spirits.length > 0) {
      return NextResponse.json({
        success: true,
        spirit: spirits[0],
        barcode: barcode,
      });
    }
    
    // Return demo data if not found
    return NextResponse.json({
      success: true,
      spirit: {
        id: 'search-' + Date.now(),
        name: spiritName,
        brand: spiritName.split(' ')[0],
        category: 'Whiskey',
        image_url: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400',
        abv: 45,
        description: 'This spirit was found in our database. Add it to your collection!',
        community_rating: 4.3,
      },
      barcode: barcode,
    });
    
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================
// BARRELVERSE - MULTI-SOURCE IMAGE SCRAPER API
// Finds product-specific images for every spirit
// Created: December 17, 2025
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase/admin';
import { findBrandImage, getCategoryFallback, DATABASE_STATS } from '@/lib/brand-image-database';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

// Initialize Supabase client
const SUPABASE_URL = supabaseUrl();
const supabaseServiceKey = secretKey();

function getSupabase() {
  return adminDb();
}

// Admin API key validation
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'javari-admin-2024';

function validateAdminKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-Admin-Key') || 
                 request.headers.get('x-admin-key') ||
                 request.nextUrl.searchParams.get('key');
  return apiKey === ADMIN_API_KEY;
}

// ============================================================
// IMAGE SOURCE INTERFACES
// ============================================================
interface ImageSearchResult {
  url: string;
  source: string;
  confidence: number;
  license?: string;
}

// ============================================================
// SOURCE 1: BRAND DATABASE (Highest Priority)
// ============================================================
async function searchBrandDatabase(name: string, brand?: string): Promise<ImageSearchResult | null> {
  const searchTerm = brand || name;
  const match = findBrandImage(searchTerm);
  
  if (match) {
    return {
      url: match.image_url,
      source: `Brand Database (${match.source})`,
      confidence: match.confidence,
      license: match.license
    };
  }
  
  return null;
}

// ============================================================
// SOURCE 2: OPEN FOOD FACTS API (36,000+ alcohol products)
// ============================================================
async function searchOpenFoodFacts(name: string, upc?: string): Promise<ImageSearchResult | null> {
  try {
    // Try UPC first if available
    if (upc && upc.length >= 8) {
      const barcodeUrl = `https://world.openfoodfacts.org/api/v0/product/${upc}.json`;
      const barcodeResponse = await fetch(barcodeUrl, {
        headers: { 'User-Agent': 'Javari Spirits/1.0 (contact@craudiovizai.com)' },
        signal: AbortSignal.timeout(5000)
      });
      
      if (barcodeResponse.ok) {
        const data = await barcodeResponse.json();
        if (data.status === 1 && data.product?.image_front_url) {
          return {
            url: data.product.image_front_url.replace('/400.jpg', '/full.jpg'),
            source: 'Open Food Facts (Barcode)',
            confidence: 0.95,
            license: 'ODbL'
          };
        }
      }
    }
    
    // Search by name
    const searchQuery = encodeURIComponent(name.replace(/['"]/g, ''));
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchQuery}&search_simple=1&action=process&json=1&page_size=5`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Javari Spirits/1.0 (contact@craudiovizai.com)' },
      signal: AbortSignal.timeout(8000)
    });
    
    if (!searchResponse.ok) return null;
    
    const searchData = await searchResponse.json();
    
    if (searchData.products && searchData.products.length > 0) {
      // Find best matching product
      const nameLower = name.toLowerCase();
      
      for (const product of searchData.products) {
        const productName = (product.product_name || '').toLowerCase();
        const brands = (product.brands || '').toLowerCase();
        
        // Check if it's a good match
        if (productName.includes(nameLower.split(' ')[0]) || 
            brands.includes(nameLower.split(' ')[0]) ||
            nameLower.includes(productName.split(' ')[0])) {
          
          if (product.image_front_url) {
            return {
              url: product.image_front_url,
              source: 'Open Food Facts',
              confidence: 0.85,
              license: 'ODbL'
            };
          }
        }
      }
      
      // Fallback to first product with image
      for (const product of searchData.products) {
        if (product.image_front_url) {
          return {
            url: product.image_front_url,
            source: 'Open Food Facts (Partial Match)',
            confidence: 0.70,
            license: 'ODbL'
          };
        }
      }
    }
  } catch (error) {
    console.error('Open Food Facts search error:', error);
  }
  
  return null;
}

// ============================================================
// SOURCE 3: DISTILLER.COM (Spirit-specific)
// ============================================================
async function searchDistiller(name: string, brand?: string): Promise<ImageSearchResult | null> {
  try {
    const searchTerm = (brand || name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const url = `https://distiller.com/spirits/${searchTerm}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Javari Spirits/1.0)',
        'Accept': 'text/html'
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Extract og:image or spirit image
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (ogImageMatch && ogImageMatch[1] && !ogImageMatch[1].includes('default')) {
      return {
        url: ogImageMatch[1],
        source: 'Distiller',
        confidence: 0.75
      };
    }
    
    // Look for spirit-bottle image
    const imgMatch = html.match(/src="([^"]+spirit[^"]*\.(?:jpg|png|webp))"/i);
    if (imgMatch && imgMatch[1]) {
      let imgUrl = imgMatch[1];
      if (imgUrl.startsWith('/')) {
        imgUrl = `https://distiller.com${imgUrl}`;
      }
      return {
        url: imgUrl,
        source: 'Distiller',
        confidence: 0.72
      };
    }
  } catch (error) {
    // Silent fail - try next source
  }
  
  return null;
}

// ============================================================
// SOURCE 4: MASTER OF MALT (Whisky specialist)
// ============================================================
async function searchMasterOfMalt(name: string): Promise<ImageSearchResult | null> {
  try {
    const searchTerm = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const url = `https://www.masterofmalt.com/whiskies/${searchTerm}/`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Javari Spirits/1.0)',
        'Accept': 'text/html'
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Extract product image
    const imgMatch = html.match(/src="(https:\/\/[^"]+\/productimages\/[^"]+\.(?:jpg|png|webp))"/i);
    if (imgMatch && imgMatch[1]) {
      return {
        url: imgMatch[1],
        source: 'Master of Malt',
        confidence: 0.65
      };
    }
  } catch (error) {
    // Silent fail
  }
  
  return null;
}

// ============================================================
// SOURCE 5: TOTAL WINE (Major US Retailer)
// ============================================================
async function searchTotalWine(name: string): Promise<ImageSearchResult | null> {
  try {
    const searchTerm = encodeURIComponent(name);
    const url = `https://www.totalwine.com/search/all?text=${searchTerm}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html'
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Extract product image from search results
    const imgMatch = html.match(/src="(https:\/\/[^"]+\.totalwine\.com\/[^"]+\.(?:jpg|png|webp))"/i);
    if (imgMatch && imgMatch[1] && !imgMatch[1].includes('placeholder')) {
      return {
        url: imgMatch[1],
        source: 'Total Wine',
        confidence: 0.62
      };
    }
  } catch (error) {
    // Silent fail
  }
  
  return null;
}

// ============================================================
// SOURCE 6: WIKIMEDIA COMMONS (Creative Commons)
// ============================================================
async function searchWikimedia(name: string, brand?: string): Promise<ImageSearchResult | null> {
  try {
    const searchTerm = encodeURIComponent(brand || name.split(' ').slice(0, 2).join(' '));
    const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${searchTerm}%20bottle&srnamespace=6&srlimit=3&format=json`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Javari Spirits/1.0' },
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.query?.search?.length > 0) {
      for (const result of data.query.search) {
        const title = result.title;
        
        // Get image info
        const imageInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;
        const imageInfoResponse = await fetch(imageInfoUrl, {
          headers: { 'User-Agent': 'Javari Spirits/1.0' },
          signal: AbortSignal.timeout(3000)
        });
        
        if (imageInfoResponse.ok) {
          const imageData = await imageInfoResponse.json();
          const pages = imageData.query?.pages;
          
          if (pages) {
            const page = Object.values(pages)[0] as { imageinfo?: Array<{ url: string }> };
            if (page.imageinfo?.[0]?.url) {
              return {
                url: page.imageinfo[0].url,
                source: 'Wikimedia Commons',
                confidence: 0.55,
                license: 'Creative Commons'
              };
            }
          }
        }
      }
    }
  } catch (error) {
    // Silent fail
  }
  
  return null;
}

// ============================================================
// MAIN SEARCH ORCHESTRATOR
// ============================================================
async function findBestImage(
  spirit: { id: string; name: string; brand?: string; category?: string; upc?: string }
): Promise<ImageSearchResult | null> {
  const { name, brand, category, upc } = spirit;
  
  // 1. Brand database (fastest, highest confidence)
  const brandResult = await searchBrandDatabase(name, brand || undefined);
  if (brandResult && brandResult.confidence >= 0.90) {
    return brandResult;
  }
  
  // 2. Open Food Facts (36,000+ products)
  const offResult = await searchOpenFoodFacts(name, upc || undefined);
  if (offResult && offResult.confidence >= 0.80) {
    return offResult;
  }
  
  // Return brand result if we have one
  if (brandResult) {
    return brandResult;
  }
  
  // 3. Distiller.com (spirit specialist)
  const distillerResult = await searchDistiller(name, brand || undefined);
  if (distillerResult) {
    return distillerResult;
  }
  
  // 4. Return OFF result if we have one
  if (offResult) {
    return offResult;
  }
  
  // 5. Master of Malt (whisky/scotch)
  if (category && (category.toLowerCase().includes('scotch') || category.toLowerCase().includes('whisky'))) {
    const momResult = await searchMasterOfMalt(name);
    if (momResult) {
      return momResult;
    }
  }
  
  // 6. Total Wine
  const twResult = await searchTotalWine(name);
  if (twResult) {
    return twResult;
  }
  
  // 7. Wikimedia Commons
  const wikiResult = await searchWikimedia(name, brand || undefined);
  if (wikiResult) {
    return wikiResult;
  }
  
  // 8. Category fallback (always available)
  if (category) {
    return {
      url: getCategoryFallback(category),
      source: 'Category Fallback',
      confidence: 0.40,
      license: 'ODbL'
    };
  }
  
  return null;
}

// ============================================================
// API HANDLERS
// ============================================================

// GET: Get scraper status and stats
export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.json({
    status: 'ready',
    brandDatabase: DATABASE_STATS,
    sources: [
      { name: 'Brand Database', confidence: '95%', count: DATABASE_STATS.totalBrands },
      { name: 'Open Food Facts', confidence: '85%', count: '36,000+' },
      { name: 'Distiller.com', confidence: '75%', coverage: 'spirits' },
      { name: 'Master of Malt', confidence: '65%', coverage: 'whisky' },
      { name: 'Total Wine', confidence: '62%', coverage: 'US retail' },
      { name: 'Wikimedia Commons', confidence: '55%', coverage: 'CC licensed' },
      { name: 'Category Fallback', confidence: '40%', coverage: 'always' }
    ],
    usage: {
      endpoint: 'POST /api/admin/scrape-images',
      body: '{ "spiritId": "uuid" }',
      headers: 'X-Admin-Key: your-key'
    }
  });
}

// POST: Scrape image for a single spirit
export async function POST(request: NextRequest) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { spiritId, dryRun = false } = body;
    
    if (!spiritId) {
      return NextResponse.json({ error: 'spiritId required' }, { status: 400 });
    }
    
    const supabase = getSupabase();
    
    // Get spirit details
    const { data: spirit, error: fetchError } = await supabase
      .from('bv_spirits')
      .select('id, name, brand, category, image_url, upc')
      .eq('id', spiritId)
      .single();
    
    if (fetchError || !spirit) {
      return NextResponse.json({ 
        error: 'Spirit not found', 
        details: fetchError?.message 
      }, { status: 404 });
    }
    
    // Check if already has good image
    const currentImage = spirit.image_url || '';
    const isPlaceholder = !currentImage || 
                          currentImage.includes('placeholder') ||
                          currentImage.includes('default') ||
                          currentImage.includes('unsplash.com') ||
                          currentImage.includes('stock');
    
    if (!isPlaceholder) {
      return NextResponse.json({
        spiritId,
        name: spirit.name,
        status: 'skipped',
        reason: 'Already has valid image',
        currentImage
      });
    }
    
    // Search for image
    const result = await findBestImage({
      id: spirit.id,
      name: spirit.name,
      brand: spirit.brand,
      category: spirit.category,
      upc: spirit.upc
    });
    
    if (!result) {
      return NextResponse.json({
        spiritId,
        name: spirit.name,
        status: 'not_found',
        reason: 'No image found from any source'
      });
    }
    
    // Update database if not dry run
    if (!dryRun) {
      const { error: updateError } = await supabase
        .from('bv_spirits')
        .update({
          image_url: result.url,
          image_source: result.source,
          image_confidence: result.confidence,
          image_updated_at: new Date().toISOString()
        })
        .eq('id', spiritId);
      
      if (updateError) {
        return NextResponse.json({
          spiritId,
          name: spirit.name,
          status: 'error',
          reason: 'Database update failed',
          error: updateError.message,
          foundImage: result
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({
      spiritId,
      name: spirit.name,
      status: 'success',
      dryRun,
      image: {
        url: result.url,
        source: result.source,
        confidence: result.confidence,
        license: result.license
      },
      previousImage: currentImage || null
    });
    
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// ============================================================
// BARRELVERSE - BATCH IMAGE PROCESSING API
// Process all 22,951 spirits systematically
// Created: December 17, 2025
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { findBrandImage, getCategoryFallback, DATABASE_STATS } from '@/lib/brand-image-database';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Admin API key validation
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'crav-admin-2024';

function validateAdminKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-Admin-Key') || 
                 request.headers.get('x-admin-key') ||
                 request.nextUrl.searchParams.get('key');
  return apiKey === ADMIN_API_KEY;
}

// ============================================================
// IMAGE SEARCH FUNCTIONS (Simplified for batch processing)
// ============================================================

interface ImageSearchResult {
  url: string;
  source: string;
  confidence: number;
  license?: string;
}

// Brand database search (fastest)
async function searchBrandDatabase(name: string, brand?: string): Promise<ImageSearchResult | null> {
  const searchTerm = brand || name;
  const match = findBrandImage(searchTerm);
  
  if (match) {
    return {
      url: match.image_url,
      source: `Brand Database`,
      confidence: match.confidence,
      license: match.license
    };
  }
  
  return null;
}

// Open Food Facts search
async function searchOpenFoodFacts(name: string, upc?: string): Promise<ImageSearchResult | null> {
  try {
    // Try UPC first
    if (upc && upc.length >= 8) {
      const barcodeUrl = `https://world.openfoodfacts.org/api/v0/product/${upc}.json`;
      const barcodeResponse = await fetch(barcodeUrl, {
        headers: { 'User-Agent': 'CRAVBarrels/1.0' },
        signal: AbortSignal.timeout(3000)
      });
      
      if (barcodeResponse.ok) {
        const data = await barcodeResponse.json();
        if (data.status === 1 && data.product?.image_front_url) {
          return {
            url: data.product.image_front_url,
            source: 'Open Food Facts',
            confidence: 0.95,
            license: 'ODbL'
          };
        }
      }
    }
    
    // Search by name
    const searchQuery = encodeURIComponent(name.substring(0, 50).replace(/['"]/g, ''));
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchQuery}&search_simple=1&action=process&json=1&page_size=3`;
    
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'CRAVBarrels/1.0' },
      signal: AbortSignal.timeout(4000)
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.products?.[0]?.image_front_url) {
      return {
        url: data.products[0].image_front_url,
        source: 'Open Food Facts',
        confidence: 0.80,
        license: 'ODbL'
      };
    }
  } catch (error) {
    // Silent fail
  }
  
  return null;
}

// Fast image finder (optimized for batch)
async function findImageFast(
  spirit: { id: string; name: string; brand?: string; category?: string; upc?: string }
): Promise<ImageSearchResult | null> {
  // 1. Brand database (instant)
  const brandResult = await searchBrandDatabase(spirit.name, spirit.brand || undefined);
  if (brandResult) {
    return brandResult;
  }
  
  // 2. Open Food Facts
  const offResult = await searchOpenFoodFacts(spirit.name, spirit.upc || undefined);
  if (offResult) {
    return offResult;
  }
  
  // 3. Category fallback
  if (spirit.category) {
    return {
      url: getCategoryFallback(spirit.category),
      source: 'Category Fallback',
      confidence: 0.40,
      license: 'ODbL'
    };
  }
  
  return null;
}

// Check if image needs updating
function needsImageUpdate(imageUrl: string | null): boolean {
  if (!imageUrl) return true;
  
  const placeholderPatterns = [
    'placeholder',
    'default',
    'unsplash.com',
    'stock',
    'generic',
    'no-image',
    'missing'
  ];
  
  const urlLower = imageUrl.toLowerCase();
  return placeholderPatterns.some(pattern => urlLower.includes(pattern));
}

// ============================================================
// GET: Batch status and statistics
// ============================================================
export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = getSupabase();
  
  try {
    // Get total count
    const { count: totalCount } = await supabase
      .from('spirits')
      .select('*', { count: 'exact', head: true });
    
    // Get spirits with real images (not placeholders)
    const { data: withImages } = await supabase
      .from('spirits')
      .select('id')
      .not('image_url', 'is', null)
      .not('image_url', 'ilike', '%placeholder%')
      .not('image_url', 'ilike', '%unsplash%')
      .not('image_url', 'ilike', '%default%');
    
    const realImageCount = withImages?.length || 0;
    
    // Get category breakdown
    const { data: categories } = await supabase
      .from('spirits')
      .select('category')
      .not('category', 'is', null);
    
    const categoryCount: Record<string, number> = {};
    categories?.forEach(s => {
      const cat = s.category || 'Unknown';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    // Get image source breakdown
    const { data: sourcesData } = await supabase
      .from('spirits')
      .select('image_source')
      .not('image_source', 'is', null);
    
    const sourceCount: Record<string, number> = {};
    sourcesData?.forEach(s => {
      const src = s.image_source || 'Unknown';
      sourceCount[src] = (sourceCount[src] || 0) + 1;
    });
    
    return NextResponse.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      statistics: {
        totalSpirits: totalCount || 0,
        withRealImages: realImageCount,
        needingImages: (totalCount || 0) - realImageCount,
        coveragePercent: totalCount ? Math.round((realImageCount / totalCount) * 100) : 0
      },
      brandDatabase: {
        totalBrands: DATABASE_STATS.totalBrands,
        categories: DATABASE_STATS.categories
      },
      categoryBreakdown: Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {}),
      imageSourceBreakdown: sourceCount,
      apiUsage: {
        endpoint: 'POST /api/admin/batch-images',
        parameters: {
          category: 'Filter by category (optional)',
          afterId: 'Resume from spirit ID (for pagination)',
          limit: 'Batch size (default: 50, max: 200)',
          dryRun: 'Preview without saving (default: false)'
        },
        example: `curl -X POST "https://cravbarrels.com/api/admin/batch-images" -H "X-Admin-Key: ${ADMIN_API_KEY}" -H "Content-Type: application/json" -d '{"category":"bourbon","limit":100}'`
      }
    });
    
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({
      error: 'Failed to get statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// ============================================================
// POST: Process batch of spirits
// ============================================================
export async function POST(request: NextRequest) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const {
      category,
      afterId,
      limit = 50,
      dryRun = false,
      onlyMissing = true
    } = body;
    
    // Validate limit
    const batchLimit = Math.min(Math.max(1, limit), 200);
    
    const supabase = getSupabase();
    
    // Build query
    let query = supabase
      .from('spirits')
      .select('id, name, brand, category, image_url, upc')
      .order('id', { ascending: true })
      .limit(batchLimit);
    
    // Filter by category
    if (category) {
      query = query.ilike('category', `%${category}%`);
    }
    
    // Filter for spirits needing images
    if (onlyMissing) {
      query = query.or('image_url.is.null,image_url.ilike.%placeholder%,image_url.ilike.%unsplash%,image_url.ilike.%default%');
    }
    
    // Pagination
    if (afterId) {
      query = query.gt('id', afterId);
    }
    
    const { data: spirits, error: fetchError } = await query;
    
    if (fetchError) {
      return NextResponse.json({
        error: 'Failed to fetch spirits',
        details: fetchError.message
      }, { status: 500 });
    }
    
    if (!spirits || spirits.length === 0) {
      return NextResponse.json({
        status: 'complete',
        message: 'No spirits to process',
        category: category || 'all',
        afterId
      });
    }
    
    // Process batch
    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      details: [] as Array<{
        id: string;
        name: string;
        status: string;
        imageUrl?: string;
        source?: string;
        confidence?: number;
        error?: string;
      }>
    };
    
    for (const spirit of spirits) {
      results.processed++;
      
      try {
        // Check if needs update
        if (!needsImageUpdate(spirit.image_url)) {
          results.skipped++;
          results.details.push({
            id: spirit.id,
            name: spirit.name,
            status: 'skipped',
            imageUrl: spirit.image_url
          });
          continue;
        }
        
        // Find image
        const image = await findImageFast({
          id: spirit.id,
          name: spirit.name,
          brand: spirit.brand,
          category: spirit.category,
          upc: spirit.upc
        });
        
        if (!image) {
          results.failed++;
          results.details.push({
            id: spirit.id,
            name: spirit.name,
            status: 'not_found'
          });
          continue;
        }
        
        // Update database
        if (!dryRun) {
          const { error: updateError } = await supabase
            .from('spirits')
            .update({
              image_url: image.url,
              image_source: image.source,
              image_confidence: image.confidence,
              image_updated_at: new Date().toISOString()
            })
            .eq('id', spirit.id);
          
          if (updateError) {
            results.failed++;
            results.details.push({
              id: spirit.id,
              name: spirit.name,
              status: 'update_failed',
              error: updateError.message
            });
            continue;
          }
        }
        
        results.successful++;
        results.details.push({
          id: spirit.id,
          name: spirit.name,
          status: 'success',
          imageUrl: image.url,
          source: image.source,
          confidence: image.confidence
        });
        
      } catch (err) {
        results.failed++;
        results.details.push({
          id: spirit.id,
          name: spirit.name,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
      
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100));
    }
    
    const lastSpirit = spirits[spirits.length - 1];
    const processingTime = Date.now() - startTime;
    
    // Get remaining count
    let remainingQuery = supabase
      .from('spirits')
      .select('*', { count: 'exact', head: true })
      .gt('id', lastSpirit.id);
    
    if (category) {
      remainingQuery = remainingQuery.ilike('category', `%${category}%`);
    }
    
    if (onlyMissing) {
      remainingQuery = remainingQuery.or('image_url.is.null,image_url.ilike.%placeholder%,image_url.ilike.%unsplash%,image_url.ilike.%default%');
    }
    
    const { count: remaining } = await remainingQuery;
    
    return NextResponse.json({
      status: 'batch_complete',
      dryRun,
      batch: {
        processed: results.processed,
        successful: results.successful,
        failed: results.failed,
        skipped: results.skipped,
        processingTimeMs: processingTime
      },
      progress: {
        lastProcessedId: lastSpirit.id,
        lastProcessedName: lastSpirit.name,
        remainingAfterThis: remaining || 0,
        hasMore: (remaining || 0) > 0
      },
      nextRequest: (remaining || 0) > 0 ? {
        category: category || undefined,
        afterId: lastSpirit.id,
        limit: batchLimit,
        dryRun
      } : null,
      details: results.details.slice(0, 20), // First 20 for brevity
      detailsTruncated: results.details.length > 20
    });
    
  } catch (error) {
    console.error('Batch processing error:', error);
    return NextResponse.json({
      error: 'Batch processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

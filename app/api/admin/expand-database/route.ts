// ============================================================
// BARRELVERSE - COMPREHENSIVE DATABASE EXPANSION API
// Pulls alcohol products from multiple FREE sources
// Goal: Get EVERY alcohol product with complete details and images
// Created: December 21, 2025
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'crav-admin-2024';

function validateAdminKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-Admin-Key') || 
                 request.headers.get('x-admin-key') ||
                 request.nextUrl.searchParams.get('key');
  return apiKey === ADMIN_API_KEY;
}

// Alcohol categories for Open Food Facts search
const ALCOHOL_CATEGORIES = [
  'en:whisky', 'en:whiskey', 'en:bourbon', 'en:scotch-whisky',
  'en:vodka', 'en:vodkas', 'en:gin', 'en:gins', 
  'en:rum', 'en:rums', 'en:tequila', 'en:tequilas', 'en:mezcal',
  'en:brandy', 'en:brandies', 'en:cognac', 'en:armagnac',
  'en:liqueur', 'en:liqueurs', 'en:absinthe', 'en:grappa', 'en:pisco',
  'en:wines', 'en:red-wines', 'en:white-wines', 'en:rose-wines',
  'en:sparkling-wines', 'en:champagne', 'en:prosecco',
  'en:beers', 'en:lagers', 'en:ales', 'en:stouts', 'en:ipas',
  'en:ciders', 'en:sake', 'en:soju',
  'en:alcoholic-beverages', 'en:spirits', 'en:distilled-beverages'
];

interface SpiritData {
  name: string;
  brand: string | null;
  category: string;
  subcategory: string | null;
  country: string | null;
  region: string | null;
  abv: number | null;
  proof: number | null;
  msrp: number | null;
  description: string | null;
  image_url: string | null;
  upc: string | null;
  ean: string | null;
  open_food_facts_id: string | null;
  ingredients: string | null;
  external_ids: Record<string, string>;
}

// Map Open Food Facts category to our category
function mapCategory(offCategory: string): string {
  const cat = offCategory.toLowerCase();
  if (cat.includes('whisky') || cat.includes('whiskey') || cat.includes('bourbon') || cat.includes('scotch')) return 'whiskey';
  if (cat.includes('vodka')) return 'vodka';
  if (cat.includes('gin')) return 'gin';
  if (cat.includes('rum')) return 'rum';
  if (cat.includes('tequila') || cat.includes('mezcal')) return 'tequila';
  if (cat.includes('brandy') || cat.includes('cognac') || cat.includes('armagnac')) return 'brandy';
  if (cat.includes('wine') || cat.includes('champagne') || cat.includes('prosecco')) return 'wine';
  if (cat.includes('beer') || cat.includes('lager') || cat.includes('ale') || cat.includes('stout') || cat.includes('ipa')) return 'beer';
  if (cat.includes('cider')) return 'cider';
  if (cat.includes('liqueur')) return 'liqueur';
  if (cat.includes('sake')) return 'sake';
  return 'other';
}

// Extract ABV from string like "40%" or "40 % vol"
function extractABV(str: string | null): number | null {
  if (!str) return null;
  const match = str.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? parseFloat(match[1]) : null;
}

// ============================================================
// SOURCE 1: OPEN FOOD FACTS (36,000+ alcohol products)
// Free, open database with product photos
// ============================================================
async function fetchOpenFoodFacts(category: string, page: number = 1): Promise<{
  products: SpiritData[];
  totalPages: number;
  totalProducts: number;
}> {
  const pageSize = 100;
  const url = `https://world.openfoodfacts.org/cgi/search.pl?` +
    `tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(category)}` +
    `&action=process&json=1&page_size=${pageSize}&page=${page}`;
  
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'BarrelVerse/1.0 (contact@craudiovizai.com)' },
      signal: AbortSignal.timeout(30000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const products: SpiritData[] = [];
    
    for (const product of (data.products || [])) {
      // Skip products without names
      if (!product.product_name && !product.product_name_en) continue;
      
      const name = product.product_name_en || product.product_name || '';
      const brand = product.brands || null;
      
      // Skip if name is too short or generic
      if (name.length < 3) continue;
      
      const abv = extractABV(product.alcohol_value || product.alcohol_100g?.toString());
      
      products.push({
        name: name.trim(),
        brand: brand?.split(',')[0]?.trim() || null,
        category: mapCategory(category),
        subcategory: product.categories?.split(',')[0]?.trim() || null,
        country: product.countries?.split(',')[0]?.trim() || null,
        region: product.origins?.split(',')[0]?.trim() || null,
        abv: abv,
        proof: abv ? abv * 2 : null,
        msrp: null,
        description: product.generic_name_en || product.generic_name || null,
        image_url: product.image_front_url || product.image_url || null,
        upc: product.code?.length === 12 ? product.code : null,
        ean: product.code?.length === 13 ? product.code : null,
        open_food_facts_id: product.code || null,
        ingredients: product.ingredients_text_en || product.ingredients_text || null,
        external_ids: { openfoodfacts: product.code || '' }
      });
    }
    
    return {
      products,
      totalPages: Math.ceil((data.count || 0) / pageSize),
      totalProducts: data.count || 0
    };
    
  } catch (error) {
    console.error(`Open Food Facts error for ${category}:`, error);
    return { products: [], totalPages: 0, totalProducts: 0 };
  }
}

// ============================================================
// SOURCE 2: UNTAPPD PUBLIC SEARCH (Beer database)
// ============================================================
async function searchUntappd(query: string): Promise<SpiritData[]> {
  // Untappd requires API key, but we can scrape public pages
  try {
    const searchUrl = `https://untappd.com/search?q=${encodeURIComponent(query)}&type=beer`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html'
      },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) return [];
    
    const html = await response.text();
    const products: SpiritData[] = [];
    
    // Extract beer data from HTML (basic scraping)
    const beerMatches = html.matchAll(/<div class="beer-item"[^>]*>[\s\S]*?<p class="name"[^>]*>(.*?)<\/p>[\s\S]*?<p class="brewery"[^>]*>(.*?)<\/p>/gi);
    
    for (const match of beerMatches) {
      if (match[1] && match[2]) {
        products.push({
          name: match[1].replace(/<[^>]*>/g, '').trim(),
          brand: match[2].replace(/<[^>]*>/g, '').trim(),
          category: 'beer',
          subcategory: null,
          country: null,
          region: null,
          abv: null,
          proof: null,
          msrp: null,
          description: null,
          image_url: null,
          upc: null,
          ean: null,
          open_food_facts_id: null,
          ingredients: null,
          external_ids: { source: 'untappd' }
        });
      }
    }
    
    return products.slice(0, 50); // Limit results
  } catch (error) {
    console.error('Untappd search error:', error);
    return [];
  }
}

// ============================================================
// SOURCE 3: THECOCKTAILDB (Spirits data)
// Free API with alcohol info
// ============================================================
async function fetchTheCocktailDB(): Promise<SpiritData[]> {
  const products: SpiritData[] = [];
  
  // TheCocktailDB has ingredient listings
  const ingredientCategories = ['Vodka', 'Gin', 'Rum', 'Tequila', 'Whiskey', 'Bourbon', 'Scotch', 'Brandy', 'Cognac'];
  
  for (const ingredient of ingredientCategories) {
    try {
      const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?i=${encodeURIComponent(ingredient)}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      
      if (response.ok) {
        const data = await response.json();
        if (data.ingredients) {
          for (const ing of data.ingredients) {
            products.push({
              name: ing.strIngredient,
              brand: null,
              category: mapCategory(ingredient),
              subcategory: ing.strType || null,
              country: null,
              region: null,
              abv: ing.strABV ? parseFloat(ing.strABV) : null,
              proof: ing.strABV ? parseFloat(ing.strABV) * 2 : null,
              msrp: null,
              description: ing.strDescription?.substring(0, 500) || null,
              image_url: `https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(ing.strIngredient)}-Medium.png`,
              upc: null,
              ean: null,
              open_food_facts_id: null,
              ingredients: null,
              external_ids: { cocktaildb: ing.idIngredient }
            });
          }
        }
      }
    } catch (error) {
      console.error(`CocktailDB error for ${ingredient}:`, error);
    }
  }
  
  return products;
}

// ============================================================
// DEDUPLICATION & UPSERT
// ============================================================
async function upsertSpirits(spirits: SpiritData[], batchId: string): Promise<{
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}> {
  const supabase = getSupabase();
  const results = { inserted: 0, updated: 0, skipped: 0, errors: [] as string[] };
  
  for (const spirit of spirits) {
    try {
      // Check for existing by name+brand or UPC/EAN
      let existingId: string | null = null;
      
      if (spirit.upc || spirit.ean || spirit.open_food_facts_id) {
        const { data: byCode } = await supabase
          .from('bv_spirits')
          .select('id')
          .or(`upc.eq.${spirit.upc},ean.eq.${spirit.ean},open_food_facts_id.eq.${spirit.open_food_facts_id}`)
          .limit(1)
          .single();
        
        if (byCode) existingId = byCode.id;
      }
      
      if (!existingId) {
        // Check by name similarity
        const { data: byName } = await supabase
          .from('bv_spirits')
          .select('id')
          .ilike('name', spirit.name)
          .limit(1)
          .single();
        
        if (byName) existingId = byName.id;
      }
      
      if (existingId) {
        // Update existing - only update null fields
        const { error } = await supabase
          .from('bv_spirits')
          .update({
            upc: spirit.upc || undefined,
            ean: spirit.ean || undefined,
            open_food_facts_id: spirit.open_food_facts_id || undefined,
            image_url: spirit.image_url || undefined,
            description: spirit.description || undefined,
            ingredients: spirit.ingredients || undefined,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingId)
          .is('image_url', null); // Only update if no image
        
        if (!error) results.updated++;
        else results.skipped++;
      } else {
        // Insert new
        const { error } = await supabase
          .from('bv_spirits')
          .insert({
            name: spirit.name,
            brand: spirit.brand,
            category: spirit.category,
            subcategory: spirit.subcategory,
            country: spirit.country,
            region: spirit.region,
            abv: spirit.abv,
            proof: spirit.proof,
            msrp: spirit.msrp,
            description: spirit.description,
            image_url: spirit.image_url,
            image_source: spirit.image_url ? 'Open Food Facts' : null,
            image_license: spirit.image_url ? 'ODbL' : null,
            upc: spirit.upc,
            ean: spirit.ean,
            open_food_facts_id: spirit.open_food_facts_id,
            ingredients: spirit.ingredients,
            external_ids: spirit.external_ids,
            rarity: 'common'
          });
        
        if (!error) results.inserted++;
        else {
          results.skipped++;
          if (results.errors.length < 10) {
            results.errors.push(`${spirit.name}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      results.skipped++;
    }
  }
  
  return results;
}

// ============================================================
// GET: Get expansion status and available sources
// ============================================================
export async function GET(request: NextRequest) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const supabase = getSupabase();
  
  // Get current database stats
  const { count: totalSpirits } = await supabase
    .from('bv_spirits')
    .select('*', { count: 'exact', head: true });
  
  const { count: withImages } = await supabase
    .from('bv_spirits')
    .select('*', { count: 'exact', head: true })
    .not('image_url', 'is', null)
    .not('image_url', 'like', '%unsplash%');
  
  // Get recent expansion logs
  const { data: recentLogs } = await supabase
    .from('bv_data_expansion_log')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(10);
  
  return NextResponse.json({
    status: 'ready',
    currentStats: {
      totalSpirits: totalSpirits || 0,
      withImages: withImages || 0,
      needingImages: (totalSpirits || 0) - (withImages || 0)
    },
    availableSources: [
      { 
        name: 'Open Food Facts', 
        type: 'api', 
        estimated: '36,000+ alcohol products',
        license: 'ODbL (Open Database License)',
        hasImages: true
      },
      { 
        name: 'TheCocktailDB', 
        type: 'api', 
        estimated: '100+ spirits',
        license: 'Free',
        hasImages: true
      },
      {
        name: 'Untappd',
        type: 'scrape',
        estimated: '1M+ beers',
        license: 'Public data',
        hasImages: false
      }
    ],
    categories: ALCOHOL_CATEGORIES,
    recentExpansions: recentLogs || [],
    usage: {
      endpoint: 'POST /api/admin/expand-database',
      body: '{ "source": "openfoodfacts", "category": "en:whisky", "maxPages": 10 }',
      headers: 'X-Admin-Key: your-key'
    }
  });
}

// ============================================================
// POST: Run database expansion from a source
// ============================================================
export async function POST(request: NextRequest) {
  if (!validateAdminKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { source, category, maxPages = 5, query } = body;
    
    const supabase = getSupabase();
    const batchId = `batch_${Date.now()}`;
    
    // Create log entry
    const { data: logEntry, error: logError } = await supabase
      .from('bv_data_expansion_log')
      .insert({
        source: source || 'openfoodfacts',
        batch_id: batchId,
        status: 'running',
        metadata: { category, maxPages, query }
      })
      .select()
      .single();
    
    if (logError) {
      console.error('Log entry error:', logError);
    }
    
    let allProducts: SpiritData[] = [];
    let totalFetched = 0;
    let imagesFound = 0;
    
    switch (source) {
      case 'openfoodfacts':
      case 'off':
        const categories = category ? [category] : ALCOHOL_CATEGORIES;
        
        for (const cat of categories) {
          let page = 1;
          let hasMore = true;
          
          while (hasMore && page <= maxPages) {
            const result = await fetchOpenFoodFacts(cat, page);
            allProducts.push(...result.products);
            totalFetched += result.products.length;
            imagesFound += result.products.filter(p => p.image_url).length;
            
            hasMore = page < result.totalPages;
            page++;
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        break;
        
      case 'cocktaildb':
        const cocktailProducts = await fetchTheCocktailDB();
        allProducts = cocktailProducts;
        totalFetched = cocktailProducts.length;
        imagesFound = cocktailProducts.filter(p => p.image_url).length;
        break;
        
      case 'untappd':
        if (!query) {
          return NextResponse.json({ error: 'query required for Untappd search' }, { status: 400 });
        }
        const untappdProducts = await searchUntappd(query);
        allProducts = untappdProducts;
        totalFetched = untappdProducts.length;
        break;
        
      case 'all':
        // Run all sources
        for (const cat of ALCOHOL_CATEGORIES.slice(0, 5)) { // Limit categories for 'all'
          const result = await fetchOpenFoodFacts(cat, 1);
          allProducts.push(...result.products);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const cocktails = await fetchTheCocktailDB();
        allProducts.push(...cocktails);
        
        totalFetched = allProducts.length;
        imagesFound = allProducts.filter(p => p.image_url).length;
        break;
        
      default:
        return NextResponse.json({ 
          error: 'Unknown source',
          validSources: ['openfoodfacts', 'off', 'cocktaildb', 'untappd', 'all']
        }, { status: 400 });
    }
    
    // Upsert to database
    const upsertResults = await upsertSpirits(allProducts, batchId);
    
    // Update log entry
    if (logEntry) {
      await supabase
        .from('bv_data_expansion_log')
        .update({
          status: upsertResults.errors.length > 0 ? 'partial' : 'completed',
          products_fetched: totalFetched,
          products_inserted: upsertResults.inserted,
          products_updated: upsertResults.updated,
          products_skipped: upsertResults.skipped,
          images_found: imagesFound,
          completed_at: new Date().toISOString(),
          error_message: upsertResults.errors.length > 0 ? upsertResults.errors.join('; ') : null
        })
        .eq('id', logEntry.id);
    }
    
    return NextResponse.json({
      success: true,
      batchId,
      source,
      results: {
        fetched: totalFetched,
        inserted: upsertResults.inserted,
        updated: upsertResults.updated,
        skipped: upsertResults.skipped,
        imagesFound
      },
      errors: upsertResults.errors.length > 0 ? upsertResults.errors : undefined,
      message: `Expansion complete: ${upsertResults.inserted} new products added, ${upsertResults.updated} updated`
    });
    
  } catch (error) {
    console.error('Expansion error:', error);
    return NextResponse.json({
      error: 'Expansion failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

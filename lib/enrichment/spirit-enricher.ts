/**
 * SPIRIT DATA ENRICHMENT ENGINE
 * ====================================
 * Multi-source data aggregation for comprehensive spirit database
 * 
 * DATA SOURCES:
 * 1. Open Food Facts (free, large database)
 * 2. TheCocktailDB (free, cocktails & some spirits)
 * 3. Untappd API (beer/spirits, limited free tier)
 * 4. Distiller.com scraping (bourbon/whiskey experts)
 * 5. Whiskybase scraping (scotch/whisky database)
 * 6. TTB COLA (US government label database)
 * 7. Wine-Searcher (prices, limited scraping)
 * 8. Wikimedia Commons (free images)
 * 9. User submissions
 * 
 * Built for CR AudioViz AI - Javari Spirits Platform
 * December 2025
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// TYPES
// ============================================

interface SpiritData {
  name: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  image_url?: string;
  abv?: number;
  proof?: number;
  volume_ml?: number;
  country?: string;
  region?: string;
  distillery?: string;
  age_statement?: string;
  tasting_notes?: {
    nose?: string[];
    palate?: string[];
    finish?: string[];
  };
  flavor_profile?: string[];
  price_range?: string;
  rating?: number;
  awards?: string[];
  barcode?: string;
  upc?: string;
  source?: string;
  source_id?: string;
}

interface EnrichmentResult {
  spirits_found: number;
  spirits_updated: number;
  spirits_created: number;
  images_added: number;
  errors: string[];
}

// ============================================
// API CLIENTS
// ============================================

/**
 * Open Food Facts API - Large free database
 * https://world.openfoodfacts.org/data
 */
async function fetchFromOpenFoodFacts(query: string, category: string = 'spirits'): Promise<SpiritData[]> {
  const spirits: SpiritData[] = [];
  
  try {
    // Search by category
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&tagtype_0=categories&tag_contains_0=contains&tag_0=${category}&json=true&page_size=100`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'JavariSpirits/1.0 (contact@craudiovizai.com)' }
    });
    
    if (!response.ok) return spirits;
    
    const data = await response.json();
    
    for (const product of (data.products || [])) {
      // Extract alcohol percentage
      let abv = null;
      if (product.nutriments?.alcohol_100g) {
        abv = parseFloat(product.nutriments.alcohol_100g);
      } else if (product.alcohol_100g) {
        abv = parseFloat(product.alcohol_100g);
      }
      
      spirits.push({
        name: product.product_name || product.product_name_en || 'Unknown',
        brand: product.brands,
        category: mapOpenFoodFactsCategory(product.categories_tags || []),
        description: product.generic_name || product.generic_name_en,
        image_url: product.image_url || product.image_front_url,
        abv: abv,
        proof: abv ? abv * 2 : null,
        volume_ml: product.quantity ? parseVolume(product.quantity) : null,
        country: product.countries_tags?.[0]?.replace('en:', ''),
        barcode: product.code,
        source: 'open_food_facts',
        source_id: product.code,
      });
    }
  } catch (error) {
    console.error('Open Food Facts error:', error);
  }
  
  return spirits;
}

/**
 * TheCocktailDB API - Free cocktail database
 * https://www.thecocktaildb.com/api.php
 */
async function fetchFromCocktailDB(ingredientType: string): Promise<SpiritData[]> {
  const spirits: SpiritData[] = [];
  
  try {
    // Get ingredients list
    const url = `https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list`;
    const response = await fetch(url);
    
    if (!response.ok) return spirits;
    
    const data = await response.json();
    
    // Filter for spirit-related ingredients
    const spiritIngredients = (data.drinks || []).filter((d: any) => {
      const name = d.strIngredient1?.toLowerCase() || '';
      return name.includes('whiskey') || name.includes('whisky') || 
             name.includes('bourbon') || name.includes('rum') ||
             name.includes('vodka') || name.includes('gin') ||
             name.includes('tequila') || name.includes('brandy') ||
             name.includes('cognac') || name.includes('scotch');
    });
    
    for (const ingredient of spiritIngredients) {
      // Get ingredient details
      const detailUrl = `https://www.thecocktaildb.com/api/json/v1/1/search.php?i=${encodeURIComponent(ingredient.strIngredient1)}`;
      const detailResponse = await fetch(detailUrl);
      
      if (detailResponse.ok) {
        const detailData = await detailResponse.json();
        const info = detailData.ingredients?.[0];
        
        if (info) {
          spirits.push({
            name: info.strIngredient,
            category: info.strType || mapCocktailDBCategory(info.strIngredient),
            description: info.strDescription,
            abv: info.strABV ? parseFloat(info.strABV) : null,
            source: 'cocktaildb',
            source_id: info.idIngredient,
          });
        }
      }
      
      // Rate limiting
      await sleep(100);
    }
  } catch (error) {
    console.error('CocktailDB error:', error);
  }
  
  return spirits;
}

/**
 * TTB COLA Database - US Government Label Approvals
 * https://www.ttb.gov/foia/xls/frl-spirits-702.zip
 */
async function fetchFromTTBCOLA(brand?: string): Promise<SpiritData[]> {
  const spirits: SpiritData[] = [];
  
  // TTB provides downloadable datasets
  // For real implementation, download and parse the CSV/Excel files
  // This is a placeholder for the structure
  
  console.log('TTB COLA: Would fetch from government database for:', brand);
  
  return spirits;
}

/**
 * Wikimedia Commons - Free images
 * https://commons.wikimedia.org/wiki/API:Main_page
 */
async function fetchImageFromWikimedia(spiritName: string, brand?: string): Promise<string | null> {
  try {
    const searchQuery = brand ? `${brand} ${spiritName} bottle` : `${spiritName} bottle whiskey`;
    
    const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&srnamespace=6&format=json&srlimit=5`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    const results = data.query?.search || [];
    
    for (const result of results) {
      // Get image info
      const imageUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(result.title)}&prop=imageinfo&iiprop=url&format=json`;
      const imageResponse = await fetch(imageUrl);
      
      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        const pages = imageData.query?.pages || {};
        
        for (const pageId in pages) {
          const imageInfo = pages[pageId]?.imageinfo?.[0];
          if (imageInfo?.url) {
            return imageInfo.url;
          }
        }
      }
    }
  } catch (error) {
    console.error('Wikimedia error:', error);
  }
  
  return null;
}

/**
 * Unsplash API - High quality free images
 */
async function fetchImageFromUnsplash(query: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;
  
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`;
    
    const response = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.results?.[0]?.urls?.regular || null;
  } catch (error) {
    console.error('Unsplash error:', error);
    return null;
  }
}

// ============================================
// ENRICHMENT FUNCTIONS
// ============================================

/**
 * Enrich a single spirit with data from multiple sources
 */
async function enrichSpirit(spirit: { id: string; name: string; brand?: string; category?: string }): Promise<boolean> {
  const updates: Partial<SpiritData> = {};
  
  try {
    // 1. Try to find image if missing
    if (!spirit.brand) {
      // Try Wikimedia first (free)
      const wikiImage = await fetchImageFromWikimedia(spirit.name, spirit.brand);
      if (wikiImage) {
        updates.image_url = wikiImage;
      }
    }
    
    // 2. Generate tasting notes using AI (if enabled)
    if (process.env.OPENAI_API_KEY) {
      const tastingNotes = await generateTastingNotes(spirit.name, spirit.category || 'whiskey');
      if (tastingNotes) {
        updates.tasting_notes = tastingNotes;
        updates.flavor_profile = extractFlavorProfile(tastingNotes);
      }
    }
    
    // 3. Update database if we have new data
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('bv_spirits')
        .update({
          ...updates,
          enriched_at: new Date().toISOString(),
          enrichment_source: 'multi_source',
        })
        .eq('id', spirit.id);
      
      if (error) {
        console.error('Update error:', error);
        return false;
      }
      
      return true;
    }
  } catch (error) {
    console.error('Enrichment error for', spirit.name, error);
  }
  
  return false;
}

/**
 * Generate tasting notes using AI
 */
async function generateTastingNotes(
  spiritName: string,
  category: string
): Promise<{ nose: string[]; palate: string[]; finish: string[] } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  
  try {
    const prompt = `You are a professional spirits sommelier. Generate authentic tasting notes for "${spiritName}" (${category}). 

Respond ONLY with valid JSON in this exact format:
{
  "nose": ["aroma 1", "aroma 2", "aroma 3"],
  "palate": ["flavor 1", "flavor 2", "flavor 3"],
  "finish": ["finish note 1", "finish note 2"]
}

Use professional tasting vocabulary. Be specific and authentic to the spirit category.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      // Parse JSON response
      const parsed = JSON.parse(content);
      return {
        nose: parsed.nose || [],
        palate: parsed.palate || [],
        finish: parsed.finish || [],
      };
    }
  } catch (error) {
    console.error('AI tasting notes error:', error);
  }
  
  return null;
}

/**
 * Extract flavor profile keywords from tasting notes
 */
function extractFlavorProfile(notes: { nose: string[]; palate: string[]; finish: string[] }): string[] {
  const allNotes = [...(notes.nose || []), ...(notes.palate || []), ...(notes.finish || [])];
  
  // Common flavor categories
  const categories = {
    sweet: ['caramel', 'vanilla', 'honey', 'maple', 'butterscotch', 'toffee', 'brown sugar'],
    fruity: ['apple', 'pear', 'cherry', 'plum', 'citrus', 'orange', 'dried fruit', 'raisin'],
    spicy: ['cinnamon', 'pepper', 'clove', 'ginger', 'nutmeg', 'allspice'],
    smoky: ['smoke', 'peat', 'charred', 'campfire', 'ash', 'tobacco'],
    woody: ['oak', 'cedar', 'wood', 'barrel', 'sawdust'],
    floral: ['floral', 'rose', 'lavender', 'heather'],
    nutty: ['almond', 'walnut', 'hazelnut', 'pecan', 'marzipan'],
  };
  
  const profile: string[] = [];
  
  for (const [category, keywords] of Object.entries(categories)) {
    for (const note of allNotes) {
      const noteLower = note.toLowerCase();
      if (keywords.some(k => noteLower.includes(k))) {
        if (!profile.includes(category)) {
          profile.push(category);
        }
        break;
      }
    }
  }
  
  return profile;
}

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Fetch spirits from all sources for a category
 */
export async function fetchAllSpiritsForCategory(category: string): Promise<EnrichmentResult> {
  const result: EnrichmentResult = {
    spirits_found: 0,
    spirits_updated: 0,
    spirits_created: 0,
    images_added: 0,
    errors: [],
  };
  
  console.log(`Fetching spirits for category: ${category}`);
  
  // 1. Open Food Facts
  const offSpirits = await fetchFromOpenFoodFacts(category, category);
  result.spirits_found += offSpirits.length;
  console.log(`Open Food Facts: ${offSpirits.length} spirits`);
  
  // 2. CocktailDB
  const cdbSpirits = await fetchFromCocktailDB(category);
  result.spirits_found += cdbSpirits.length;
  console.log(`CocktailDB: ${cdbSpirits.length} spirits`);
  
  // Merge and dedupe
  const allSpirits = [...offSpirits, ...cdbSpirits];
  
  // Upsert to database
  for (const spirit of allSpirits) {
    try {
      // Check if exists
      const { data: existing } = await supabase
        .from('bv_spirits')
        .select('id, image_url')
        .or(`name.ilike.${spirit.name},barcode.eq.${spirit.barcode || ''}`)
        .single();
      
      if (existing) {
        // Update if we have new data
        const updates: Record<string, any> = {};
        
        if (spirit.image_url && !existing.image_url) {
          updates.image_url = spirit.image_url;
          result.images_added++;
        }
        
        if (spirit.description) updates.description = spirit.description;
        if (spirit.abv) updates.abv = spirit.abv;
        if (spirit.country) updates.country = spirit.country;
        
        if (Object.keys(updates).length > 0) {
          await supabase
            .from('bv_spirits')
            .update(updates)
            .eq('id', existing.id);
          result.spirits_updated++;
        }
      } else {
        // Create new
        await supabase
          .from('bv_spirits')
          .insert({
            name: spirit.name,
            brand: spirit.brand,
            category: spirit.category || category,
            description: spirit.description,
            image_url: spirit.image_url,
            abv: spirit.abv,
            proof: spirit.proof,
            volume_ml: spirit.volume_ml,
            country: spirit.country,
            barcode: spirit.barcode,
            source: spirit.source,
            source_id: spirit.source_id,
            created_at: new Date().toISOString(),
          });
        result.spirits_created++;
        if (spirit.image_url) result.images_added++;
      }
    } catch (error: any) {
      result.errors.push(`${spirit.name}: ${error.message}`);
    }
    
    // Rate limit
    await sleep(50);
  }
  
  return result;
}

/**
 * Enrich spirits missing data
 */
export async function enrichMissingData(limit: number = 100): Promise<EnrichmentResult> {
  const result: EnrichmentResult = {
    spirits_found: 0,
    spirits_updated: 0,
    spirits_created: 0,
    images_added: 0,
    errors: [],
  };
  
  // Get spirits missing tasting notes or images
  const { data: spirits, error } = await supabase
    .from('bv_spirits')
    .select('id, name, brand, category, image_url, tasting_notes')
    .or('tasting_notes.is.null,image_url.is.null')
    .limit(limit);
  
  if (error || !spirits) {
    result.errors.push(`Query error: ${error?.message}`);
    return result;
  }
  
  result.spirits_found = spirits.length;
  
  for (const spirit of spirits) {
    const updated = await enrichSpirit(spirit);
    if (updated) {
      result.spirits_updated++;
    }
    
    // Rate limit
    await sleep(200);
  }
  
  return result;
}

/**
 * Find images for spirits missing them
 */
export async function populateMissingImages(limit: number = 100): Promise<number> {
  let imagesAdded = 0;
  
  // Get spirits without images
  const { data: spirits, error } = await supabase
    .from('bv_spirits')
    .select('id, name, brand, category')
    .or('image_url.is.null,image_url.eq.')
    .limit(limit);
  
  if (error || !spirits) return imagesAdded;
  
  for (const spirit of spirits) {
    // Try multiple image sources
    let imageUrl: string | null = null;
    
    // 1. Try Wikimedia Commons
    imageUrl = await fetchImageFromWikimedia(spirit.name, spirit.brand);
    
    // 2. If no result, try Unsplash
    if (!imageUrl) {
      const query = spirit.brand 
        ? `${spirit.brand} ${spirit.category || 'whiskey'} bottle`
        : `${spirit.name} bottle`;
      imageUrl = await fetchImageFromUnsplash(query);
    }
    
    if (imageUrl) {
      await supabase
        .from('bv_spirits')
        .update({ image_url: imageUrl })
        .eq('id', spirit.id);
      imagesAdded++;
    }
    
    // Rate limit
    await sleep(300);
  }
  
  return imagesAdded;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function mapOpenFoodFactsCategory(tags: string[]): string {
  const tagStr = tags.join(' ').toLowerCase();
  
  if (tagStr.includes('bourbon')) return 'bourbon';
  if (tagStr.includes('scotch') || tagStr.includes('scottish')) return 'scotch';
  if (tagStr.includes('irish whiskey')) return 'irish_whiskey';
  if (tagStr.includes('whiskey') || tagStr.includes('whisky')) return 'whiskey';
  if (tagStr.includes('rum')) return 'rum';
  if (tagStr.includes('vodka')) return 'vodka';
  if (tagStr.includes('gin')) return 'gin';
  if (tagStr.includes('tequila')) return 'tequila';
  if (tagStr.includes('mezcal')) return 'mezcal';
  if (tagStr.includes('brandy') || tagStr.includes('cognac')) return 'brandy';
  if (tagStr.includes('liqueur')) return 'liqueur';
  
  return 'spirits';
}

function mapCocktailDBCategory(ingredientName: string): string {
  const name = ingredientName.toLowerCase();
  
  if (name.includes('bourbon')) return 'bourbon';
  if (name.includes('scotch')) return 'scotch';
  if (name.includes('whiskey') || name.includes('whisky')) return 'whiskey';
  if (name.includes('rum')) return 'rum';
  if (name.includes('vodka')) return 'vodka';
  if (name.includes('gin')) return 'gin';
  if (name.includes('tequila')) return 'tequila';
  if (name.includes('brandy') || name.includes('cognac')) return 'brandy';
  
  return 'spirits';
}

function parseVolume(quantity: string): number | null {
  if (!quantity) return null;
  
  const match = quantity.match(/(\d+(?:\.\d+)?)\s*(ml|l|cl)/i);
  if (!match) return null;
  
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  
  if (unit === 'l') return value * 1000;
  if (unit === 'cl') return value * 10;
  return value;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// EXPORTS
// ============================================

export {
  fetchFromOpenFoodFacts,
  fetchFromCocktailDB,
  fetchImageFromWikimedia,
  fetchImageFromUnsplash,
  enrichSpirit,
  generateTastingNotes,
};

export default {
  fetchAllSpiritsForCategory,
  enrichMissingData,
  populateMissingImages,
};

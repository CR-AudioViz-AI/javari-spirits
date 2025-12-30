/**
 * SPIRIT ENRICHMENT API
 * =====================
 * Endpoint for enriching spirit data from multiple sources
 * 
 * Routes:
 * GET /api/enrichment/spirits - Get enrichment status
 * POST /api/enrichment/spirits - Trigger enrichment job
 * 
 * Query params:
 * - action: 'status' | 'enrich_category' | 'enrich_missing' | 'populate_images' | 'full_sync'
 * - category: Spirit category to enrich
 * - limit: Max spirits to process
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max for Vercel

// ============================================
// GET - Status & Analytics
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';
    
    if (action === 'status') {
      // Get comprehensive data quality stats
      const [
        totalResult,
        withImagesResult,
        withTastingNotesResult,
        withFlavorProfileResult,
        withDescriptionResult,
        categoryResult,
        recentEnrichedResult,
      ] = await Promise.all([
        supabase.from('bv_spirits').select('*', { count: 'exact', head: true }),
        supabase.from('bv_spirits').select('*', { count: 'exact', head: true }).not('image_url', 'is', null).neq('image_url', ''),
        supabase.from('bv_spirits').select('*', { count: 'exact', head: true }).not('tasting_notes', 'is', null),
        supabase.from('bv_spirits').select('*', { count: 'exact', head: true }).not('flavor_profile', 'is', null),
        supabase.from('bv_spirits').select('*', { count: 'exact', head: true }).not('description', 'is', null).neq('description', ''),
        supabase.from('bv_spirits').select('category').limit(10000),
        supabase.from('bv_spirits').select('*', { count: 'exact', head: true }).not('enriched_at', 'is', null),
      ]);
      
      // Calculate category breakdown
      const categories: Record<string, number> = {};
      for (const row of (categoryResult.data || [])) {
        const cat = row.category || 'unknown';
        categories[cat] = (categories[cat] || 0) + 1;
      }
      
      const total = totalResult.count || 0;
      const withImages = withImagesResult.count || 0;
      const withTastingNotes = withTastingNotesResult.count || 0;
      const withFlavorProfile = withFlavorProfileResult.count || 0;
      const withDescription = withDescriptionResult.count || 0;
      const enriched = recentEnrichedResult.count || 0;
      
      return NextResponse.json({
        success: true,
        data: {
          total_spirits: total,
          data_quality: {
            with_images: withImages,
            with_images_percent: total > 0 ? ((withImages / total) * 100).toFixed(1) : 0,
            with_tasting_notes: withTastingNotes,
            with_tasting_notes_percent: total > 0 ? ((withTastingNotes / total) * 100).toFixed(1) : 0,
            with_flavor_profile: withFlavorProfile,
            with_flavor_profile_percent: total > 0 ? ((withFlavorProfile / total) * 100).toFixed(1) : 0,
            with_description: withDescription,
            with_description_percent: total > 0 ? ((withDescription / total) * 100).toFixed(1) : 0,
            enriched_by_ai: enriched,
          },
          missing: {
            missing_images: total - withImages,
            missing_tasting_notes: total - withTastingNotes,
            missing_flavor_profile: total - withFlavorProfile,
            missing_description: total - withDescription,
          },
          categories: Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([name, count]) => ({ name, count })),
          last_updated: new Date().toISOString(),
        },
      });
    }
    
    if (action === 'sample_missing') {
      // Get sample spirits missing data
      const { data: missingImages } = await supabase
        .from('bv_spirits')
        .select('id, name, brand, category')
        .or('image_url.is.null,image_url.eq.')
        .limit(20);
      
      const { data: missingNotes } = await supabase
        .from('bv_spirits')
        .select('id, name, brand, category')
        .is('tasting_notes', null)
        .not('image_url', 'is', null)
        .limit(20);
      
      return NextResponse.json({
        success: true,
        data: {
          missing_images: missingImages || [],
          missing_tasting_notes: missingNotes || [],
        },
      });
    }
    
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    
  } catch (error: any) {
    console.error('Enrichment status error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// POST - Trigger Enrichment
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, category, limit = 50, api_key } = body;
    
    // Simple API key check for cron jobs
    const expectedKey = process.env.ENRICHMENT_API_KEY || 'crav-enrich-2025';
    if (api_key !== expectedKey) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }
    
    const results: any = {
      action,
      started_at: new Date().toISOString(),
      spirits_processed: 0,
      spirits_updated: 0,
      images_added: 0,
      errors: [],
    };
    
    switch (action) {
      case 'populate_images':
        // Find and add images for spirits missing them
        results.task = 'Populating missing images';
        
        const { data: spiritsMissingImages } = await supabase
          .from('bv_spirits')
          .select('id, name, brand, category')
          .or('image_url.is.null,image_url.eq.')
          .limit(limit);
        
        if (spiritsMissingImages) {
          results.spirits_processed = spiritsMissingImages.length;
          
          for (const spirit of spiritsMissingImages) {
            try {
              // Try multiple image sources
              let imageUrl = await findImageForSpirit(spirit.name, spirit.brand, spirit.category);
              
              if (imageUrl) {
                await supabase
                  .from('bv_spirits')
                  .update({ 
                    image_url: imageUrl,
                    image_source: 'auto_enrichment',
                    enriched_at: new Date().toISOString(),
                  })
                  .eq('id', spirit.id);
                
                results.images_added++;
                results.spirits_updated++;
              }
            } catch (e: any) {
              results.errors.push(`${spirit.name}: ${e.message}`);
            }
            
            // Rate limiting
            await sleep(200);
          }
        }
        break;
        
      case 'generate_tasting_notes':
        // Generate AI tasting notes for spirits missing them
        results.task = 'Generating tasting notes with AI';
        
        if (!process.env.OPENAI_API_KEY) {
          return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 400 });
        }
        
        const { data: spiritsMissingNotes } = await supabase
          .from('bv_spirits')
          .select('id, name, brand, category, abv')
          .is('tasting_notes', null)
          .not('image_url', 'is', null) // Prioritize spirits with images
          .limit(limit);
        
        if (spiritsMissingNotes) {
          results.spirits_processed = spiritsMissingNotes.length;
          
          for (const spirit of spiritsMissingNotes) {
            try {
              const tastingNotes = await generateTastingNotesAI(
                spirit.name,
                spirit.brand,
                spirit.category,
                spirit.abv
              );
              
              if (tastingNotes) {
                const flavorProfile = extractFlavorKeywords(tastingNotes);
                
                await supabase
                  .from('bv_spirits')
                  .update({
                    tasting_notes: tastingNotes,
                    flavor_profile: flavorProfile,
                    enriched_at: new Date().toISOString(),
                    enrichment_source: 'ai_generated',
                  })
                  .eq('id', spirit.id);
                
                results.spirits_updated++;
              }
            } catch (e: any) {
              results.errors.push(`${spirit.name}: ${e.message}`);
            }
            
            // Rate limiting for API calls
            await sleep(500);
          }
        }
        break;
        
      case 'fetch_open_food_facts':
        // Fetch new spirits from Open Food Facts
        results.task = 'Fetching from Open Food Facts';
        
        const categories = category 
          ? [category] 
          : ['whiskey', 'bourbon', 'scotch', 'rum', 'vodka', 'gin', 'tequila', 'brandy'];
        
        for (const cat of categories) {
          try {
            const newSpirits = await fetchFromOpenFoodFacts(cat);
            results.spirits_processed += newSpirits.length;
            
            for (const spirit of newSpirits) {
              // Check if already exists
              const { data: existing } = await supabase
                .from('bv_spirits')
                .select('id')
                .or(`name.ilike.${spirit.name},barcode.eq.${spirit.barcode || 'NONE'}`)
                .single();
              
              if (!existing) {
                await supabase.from('bv_spirits').insert({
                  name: spirit.name,
                  brand: spirit.brand,
                  category: spirit.category || cat,
                  description: spirit.description,
                  image_url: spirit.image_url,
                  abv: spirit.abv,
                  proof: spirit.abv ? spirit.abv * 2 : null,
                  volume_ml: spirit.volume_ml,
                  country: spirit.country,
                  barcode: spirit.barcode,
                  source: 'open_food_facts',
                  source_id: spirit.barcode,
                  created_at: new Date().toISOString(),
                });
                results.spirits_updated++;
                if (spirit.image_url) results.images_added++;
              }
            }
          } catch (e: any) {
            results.errors.push(`Category ${cat}: ${e.message}`);
          }
          
          await sleep(1000); // Respect API limits
        }
        break;
        
      case 'full_sync':
        // Run all enrichment tasks
        results.task = 'Full sync (images + tasting notes + fetch new)';
        
        // This would chain all the above actions
        // For production, this should be handled by a queue
        return NextResponse.json({
          error: 'Full sync should be triggered via individual actions to avoid timeouts',
          suggestion: 'Run populate_images, generate_tasting_notes, and fetch_open_food_facts separately',
        }, { status: 400 });
        
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
    
    results.completed_at = new Date().toISOString();
    results.duration_seconds = (new Date(results.completed_at).getTime() - new Date(results.started_at).getTime()) / 1000;
    
    // Log the enrichment run
    await supabase.from('bv_activity_log').insert({
      event_type: 'spirit_enrichment',
      event_data: results,
    });
    
    return NextResponse.json({
      success: true,
      data: results,
    });
    
  } catch (error: any) {
    console.error('Enrichment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function findImageForSpirit(name: string, brand?: string, category?: string): Promise<string | null> {
  // Try multiple sources
  
  // 1. Wikimedia Commons (free)
  try {
    const query = brand ? `${brand} ${name} bottle` : `${name} bottle`;
    const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&format=json&srlimit=3`;
    
    const response = await fetch(wikiUrl);
    if (response.ok) {
      const data = await response.json();
      const results = data.query?.search || [];
      
      for (const result of results) {
        const imageInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(result.title)}&prop=imageinfo&iiprop=url&format=json`;
        const imageResponse = await fetch(imageInfoUrl);
        
        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          const pages = imageData.query?.pages || {};
          
          for (const pageId in pages) {
            const url = pages[pageId]?.imageinfo?.[0]?.url;
            if (url && (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg'))) {
              return url;
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('Wikimedia error:', e);
  }
  
  // 2. Unsplash (if key available)
  if (process.env.UNSPLASH_ACCESS_KEY) {
    try {
      const query = category ? `${category} bottle` : `whiskey bottle`;
      const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`;
      
      const response = await fetch(unsplashUrl, {
        headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.results?.[0]?.urls?.regular) {
          return data.results[0].urls.regular;
        }
      }
    } catch (e) {
      console.error('Unsplash error:', e);
    }
  }
  
  return null;
}

async function generateTastingNotesAI(
  name: string,
  brand?: string,
  category?: string,
  abv?: number
): Promise<{ nose: string[]; palate: string[]; finish: string[] } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  
  const spiritInfo = [
    name,
    brand ? `by ${brand}` : '',
    category ? `(${category})` : '',
    abv ? `${abv}% ABV` : '',
  ].filter(Boolean).join(' ');
  
  const prompt = `You are a master sommelier. Generate authentic, professional tasting notes for: "${spiritInfo}"

Respond ONLY with valid JSON:
{
  "nose": ["3-5 aroma descriptors"],
  "palate": ["3-5 flavor descriptors"],
  "finish": ["2-3 finish descriptors"]
}

Use professional vocabulary appropriate for the spirit type. Be specific and realistic.`;

  try {
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
        max_tokens: 250,
      }),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      // Clean and parse JSON
      const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(jsonStr);
    }
  } catch (e) {
    console.error('OpenAI error:', e);
  }
  
  return null;
}

function extractFlavorKeywords(notes: { nose: string[]; palate: string[]; finish: string[] }): string[] {
  const allTerms = [...notes.nose, ...notes.palate, ...notes.finish].join(' ').toLowerCase();
  
  const flavorCategories: Record<string, string[]> = {
    sweet: ['caramel', 'vanilla', 'honey', 'maple', 'butterscotch', 'toffee', 'sugar', 'molasses'],
    fruity: ['apple', 'pear', 'cherry', 'plum', 'citrus', 'orange', 'lemon', 'berry', 'fruit', 'raisin', 'dried fruit'],
    spicy: ['cinnamon', 'pepper', 'clove', 'ginger', 'nutmeg', 'spice', 'allspice', 'cardamom'],
    smoky: ['smoke', 'peat', 'char', 'ash', 'campfire', 'tobacco', 'burnt'],
    woody: ['oak', 'wood', 'cedar', 'barrel', 'timber', 'sawdust'],
    floral: ['floral', 'rose', 'lavender', 'heather', 'flower', 'blossom'],
    nutty: ['almond', 'walnut', 'hazelnut', 'pecan', 'nut', 'marzipan'],
    rich: ['chocolate', 'coffee', 'dark', 'rich', 'deep', 'complex'],
  };
  
  const profile: string[] = [];
  
  for (const [category, keywords] of Object.entries(flavorCategories)) {
    if (keywords.some(k => allTerms.includes(k))) {
      profile.push(category);
    }
  }
  
  return profile;
}

async function fetchFromOpenFoodFacts(category: string): Promise<any[]> {
  const spirits: any[] = [];
  
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${category}&tagtype_0=categories&tag_contains_0=contains&tag_0=alcoholic-beverages&json=true&page_size=50`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'JavariSpirits/1.0 (support@craudiovizai.com)' }
    });
    
    if (!response.ok) return spirits;
    
    const data = await response.json();
    
    for (const product of (data.products || [])) {
      // Filter for actual spirits (check alcohol content)
      const alcohol = product.nutriments?.alcohol_100g;
      if (!alcohol || alcohol < 15) continue; // Skip low-alcohol items
      
      spirits.push({
        name: product.product_name || product.product_name_en,
        brand: product.brands,
        category: category,
        description: product.generic_name || product.generic_name_en,
        image_url: product.image_url || product.image_front_url,
        abv: parseFloat(alcohol),
        volume_ml: product.quantity ? parseVolume(product.quantity) : null,
        country: product.countries_tags?.[0]?.replace('en:', ''),
        barcode: product.code,
      });
    }
  } catch (e) {
    console.error('OFF error:', e);
  }
  
  return spirits;
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

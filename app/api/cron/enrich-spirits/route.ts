/**
 * CRON: Spirit Enrichment
 * =======================
 * Runs nightly at 3 AM EST to enrich spirit data
 * 
 * Tasks:
 * 1. Generate AI tasting notes for spirits missing them
 * 2. Fetch new spirits from Open Food Facts
 * 3. Update data quality metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Also allow internal API key
    const { searchParams } = new URL(request.url);
    if (searchParams.get('key') !== process.env.ENRICHMENT_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  const results = {
    timestamp: new Date().toISOString(),
    tasks: [] as any[],
    total_updated: 0,
    errors: [] as string[],
  };
  
  try {
    // Task 1: Generate AI tasting notes for 25 spirits
    if (process.env.OPENAI_API_KEY) {
      const { data: spiritsNeedingNotes } = await supabase
        .from('bv_spirits')
        .select('id, name, brand, category, abv')
        .is('tasting_notes', null)
        .not('name', 'is', null)
        .limit(25);
      
      let notesGenerated = 0;
      
      for (const spirit of (spiritsNeedingNotes || [])) {
        try {
          const notes = await generateTastingNotes(spirit);
          
          if (notes) {
            await supabase
              .from('bv_spirits')
              .update({
                tasting_notes: notes,
                flavor_profile: extractFlavors(notes),
                enriched_at: new Date().toISOString(),
              })
              .eq('id', spirit.id);
            
            notesGenerated++;
          }
        } catch (e: any) {
          results.errors.push(`Notes for ${spirit.name}: ${e.message}`);
        }
        
        await sleep(500); // Rate limit
      }
      
      results.tasks.push({
        name: 'generate_tasting_notes',
        processed: spiritsNeedingNotes?.length || 0,
        updated: notesGenerated,
      });
      results.total_updated += notesGenerated;
    }
    
    // Task 2: Fetch new spirits from Open Food Facts (bourbon focus today)
    const categories = ['bourbon', 'scotch', 'japanese whisky', 'rum', 'tequila'];
    const todayCategory = categories[new Date().getDay() % categories.length];
    
    const newSpiritsTask = await fetchNewSpirits(todayCategory);
    results.tasks.push({
      name: 'fetch_new_spirits',
      category: todayCategory,
      ...newSpiritsTask,
    });
    results.total_updated += newSpiritsTask.created;
    
    // Task 3: Update metrics
    const metrics = await updateDataQualityMetrics();
    results.tasks.push({
      name: 'update_metrics',
      ...metrics,
    });
    
    // Log the cron run
    await supabase.from('bv_cron_logs').insert({
      job_name: 'enrich_spirits',
      status: 'completed',
      results,
      run_at: new Date().toISOString(),
    });
    
    return NextResponse.json({
      success: true,
      message: `Enrichment complete: ${results.total_updated} spirits updated`,
      data: results,
    });
    
  } catch (error: any) {
    results.errors.push(error.message);
    
    await supabase.from('bv_cron_logs').insert({
      job_name: 'enrich_spirits',
      status: 'error',
      results,
      error: error.message,
      run_at: new Date().toISOString(),
    });
    
    return NextResponse.json({
      success: false,
      error: error.message,
      data: results,
    }, { status: 500 });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function generateTastingNotes(spirit: {
  name: string;
  brand?: string;
  category?: string;
  abv?: number;
}): Promise<{ nose: string[]; palate: string[]; finish: string[] } | null> {
  const prompt = `Generate professional tasting notes for "${spirit.name}"${spirit.brand ? ` by ${spirit.brand}` : ''}${spirit.category ? ` (${spirit.category})` : ''}${spirit.abv ? ` at ${spirit.abv}% ABV` : ''}.

Return ONLY valid JSON:
{"nose":["aroma1","aroma2","aroma3"],"palate":["flavor1","flavor2","flavor3"],"finish":["finish1","finish2"]}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
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
    try {
      const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }
  
  return null;
}

function extractFlavors(notes: { nose: string[]; palate: string[]; finish: string[] }): string[] {
  const text = [...notes.nose, ...notes.palate, ...notes.finish].join(' ').toLowerCase();
  const flavors: string[] = [];
  
  if (/caramel|vanilla|honey|maple|butterscotch|toffee/.test(text)) flavors.push('sweet');
  if (/apple|pear|cherry|plum|citrus|orange|berry|fruit/.test(text)) flavors.push('fruity');
  if (/cinnamon|pepper|clove|ginger|spice/.test(text)) flavors.push('spicy');
  if (/smoke|peat|char|ash|campfire/.test(text)) flavors.push('smoky');
  if (/oak|wood|cedar|barrel/.test(text)) flavors.push('woody');
  if (/floral|rose|lavender|heather/.test(text)) flavors.push('floral');
  if (/almond|walnut|hazelnut|nut/.test(text)) flavors.push('nutty');
  if (/chocolate|coffee|dark|rich/.test(text)) flavors.push('rich');
  
  return flavors;
}

async function fetchNewSpirits(category: string): Promise<{ found: number; created: number; errors: string[] }> {
  const result = { found: 0, created: 0, errors: [] as string[] };
  
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(category)}&tagtype_0=categories&tag_contains_0=contains&tag_0=alcoholic-beverages&json=true&page_size=30`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'JavariSpirits/1.0' }
    });
    
    if (!response.ok) return result;
    
    const data = await response.json();
    result.found = data.products?.length || 0;
    
    for (const product of (data.products || [])) {
      const alcohol = product.nutriments?.alcohol_100g;
      if (!alcohol || alcohol < 15) continue;
      
      // Check if exists
      const { data: existing } = await supabase
        .from('bv_spirits')
        .select('id')
        .eq('barcode', product.code)
        .single();
      
      if (!existing && product.product_name) {
        await supabase.from('bv_spirits').insert({
          name: product.product_name || product.product_name_en,
          brand: product.brands,
          category: category,
          description: product.generic_name,
          image_url: product.image_url || product.image_front_url,
          abv: parseFloat(alcohol),
          proof: parseFloat(alcohol) * 2,
          country: product.countries_tags?.[0]?.replace('en:', ''),
          barcode: product.code,
          source: 'open_food_facts',
          created_at: new Date().toISOString(),
        });
        result.created++;
      }
    }
  } catch (e: any) {
    result.errors.push(e.message);
  }
  
  return result;
}

async function updateDataQualityMetrics(): Promise<{
  total: number;
  with_images: number;
  with_notes: number;
  with_flavors: number;
}> {
  const [total, images, notes, flavors] = await Promise.all([
    supabase.from('bv_spirits').select('*', { count: 'exact', head: true }),
    supabase.from('bv_spirits').select('*', { count: 'exact', head: true }).not('image_url', 'is', null).neq('image_url', ''),
    supabase.from('bv_spirits').select('*', { count: 'exact', head: true }).not('tasting_notes', 'is', null),
    supabase.from('bv_spirits').select('*', { count: 'exact', head: true }).not('flavor_profile', 'is', null),
  ]);
  
  const metrics = {
    total: total.count || 0,
    with_images: images.count || 0,
    with_notes: notes.count || 0,
    with_flavors: flavors.count || 0,
  };
  
  // Store metrics snapshot
  await supabase.from('bv_data_metrics').insert({
    metric_type: 'spirit_data_quality',
    metrics,
    recorded_at: new Date().toISOString(),
  });
  
  return metrics;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

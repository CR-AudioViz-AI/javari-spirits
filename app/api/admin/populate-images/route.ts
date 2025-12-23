import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface ImageResult {
  url: string;
  thumbnail_url?: string;
  source: string;
  license: string;
  attribution: string;
  source_url: string;
  width?: number;
  height?: number;
}

async function searchWikimedia(spiritName: string, brand?: string): Promise<ImageResult[]> {
  const searchTerms = brand ? `${brand} ${spiritName} bottle` : `${spiritName} bottle whiskey`;
  try {
    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerms)}&srnamespace=6&srlimit=3&format=json&origin=*`,
      { headers: { 'User-Agent': 'CRAVBarrels/1.0' } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    const results: ImageResult[] = [];
    for (const item of (data.query?.search || []).slice(0, 2)) {
      const imageInfo = await getWikiImageInfo(item.title);
      if (imageInfo) results.push(imageInfo);
    }
    return results;
  } catch (e) { console.error('Wikimedia error:', e); return []; }
}

async function getWikiImageInfo(fileTitle: string): Promise<ImageResult | null> {
  try {
    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=url|size&format=json&origin=*`,
      { headers: { 'User-Agent': 'CRAVBarrels/1.0' } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const page = Object.values(data.query?.pages || {})[0] as any;
    if (!page?.imageinfo?.[0]) return null;
    const info = page.imageinfo[0];
    return {
      url: info.url,
      thumbnail_url: info.thumburl || info.url,
      source: 'wikimedia',
      license: 'cc-by-sa',
      attribution: 'Wikimedia Commons',
      source_url: `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle)}`,
      width: info.width,
      height: info.height
    };
  } catch { return null; }
}

async function saveImageToDb(spiritId: string, image: ImageResult, isPrimary: boolean): Promise<string | null> {
  try {
    const { data, error } = await supabase.from('spirit_images').insert({
      spirit_id: spiritId,
      url: image.url,
      thumbnail_url: image.thumbnail_url || null,
      source: image.source || 'wikimedia',
      license: image.license || 'cc-by-sa',
      attribution_required: true,
      attribution_text: image.attribution || 'Wikimedia Commons',
      source_url: image.source_url || '',
      width: image.width || null,
      height: image.height || null,
      status: 'approved',
      is_primary: isPrimary
    }).select('id').single();
    
    if (error) {
      console.error('Insert error:', error);
      return null;
    }
    return data?.id || null;
  } catch (e) {
    console.error('Save error:', e);
    return null;
  }
}

async function updateSpiritImage(spiritId: string, imageId: string) {
  try {
    await supabase.from('bv_spirits').update({ primary_image_id: imageId }).eq('id', spiritId);
  } catch (e) {
    console.error('Update spirit error:', e);
  }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const limit = Math.min(body.limit || 30, 50);

    const { data: spirits, error } = await supabase
      .from('bv_spirits')
      .select('id, name, brand')
      .is('primary_image_id', null)
      .limit(limit);
      
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const results = { processed: 0, imagesFound: 0, imagesSaved: 0, spiritsWithImages: 0, errors: [] as string[] };

    for (const spirit of spirits || []) {
      results.processed++;
      try {
        await sleep(1500);
        const images = await searchWikimedia(spirit.name, spirit.brand);
        results.imagesFound += images.length;
        
        if (images.length > 0) {
          const imageId = await saveImageToDb(spirit.id, images[0], true);
          if (imageId) {
            results.imagesSaved++;
            results.spiritsWithImages++;
            await updateSpiritImage(spirit.id, imageId);
          }
        }
      } catch (e: any) { 
        results.errors.push(`${spirit.name}: ${e.message}`); 
      }
    }
    return NextResponse.json({ success: true, message: `Processed ${results.processed} spirits`, results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  const { count: total } = await supabase.from('bv_spirits').select('*', { count: 'exact', head: true });
  const { count: withImages } = await supabase.from('bv_spirits').select('*', { count: 'exact', head: true }).not('primary_image_id', 'is', null);
  return NextResponse.json({
    total_spirits: total || 0,
    with_images: withImages || 0,
    without_images: (total || 0) - (withImages || 0),
    coverage_percent: total ? ((withImages || 0) / total * 100).toFixed(1) : 0
  });
}

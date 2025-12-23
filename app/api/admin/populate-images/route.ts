/**
 * CRAV Barrels - Batch Image Population API (UPDATED)
 * Uses bv_spirits table
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const DELAY_BETWEEN_REQUESTS = 1000;

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
  
  const params = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: searchTerms,
    srnamespace: '6',
    srlimit: '5',
    format: 'json',
    origin: '*'
  });

  try {
    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?${params}`,
      { headers: { 'User-Agent': 'CRAVBarrels/1.0 (https://cravbarrels.com)' } }
    );

    if (!response.ok) return [];

    const data = await response.json();
    const results: ImageResult[] = [];

    for (const item of (data.query?.search || []).slice(0, 3)) {
      const imageInfo = await getImageInfo(item.title);
      if (imageInfo) results.push(imageInfo);
      await sleep(300);
    }

    return results;
  } catch (error) {
    return [];
  }
}

async function getImageInfo(fileTitle: string): Promise<ImageResult | null> {
  const params = new URLSearchParams({
    action: 'query', titles: fileTitle, prop: 'imageinfo',
    iiprop: 'url|size|extmetadata', format: 'json', origin: '*'
  });

  try {
    const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`,
      { headers: { 'User-Agent': 'CRAVBarrels/1.0' } });
    if (!response.ok) return null;
    const data = await response.json();
    const page = Object.values(data.query?.pages || {})[0] as any;
    if (!page?.imageinfo?.[0]) return null;
    const info = page.imageinfo[0];
    const meta = info.extmetadata || {};
    let license = 'cc0';
    const ls = (meta.LicenseShortName?.value || '').toLowerCase();
    if (ls.includes('cc-by-sa')) license = 'cc-by-sa';
    else if (ls.includes('cc-by')) license = 'cc-by';
    return {
      url: info.url, thumbnail_url: info.thumburl, source: 'wikimedia', license,
      attribution: meta.Artist?.value || 'Wikimedia Commons',
      source_url: `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle)}`,
      width: info.width, height: info.height
    };
  } catch { return null; }
}

async function searchOpenverse(spiritName: string, brand?: string): Promise<ImageResult[]> {
  const searchTerms = brand ? `${brand} ${spiritName} bottle` : `${spiritName} whiskey bottle`;
  try {
    const response = await fetch(
      `https://api.openverse.org/v1/images/?q=${encodeURIComponent(searchTerms)}&license=cc0,by,by-sa&mature=false&page_size=5`,
      { headers: { 'User-Agent': 'CRAVBarrels/1.0' } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return (data.results || []).slice(0, 3).map((item: any) => ({
      url: item.url, thumbnail_url: item.thumbnail, source: 'openverse',
      license: item.license || 'cc-by', attribution: item.attribution || item.creator || 'Unknown',
      source_url: item.foreign_landing_url || item.url, width: item.width, height: item.height
    }));
  } catch { return []; }
}

async function saveImage(spiritId: string, image: ImageResult, isPrimary: boolean) {
  const { data, error } = await supabase.from('spirit_images').insert({
    spirit_id: spiritId, url: image.url, thumbnail_url: image.thumbnail_url,
    source: image.source, license: image.license, attribution_required: image.license !== 'cc0',
    attribution_text: image.attribution, source_url: image.source_url,
    width: image.width, height: image.height, status: 'approved', is_primary: isPrimary
  }).select().single();
  return error ? null : data;
}

async function updateSpiritPrimaryImage(spiritId: string, imageId: string) {
  await supabase.from('bv_spirits').update({ primary_image_id: imageId }).eq('id', spiritId);
}

function sleep(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const limit = Math.min(body.limit || 50, 100);
    const priorityOnly = body.priorityOnly || false;

    let query = supabase.from('bv_spirits').select('id, name, brand, type').is('primary_image_id', null);
    if (priorityOnly) {
      query = query.or('brand.ilike.%pappy%,brand.ilike.%buffalo trace%,brand.ilike.%makers mark%,brand.ilike.%jack daniels%,brand.ilike.%johnnie walker%,brand.ilike.%macallan%,brand.ilike.%glenfiddich%,brand.ilike.%blanton%,brand.ilike.%weller%');
    }
    const { data: spirits, error } = await query.limit(limit);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const results = { processed: 0, imagesFound: 0, imagesSaved: 0, spiritsWithImages: 0, errors: [] as string[] };

    for (const spirit of spirits || []) {
      results.processed++;
      try {
        const wikimediaImages = await searchWikimedia(spirit.name, spirit.brand);
        await sleep(DELAY_BETWEEN_REQUESTS);
        const openverseImages = await searchOpenverse(spirit.name, spirit.brand);
        await sleep(DELAY_BETWEEN_REQUESTS);
        const allImages = [...wikimediaImages, ...openverseImages];
        results.imagesFound += allImages.length;
        if (allImages.length > 0) {
          const primaryImage = await saveImage(spirit.id, allImages[0], true);
          if (primaryImage) {
            results.imagesSaved++;
            results.spiritsWithImages++;
            await updateSpiritPrimaryImage(spirit.id, primaryImage.id);
          }
          for (let i = 1; i < Math.min(allImages.length, 3); i++) {
            const saved = await saveImage(spirit.id, allImages[i], false);
            if (saved) results.imagesSaved++;
          }
        }
      } catch (error: any) { results.errors.push(`${spirit.name}: ${error.message}`); }
    }

    return NextResponse.json({ success: true, message: `Processed ${results.processed} spirits`, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { count: total } = await supabase.from('bv_spirits').select('*', { count: 'exact', head: true });
  const { count: withImages } = await supabase.from('bv_spirits').select('*', { count: 'exact', head: true }).not('primary_image_id', 'is', null);
  const withoutImages = (total || 0) - (withImages || 0);
  return NextResponse.json({
    total_spirits: total || 0, with_images: withImages || 0, without_images: withoutImages,
    coverage_percent: total ? ((withImages || 0) / total * 100).toFixed(1) : 0
  });
}

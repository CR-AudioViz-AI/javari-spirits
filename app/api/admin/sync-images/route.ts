import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = 'spirit-images';

// Verified working official images
const VERIFIED_IMAGES: Record<string, string> = {
  'buffalo trace': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/BUFFALO_TRACE_BOTTLE-e1765117225509.png',
  'blanton': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/12/BLANTONS.png',
  'eagle rare': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/12/BOTTLE-EAGLE-RARE.png',
  'weller': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/WELLER-SPECIAL-RESERVE-PACKSHOT-PRODUCT-e1764158017233.png',
  'e.h. taylor': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/E.H.TAYLOR_SINGLE_BARREL_BOTTLE.png',
  'taylor': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/E.H.TAYLOR_SINGLE_BARREL_BOTTLE.png',
  'sazerac': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/Sazerac-Rye-Pack-Shot.png',
  'van winkle': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/OLD_-RIP_VAN_WINKLE_10_B0TTLE.png',
  'pappy': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/OLD_-RIP_VAN_WINKLE_10_B0TTLE.png',
  'traveller': 'https://wordpress-1508494-5786922.cloudwaysapps.com/wp-content/uploads/2025/11/TRAVELLER_BOTTLE.png',
  'michter': 'https://michters.com/wp-content/uploads/2025/01/BOURB750_418x1378100_2023.jpg',
};

function findVerifiedImage(name: string, brand: string): string | null {
  const searchText = `${name} ${brand}`.toLowerCase();
  for (const [pattern, url] of Object.entries(VERIFIED_IMAGES)) {
    if (searchText.includes(pattern)) {
      return url;
    }
  }
  return null;
}

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'BarrelVerse-ImageSync/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}

async function uploadImage(spiritId: string, imageBuffer: Buffer): Promise<string | null> {
  const filename = `${spiritId}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, imageBuffer, { contentType: 'image/jpeg', upsert: true });
  
  if (error) return null;
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
}

// POST - Manually trigger sync for specific spirits or all
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json().catch(() => ({}));
    const batchSize = body.batchSize || 100;
    const category = body.category; // Optional filter
    
    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some(b => b.name === BUCKET_NAME)) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: true });
    }
    
    // Build query
    let query = supabase
      .from('bv_spirits')
      .select('id, name, brand, image_url')
      .not('image_url', 'like', `%${BUCKET_NAME}%`)
      .limit(batchSize);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data: spirits, error } = await query;
    
    if (error || !spirits) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    let uploaded = 0;
    let failed = 0;
    
    for (const spirit of spirits) {
      let sourceUrl = findVerifiedImage(spirit.name || '', spirit.brand || '');
      
      if (!sourceUrl && spirit.image_url) {
        try {
          const res = await fetch(spirit.image_url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
          if (res.ok) sourceUrl = spirit.image_url;
        } catch {}
      }
      
      if (!sourceUrl) {
        failed++;
        continue;
      }
      
      const imageBuffer = await downloadImage(sourceUrl);
      if (!imageBuffer) {
        failed++;
        continue;
      }
      
      const newUrl = await uploadImage(spirit.id, imageBuffer);
      if (!newUrl) {
        failed++;
        continue;
      }
      
      await supabase
        .from('bv_spirits')
        .update({ image_url: newUrl, thumbnail_url: newUrl })
        .eq('id', spirit.id);
      
      uploaded++;
    }
    
    const { count: remaining } = await supabase
      .from('bv_spirits')
      .select('*', { count: 'exact', head: true })
      .not('image_url', 'like', `%${BUCKET_NAME}%`);
    
    return NextResponse.json({
      success: true,
      processed: spirits.length,
      uploaded,
      failed,
      remaining: remaining || 0,
      duration: Date.now() - startTime,
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Check sync status
export async function GET() {
  const { count: total } = await supabase
    .from('bv_spirits')
    .select('*', { count: 'exact', head: true });
  
  const { count: synced } = await supabase
    .from('bv_spirits')
    .select('*', { count: 'exact', head: true })
    .like('image_url', `%${BUCKET_NAME}%`);
  
  const { count: remaining } = await supabase
    .from('bv_spirits')
    .select('*', { count: 'exact', head: true })
    .not('image_url', 'like', `%${BUCKET_NAME}%`);
  
  return NextResponse.json({
    total: total || 0,
    synced: synced || 0,
    remaining: remaining || 0,
    percentComplete: total ? Math.round(((synced || 0) / total) * 100) : 0,
    storageUrl: `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/`,
  });
}

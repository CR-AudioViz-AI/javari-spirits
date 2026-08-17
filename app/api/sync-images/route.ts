import { NextRequest, NextResponse } from 'next/server';
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = lazyAdminDb();

const BUCKET_NAME = 'spirit-images';

// Verified working official images (HTTP 200 tested on 2025-12-20)
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
  const searchText = (name + ' ' + brand).toLowerCase();
  for (const [pattern, url] of Object.entries(VERIFIED_IMAGES)) {
    if (searchText.includes(pattern)) {
      return url;
    }
  }
  return null;
}

async function downloadAndUpload(imageUrl: string, spiritId: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl, {
      headers: { 'User-Agent': 'BarrelVerse-ImageSync/1.0' }
    });
    
    if (!response.ok) {
      console.log('Download failed for ' + spiritId + ': HTTP ' + response.status);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const filename = spiritId + '.' + ext;
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: contentType,
        upsert: true
      });
    
    if (error) {
      console.error('Upload error for ' + spiritId + ':', error.message);
      return null;
    }
    
    return supabaseUrl + '/storage/v1/object/public/' + BUCKET_NAME + '/' + filename;
  } catch (error) {
    console.error('Error processing ' + spiritId + ':', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const batch = body.batch || 0;
    const batchSize = body.batchSize || 50;
    
    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
    
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, { public: true });
      console.log('Created bucket: ' + BUCKET_NAME);
    }
    
    // Fetch spirits for this batch
    const { data: spirits, error: fetchError } = await supabase
      .from('bv_spirits')
      .select('id, name, brand, image_url')
      .range(batch * batchSize, (batch + 1) * batchSize - 1);
    
    if (fetchError || !spirits) {
      return NextResponse.json({ error: 'Failed to fetch spirits', details: fetchError }, { status: 500 });
    }
    
    const results = {
      processed: 0,
      uploaded: 0,
      failed: 0,
      skipped: 0,
      details: [] as Array<{ id: string; name: string; status: string; url?: string }>
    };
    
    for (const spirit of spirits) {
      results.processed++;
      
      // Find the best image URL
      let imageUrl = findVerifiedImage(spirit.name || '', spirit.brand || '');
      
      if (!imageUrl && spirit.image_url) {
        // Validate existing URL with HEAD request
        try {
          const check = await fetch(spirit.image_url, { method: 'HEAD' });
          if (check.ok) {
            imageUrl = spirit.image_url;
          }
        } catch {
          // URL is invalid, skip
        }
      }
      
      if (!imageUrl) {
        results.skipped++;
        results.details.push({ id: spirit.id, name: spirit.name, status: 'skipped' });
        continue;
      }
      
      // Download and upload to our storage
      const newUrl = await downloadAndUpload(imageUrl, spirit.id);
      
      if (newUrl) {
        results.uploaded++;
        results.details.push({ id: spirit.id, name: spirit.name, status: 'uploaded', url: newUrl });
        
        // Update database with self-hosted URL
        await supabase
          .from('bv_spirits')
          .update({ image_url: newUrl, thumbnail_url: newUrl })
          .eq('id', spirit.id);
      } else {
        results.failed++;
        results.details.push({ id: spirit.id, name: spirit.name, status: 'failed' });
      }
    }
    
    return NextResponse.json({
      batch,
      batchSize,
      spiritsInBatch: spirits.length,
      hasMore: spirits.length === batchSize,
      ...results
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function GET() {
  // Get status/count
  const { count, error } = await supabase
    .from('bv_spirits')
    .select('*', { count: 'exact', head: true });
  
  // Check bucket
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);
  
  return NextResponse.json({
    totalSpirits: count,
    bucketName: BUCKET_NAME,
    bucketExists,
    supabaseUrl,
    error: error?.message
  });
}

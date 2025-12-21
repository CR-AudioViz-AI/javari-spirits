import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = 'spirit-images';

// Verified working official images - download and host these
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

async function downloadAndUpload(spiritId: string, sourceUrl: string): Promise<string | null> {
  try {
    // Download image
    const response = await fetch(sourceUrl, {
      headers: { 'User-Agent': 'BarrelVerse-ImageSync/1.0' },
    });
    
    if (!response.ok) {
      console.log('Download failed for ' + spiritId + ': HTTP ' + response.status);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const filename = spiritId + '.jpg';
    
    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, arrayBuffer, { 
        contentType: 'image/jpeg', 
        upsert: true 
      });
    
    if (error) {
      console.log('Upload failed for ' + spiritId + ': ' + error.message);
      return null;
    }
    
    return supabaseUrl + '/storage/v1/object/public/' + BUCKET_NAME + '/' + filename;
  } catch (e) {
    console.log('Error for ' + spiritId + ': ' + (e instanceof Error ? e.message : 'Unknown'));
    return null;
  }
}

export async function GET() {
  try {
    const { count: total } = await supabase
      .from('bv_spirits')
      .select('*', { count: 'exact', head: true });
    
    const { count: synced } = await supabase
      .from('bv_spirits')
      .select('*', { count: 'exact', head: true })
      .like('image_url', '%' + BUCKET_NAME + '%');
    
    return NextResponse.json({
      total: total || 0,
      synced: synced || 0,
      remaining: (total || 0) - (synced || 0),
      percentComplete: total ? Math.round(((synced || 0) / total) * 100) : 0,
      storageUrl: supabaseUrl + '/storage/v1/object/public/' + BUCKET_NAME + '/',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json().catch(() => ({}));
    const batchSize = Math.min(body.batchSize || 20, 50);
    const priorityOnly = body.priorityOnly === true; // Only process verified brands
    
    // Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some(b => b.name === BUCKET_NAME)) {
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, { public: true });
      if (error) {
        return NextResponse.json({ error: 'Failed to create bucket: ' + error.message }, { status: 500 });
      }
    }
    
    // Get spirits that need syncing
    let query = supabase
      .from('bv_spirits')
      .select('id, name, brand, image_url')
      .not('image_url', 'like', '%' + BUCKET_NAME + '%')
      .limit(batchSize);
    
    // If priorityOnly, only get spirits that match verified image patterns
    if (priorityOnly) {
      const patterns = Object.keys(VERIFIED_IMAGES);
      const orConditions = patterns.map(p => 'name.ilike.%' + p + '%,brand.ilike.%' + p + '%').join(',');
      query = query.or(orConditions);
    }
    
    const { data: spirits, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 });
    }
    
    if (!spirits || spirits.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No spirits to process',
        processed: 0,
        uploaded: 0,
        duration: Date.now() - startTime,
      });
    }
    
    let uploaded = 0;
    let failed = 0;
    const results: { id: string; status: string; url?: string }[] = [];
    
    for (const spirit of spirits) {
      // Get source URL - prefer verified, fallback to existing if valid
      let sourceUrl = findVerifiedImage(spirit.name || '', spirit.brand || '');
      
      if (!sourceUrl && spirit.image_url && !priorityOnly) {
        // Validate existing URL
        try {
          const res = await fetch(spirit.image_url, { method: 'HEAD' });
          if (res.ok) {
            sourceUrl = spirit.image_url;
          }
        } catch {
          // URL is invalid
        }
      }
      
      if (!sourceUrl) {
        failed++;
        results.push({ id: spirit.id, status: 'no_source' });
        continue;
      }
      
      const newUrl = await downloadAndUpload(spirit.id, sourceUrl);
      
      if (!newUrl) {
        failed++;
        results.push({ id: spirit.id, status: 'failed' });
        continue;
      }
      
      // Update database
      const { error: updateError } = await supabase
        .from('bv_spirits')
        .update({ image_url: newUrl, thumbnail_url: newUrl })
        .eq('id', spirit.id);
      
      if (updateError) {
        failed++;
        results.push({ id: spirit.id, status: 'db_error' });
      } else {
        uploaded++;
        results.push({ id: spirit.id, status: 'success', url: newUrl });
      }
    }
    
    const { count: remaining } = await supabase
      .from('bv_spirits')
      .select('*', { count: 'exact', head: true })
      .not('image_url', 'like', '%' + BUCKET_NAME + '%');
    
    return NextResponse.json({
      success: true,
      processed: spirits.length,
      uploaded,
      failed,
      remaining: remaining || 0,
      duration: Date.now() - startTime,
      details: results.slice(0, 10), // Only return first 10 for brevity
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const maxDuration = 60;

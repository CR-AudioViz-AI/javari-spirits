import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client with service role for storage access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = 'spirit-images';
const BATCH_SIZE = 50; // Process 50 spirits per cron run to stay under Vercel limits

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

// Find verified image for a spirit
function findVerifiedImage(name: string, brand: string): string | null {
  const searchText = `${name} ${brand}`.toLowerCase();
  for (const [pattern, url] of Object.entries(VERIFIED_IMAGES)) {
    if (searchText.includes(pattern)) {
      return url;
    }
  }
  return null;
}

// Download image and return as buffer
async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'BarrelVerse-ImageSync/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    
    if (!response.ok) return null;
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

// Check if image exists in storage
async function imageExistsInStorage(spiritId: string): Promise<boolean> {
  const { data } = await supabase.storage
    .from(BUCKET_NAME)
    .list('', { search: spiritId });
  return data !== null && data.length > 0;
}

// Upload image to Supabase Storage
async function uploadImage(spiritId: string, imageBuffer: Buffer): Promise<string | null> {
  const filename = `${spiritId}.jpg`;
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, imageBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });
  
  if (error) {
    console.error(`Upload failed for ${spiritId}:`, error.message);
    return null;
  }
  
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
}

// Process a single spirit
async function processSpirit(spirit: any): Promise<{ id: string; newUrl: string } | null> {
  const spiritId = spirit.id;
  
  // Skip if already hosted in our storage
  if (spirit.image_url?.includes(BUCKET_NAME)) {
    return null;
  }
  
  // Try verified image first
  let sourceUrl = findVerifiedImage(spirit.name || '', spirit.brand || '');
  
  // Fall back to existing URL if no verified image
  if (!sourceUrl && spirit.image_url) {
    // Validate existing URL
    try {
      const response = await fetch(spirit.image_url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        sourceUrl = spirit.image_url;
      }
    } catch {
      // URL is invalid
    }
  }
  
  if (!sourceUrl) {
    return null; // No valid image source
  }
  
  // Download the image
  const imageBuffer = await downloadImage(sourceUrl);
  if (!imageBuffer) {
    return null;
  }
  
  // Upload to our storage
  const newUrl = await uploadImage(spiritId, imageBuffer);
  if (!newUrl) {
    return null;
  }
  
  return { id: spiritId, newUrl };
}

// Ensure bucket exists
async function ensureBucket(): Promise<boolean> {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === BUCKET_NAME);
  
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    });
    if (error) {
      console.error('Failed to create bucket:', error);
      return false;
    }
  }
  return true;
}

// Main cron handler
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow without auth in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  try {
    // Ensure storage bucket exists
    const bucketReady = await ensureBucket();
    if (!bucketReady) {
      return NextResponse.json({ error: 'Failed to initialize storage' }, { status: 500 });
    }
    
    // Get spirits that need image sync (not already in our storage)
    const { data: spirits, error } = await supabase
      .from('bv_spirits')
      .select('id, name, brand, image_url')
      .not('image_url', 'like', `%${BUCKET_NAME}%`)
      .limit(BATCH_SIZE);
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    if (!spirits || spirits.length === 0) {
      return NextResponse.json({
        message: 'All images synced!',
        processed: 0,
        duration: Date.now() - startTime,
      });
    }
    
    // Process spirits
    const results = await Promise.all(spirits.map(processSpirit));
    const updates = results.filter((r): r is { id: string; newUrl: string } => r !== null);
    
    // Update database with new URLs
    for (const update of updates) {
      await supabase
        .from('bv_spirits')
        .update({ 
          image_url: update.newUrl,
          thumbnail_url: update.newUrl,
        })
        .eq('id', update.id);
    }
    
    // Get remaining count
    const { count } = await supabase
      .from('bv_spirits')
      .select('*', { count: 'exact', head: true })
      .not('image_url', 'like', `%${BUCKET_NAME}%`);
    
    return NextResponse.json({
      message: 'Image sync batch complete',
      processed: spirits.length,
      uploaded: updates.length,
      remaining: count || 0,
      duration: Date.now() - startTime,
      storageUrl: `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/`,
    });
    
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ 
      error: 'Internal error',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}

// Vercel cron config - run every hour
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 second timeout

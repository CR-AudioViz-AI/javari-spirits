import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with anon key for public read access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// FIXED: Generic category images - NO branded products
const categoryImages: Record<string, string> = {
  bourbon: 'https://images.unsplash.com/photo-1598018553943-93a4a78f1e08?w=400&h=600&fit=crop',
  scotch: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=600&fit=crop',
  wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=600&fit=crop',
  beer: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=600&fit=crop',
  rum: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=600&fit=crop',
  tequila: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=400&h=600&fit=crop',
  vodka: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=600&fit=crop',
  gin: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=600&fit=crop',
  cognac: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=600&fit=crop',
  brandy: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=600&fit=crop',
  mezcal: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=400&h=600&fit=crop',
  sake: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&h=600&fit=crop',
  rye: 'https://images.unsplash.com/photo-1598018553943-93a4a78f1e08?w=400&h=600&fit=crop',
  irish: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=600&fit=crop',
  japanese: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=600&fit=crop',
  other: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=600&fit=crop',
};

// Bad image URLs to filter out (branded products like Johnnie Walker, Jose Cuervo)
const BAD_IMAGE_PATTERNS = [
  'photo-1569529465841',  // Johnnie Walker
  'photo-1516535794938',  // Jose Cuervo
];

function getCleanImageUrl(spirit: any): string {
  // Check if spirit has an image_url and if it's not a bad one
  if (spirit.image_url) {
    const isBadImage = BAD_IMAGE_PATTERNS.some(pattern => spirit.image_url.includes(pattern));
    if (!isBadImage) {
      return spirit.image_url;
    }
  }
  // Fall back to category default
  return categoryImages[spirit.category] || categoryImages.bourbon;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('bv_spirits')
      .select('*', { count: 'exact' });

    // Apply category filter
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,distillery.ilike.%${search}%`);
    }

    // Apply sorting
    const validSortFields = ['name', 'msrp', 'proof', 'category', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: spirits, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Add fallback images for spirits - filter out bad branded images
    const spiritsWithImages = (spirits || []).map(spirit => ({
      ...spirit,
      image_url: getCleanImageUrl(spirit),
      thumbnail_url: getCleanImageUrl(spirit),
    }));

    // Get category counts
    const { data: categoryCounts } = await supabase
      .from('bv_spirits')
      .select('category');

    const counts: Record<string, number> = {};
    (categoryCounts || []).forEach((item: { category: string }) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });

    return NextResponse.json({
      spirits: spiritsWithImages,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      categoryCounts: counts,
    });
  } catch (error) {
    console.error('Error fetching spirits:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch spirits',
        spirits: [],
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
        categoryCounts: {},
      },
      { status: 500 }
    );
  }
}

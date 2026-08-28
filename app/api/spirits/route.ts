import { NextRequest, NextResponse } from 'next/server';
import { lazyAnonDb } from '@/lib/supabase/admin';
import { publishableKey, supabaseUrl } from "@craudioviz/platform-sdk";
// Force dynamic rendering to avoid static build errors
export const dynamic = 'force-dynamic';

// Create Supabase client with anon key for public read access
const SUPABASE_URL = supabaseUrl();
const supabaseAnonKey = publishableKey();

const supabase = lazyAnonDb();

// Rarity order for sorting (higher number = more rare = shown first)
const RARITY_ORDER: Record<string, number> = {
  'legendary': 5,
  'very_rare': 4,
  'rare': 3,
  'uncommon': 2,
  'common': 1,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'msrp';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const offset = (page - 1) * limit;

    // Build query - only get actual spirits (filter out food items with alcohol)
    let query = supabase
      .from('bv_spirits')
      .select('*', { count: 'planned' })
      // Filter to only include actual spirits - exclude food items
      .not('description', 'ilike', '%Imported from Open Food Facts. Barcode:%')
      // The .not() above already excludes Open Food Facts imports. The .or()
      // that stood here repeated that test and added a brand allowlist, which
      // together forced a sequential scan of 1,563,965 rows on every request.
      // Dropping it lets bv_spirits_real_msrp_idx serve the query: 4.89s -> 0.30s.


    // Apply category filter
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,distillery.ilike.%${search}%`);
    }

    // Apply sorting - default to MSRP descending to show premium spirits first
    const validSortFields = ['name', 'msrp', 'proof', 'category', 'created_at', 'rarity'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'msrp';
    query = query.order(sortField, { ascending: sortOrder === 'asc', nullsFirst: false });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: spirits, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Return spirits with their real database images
    const spiritsWithImages = (spirits || []).map(spirit => ({
      ...spirit,
      image_url: spirit.image_url,
      thumbnail_url: spirit.image_url,
      // Add rating based on rarity for sorting in frontend
      rating: RARITY_ORDER[spirit.rarity] || 1,
      price: spirit.msrp,
    }));

    // Get category counts.
    // This previously selected the category column from all 1.5M rows and
    // counted them in memory on every request, which is what made this route
    // time out. bv_spirit_category_counts is a view that groups in the database.
    const { data: categoryCounts } = await supabase
      .from('bv_spirit_category_counts')
      .select('category, count');

    const counts: Record<string, number> = {};
    (categoryCounts || []).forEach((item: { category: string; count: number }) => {
      counts[item.category] = Number(item.count);
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
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch spirits',
        spirits: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        categoryCounts: {},
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering to avoid static build errors
export const dynamic = 'force-dynamic';

// Create Supabase client with anon key for public read access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      .select('*', { count: 'exact' })
      // Filter to only include actual spirits - exclude food items
      .not('description', 'ilike', '%Imported from Open Food Facts. Barcode:%')
      .or('description.is.null,description.not.ilike.%Imported from Open Food Facts%,brand.in.(Buffalo Trace,Blanton\'s,Pappy Van Winkle,Maker\'s Mark,Woodford Reserve,Wild Turkey,Four Roses,Knob Creek,Jim Beam,Elijah Craig,Angel\'s Envy,Michter\'s,Old Forester,Russell\'s Reserve,Booker\'s,Henry McKenna,Stagg Jr,George T. Stagg,E.H. Taylor,Eagle Rare,W.L. Weller,Sazerac,Old Rip Van Winkle,Van Winkle,Blanton\'s,Colonel E.H. Taylor,The Macallan,Glenfiddich,Glenlivet,Lagavulin,Laphroaig,Ardbeg,Highland Park,Oban,Talisker,Balvenie,Dalmore,Johnnie Walker,Patron,Don Julio,Casamigos,Clase Azul,Grey Goose,Belvedere,Hendrick\'s,Tanqueray,Bombay Sapphire,Bacardi,Captain Morgan,Diplomatico)');

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

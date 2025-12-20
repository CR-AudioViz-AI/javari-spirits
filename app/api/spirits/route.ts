import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with anon key for public read access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

    // FIXED: Return spirits exactly as they are from the database
    // The database has REAL product images from OpenFoodFacts, Buffalo Trace Media Kit, etc.
    // DO NOT replace with generic Unsplash fallbacks!
    const spiritsWithImages = (spirits || []).map(spirit => ({
      ...spirit,
      // Use the database image_url directly - no fallbacks
      image_url: spirit.image_url,
      thumbnail_url: spirit.image_url, // Use same real image for thumbnails
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

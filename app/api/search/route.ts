/**
 * ADVANCED SPIRITS SEARCH API
 * ===========================
 * Full-text search with fuzzy matching, filters, and faceted results
 * 
 * GET /api/search?q=buffalo&category=bourbon&minRating=4&priceRange=50-100
 * 
 * Features:
 * - Fuzzy text search across name, brand, distillery
 * - Category/subcategory filtering
 * - Price range filtering
 * - Rating filtering
 * - Country/region filtering
 * - ABV range filtering
 * - Faceted counts for filter options
 * - Pagination with cursor support
 * - Sort options (relevance, rating, price, name)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

// ============================================
// TYPES
// ============================================

interface SearchFilters {
  q?: string;
  category?: string;
  subcategory?: string;
  country?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minAbv?: number;
  maxAbv?: number;
  hasImage?: boolean;
  hasTastingNotes?: boolean;
  sort?: 'relevance' | 'rating' | 'price_asc' | 'price_desc' | 'name' | 'newest';
  limit?: number;
  offset?: number;
}

interface Facets {
  categories: { value: string; count: number }[];
  countries: { value: string; count: number }[];
  priceRanges: { label: string; min: number; max: number; count: number }[];
  ratingRanges: { label: string; min: number; count: number }[];
}

// ============================================
// MAIN HANDLER
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters: SearchFilters = {
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      subcategory: searchParams.get('subcategory') || undefined,
      country: searchParams.get('country') || undefined,
      region: searchParams.get('region') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
      minAbv: searchParams.get('minAbv') ? parseFloat(searchParams.get('minAbv')!) : undefined,
      maxAbv: searchParams.get('maxAbv') ? parseFloat(searchParams.get('maxAbv')!) : undefined,
      hasImage: searchParams.get('hasImage') === 'true',
      hasTastingNotes: searchParams.get('hasTastingNotes') === 'true',
      sort: (searchParams.get('sort') as SearchFilters['sort']) || 'relevance',
      limit: Math.min(parseInt(searchParams.get('limit') || '24'), 100),
      offset: parseInt(searchParams.get('offset') || '0'),
    };
    
    // Build query
    let query = supabase
      .from('bv_spirits')
      .select('id, name, brand, category, subcategory, image_url, abv, msrp, country, region, community_rating, rating_count, description', { count: 'exact' });
    
    // Text search with fuzzy matching
    if (filters.q && filters.q.trim()) {
      const searchTerm = filters.q.trim();
      // Use ilike for fuzzy matching across multiple fields
      query = query.or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,distillery.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
    }
    
    // Category filter
    if (filters.category) {
      query = query.eq('category', filters.category.toLowerCase());
    }
    
    // Subcategory filter
    if (filters.subcategory) {
      query = query.eq('subcategory', filters.subcategory);
    }
    
    // Country filter
    if (filters.country) {
      query = query.eq('country', filters.country);
    }
    
    // Region filter
    if (filters.region) {
      query = query.eq('region', filters.region);
    }
    
    // Price range filter
    if (filters.minPrice !== undefined) {
      query = query.gte('msrp', filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte('msrp', filters.maxPrice);
    }
    
    // Rating filter
    if (filters.minRating !== undefined) {
      query = query.gte('community_rating', filters.minRating);
    }
    
    // ABV range filter
    if (filters.minAbv !== undefined) {
      query = query.gte('abv', filters.minAbv);
    }
    if (filters.maxAbv !== undefined) {
      query = query.lte('abv', filters.maxAbv);
    }
    
    // Has image filter
    if (filters.hasImage) {
      query = query.not('image_url', 'is', null);
    }
    
    // Has tasting notes filter
    if (filters.hasTastingNotes) {
      query = query.not('tasting_notes', 'is', null);
    }
    
    // Sorting
    switch (filters.sort) {
      case 'rating':
        query = query.order('community_rating', { ascending: false, nullsFirst: false });
        break;
      case 'price_asc':
        query = query.order('msrp', { ascending: true, nullsFirst: false });
        break;
      case 'price_desc':
        query = query.order('msrp', { ascending: false, nullsFirst: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'relevance':
      default:
        // For relevance, prioritize items with ratings and images
        query = query
          .order('community_rating', { ascending: false, nullsFirst: false })
          .order('rating_count', { ascending: false, nullsFirst: false });
        break;
    }
    
    // Pagination
    query = query.range(filters.offset!, filters.offset! + filters.limit! - 1);
    
    // Execute search
    const { data: spirits, error, count } = await query;
    
    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
    
    // Get facets for filtering UI
    const facets = await getFacets(filters);
    
    // Calculate pagination info
    const totalResults = count || 0;
    const totalPages = Math.ceil(totalResults / filters.limit!);
    const currentPage = Math.floor(filters.offset! / filters.limit!) + 1;
    
    return NextResponse.json({
      success: true,
      data: {
        spirits: spirits || [],
        facets,
        pagination: {
          total: totalResults,
          limit: filters.limit,
          offset: filters.offset,
          currentPage,
          totalPages,
          hasMore: filters.offset! + filters.limit! < totalResults,
        },
        filters: filters,
      },
    });
    
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// FACETS HELPER
// ============================================

async function getFacets(currentFilters: SearchFilters): Promise<Facets> {
  // Get category counts
  const { data: categoryData } = await supabase
    .from('bv_spirits')
    .select('category')
    .not('category', 'is', null);
  
  const categoryCounts: Record<string, number> = {};
  for (const item of categoryData || []) {
    const cat = item.category?.toLowerCase();
    if (cat) {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
  }
  
  const categories = Object.entries(categoryCounts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
  
  // Get country counts
  const { data: countryData } = await supabase
    .from('bv_spirits')
    .select('country')
    .not('country', 'is', null);
  
  const countryCounts: Record<string, number> = {};
  for (const item of countryData || []) {
    if (item.country) {
      countryCounts[item.country] = (countryCounts[item.country] || 0) + 1;
    }
  }
  
  const countries = Object.entries(countryCounts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
  
  // Price range counts
  const priceRanges = [
    { label: 'Under $25', min: 0, max: 25 },
    { label: '$25 - $50', min: 25, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $200', min: 100, max: 200 },
    { label: '$200+', min: 200, max: 999999 },
  ];
  
  const priceRangesWithCounts = await Promise.all(
    priceRanges.map(async (range) => {
      const { count } = await supabase
        .from('bv_spirits')
        .select('*', { count: 'exact', head: true })
        .gte('msrp', range.min)
        .lt('msrp', range.max);
      
      return { ...range, count: count || 0 };
    })
  );
  
  // Rating range counts
  const ratingRanges = [
    { label: '4+ Stars', min: 4 },
    { label: '3+ Stars', min: 3 },
    { label: '2+ Stars', min: 2 },
  ];
  
  const ratingRangesWithCounts = await Promise.all(
    ratingRanges.map(async (range) => {
      const { count } = await supabase
        .from('bv_spirits')
        .select('*', { count: 'exact', head: true })
        .gte('community_rating', range.min);
      
      return { ...range, count: count || 0 };
    })
  );
  
  return {
    categories,
    countries,
    priceRanges: priceRangesWithCounts,
    ratingRanges: ratingRangesWithCounts,
  };
}

// ============================================
// AUTOCOMPLETE ENDPOINT
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit = 10 } = body;
    
    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }
    
    // Search for matching spirits
    const { data: spirits } = await supabase
      .from('bv_spirits')
      .select('id, name, brand, category, image_url')
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
      .limit(limit);
    
    // Search for matching brands
    const { data: brands } = await supabase
      .from('bv_spirits')
      .select('brand')
      .ilike('brand', `%${query}%`)
      .not('brand', 'is', null);
    
    // Dedupe brands
    const uniqueBrands = [...new Set((brands || []).map(b => b.brand))].slice(0, 5);
    
    // Search for matching categories
    const { data: categories } = await supabase
      .from('bv_spirits')
      .select('category')
      .ilike('category', `%${query}%`)
      .not('category', 'is', null);
    
    const uniqueCategories = [...new Set((categories || []).map(c => c.category))].slice(0, 5);
    
    return NextResponse.json({
      suggestions: {
        spirits: (spirits || []).map(s => ({
          type: 'spirit',
          id: s.id,
          name: s.name,
          brand: s.brand,
          category: s.category,
          image_url: s.image_url,
        })),
        brands: uniqueBrands.map(b => ({
          type: 'brand',
          name: b,
        })),
        categories: uniqueCategories.map(c => ({
          type: 'category',
          name: c,
        })),
      },
    });
    
  } catch (error: any) {
    console.error('Autocomplete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

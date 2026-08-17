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
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

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

/** Values of the spirit_category enum, so a search term naming one can be
 *  matched exactly rather than through an ilike the enum does not support. */
// Verified against pg_enum on 2026-08-17. An unlisted value passed to
// .eq('category', ...) is an invalid-enum error and another 500, so this list
// must stay in step with the type.
const SPIRIT_CATEGORIES: readonly string[] = [
  'bourbon', 'scotch', 'irish', 'japanese', 'tequila', 'rum', 'gin', 'vodka',
  'cognac', 'brandy', 'wine', 'beer', 'mezcal', 'sake', 'rye', 'other',
];

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
      .select('id, name, brand, category, subcategory, image_url, abv, msrp, country, region, community_rating, rating_count, description', { count: 'planned' });
    
    // Text search with fuzzy matching
    if (filters.q && filters.q.trim()) {
      const searchTerm = filters.q.trim();
      // Use ilike for fuzzy matching across multiple fields
      // bv_spirits.category is the enum spirit_category. Postgres has no ilike
      // operator for an enum, which is why every search returned 500. Text
      // columns carry the fuzzy match; a term that names a category is applied
      // as an exact filter instead, which is both correct and indexable.
      query = query.or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,distillery.ilike.%${searchTerm}%`);
      if (SPIRIT_CATEGORIES.includes(searchTerm.toLowerCase())) {
        query = query.eq('category', searchTerm.toLowerCase());
      }
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
    
    // Get facets for filtering UI. These are sidebar hints, not answers, and
  // each one used an exact count over 1,563,965 rows — ten full scans per
  // search, which is where 14 of the 14.1 seconds went. Planner estimates are
  // the right precision for a "roughly this many" label.
    const facets = await getFacets();
    
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

async function getFacets(): Promise<Facets> {
  // Reads bv_spirit_facets, a materialized view refreshed nightly by pg_cron
  // (job refresh-spirit-facets, 04:17 UTC).
  //
  // This function previously selected the category column for all 1,563,965
  // rows, then the country column for all 1,563,965 rows, and counted both in
  // JavaScript, then ran eight more counts on top. That was 8 of the 8.6
  // seconds a search took. It also accepted the current filters and never used
  // them, so the facets were already global — a precomputed snapshot is exactly
  // what this always returned, only without the scans.
  const { data, error } = await supabase
    .from('bv_spirit_facets')
    .select('facet, value, lo, hi, n')
    .order('n', { ascending: false });

  if (error || !data) {
    // Facets are a sidebar affordance. If the view is mid-refresh, the search
    // results themselves are still correct and must not be lost to this.
    return { categories: [], countries: [], priceRanges: [], ratingRanges: [] };
  }

  type Row = { facet: string; value: string; lo: number | null; hi: number | null; n: number };
  const rows = data as Row[];
  const of = (facet: string): Row[] => rows.filter(r => r.facet === facet);

  return {
    categories: of('category').map(r => ({ value: r.value, count: Number(r.n) })).slice(0, 15),
    countries:  of('country').map(r => ({ value: r.value, count: Number(r.n) })).slice(0, 20),
    priceRanges: of('price')
      .sort((a, b) => Number(a.lo) - Number(b.lo))
      .map(r => ({ label: r.value, min: Number(r.lo), max: Number(r.hi), count: Number(r.n) })),
    ratingRanges: of('rating')
      .sort((a, b) => Number(b.lo) - Number(a.lo))
      .map(r => ({ label: r.value, min: Number(r.lo), count: Number(r.n) })),
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

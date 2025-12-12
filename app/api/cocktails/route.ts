import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get('difficulty');
    const glassType = searchParams.get('glass');
    const search = searchParams.get('search');
    const cocktailId = searchParams.get('id');
    const slug = searchParams.get('slug');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get single cocktail by ID or slug
    if (cocktailId || slug) {
      let query = supabase
        .from('bv_cocktails')
        .select('*');
      
      if (cocktailId) {
        query = query.eq('id', cocktailId);
      } else if (slug) {
        query = query.eq('slug', slug);
      }

      const { data, error } = await query.single();

      if (error) throw error;

      // Get ingredients
      const { data: ingredients } = await supabase
        .from('bv_cocktail_ingredients')
        .select('*')
        .eq('cocktail_id', data.id)
        .order('sort_order');

      return NextResponse.json({
        success: true,
        cocktail: {
          ...data,
          ingredients: ingredients || []
        }
      });
    }

    // List cocktails
    let query = supabase
      .from('bv_cocktails')
      .select('*')
      .order('name');

    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty);
    }

    if (glassType && glassType !== 'all') {
      query = query.eq('glass_type', glassType);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query.limit(limit);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      cocktails: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Cocktails API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cocktails' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, cocktailId, action, rating, notes } = body;

    if (!cocktailId) {
      return NextResponse.json(
        { success: false, error: 'Cocktail ID required' },
        { status: 400 }
      );
    }

    if (action === 'favorite' && userId) {
      const { data, error } = await supabase
        .from('bv_user_favorites')
        .insert({
          user_id: userId,
          item_type: 'cocktail',
          item_id: cocktailId
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // Already favorited, remove it
          await supabase
            .from('bv_user_favorites')
            .delete()
            .eq('user_id', userId)
            .eq('item_id', cocktailId)
            .eq('item_type', 'cocktail');

          return NextResponse.json({
            success: true,
            message: 'Removed from favorites'
          });
        }
        throw error;
      }

      return NextResponse.json({
        success: true,
        message: 'Added to favorites'
      });
    }

    if (action === 'made' && userId) {
      const { error } = await supabase
        .from('bv_cocktail_makes')
        .insert({
          user_id: userId,
          cocktail_id: cocktailId,
          rating,
          notes,
          made_at: new Date().toISOString()
        });

      if (error) throw error;

      // Award proof points
      await supabase.rpc('add_proof_points', {
        p_user_id: userId,
        p_points: 10,
        p_reason: 'Made a cocktail'
      });

      return NextResponse.json({
        success: true,
        message: 'Cocktail make recorded!',
        proofAwarded: 10
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Cocktail action error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process action' },
      { status: 500 }
    );
  }
}

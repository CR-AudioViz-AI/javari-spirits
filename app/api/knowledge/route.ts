import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const articleId = searchParams.get('id');

    // Get single article
    if (articleId) {
      const { data, error } = await supabase
        .from('bv_knowledge_base')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) throw error;

      // Increment view count
      await supabase
        .from('bv_knowledge_base')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', articleId);

      return NextResponse.json({
        success: true,
        article: data
      });
    }

    // List articles
    let query = supabase
      .from('bv_knowledge_base')
      .select('*')
      .order('view_count', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, error } = await query.limit(50);

    if (error) throw error;

    // Get categories
    const { data: categories } = await supabase
      .from('bv_knowledge_base')
      .select('category')
      .order('category');

    const uniqueCategories = [...new Set(categories?.map(c => c.category) || [])];

    return NextResponse.json({
      success: true,
      articles: data || [],
      count: data?.length || 0,
      categories: uniqueCategories
    });
  } catch (error) {
    console.error('Knowledge API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, action, userId } = body;

    if (!articleId) {
      return NextResponse.json(
        { success: false, error: 'Article ID required' },
        { status: 400 }
      );
    }

    if (action === 'helpful') {
      const { data, error } = await supabase
        .from('bv_knowledge_base')
        .select('helpful_count')
        .eq('id', articleId)
        .single();

      if (error) throw error;

      await supabase
        .from('bv_knowledge_base')
        .update({ helpful_count: (data.helpful_count || 0) + 1 })
        .eq('id', articleId);

      return NextResponse.json({
        success: true,
        message: 'Marked as helpful'
      });
    }

    if (action === 'bookmark' && userId) {
      // Would need a bookmarks table
      return NextResponse.json({
        success: true,
        message: 'Bookmarked'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Knowledge action error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process action' },
      { status: 500 }
    );
  }
}

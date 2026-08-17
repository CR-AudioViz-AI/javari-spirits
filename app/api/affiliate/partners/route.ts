import { NextRequest, NextResponse } from 'next/server';
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    let query = supabase
      .from('bv_affiliate_partners')
      .select(`
        id,
        partner_name,
        partner_slug,
        category,
        description,
        logo_url,
        website_url,
        affiliate_url,
        commission_rate,
        cookie_duration_days,
        avg_order_value,
        rating,
        features,
        badge,
        status
      `)
      .eq('status', 'active')
      .order('rating', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by category for the frontend
    const grouped = (data || []).reduce((acc, partner) => {
      const cat = partner.category;
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(partner);
      return acc;
    }, {} as Record<string, typeof data>);

    return NextResponse.json({
      partners: data,
      byCategory: grouped,
      total: data?.length || 0
    });

  } catch (error) {
    console.error('Error fetching affiliate partners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

// Admin endpoint to add/update partners
export async function POST(request: NextRequest) {
  try {
    // Check for admin authorization
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY;
    
    if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const {
      partner_name,
      partner_slug,
      category,
      description,
      logo_url,
      website_url,
      affiliate_url,
      affiliate_network,
      affiliate_id,
      commission_rate,
      commission_type,
      cookie_duration_days,
      avg_order_value,
      rating,
      features,
      badge,
      status,
      terms_url,
      notes
    } = body;

    // Validate required fields
    if (!partner_name || !partner_slug || !category || !affiliate_url) {
      return NextResponse.json(
        { error: 'Missing required fields: partner_name, partner_slug, category, affiliate_url' },
        { status: 400 }
      );
    }

    // Upsert partner (insert or update on conflict)
    const { data, error } = await supabase
      .from('bv_affiliate_partners')
      .upsert({
        partner_name,
        partner_slug,
        category,
        description,
        logo_url,
        website_url,
        affiliate_url,
        affiliate_network,
        affiliate_id,
        commission_rate,
        commission_type: commission_type || 'percentage',
        cookie_duration_days,
        avg_order_value,
        rating,
        features,
        badge,
        status: status || 'active',
        terms_url,
        notes,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'partner_slug'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      partner: data
    });

  } catch (error) {
    console.error('Error saving partner:', error);
    return NextResponse.json(
      { error: 'Failed to save partner' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const partner = searchParams.get('partner');
  const redirect = searchParams.get('redirect');
  const source = searchParams.get('source') || 'unknown';

  if (!partner || !redirect) {
    return NextResponse.json(
      { error: 'Missing partner or redirect parameter' },
      { status: 400 }
    );
  }

  try {
    // Get partner info from database
    const { data: partnerData } = await supabase
      .from('bv_affiliate_partners')
      .select('id, affiliate_url')
      .eq('partner_slug', partner)
      .eq('status', 'active')
      .single();

    // Get device info from headers
    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Determine device type
    let deviceType = 'desktop';
    if (/mobile/i.test(userAgent)) deviceType = 'mobile';
    else if (/tablet|ipad/i.test(userAgent)) deviceType = 'tablet';

    // Generate session ID for anonymous tracking
    const sessionId = request.cookies.get('bv_session')?.value || 
                      `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Record the click
    await supabase.from('bv_affiliate_clicks').insert({
      partner_id: partnerData?.id || null,
      partner_slug: partner,
      session_id: sessionId,
      source_page: source,
      source_component: searchParams.get('component') || null,
      ip_address: ip,
      user_agent: userAgent,
      referrer: request.headers.get('referer') || null,
      device_type: deviceType,
    });

    // Determine final redirect URL
    let finalUrl = redirect;
    if (partnerData?.affiliate_url) {
      // Use the stored affiliate URL if available
      finalUrl = partnerData.affiliate_url;
    }

    // Decode the URL if it was encoded
    try {
      finalUrl = decodeURIComponent(finalUrl);
    } catch {
      // URL wasn't encoded, use as-is
    }

    // Redirect to affiliate
    const response = NextResponse.redirect(finalUrl);
    
    // Set session cookie if not present
    if (!request.cookies.get('bv_session')) {
      response.cookies.set('bv_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }

    return response;

  } catch (error) {
    console.error('Affiliate click tracking error:', error);
    // Still redirect even if tracking fails
    try {
      return NextResponse.redirect(decodeURIComponent(redirect));
    } catch {
      return NextResponse.redirect(redirect);
    }
  }
}

// POST endpoint for AJAX tracking (non-redirect)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partner, source, component, destination } = body;

    if (!partner) {
      return NextResponse.json(
        { error: 'Missing partner parameter' },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    
    let deviceType = 'desktop';
    if (/mobile/i.test(userAgent)) deviceType = 'mobile';
    else if (/tablet|ipad/i.test(userAgent)) deviceType = 'tablet';

    const sessionId = request.cookies.get('bv_session')?.value || 
                      `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get partner ID
    const { data: partnerData } = await supabase
      .from('bv_affiliate_partners')
      .select('id')
      .eq('partner_slug', partner)
      .single();

    // Record click
    const { data, error } = await supabase.from('bv_affiliate_clicks').insert({
      partner_id: partnerData?.id || null,
      partner_slug: partner,
      session_id: sessionId,
      source_page: source || 'unknown',
      source_component: component || null,
      ip_address: ip,
      user_agent: userAgent,
      referrer: request.headers.get('referer') || null,
      device_type: deviceType,
    }).select('id').single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      clickId: data?.id,
      sessionId 
    });

  } catch (error) {
    console.error('Affiliate click tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}

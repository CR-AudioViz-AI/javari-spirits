// app/api/alerts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireCaller } from '@/lib/api/caller';
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

// GET - List user's price alerts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // 2026-09-04: identity from the token, never the query string.
  const _c = await requireCaller(request);
  if (!_c.ok) return _c.res;
  const userId = _c.userId;

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('bv_price_alerts')
    .select(`
      *,
      spirit:bv_spirits(id, name, brand, image_url, msrp)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ alerts: data });
}

// POST - Create new price alert
export async function POST(request: NextRequest) {
  try {
    // user id deliberately not taken from the body.
    const {spiritId, targetPrice, alertType} = await request.json();
    const _c = await requireCaller(request);
    if (!_c.ok) return _c.res;
    const userId = _c.userId;

    if (!userId || !spiritId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check user's subscription limits
    const { data: sub } = await supabase
      .from('bv_subscriptions')
      .select('plan')
      .eq('user_id', userId)
      .single();

    const plan = sub?.plan || 'free';
    const limits: Record<string, number> = {
      free: 3,
      collector: 10,
      connoisseur: Infinity,
      sommelier: Infinity,
    };

    // Count existing alerts
    const { count } = await supabase
      .from('bv_price_alerts')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_active', true);

    if ((count || 0) >= limits[plan]) {
      return NextResponse.json({
        error: 'Alert limit reached',
        upgrade: true,
        message: `You've reached your ${limits[plan]} price alert limit. Upgrade to add more!`
      }, { status: 429 });
    }

    // Create alert
    const { data, error } = await supabase
      .from('bv_price_alerts')
      .insert({
        user_id: userId,
        spirit_id: spiritId,
        target_price: targetPrice,
        alert_type: alertType || 'below',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ alert: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove price alert
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const alertId = searchParams.get('id');
  // 2026-09-04: identity from the token, never the query string.
  const _c = await requireCaller(request);
  if (!_c.ok) return _c.res;
  const userId = _c.userId;

  if (!alertId || !userId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { error } = await supabase
    .from('bv_price_alerts')
    .delete()
    .eq('id', alertId)
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

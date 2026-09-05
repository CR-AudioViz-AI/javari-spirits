// 2026-09-04: table names corrected against the live schema. These are renames
// the code never caught up with - bv_user_profiles and bv_users are both
// bv_profiles, bv_activity_log is bv_activities, bv_tickets is
// bv_support_tickets. Each returned PostgREST 42P01 and failed the WHOLE
// query, so every feature built on them returned nothing.
//
// Only verified renames were applied. bv_tasting_sessions and bv_user_favorites
// look like renames and are NOT: their columns do not exist in any candidate
// table, so they are unbuilt features and repointing them would swap a loud
// failure for a silent wrong answer.
// app/api/distilleries/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { lazyAdminDb } from '@/lib/supabase/admin';
import { requireCaller } from '@/lib/api/caller';
const supabase = lazyAdminDb()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const region = searchParams.get('region')
  const country = searchParams.get('country')
  const search = searchParams.get('search')
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    let query = supabase
      .from('bv_distilleries')
      .select('*')
      .order('name')
      .limit(limit)

    if (region) {
      query = query.eq('region', region)
    }
    if (country) {
      query = query.eq('country', country)
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,region.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) throw error

    // Get unique regions for filtering
    const { data: regions } = await supabase
      .from('bv_distilleries')
      .select('region')
      .not('region', 'is', null)
      .order('region')

    const regionArray = regions?.map(r => r.region).filter(Boolean) || []
    const uniqueRegions = Array.from(new Set(regionArray))

    return NextResponse.json({
      success: true,
      distilleries: data,
      count: data?.length || 0,
      regions: uniqueRegions
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Record distillery visit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // user id deliberately not taken from the body.
    const { distilleryId, visitDate, notes, rating } = body
    const _c = await requireCaller(request)
    if (!_c.ok) return _c.res
    const userId = _c.userId

    if (!distilleryId) {
      return NextResponse.json({ error: 'User ID and Distillery ID required' }, { status: 400 })
    }

    // Check for duplicate visit
    const { data: existing } = await supabase
      .from('bv_distillery_visits')
      .select('id')
      .eq('user_id', userId)
      .eq('distillery_id', distilleryId)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Visit already recorded' }, { status: 409 })
    }

    // Record the visit
    const { data, error } = await supabase
      .from('bv_distillery_visits')
      .insert({
        user_id: userId,
        distillery_id: distilleryId,
        visit_date: visitDate || new Date().toISOString(),
        notes,
        rating
      })
      .select()
      .single()

    if (error) throw error

    // Award proof points
    await supabase
      .from('bv_profiles')
      .update({ 
        proof_points: supabase.rpc('increment_points', { amount: 25 })
      })
      .eq('id', userId)

    return NextResponse.json({
      success: true,
      visit: data,
      pointsAwarded: 25
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

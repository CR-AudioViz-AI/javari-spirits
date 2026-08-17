// app/api/distilleries/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { lazyAdminDb } from '@/lib/supabase/admin';
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
    const { userId, distilleryId, visitDate, notes, rating } = body

    if (!userId || !distilleryId) {
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
      .from('bv_user_profiles')
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

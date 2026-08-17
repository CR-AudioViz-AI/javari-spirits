// app/api/wishlist/route.ts — the hunt list
//
// What a collector is looking for, which is a different thing from what they
// own. Kept private: what someone is hunting reveals what they will overpay
// for, and a public wishlist is a gift to anyone selling to them.
//
// IT ACCEPTS UNCATALOGUED BOTTLES. The original table keyed on a catalogue
// reference, but a wishlist entry is almost always something never owned and
// often not catalogued at all — 'Pappy 23' typed from memory. A wishlist that
// rejects those rejects exactly the bottles people most want to track.
//
// ACQUIRING FROM THE WISHLIST ADDS TO THE SHELF. Marking something found and
// then having to type it again is the kind of small friction that makes people
// stop using a feature.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  const { data, error } = await db()
    .from('collector_wishlists')
    .select('*')
    .eq('user_id', userId)
    .eq('domain', 'spirits')
    .order('acquired')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = data ?? []
  return NextResponse.json({
    items: rows,
    totals: {
      hunting: rows.filter(r => !r.acquired).length,
      found: rows.filter(r => r.acquired).length,
      // What the whole hunt would cost at the prices they said they would pay.
      budget: rows.filter(r => !r.acquired)
        .reduce((n, r) => n + Number(r.max_price ?? r.target_price ?? 0), 0),
    },
  })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let b: {
    userId: string; name: string; brand?: string; category?: string
    maxPrice?: number; priority?: number; notes?: string; imageUrl?: string
  }
  try { b = await request.json() } catch {
    return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 })
  }
  if (!b.userId || !b.name?.trim()) {
    return NextResponse.json({ error: 'userId and name are required' }, { status: 400 })
  }
  const { data, error } = await db().from('collector_wishlists').insert({
    user_id: b.userId,
    domain: 'spirits',
    name: b.name.trim(),
    brand: b.brand ?? null,
    category: b.category ?? null,
    image_url: b.imageUrl ?? null,
    max_price: b.maxPrice ?? null,
    // 1 idle curiosity, 5 would drive across the state for it.
    priority: Math.max(1, Math.min(5, b.priority ?? 3)),
    notes: b.notes ?? null,
  }).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data?.id, message: 'Added to your hunt list.' })
}

/** Mark found — and put it on the shelf in the same action. */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  let b: { userId: string; id: string; acquired?: boolean; paid?: number; addToShelf?: boolean }
  try { b = await request.json() } catch {
    return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 })
  }
  if (!b.userId || !b.id) {
    return NextResponse.json({ error: 'userId and id are required' }, { status: 400 })
  }
  const supa = db()
  const { data: row } = await supa
    .from('collector_wishlists').select('*').eq('id', b.id).eq('user_id', b.userId).single()
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const acquired = b.acquired !== false
  await supa.from('collector_wishlists').update({
    acquired, acquired_at: acquired ? new Date().toISOString() : null,
  }).eq('id', b.id)

  // Marking something found and then retyping it is exactly the friction that
  // makes a feature go unused. Add it to the shelf in the same breath.
  let shelved = false
  if (acquired && b.addToShelf !== false) {
    const { error } = await supa.from('user_bottles').insert({
      user_id: b.userId,
      name: row.name, brand: row.brand, category: row.category,
      photo_url: row.image_url,
      quantity: 1, is_open: false, fill_level: null, status: 'sealed',
      purchase_price: b.paid ?? row.max_price ?? null,
      notes: row.notes,
    })
    shelved = !error
  }

  return NextResponse.json({
    ok: true, acquired, shelved,
    message: acquired
      ? shelved ? 'Found, and added to your shelf.' : 'Marked as found.'
      : 'Back on the hunt list.',
  })
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const id = request.nextUrl.searchParams.get('id')
  const userId = request.nextUrl.searchParams.get('userId')
  if (!id || !userId) return NextResponse.json({ error: 'id and userId are required' }, { status: 400 })
  const { error } = await db().from('collector_wishlists').delete().eq('id', id).eq('user_id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, message: 'Removed.' })
}

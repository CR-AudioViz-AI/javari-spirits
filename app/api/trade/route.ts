// app/api/trade/route.ts — the trade board
//
// A collector with two of something and none of another is the whole basis of
// this hobby. This is where that gets resolved.
//
// SEALED ONLY, DELIBERATELY. Trading an opened bottle is a different and far
// more fraught transaction — provenance, fill level, whether it was stored
// upright — and pretending it is the same thing invites disputes between users
// that the platform then has to arbitrate.
//
// LISTING A BOTTLE DOES NOT REMOVE IT FROM THE SHELF. It stays owned until a
// trade actually closes, because a listing is an invitation, not a commitment,
// and a collector who loses a bottle from their own records for merely offering
// it will stop offering.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/supabase/admin';
import { requireCaller } from '@/lib/api/caller';
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function db() {
  return adminDb()
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 2026-09-04: identity from the token, never the query string.
  const _c = await requireCaller(request);
  if (!_c.ok) return _c.res;
  const mine = _c.userId;const q = request.nextUrl.searchParams.get('q')
  const supa = db()

  let query = supa.from('bottle_trades').select('*').order('created_at', { ascending: false }).limit(60)
  query = mine ? query.eq('owner_id', mine) : query.eq('status', 'open')
  if (q) query = query.ilike('name', `%${q}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ trades: data ?? [], scope: mine ? 'mine' : 'board' })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let b: {
    userId: string; bottleId?: string; name: string; brand?: string
    category?: string; seeking?: string; quantity?: number
    estimatedValue?: number; location?: string; notes?: string
  }
  try { b = await request.json() } catch {
    return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 })
  }
  if (!b.userId || !b.name?.trim()) {
    return NextResponse.json({ error: 'userId and name are required' }, { status: 400 })
  }

  const supa = db()

  // If it came from the shelf, refuse to list an opened bottle rather than
  // letting the mistake surface later as an argument between two users.
  if (b.bottleId) {
    const { data: row } = await supa
      .from('user_bottles').select('id,is_open,quantity,name')
      .eq('id', b.bottleId).eq('user_id', b.userId).single()
    if (!row) return NextResponse.json({ error: 'That bottle is not in your collection' }, { status: 404 })
    if (row.is_open) {
      return NextResponse.json({
        error: 'Opened bottles cannot be listed. Trading a part-used bottle is a different transaction and this board is not built to arbitrate it.',
      }, { status: 400 })
    }
    if (Number(row.quantity) < Math.max(1, b.quantity ?? 1)) {
      return NextResponse.json({
        error: `You have ${row.quantity} sealed, so you cannot offer ${b.quantity}.`,
      }, { status: 400 })
    }
  }

  const { data, error } = await supa.from('bottle_trades').insert({
    owner_id: b.userId,
    bottle_id: b.bottleId ?? null,
    name: b.name.trim(),
    brand: b.brand ?? null,
    category: b.category ?? null,
    seeking: b.seeking ?? null,
    quantity: Math.max(1, b.quantity ?? 1),
    estimated_value: b.estimatedValue ?? null,
    location: b.location ?? null,
    notes: b.notes ?? null,
    status: 'open',
  }).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ok: true, id: data?.id,
    message: 'Listed. It stays on your shelf until a trade actually closes — a listing is an invitation, not a commitment.',
  })
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  let b: { userId: string; id: string; status: 'open' | 'pending' | 'closed' | 'withdrawn' }
  try { b = await request.json() } catch {
    return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 })
  }
  if (!b.userId || !b.id || !b.status) {
    return NextResponse.json({ error: 'userId, id and status are required' }, { status: 400 })
  }
  const { error } = await db().from('bottle_trades')
    .update({ status: b.status, updated_at: new Date().toISOString() })
    .eq('id', b.id).eq('owner_id', b.userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    ok: true, status: b.status,
    message: b.status === 'closed'
      ? 'Closed. Adjust your shelf if the bottle has actually changed hands — we do not move it for you, because only you know whether it arrived.'
      : `Marked ${b.status}.`,
  })
}

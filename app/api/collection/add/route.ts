// app/api/collection/add/route.ts — put a bottle in a collection
//
// The missing link. This app could scan a bottle and identify it, and then
// there was nowhere for it to go — which is why user_bottles has zero rows
// despite seventy pages of collection features being built.
//
// IT STACKS SEALED BOTTLES ONTO THE EXISTING CARD. Adding a second Eagle Rare
// increments the sealed row rather than creating a duplicate card, because a
// collector with twelve of something wants one card that says twelve, not
// twelve cards.
//
// AN OPENED BOTTLE IS ALWAYS ITS OWN ROW. It has a fill level, an opened date
// and its own notes. Stacking it would make those meaningless.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { normaliseName } from '@/lib/collection/model'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

interface Body {
  userId: string
  name: string
  brand?: string
  category?: string
  catalogId?: string
  barcode?: string
  bottleSize?: string
  /** How many sealed bottles to add. Ignored when opened is true. */
  quantity?: number
  /** True if this bottle is already open. */
  opened?: boolean
  /** 0-100. Only meaningful when opened. */
  fillLevel?: number
  openedDate?: string
  purchasePrice?: number
  purchaseDate?: string
  purchasePlace?: string
  marketValue?: number
  storagePlace?: string
  photoUrl?: string
  notes?: string
  rating?: number
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let b: Body
  try {
    b = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 })
  }
  if (!b.userId || !b.name?.trim()) {
    return NextResponse.json({ error: 'userId and name are required' }, { status: 400 })
  }

  const supa = db()
  const opened = Boolean(b.opened)
  const qty = opened ? 1 : Math.max(1, Math.floor(b.quantity ?? 1))
  const groupKey = b.catalogId ?? null

  // An opened bottle always gets its own row — it carries a level, a date and
  // notes that only apply to that one physical bottle.
  if (opened) {
    const { data, error } = await supa.from('user_bottles').insert({
      user_id: b.userId,
      catalog_id: groupKey,
      name: b.name.trim(),
      brand: b.brand ?? null,
      category: b.category ?? null,
      bottle_size: b.bottleSize ?? null,
      barcode: b.barcode ?? null,
      quantity: 1,
      is_open: true,
      fill_level: Math.max(0, Math.min(100, Math.round(b.fillLevel ?? 100))),
      opened_date: b.openedDate ?? new Date().toISOString().slice(0, 10),
      purchase_price: b.purchasePrice ?? null,
      purchase_date: b.purchaseDate ?? null,
      purchase_place: b.purchasePlace ?? null,
      market_value: b.marketValue ?? null,
      storage_place: b.storagePlace ?? null,
      photo_url: b.photoUrl ?? null,
      notes: b.notes ?? null,
      rating: b.rating ?? null,
      status: 'open',
    }).select('id').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({
      ok: true, action: 'added-open', bottleId: data?.id,
      message: `Added as an open bottle at ${Math.round(b.fillLevel ?? 100)}%.`,
    })
  }

  // Sealed: find an existing sealed row for the same spirit and stack onto it.
  let query = supa.from('user_bottles')
    .select('id,quantity,name,brand')
    .eq('user_id', b.userId)
    .eq('is_open', false)
    .eq('is_finished', false)
  query = groupKey
    ? query.eq('catalog_id', groupKey)
    : query.ilike('name', b.name.trim())

  const { data: existing } = await query.limit(5)
  const match = groupKey
    ? existing?.[0]
    // Without a catalogue id, match on the normalised name so a hand-typed
    // "Eagle Rare 10yr" lands on the same card as "Eagle Rare 10 Year".
    : existing?.find(r => normaliseName(String(r.name), r.brand as string | null) ===
                          normaliseName(b.name, b.brand))

  if (match) {
    const { error } = await supa.from('user_bottles')
      .update({ quantity: (match.quantity as number) + qty, updated_at: new Date().toISOString() })
      .eq('id', match.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({
      ok: true, action: 'stacked', bottleId: match.id,
      quantity: (match.quantity as number) + qty,
      message: `Now ${(match.quantity as number) + qty} sealed on this card.`,
    })
  }

  const { data, error } = await supa.from('user_bottles').insert({
    user_id: b.userId,
    catalog_id: groupKey,
    name: b.name.trim(),
    brand: b.brand ?? null,
    category: b.category ?? null,
    bottle_size: b.bottleSize ?? null,
    barcode: b.barcode ?? null,
    quantity: qty,
    is_open: false,
    fill_level: null,
    purchase_price: b.purchasePrice ?? null,
    purchase_date: b.purchaseDate ?? null,
    purchase_place: b.purchasePlace ?? null,
    market_value: b.marketValue ?? null,
    storage_place: b.storagePlace ?? null,
    photo_url: b.photoUrl ?? null,
    notes: b.notes ?? null,
    rating: b.rating ?? null,
    status: 'sealed',
  }).select('id').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    ok: true, action: 'created', bottleId: data?.id, quantity: qty,
    message: qty === 1 ? 'Added to your collection.' : `Added ${qty} sealed bottles.`,
  })
}

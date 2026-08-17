// app/api/collection/open/route.ts — open one bottle from a sealed stack
//
// The split. A card showing twelve sealed Eagle Rare becomes eleven sealed plus
// one open at 100%, and from that moment the open one has its own life — its
// own fill level, its own opened date, its own notes.
//
// THIS IS THE OPERATION THAT MAKES THE MODEL WORK. Without it a collector would
// have to delete a row and create two, which nobody does, so fill level would
// go untracked and the whole feature would be decorative.
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  let b: { userId: string; sealedRowId: string; fillLevel?: number; notes?: string }
  try {
    b = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 })
  }
  if (!b.userId || !b.sealedRowId) {
    return NextResponse.json({ error: 'userId and sealedRowId are required' }, { status: 400 })
  }

  const supa = db()
  const { data: row, error: readErr } = await supa
    .from('user_bottles').select('*').eq('id', b.sealedRowId).eq('user_id', b.userId).single()
  if (readErr || !row) {
    return NextResponse.json({ error: 'Bottle not found' }, { status: 404 })
  }
  if (row.is_open) {
    return NextResponse.json({ error: 'That bottle is already open' }, { status: 400 })
  }
  const qty = Number(row.quantity ?? 0)
  if (qty < 1) {
    return NextResponse.json({ error: 'No sealed bottles left on this card' }, { status: 400 })
  }

  const today = new Date().toISOString().slice(0, 10)
  const level = Math.max(0, Math.min(100, Math.round(b.fillLevel ?? 100)))

  // Create the open bottle first. If the decrement then failed we would have one
  // extra bottle recorded, which is a far better failure than one that vanished.
  const { data: opened, error: insErr } = await supa.from('user_bottles').insert({
    user_id: row.user_id,
      domain: 'spirits',
    catalog_id: row.catalog_id,
    reference_id: row.reference_id,
    name: row.name, brand: row.brand, category: row.category,
    distillery: row.distillery, region: row.region, country: row.country,
    vintage: row.vintage, age_statement: row.age_statement,
    abv: row.abv, proof: row.proof, bottle_size: row.bottle_size,
    barcode: row.barcode, batch_code: row.batch_code,
    quantity: 1, is_open: true, fill_level: level,
    opened_date: today, status: 'open',
    purchase_price: row.purchase_price, purchase_date: row.purchase_date,
    purchase_place: row.purchase_place, market_value: row.market_value,
    storage_place: row.storage_place, photo_url: row.photo_url,
    rating: row.rating, notes: b.notes ?? null,
  }).select('id').single()
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

  if (qty === 1) {
    // The last sealed bottle became the open one, so the sealed row goes.
    await supa.from('user_bottles').delete().eq('id', row.id)
  } else {
    await supa.from('user_bottles')
      .update({ quantity: qty - 1, updated_at: new Date().toISOString() })
      .eq('id', row.id)
  }

  return NextResponse.json({
    ok: true,
    openedBottleId: opened?.id,
    sealedRemaining: qty - 1,
    message: qty - 1 === 0
      ? 'Opened your last sealed one.'
      : `Opened. ${qty - 1} sealed still on this card.`,
  })
}

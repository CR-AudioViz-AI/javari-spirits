// app/api/collection/pour/route.ts — record a pour, drop the level
//
// A fill level nobody updates is decoration. This is the one-tap action that
// keeps it true: pour a dram, the level drops, and the pour is recorded.
//
// A POUR IS AN EVENT, NOT A NUMBER. Keeping the history means the app can tell
// a collector how fast a bottle is going and warn before a favourite runs out —
// which is the actual reason anyone tracks fill level rather than eyeballing it.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from 'next/server'
import { adminDb, NO_STORE_HEADERS } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'


/** A standard 2oz pour from a 750ml bottle is about 8%. */
const DRAM_PERCENT = 8

export async function POST(request: NextRequest): Promise<NextResponse> {
  let b: { bottleId: string; toLevel?: number; drams?: number; occasion?: string; notes?: string }
  try {
    b = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body must be JSON' }, { status: 400, headers: NO_STORE_HEADERS })
  }
  const caller = await requireUser(request)
  if (!caller.ok) {
    return NextResponse.json({ error: caller.message }, { status: caller.status, headers: NO_STORE_HEADERS })
  }
  const userId = caller.userId

  if (!b.bottleId) {
    return NextResponse.json({ error: 'bottleId is required' }, { status: 400, headers: NO_STORE_HEADERS })
  }

  const supa = adminDb()
  const { data: row, error } = await supa
    .from('user_bottles').select('id,fill_level,is_open,name')
    .eq('id', b.bottleId).eq('user_id', userId).single()
  if (error || !row) return NextResponse.json({ error: 'Bottle not found' }, { status: 404, headers: NO_STORE_HEADERS })
  if (!row.is_open) {
    return NextResponse.json({ error: 'That bottle is still sealed. Open it first.' }, { status: 400, headers: NO_STORE_HEADERS })
  }

  const from = Number(row.fill_level ?? 100)
  const to = b.toLevel !== undefined
    ? Math.max(0, Math.min(100, Math.round(b.toLevel)))
    : Math.max(0, from - DRAM_PERCENT * Math.max(1, b.drams ?? 1))

  const finished = to <= 0

  await supa.from('user_bottles').update({
    fill_level: to,
    is_finished: finished,
    finished_date: finished ? new Date().toISOString().slice(0, 10) : null,
    status: finished ? 'finished' : 'open',
    updated_at: new Date().toISOString(),
  }).eq('id', row.id)

  await supa.from('bottle_pours').insert({
    bottle_id: row.id, user_id: userId,
    from_level: from, to_level: to,
    occasion: b.occasion ?? null, notes: b.notes ?? null,
  })

  return NextResponse.json({
    ok: true, from, to, finished,
    message: finished
      ? `That was the last of it. ${row.name} is finished — it stays in your history.`
      : to <= 20
        ? `Down to ${to}%. Running low.`
        : `Now at ${to}%.`,
  }, { headers: NO_STORE_HEADERS })
}

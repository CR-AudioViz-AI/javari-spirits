// app/api/collection/list/route.ts — the collection, as cards
//
// One card per spirit with the true quantity, which is the whole point: Eagle
// Rare with twelve bottles is ONE card reading "11 sealed · 1 open at 60%",
// never twelve rows and never one row with a meaningless average.
//
// VALUE IS PRO-RATED BY WHAT IS LEFT. A nearly-empty bottle counted at full
// retail is how collection valuations become fantasy numbers. Sealed bottles
// count in full; open ones count by fill level.
//
// READS MUST NOT BE CACHED. This route hands the client a sealedRowId that
// /api/collection/open then writes against. A cached body means a stale id and
// a write that fails with "Bottle not found". Reads go through adminDb(), which
// pins cache: 'no-store' on the PostgREST fetch; see lib/supabase/admin.ts.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from 'next/server'
import { adminDb, NO_STORE_HEADERS } from '@/lib/supabase/admin'
import { describe, runningLow, toCards } from '@/lib/collection/model'
import type { BottleRow } from '@/lib/collection/model'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = request.nextUrl.searchParams.get('userId')
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400, headers: NO_STORE_HEADERS })
  }

  try {
    const supa = adminDb()
    const { data, error } = await supa
      .from('user_bottles').select('*')
      .eq('user_id', userId)
      .eq('domain', 'spirits')
      .eq('is_finished', false)
      .order('name')
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: NO_STORE_HEADERS })
    }

    const cards = toCards((data ?? []) as unknown as BottleRow[])
    const low = runningLow(cards)

    return NextResponse.json({
      cards: cards.map(c => ({ ...c, summary: describe(c) })),
      totals: {
        distinctSpirits: cards.length,
        bottles: cards.reduce((n, c) => n + c.totalBottles, 0),
        sealed: cards.reduce((n, c) => n + c.sealedCount, 0),
        open: cards.reduce((n, c) => n + c.open.length, 0),
        // Two half bottles is one bottle of liquid. Collectors ask this.
        liquidEquivalent: Math.round(cards.reduce((n, c) => n + c.liquidEquivalent, 0) * 100) / 100,
        invested: Math.round(cards.reduce((n, c) => n + c.investedValue, 0) * 100) / 100,
        currentValue: Math.round(cards.reduce((n, c) => n + c.currentValue, 0) * 100) / 100,
      },
      runningLow: low.map(c => ({ name: c.name, level: c.open[0]?.fillLevel ?? 0 })),
    }, { headers: NO_STORE_HEADERS })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unexpected error reading the collection'
    return NextResponse.json({ error: message }, { status: 500, headers: NO_STORE_HEADERS })
  }
}

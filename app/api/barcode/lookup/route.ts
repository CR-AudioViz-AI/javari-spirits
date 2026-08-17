// app/api/barcode/lookup/route.ts — Javari Spirits barcode lookup
//
// This app used to carry 38 hardcoded UPCs in a constant. That is not a
// database, it is a demo, and it would have been rebuilt again for Javari Cards
// and every collector app after it.
//
// It now calls the central identification service at craudiovizai.com/api/identify.
// One place to fix, one place to pay, and a bottle resolved here is instantly
// free for every other app in the ecosystem.
//
// WHAT THIS ROUTE ADDS ON TOP. The central service answers "what is this". This
// route answers "what is this, and what can I do with it here" — matching the
// result against our own 1.5M-row spirits catalogue so the user gets the
// tasting notes, the valuation and the collection actions rather than a bare
// product name.
//
// A MISS IS NOT AN ERROR. Roughly a third of real bottles will not be in any
// barcode database, so the response tells the caller exactly what to offer
// next: a photo for the vision model, or a name search. Returning 404 and
// stopping would make the app feel broken when it is working correctly.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 45

const IDENTIFY = process.env.IDENTIFY_SERVICE_URL ?? 'https://craudiovizai.com/api/identify'

function db() {
  return adminDb()
}

interface IdentifyResult {
  found: boolean
  via?: string
  attempted?: string[]
  result?: {
    name: string
    brand?: string
    category?: string
    imageUrl?: string
    payload?: Record<string, unknown>
    source: string
    confidence: number
    confirmed?: boolean
  }
  candidates?: Array<{ name: string; brand?: string; confidence: number; payload?: Record<string, unknown> }>
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get('barcode') ?? request.nextUrl.searchParams.get('code')
  // The scan page sends 'query'; other callers send 'q'. Accepting only one
  // would fail silently as a miss rather than an error, which is the worst kind
  // of contract mismatch — it looks like the database is thin.
  const query = request.nextUrl.searchParams.get('q') ?? request.nextUrl.searchParams.get('query')
  if (!code && !query) {
    return NextResponse.json({ error: 'barcode or q is required' }, { status: 400 })
  }

  let id: IdentifyResult
  try {
    const r = await fetch(IDENTIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code ?? undefined,
        query: query ?? undefined,
        domain: 'spirits',
        app: 'javari-spirits',
      }),
      signal: AbortSignal.timeout(30_000),
    })
    id = (await r.json()) as IdentifyResult
  } catch {
    return NextResponse.json({
      found: false,
      error: 'The identification service did not respond.',
      next: 'retry',
    }, { status: 502 })
  }

  // A name search returns candidates for a human to choose between. Passing
  // them through untouched matters — presenting a 0.55 guess as a confirmed
  // match is how a collection fills with wrong bottles.
  if (id.candidates) {
    return NextResponse.json({
      success: id.found, found: id.found, mode: 'candidates', candidates: id.candidates,
      message: 'Pick the right one — these are name matches, not confirmed identifications.',
    })
  }

  if (!id.found || !id.result) {
    return NextResponse.json({
      success: false, found: false,
      barcode: code,
      attempted: id.attempted ?? [],
      // A miss is expected, not broken. Say what to do about it.
      next: ['photo', 'search', 'manual'],
      message:
        'Not in any barcode database. Take a photo of the label and we will read it, ' +
        'search by name, or enter it by hand — anything you enter becomes a confirmed ' +
        'record, so the next person who scans this bottle gets it instantly.',
    })
  }

  // Enrich against our own catalogue so the user gets a spirit, not a product.
  const supa = db()
  const r = id.result
  let spirit: Record<string, unknown> | null = null

  const spiritId = r.payload?.spiritId
  if (spiritId) {
    const { data } = await supa.from('bv_spirits').select('*').eq('id', spiritId).limit(1)
    spirit = data?.[0] ?? null
  }
  if (!spirit && r.name) {
    // Match on the distinctive words rather than the whole title: a barcode
    // database calls it "BUFFALO TRACE BBN 1.75L 90PF" and our catalogue calls
    // it "Buffalo Trace Kentucky Straight Bourbon".
    const words = r.name.replace(/[^a-z0-9\s]/gi, ' ').split(/\s+/)
      .filter(w => w.length > 3 && !/^\d+$/.test(w)).slice(0, 3)
    if (words.length) {
      const { data } = await supa
        .from('bv_spirits')
        .select('id,name,brand,category,image_url,abv,msrp,description')
        .ilike('name', `%${words.join('%')}%`)
        .limit(1)
      spirit = data?.[0] ?? null
    }
  }

  // 'success' mirrors 'found' so the existing scan page works without edits.
  return NextResponse.json({
    success: true, found: true,
    barcode: code,
    via: id.via,
    identified: {
      name: r.name, brand: r.brand, category: r.category,
      imageUrl: r.imageUrl, confidence: r.confidence,
      confirmed: r.confirmed ?? false, source: r.source,
    },
    // Present when we know the bottle, absent when we only know the product.
    spirit,
    actions: spirit
      ? ['add_to_collection', 'value', 'tasting_notes', 'find_similar']
      : ['add_to_collection', 'suggest_catalogue_entry'],
    message: spirit
      ? 'Matched to our catalogue.'
      : 'Identified, but not yet in our spirits catalogue. Adding it to your collection will create the entry.',
  })
}

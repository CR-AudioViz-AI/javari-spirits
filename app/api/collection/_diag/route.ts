// app/api/collection/_diag/route.ts — what does the running app actually see?
//
// Three rounds of speculative fixes is two too many. PostgREST returns is_open
// correctly when queried directly with the service key, and the deployed route
// reports every row as sealed. One of the assumptions in between is wrong and
// guessing which has already cost more than measuring would have.
//
// This reports, without interpretation: which Supabase URL the app resolved,
// the role encoded in the key it is using, and the exact column set coming back
// on a real row. Whichever of those is unexpected is the bug.
//
// Gated behind ADMIN_SECRET. A diagnostic that names a key's role and the
// project it points at is not something to leave open.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Decode a JWT payload without verifying it. Enough to read role and ref. */
function peek(jwt: string): Record<string, unknown> | null {
  try {
    const part = jwt.split('.')[1]
    const json = Buffer.from(part.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.ADMIN_SECRET
  const auth = request.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  const claims = key ? peek(key) : null

  const userId = request.nextUrl.searchParams.get('userId') ?? ''
  const supa = createClient(url, key, { auth: { persistSession: false } })

  const { data, error } = await supa
    .from('user_bottles').select('*').eq('user_id', userId).limit(3)

  return NextResponse.json({
    // Which project and which role is this process actually using?
    resolved: {
      url,
      keyLength: key.length,
      keyRole: claims?.role ?? null,
      keyRef: claims?.ref ?? null,
      // The vault shim proxies process.env, so this says whether the value
      // came from Vercel or was substituted at runtime.
      adminSecretPresent: Boolean(secret),
    },
    query: {
      rows: data?.length ?? 0,
      error: error?.message ?? null,
      // The whole question: does the running app see is_open at all?
      columnsSeen: data?.[0] ? Object.keys(data[0]).sort() : [],
      hasIsOpen: data?.[0] ? 'is_open' in data[0] : null,
      hasDomain: data?.[0] ? 'domain' in data[0] : null,
      sample: data?.map(r => ({
        name: r.name, quantity: r.quantity,
        is_open: r.is_open, fill_level: r.fill_level, domain: r.domain,
      })) ?? [],
    },
  })
}

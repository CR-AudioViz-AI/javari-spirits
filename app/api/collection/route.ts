// app/api/collection/route.ts — redirects to the working collection API
//
// This route queried spirit_collection, a table that DOES NOT EXIST. Every call
// either failed or returned nothing, silently, for as long as it has been
// deployed. It is the reason the collection surface looked built and was not.
//
// It is kept as a redirect rather than deleted because other pages may still
// link here, and a 404 would replace a silent failure with a visible one for no
// benefit. The real implementation is /api/collection/list, which reads
// user_bottles — the table that actually holds what people own.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Accept the old parameter name as well as the new one, so an existing caller
  // keeps working rather than being punished for our rename.
  const userId = request.nextUrl.searchParams.get('user_id')
    ?? request.nextUrl.searchParams.get('userId')
  const url = new URL('/api/collection/list', request.nextUrl.origin)
  if (userId) url.searchParams.set('userId', userId)
  return NextResponse.redirect(url, 308)
}

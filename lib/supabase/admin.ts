// lib/supabase/admin.ts — the one service-role client every server route uses
//
// WHY THIS FILE EXISTS. supabase-js talks to PostgREST over ordinary `fetch`.
// Next.js 14 replaces the global `fetch` with an instrumented version that
// writes responses into the Data Cache, and inside a Route Handler an outbound
// GET is cached by default. `export const dynamic = 'force-dynamic'` does not
// stop it — that flag governs whether the ROUTE is re-executed, not whether the
// fetches inside it are served from cache. The route runs again, hits the cache,
// and returns a snapshot of the database from minutes or hours ago.
//
// That is not a theory. On 2026-08-17 /api/collection/list returned a bottle row
// id that had been deleted from the database, with x-vercel-cache: MISS on every
// request. Renaming the live row changed nothing in the response. The CDN was
// innocent; the Data Cache was serving a stale PostgREST body.
//
// A collection app that reads stale rows is worse than one that reads none: it
// hands the client identifiers for rows that no longer exist, and every write
// keyed on those identifiers fails with "not found" for reasons no log explains.
//
// Pinning `cache: 'no-store'` on the client's own fetch fixes it at the source
// and does not depend on any route-segment flag being set correctly by whoever
// writes the next route. Route config is a convention; this is a guarantee.
//
// NOT A MODULE-LEVEL SINGLETON. instrumentation.ts installs the vault env-shim
// asynchronously at server start, so process.env may not hold the real values at
// module evaluation time. Construct per request — it is a plain object, not a
// connection pool, and costs nothing.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * The global fetch, with caching removed. Every request made by a client built
 * here goes to PostgREST, every time.
 */
const uncachedFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: 'no-store' })

/**
 * A service-role Supabase client that never reads from the Next.js Data Cache.
 *
 * @throws if either bootstrap variable is missing, naming which one. A thrown
 *   error with a name in it beats `undefined!` producing an opaque 401 from
 *   PostgREST that looks like a permissions problem and is not.
 */
export function adminDb(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: uncachedFetch,
      headers: { 'X-Client-Info': 'javari-spirits/admin' },
    },
  })
}

/**
 * Response headers for any route whose body must never be reused — by the
 * browser, by an intermediary, or by Vercel's edge. The Data Cache is fixed
 * above; this closes the same hole on the way out.
 */
export const NO_STORE_HEADERS: Readonly<Record<string, string>> = Object.freeze({
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
})

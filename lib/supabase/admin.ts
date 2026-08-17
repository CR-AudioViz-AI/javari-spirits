// lib/supabase/admin.ts — the one place this app builds a Supabase client
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
// A `.select()` is an outbound GET regardless of the handler's own method, so
// POST routes are exposed too. So is `auth.getUser()`, which is how a stale
// token check becomes an authorisation bug rather than a display bug.
//
// Pinning `cache: 'no-store'` on the client's own fetch fixes it at the source
// and does not depend on any route-segment flag being set correctly by whoever
// writes the next route. Route config is a convention; this is a guarantee.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * The global fetch with caching removed. Every request made by a client built
 * here reaches Supabase, every time.
 */
const uncachedFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: 'no-store' })

function requireEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'SUPABASE_SERVICE_ROLE_KEY' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'): string {
  const value = process.env[name]
  // A thrown error naming the variable beats `undefined!` producing an opaque
  // 401 from PostgREST that reads like a permissions problem and is not.
  if (!value) throw new Error(`${name} is not set`)
  return value
}

/**
 * A service-role client that never reads from the Next.js Data Cache.
 *
 * Call this inside a request handler. Do not assign it at module scope —
 * instrumentation.ts installs the vault env-shim asynchronously, so process.env
 * is not reliable at module evaluation time, and a module-scope client also
 * forces `next build` to hold real credentials just to collect page data. Use
 * lazyAdminDb() where a module-scope binding must be kept.
 */
export function adminDb(): SupabaseClient {
  return createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: uncachedFetch, headers: { 'X-Client-Info': 'javari-spirits/admin' } },
  })
}

/**
 * An anon-key client carrying the caller's Authorization header, for verifying
 * a user token. Uncached for the same reason: `auth.getUser()` is a GET, and a
 * cached identity response is an authorisation bug.
 */
export function anonDb(authHeader?: string | null): SupabaseClient {
  return createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: uncachedFetch,
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  })
}

/**
 * Defer construction to first property access.
 *
 * Fifty-odd routes in this app hold `const supabase = createClient(...)` at
 * module scope and reference it from every handler in the file. Rewriting each
 * of those to build a client inside every handler means touching hundreds of
 * lines and risks missing a use site inside a nested helper — a worse trade
 * than the one line this replaces.
 *
 * First access happens inside a request, by which time the env-shim has warmed
 * and the credentials are real. The resolved client is then reused for the life
 * of the server instance, which is correct: it holds no connection and no
 * session, only configuration. Nothing is constructed during `next build`, so
 * the build no longer needs live credentials to collect page data.
 */
function deferred(build: () => SupabaseClient): SupabaseClient {
  let resolved: SupabaseClient | null = null
  const target = (): SupabaseClient => (resolved ??= build())

  return new Proxy({} as SupabaseClient, {
    get(_ignored, property) {
      const client = target()
      const value: unknown = Reflect.get(client as unknown as object, property)
      return typeof value === 'function'
        ? (value as (...args: unknown[]) => unknown).bind(client)
        : value
    },
    has: (_ignored, property) => property in (target() as unknown as object),
    getPrototypeOf: () => Object.getPrototypeOf(target() as unknown as object) as object | null,
  })
}

/** Module-scope-safe service-role client. See deferred(). */
export function lazyAdminDb(): SupabaseClient {
  return deferred(() => adminDb())
}

/** Module-scope-safe anon client. See deferred(). */
export function lazyAnonDb(): SupabaseClient {
  return deferred(() => anonDb())
}

/**
 * Response headers for any route whose body must never be reused — by the
 * browser, by an intermediary, or by Vercel's edge. The Data Cache is handled
 * above; this closes the same hole on the way out.
 */
export const NO_STORE_HEADERS: Readonly<Record<string, string>> = Object.freeze({
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
})

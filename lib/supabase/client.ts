// lib/supabase/client.ts — the browser Supabase client
//
// WHAT WAS WRONG. This file used createBrowserClient from @supabase/ssr, the
// cookie-backed client, and returned a NEW instance on every call. useAuth calls
// getClient() in the component body, so every render produced a different client
// object, which changed the useEffect dependency, which tore down and re-created
// the onAuthStateChange subscription on every render. Sessions did not survive,
// which is why /shelf read a user id out of localStorage instead — a key nothing
// ever wrote.
//
// This is the locked architecture: module-level singleton, raw supabase-js,
// localStorage, PKCE, detectSessionInUrl true. Not @supabase/ssr.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

/**
 * The one browser client for this app. Stable across renders by construction —
 * callers may use it as a hook dependency without causing a re-subscribe loop.
 */
export function createClient(): SupabaseClient {
  if (browserClient) return browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')

  browserClient = createSupabaseClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  })
  return browserClient
}

/** Historical name used across this codebase. Same singleton. */
export const getClient = createClient

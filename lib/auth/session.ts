// lib/auth/session.ts — resolve the caller from their session, server side
//
// WHY THIS EXISTS. The collection routes took the owner as a query parameter:
// /api/collection/list?userId=<uuid>. Anyone who knew or guessed a uuid could
// read, open and pour another person's collection, and every write trusted the
// caller to say who they were. That is an insecure direct object reference, and
// it is also why the feature could never work in a browser — the page had no
// user id to send, so it sat on "Loading your shelf…" forever.
//
// The owner now comes from the verified session and nowhere else. A route that
// cannot name its caller does not run.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import type { NextRequest } from 'next/server'
import { anonDb } from '@/lib/supabase/admin'

export type Caller = { ok: true; userId: string } | { ok: false; message: string; status: number }

/**
 * Verify the bearer token on the request and return the user it belongs to.
 * Uses the anon client with the caller's own token, so Supabase does the
 * verification — this code never inspects or trusts a JWT itself.
 */
export async function requireUser(request: NextRequest): Promise<Caller> {
  const header = request.headers.get('authorization')
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    return { ok: false, message: 'Sign in to manage your collection.', status: 401 }
  }

  try {
    const { data, error } = await anonDb(header).auth.getUser()
    if (error || !data.user) {
      return { ok: false, message: 'Your session has expired. Sign in again.', status: 401 }
    }
    return { ok: true, userId: data.user.id }
  } catch {
    return { ok: false, message: 'Could not verify your session.', status: 401 }
  }
}

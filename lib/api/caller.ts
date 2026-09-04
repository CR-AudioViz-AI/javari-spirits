// lib/api/caller.ts
//
// Who is asking, established from their token rather than from what they typed.
//
// WHY THIS EXISTS. On 4 September a route-auth guard was run in this repository
// for the first time and reported 36 routes that take a user id from the request
// body or query string and use it against a SERVICE-ROLE client. That client
// bypasses row level security completely, so every one of those routes would act
// on any account whose id a caller chose to send.
//
// Two of them spent credits. One wrote to a consent record. The rest read and
// wrote collections, alerts, achievements and wishlists belonging to whoever was
// named in the request.
//
// The guard had reported PASS the first time it ran here, because this repository
// gets its service-role client from `lazyAdminDb` — a helper whose name contains
// neither SERVICE_ROLE nor 'service', so the guard could not see the credential.
// It was invisible twice over: to the guard, and to anyone reading the route.
//
// THE FIX IS NOT BETTER VALIDATION. There is no way to check that a user id in a
// request belongs to the person sending it, because the request is the thing
// being questioned. The only fix is to stop accepting one: the caller presents a
// token, the server resolves it, and the id the caller typed is ignored.
//
// This lives in one file so all 28 routes share the same answer. Twenty-eight
// copies of an auth check is twenty-eight chances for one of them to drift, and
// the one that drifts is the one nobody looks at again.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · 2026-09-04

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabase/admin';

/**
 * The authenticated caller's user id, or null.
 *
 * Returns null rather than throwing, so a route can decide whether anonymous
 * access is acceptable for what it does. A public submission form may accept
 * null and record the entry as anonymous; a route that spends credits must not.
 */
export async function callerId(request: Request): Promise<string | null> {
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  if (!token) return null;

  try {
    const { data, error } = await adminDb().auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user.id;
  } catch {
    // A failed lookup is not an authenticated caller. Failing closed here matters
    // more than the error message: an outage in the auth service must not become
    // an open door.
    return null;
  }
}

/** The standard refusal, so every route says the same thing the same way. */
export function unauthorised(): NextResponse {
  return NextResponse.json(
    { error: 'Sign in required.', code: 'AUTH_REQUIRED' },
    { status: 401 },
  );
}

/**
 * The caller's id, or a 401 response ready to return.
 *
 * Written as a discriminated union rather than a throw so the refusal is visible
 * at the call site. A route that forgets to handle it will not compile, which is
 * the point: the previous version of this problem was invisible in exactly this
 * position.
 */
export async function requireCaller(
  request: Request,
): Promise<{ ok: true; userId: string } | { ok: false; res: NextResponse }> {
  const userId = await callerId(request);
  if (!userId) return { ok: false, res: unauthorised() };
  return { ok: true, userId };
}

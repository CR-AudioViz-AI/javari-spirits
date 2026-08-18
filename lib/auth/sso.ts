'use client'
// lib/auth/sso.ts — the branded site's half of the cross-domain handoff
//
// STEP 1 AND STEP 5. Step 1 sends a signed-out visitor to craudiovizai.com to
// ask whether they are signed in there. Step 5 turns the returned code into a
// real session on this domain.
//
// LOOPING IS THE FAILURE MODE THAT MATTERS. If a visitor is signed out
// everywhere and this asks on every page load, they bounce between two domains
// forever and the site is unusable. One attempt per tab, recorded in
// sessionStorage, and the answer is remembered for the whole visit.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { createClient } from '@/lib/supabase/client'

const CORE_ORIGIN = 'https://craudiovizai.com'
const ATTEMPTED = 'javari-sso-attempted'

function alreadyAsked(): boolean {
  try {
    return window.sessionStorage.getItem(ATTEMPTED) === '1'
  } catch {
    // Private mode with storage disabled. Treat as asked so we never loop.
    return true
  }
}

function markAsked(): void {
  try {
    window.sessionStorage.setItem(ATTEMPTED, '1')
  } catch {
    /* private mode — the in-page guard still holds for this navigation */
  }
}

/** Strip the handoff parameters so a refresh does not replay a spent code. */
function cleanUrl(): void {
  const url = new URL(window.location.href)
  let touched = false
  for (const key of ['sso_code', 'sso']) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key)
      touched = true
    }
  }
  if (touched) window.history.replaceState({}, '', url.toString())
}

/**
 * Called once on load by the app shell.
 *
 * @returns 'signed-in' when a session now exists on this domain,
 *          'redirecting' when the browser is being sent to the identity origin,
 *          'signed-out' when there is no session anywhere and none is coming.
 */
export async function attemptSso(): Promise<'signed-in' | 'redirecting' | 'signed-out'> {
  const params = new URLSearchParams(window.location.search)

  // Coming back with a code: spend it.
  const code = params.get('sso_code')
  if (code) {
    markAsked()
    try {
      const res = await fetch('/api/auth/sso/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
        cache: 'no-store',
      })
      if (!res.ok) {
        cleanUrl()
        return 'signed-out'
      }
      const { tokenHash } = (await res.json()) as { tokenHash: string }

      // Establishes a session owned by THIS origin, independent of the identity
      // origin's session. Two origins sharing one refresh token rotate it
      // against each other and one gets silently signed out.
      const { error } = await createClient().auth.verifyOtp({
        token_hash: tokenHash,
        type: 'email',
      })
      cleanUrl()
      return error ? 'signed-out' : 'signed-in'
    } catch {
      cleanUrl()
      return 'signed-out'
    }
  }

  // Coming back told there is no session at the identity origin either.
  if (params.get('sso') === 'none') {
    markAsked()
    cleanUrl()
    return 'signed-out'
  }

  // Already have a session here — nothing to do.
  const { data } = await createClient().auth.getSession()
  if (data.session) return 'signed-in'

  if (alreadyAsked()) return 'signed-out'
  markAsked()

  // Ask the identity origin. Send the current page so the visitor lands back
  // exactly where they were rather than on a home page.
  const back = new URL(window.location.href)
  back.searchParams.delete('sso_code')
  back.searchParams.delete('sso')
  window.location.assign(
    `${CORE_ORIGIN}/auth/handoff?redirect=${encodeURIComponent(back.toString())}`,
  )
  return 'redirecting'
}

// @auth-reviewed: this is a legitimate use of the cookie-based client.
// exchangeCodeForSession is the operation that WRITES the session, and it needs
// cookie set/remove access to do it. Every OTHER use of a cookie client on this
// platform was READING a session that nothing writes - sessions live in
// localStorage - which is why 32 core routes and 11 more across the fleet
// answered 401 to everyone until 2026-08-19.
//
// Do not "fix" this one to requireUser(): there is no bearer token yet at this
// point in the flow. This route is what creates it.
// app/auth/callback/route.ts
// BarrelVerse Auth Callback Handler

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { publishableKey, supabaseUrl } from "@craudioviz/platform-sdk";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      supabaseUrl(),
      publishableKey(),
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Handle Server Component
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

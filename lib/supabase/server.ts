// lib/supabase/server.ts
// BarrelVerse Supabase Client - Server

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database'
import { secretKey, publishableKey, supabaseUrl } from "@craudioviz/platform-sdk";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
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
            // Handle cookies in Server Component
          }
        },
      },
    }
  )
}

// Admin client with service role (use with caution)
export function createAdminClient() {
  return createServerClient<Database>(
    supabaseUrl(),
    secretKey(),
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )
}

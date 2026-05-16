// lib/credits-check.ts — Credits gate for API routes
// Usage: const check = await requireCredits(req, 5, 'resume_generation')
//        if (!check.allowed) return check.response
// Created: May 16, 2026
import { NextRequest, NextResponse } from 'next/server'

const PLATFORM_URL = process.env.NEXT_PUBLIC_CENTRAL_API_URL ?? 'https://craudiovizai.com'

interface CreditsCheck {
  allowed:    boolean
  user?:      { id: string; email: string; tier: string; credits: number }
  response?:  NextResponse
  credited?:  boolean
}

export async function requireCredits(
  req:      NextRequest,
  cost:     number,
  action:   string,
): Promise<CreditsCheck> {
  // Get auth token
  const token = req.cookies.get('sb-access-token')?.value
    ?? req.headers.get('authorization')?.replace('Bearer ', '')
    ?? req.headers.get('x-user-token')

  if (!token && cost > 0) {
    return {
      allowed:  false,
      response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    }
  }

  if (cost === 0) return { allowed: true }

  try {
    // Check credits via platform
    const res = await fetch(`${PLATFORM_URL}/api/credits/spend`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: cost, action, app_id: process.env.NEXT_PUBLIC_APP_NAME }),
    })

    if (res.status === 401) {
      return {
        allowed:  false,
        response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
      }
    }

    if (res.status === 402) {
      const data = await res.json()
      return {
        allowed:  false,
        response: NextResponse.json({
          error:      'Insufficient credits',
          balance:    data.balance ?? 0,
          required:   cost,
          upgrade_url: `${PLATFORM_URL}/pricing`,
        }, { status: 402 }),
      }
    }

    if (!res.ok) {
      // On error, allow but don't deduct (don't block users on infra issues)
      console.error('[credits-check] platform error:', res.status)
      return { allowed: true, credited: false }
    }

    const data = await res.json()
    return {
      allowed:  true,
      credited: true,
      user:     data.user,
    }
  } catch (err) {
    // Platform unreachable — allow to prevent blocking users
    console.error('[credits-check] platform unreachable:', err)
    return { allowed: true, credited: false }
  }
}

export async function getUser(req: NextRequest): Promise<{
  id: string; email: string; tier: string; credits: number
} | null> {
  const token = req.cookies.get('sb-access-token')?.value
    ?? req.headers.get('authorization')?.replace('Bearer ', '')
    ?? req.headers.get('x-user-token')

  if (!token) return null

  try {
    const res = await fetch(`${PLATFORM_URL}/api/auth/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

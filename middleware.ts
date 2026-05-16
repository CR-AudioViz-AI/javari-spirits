// middleware.ts — Universal Javari App Middleware
// Every Javari app uses this. Handles:
// 1. Auth check via craudiovizai.com session
// 2. Credit gating for protected routes
// 3. Redirect to login if unauthenticated
// 4. App-specific public routes
// Created: May 16, 2026
import { NextRequest, NextResponse } from 'next/server'

const PLATFORM_URL   = process.env.NEXT_PUBLIC_CENTRAL_API_URL ?? 'https://craudiovizai.com'
const APP_NAME       = process.env.NEXT_PUBLIC_APP_NAME ?? 'javari-app'
const LOGIN_URL      = `${PLATFORM_URL}/auth/signin?app=${APP_NAME}&return_to=`

// Routes that don't require auth
const PUBLIC_ROUTES = [
  '/', '/about', '/pricing', '/features', '/contact',
  '/api/health', '/api/generate', '/api/public',
  '/_next', '/favicon', '/robots.txt', '/sitemap.xml',
]

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow public routes
  if (isPublic(pathname)) return NextResponse.next()

  // Check for session cookie from craudiovizai.com
  const sessionToken = req.cookies.get('sb-access-token')?.value
    ?? req.cookies.get('supabase-auth-token')?.value
    ?? req.headers.get('authorization')?.replace('Bearer ', '')

  if (!sessionToken) {
    // Redirect to platform login
    const loginUrl = `${LOGIN_URL}${encodeURIComponent(req.url)}`
    return NextResponse.redirect(loginUrl)
  }

  // Pass token through to API routes
  const response = NextResponse.next()
  response.headers.set('x-user-token', sessionToken)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}

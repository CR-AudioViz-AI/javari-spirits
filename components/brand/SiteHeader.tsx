'use client'
// components/brand/SiteHeader.tsx — the one header this site has
//
// There were two. app/layout.tsx rendered a fixed bar reading "Javari Spirits ·
// CR AudioViz AI · EIN 39-3646201", and app/page.tsx rendered a second nav
// underneath it reading "Javari Spirits" again. Both showed a 🥃 emoji where a
// logo belongs, and neither linked to the shelf, the scanner or the add form —
// the only three things this app is actually for.
//
// AUTH-AWARE BY DESIGN. A signed-out visitor needs a reason to sign up. A
// signed-in collector needs one tap to their shelf. A header that shows the same
// thing to both is a header that helps neither.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'
import { attemptSso } from '@/lib/auth/sso'

const LINKS = [
  { href: '/shelf', label: 'My Shelf', authed: true },
  { href: '/collection/add', label: 'Add', authed: true },
  { href: '/scan', label: 'Scan', authed: true },
  { href: '/spirits', label: 'Explore', authed: false },
]

export default function SiteHeader() {
  const { user, loading, signOut } = useAuth()
  const authed = Boolean(user)
  const ssoTried = useRef(false)

  // Cross-domain sign-in. Sessions live in localStorage, which the browser scopes
  // to one origin, so a session on craudiovizai.com is invisible here. This asks
  // the identity origin once per tab and adopts the answer. See lib/auth/sso.ts.
  useEffect(() => {
    if (loading || authed || ssoTried.current) return
    ssoTried.current = true
    void attemptSso()
  }, [loading, authed])

  return (
    <header
      style={{
        background: 'rgba(13,14,17,0.94)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(245,197,66,0.14)',
        position: 'sticky', top: 0, zIndex: 200,
      }}
    >
      <nav
        aria-label="Primary"
        style={{
          maxWidth: 1100, margin: '0 auto', height: 58, padding: '0 18px',
          display: 'flex', alignItems: 'center', gap: 16,
        }}
      >
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0 }}
        >
          {/* The real mark. public/icon-512.png shipped months ago and nothing pointed at it. */}
          <img src="/icon-512.png" alt="" width={26} height={26} style={{ borderRadius: 6, display: 'block' }} />
          <span style={{ fontWeight: 900, color: '#F5C542', fontSize: 16, letterSpacing: -0.2 }}>
            Javari Spirits
          </span>
        </Link>

        <div style={{ display: 'flex', gap: 4, marginLeft: 6, flexWrap: 'wrap' }}>
          {LINKS.filter(l => !l.authed || authed).map(l => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                color: 'rgba(242,237,228,0.72)', textDecoration: 'none',
                fontSize: 13.5, fontWeight: 600, padding: '7px 11px', borderRadius: 8,
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <a
            href="https://craudiovizai.com"
            style={{ color: 'rgba(242,237,228,0.4)', textDecoration: 'none', fontSize: 12 }}
          >
            CR AudioViz AI
          </a>
          {loading ? null : authed ? (
            <button
              onClick={() => void signOut()}
              style={{
                background: 'transparent', border: '1px solid rgba(245,197,66,0.3)',
                color: '#F5C542', borderRadius: 8, padding: '7px 14px',
                fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Sign out
            </button>
          ) : (
            <>
              <Link href="/auth/login" style={{ color: 'rgba(242,237,228,0.72)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                Sign in
              </Link>
              <Link
                href="/auth/register"
                style={{
                  background: '#F5C542', color: '#241a04', borderRadius: 8,
                  padding: '8px 15px', fontSize: 12.5, fontWeight: 800, textDecoration: 'none',
                }}
              >
                Start free
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

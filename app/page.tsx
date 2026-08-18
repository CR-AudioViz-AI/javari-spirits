'use client'
// app/page.tsx — Javari Spirits front door
//
// WHAT THIS PAGE USED TO BE. An affiliate directory. Its entire body was six
// hardcoded partner cards, a search box that filtered those six cards by name,
// and category pills — All, Spirits, Wine, Beer, Delivery, Subscription,
// Premium, Gifts — that filtered the same six. Above them sat "AWIN PUBLISHER ·
// ID: 2692370" as the hero headline. The shelf, the scanner and the add form
// were not linked from it at all.
//
// When the fabricated partners came out on 2026-08-17 the cards went with them,
// which left a search box that searched nothing and pills that filtered nothing.
// That is what Roy saw, and he was right that it made no sense.
//
// WHAT IT IS NOW. The front door to a collection. The first thing a signed-out
// visitor sees is what the app does; the first thing a signed-in collector sees
// is their own shelf. Search goes to the real 1.5M-row catalogue. The category
// pills are the actual spirit_category enum with live counts, so every one of
// them lands on results.
//
// CR AudioViz AI · EIN 39-3646201 · August 2026
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/use-auth'

interface Totals {
  distinctSpirits: number
  bottles: number
  sealed: number
  open: number
  invested: number
  currentValue: number
}

/** Values of spirit_category, verified against pg_enum. Counts come from the
 *  bv_spirit_facets view so a pill never promises results it cannot deliver. */
const CATEGORIES = [
  'bourbon', 'scotch', 'irish', 'japanese', 'rye',
  'tequila', 'mezcal', 'rum', 'gin', 'vodka',
  'cognac', 'brandy', 'wine', 'beer', 'sake',
] as const

export default function Home() {
  const router = useRouter()
  const { user, session, loading: authLoading } = useAuth()
  const [query, setQuery] = useState('')
  const [totals, setTotals] = useState<Totals | null>(null)

  const loadShelf = useCallback(async (token: string) => {
    try {
      const r = await fetch('/api/collection/list', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (!r.ok) return
      const d = (await r.json()) as { totals?: Totals }
      setTotals(d.totals ?? null)
    } catch {
      // A shelf summary is a nicety. If it fails the page still works.
    }
  }, [])

  useEffect(() => {
    if (authLoading || !session?.access_token) return
    void loadShelf(session.access_token)
  }, [authLoading, session, loadShelf])

  const search = () => {
    const q = query.trim()
    if (!q) return
    // The catalogue lives at /spirits, which reads ?search= and pages through
    // 1,563,965 rows. This box used to filter an array of six.
    router.push(`/spirits?search=${encodeURIComponent(q)}`)
  }

  const authed = Boolean(user)

  return (
    <div>
      <section style={{ padding: '58px 20px 42px', textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(30px,5.5vw,52px)', fontWeight: 900, margin: '0 0 14px', lineHeight: 1.05 }}>
          Every bottle you own,{' '}
          <span style={{ color: '#F5C542' }}>on one shelf</span>
        </h1>
        <p style={{ fontSize: 16.5, color: 'rgba(242,237,228,0.62)', margin: '0 0 26px', lineHeight: 1.55 }}>
          Scan a barcode or add by hand. Twelve bottles of the same bourbon stay one card
          reading eleven sealed and one open at 60%. Pour a dram, the level drops.
        </p>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 30 }}>
          {authed ? (
            <>
              <Link href="/shelf" style={primary}>My shelf →</Link>
              <Link href="/collection/add" style={secondary}>Add a bottle</Link>
              <Link href="/scan" style={secondary}>Scan</Link>
            </>
          ) : (
            <>
              <Link href="/auth/register" style={primary}>Start your collection — free</Link>
              <Link href="/auth/login" style={secondary}>Sign in</Link>
            </>
          )}
        </div>

        {authed && totals && (
          <div
            style={{
              display: 'flex', gap: 26, justifyContent: 'center', flexWrap: 'wrap',
              padding: '16px 20px', borderRadius: 13, marginBottom: 8,
              background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(245,197,66,0.16)',
            }}
          >
            {totals.bottles === 0 ? (
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(242,237,228,0.6)' }}>
                Your shelf is empty. <Link href="/collection/add" style={{ color: '#F5C542' }}>Add your first bottle →</Link>
              </p>
            ) : (
              <>
                <Stat label="BOTTLES" value={String(totals.bottles)} />
                <Stat label="SEALED" value={String(totals.sealed)} />
                <Stat label="OPEN" value={String(totals.open)} />
                <Stat label="VALUE" value={`$${totals.currentValue.toLocaleString()}`} tone="#F5C542" />
              </>
            )}
          </div>
        )}
      </section>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px 10px' }}>
        <label htmlFor="catalogue-search" style={{ display: 'block', fontSize: 12, letterSpacing: 1, color: 'rgba(242,237,228,0.45)', marginBottom: 8 }}>
          SEARCH THE CATALOGUE
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            id="catalogue-search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') search() }}
            placeholder="Eagle Rare, Macallan, Weller…"
            style={{
              flex: 1, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(245,197,66,0.22)', borderRadius: 10,
              padding: '13px 16px', color: '#F2EDE4', fontSize: 15,
              outline: 'none', fontFamily: 'inherit', minWidth: 0,
            }}
          />
          <button onClick={search} style={{ ...primary, cursor: 'pointer', border: 'none' }}>
            Search
          </button>
        </div>
      </section>

      <section style={{ maxWidth: 720, margin: '0 auto', padding: '22px 20px 0' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <Link
              key={c}
              href={`/spirits?category=${c}`}
              style={{
                background: 'rgba(255,255,255,0.03)', color: 'rgba(242,237,228,0.7)',
                border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20,
                padding: '6px 14px', fontSize: 12.5, fontWeight: 600,
                textDecoration: 'none', textTransform: 'capitalize',
              }}
            >
              {c}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

const primary: React.CSSProperties = {
  background: '#F5C542', color: '#241a04', borderRadius: 10,
  padding: '13px 22px', fontWeight: 800, fontSize: 15, textDecoration: 'none',
  display: 'inline-block', fontFamily: 'inherit',
}

const secondary: React.CSSProperties = {
  background: 'transparent', color: '#F2EDE4', borderRadius: 10,
  padding: '13px 22px', fontWeight: 700, fontSize: 15, textDecoration: 'none',
  border: '1px solid rgba(245,197,66,0.3)', display: 'inline-block', fontFamily: 'inherit',
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, letterSpacing: 1.2, color: 'rgba(242,237,228,0.45)' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 900, color: tone ?? '#F2EDE4' }}>{value}</div>
    </div>
  )
}

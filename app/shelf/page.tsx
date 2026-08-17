'use client'
// app/shelf/page.tsx — the collection, as your actual shelf
//
// One card per spirit with the true quantity, exactly as Roy described it:
// twelve Eagle Rare shows as eleven sealed plus one open at 60%, on a single
// card, with a slider for the open one.
//
// THE EMPTY STATE MATTERS MOST HERE. user_bottles has zero rows today, so the
// first thing anyone sees is the empty state — and if it is a shrug, the app
// looks broken rather than new. It points at the two ways in.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { useCallback, useEffect, useState } from 'react'
import BottleCard from '@/components/collection/BottleCard'
import type { Card } from '@/components/collection/BottleCard'

interface Totals {
  distinctSpirits: number
  bottles: number
  sealed: number
  open: number
  liquidEquivalent: number
  invested: number
  currentValue: number
}

export default function Shelf() {
  const [cards, setCards] = useState<Card[]>([])
  const [totals, setTotals] = useState<Totals | null>(null)
  const [low, setLow] = useState<{ name: string; level: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [sort, setSort] = useState<'name' | 'value' | 'level'>('name')

  useEffect(() => {
    // The auth wiring for this app lives elsewhere; read whatever it stored.
    try {
      const raw = window.localStorage?.getItem('sb-user-id') ??
                  window.localStorage?.getItem('userId') ?? ''
      setUserId(raw)
    } catch { setUserId('') }
  }, [])

  const load = useCallback(async (uid: string) => {
    if (!uid) { setLoading(false); return }
    setLoading(true)
    try {
      const r = await fetch(`/api/collection/list?userId=${encodeURIComponent(uid)}`)
      const d = await r.json()
      if (d.error) { setError(String(d.error)); return }
      setCards(d.cards ?? [])
      setTotals(d.totals ?? null)
      setLow(d.runningLow ?? [])
      setError('')
    } catch {
      setError('Could not load your shelf.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load(userId) }, [userId, load])

  const openOne = async (sealedRowId: string) => {
    setBusy(true)
    try {
      await fetch('/api/collection/open', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sealedRowId }),
      })
      await load(userId)
    } finally { setBusy(false) }
  }

  const pour = async (bottleId: string, toLevel: number) => {
    setBusy(true)
    try {
      await fetch('/api/collection/pour', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, bottleId, toLevel }),
      })
      await load(userId)
    } finally { setBusy(false) }
  }

  const sorted = [...cards].sort((a, b) => {
    if (sort === 'value') return b.currentValue - a.currentValue
    if (sort === 'level') {
      const al = a.open.length ? Math.min(...a.open.map(o => o.fillLevel)) : 101
      const bl = b.open.length ? Math.min(...b.open.map(o => o.fillLevel)) : 101
      return al - bl
    }
    return a.name.localeCompare(b.name)
  })

  return (
    <div style={{ minHeight: '100vh', background: '#0D0E11', color: '#F2EDE4',
                  fontFamily: 'system-ui, sans-serif', padding: 18 }}>
      <div style={{ maxWidth: 940, margin: '0 auto' }}>
        <header style={{ marginBottom: 14 }}>
          <h1 style={{ fontSize: 27, fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>
            Your <span style={{ color: '#F5C542' }}>Shelf</span>
          </h1>
          <p style={{ color: 'rgba(242,237,228,0.55)', fontSize: 13, margin: '4px 0 0' }}>
            One card per bottle you own, however many of it you have.
          </p>
        </header>

        {totals && totals.bottles > 0 && (
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 14,
                        padding: '12px 14px', borderRadius: 12,
                        background: 'rgba(245,197,66,0.05)',
                        border: '1px solid rgba(245,197,66,0.16)' }}>
            <Big label="SPIRITS" value={String(totals.distinctSpirits)} />
            <Big label="BOTTLES" value={String(totals.bottles)} tone="#F5C542" />
            <Big label="SEALED" value={String(totals.sealed)} />
            <Big label="OPEN" value={String(totals.open)} />
            {/* Two half bottles is one bottle of liquid. Collectors ask this. */}
            <Big label="LIQUID" value={`${totals.liquidEquivalent}`} />
            <Big label="INVESTED" value={`$${totals.invested.toFixed(0)}`} />
            <Big label="VALUE" value={`$${totals.currentValue.toFixed(0)}`}
                 tone={totals.currentValue >= totals.invested ? '#7BE495' : '#FF8C4F'} />
          </div>
        )}

        {low.length > 0 && (
          <div style={{ marginBottom: 14, padding: '9px 13px', borderRadius: 10,
                        background: 'rgba(255,140,79,0.09)',
                        border: '1px solid rgba(255,140,79,0.28)', fontSize: 13 }}>
            <b style={{ color: '#FF8C4F' }}>Running low:</b>{' '}
            <span style={{ color: 'rgba(242,237,228,0.8)' }}>
              {low.map(l => `${l.name} (${l.level}%)`).join(' · ')}
            </span>
          </div>
        )}

        {cards.length > 1 && (
          <div style={{ display: 'flex', gap: 7, marginBottom: 12 }}>
            {(['name', 'value', 'level'] as const).map(s => (
              <button key={s} onClick={() => setSort(s)}
                style={{
                  background: sort === s ? '#F5C542' : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(245,197,66,0.3)',
                  color: sort === s ? '#241a04' : 'rgba(242,237,228,0.7)',
                  borderRadius: 7, padding: '4px 12px', fontSize: 12,
                  fontWeight: 700, cursor: 'pointer',
                }}>
                {s === 'name' ? 'A–Z' : s === 'value' ? 'Value' : 'Lowest first'}
              </button>
            ))}
          </div>
        )}

        {loading && <p style={{ color: 'rgba(242,237,228,0.5)' }}>Loading your shelf…</p>}
        {error && <p style={{ color: '#FF8C4F' }}>{error}</p>}

        {!loading && !userId && (
          <Empty
            title="Sign in to see your shelf"
            body="Your collection is tied to your account so it follows you to any device."
            actions={[{ label: 'Sign in', href: '/auth/login' }]}
          />
        )}

        {!loading && userId && cards.length === 0 && !error && (
          <Empty
            title="Nothing on the shelf yet"
            body="Scan a barcode, photograph a label, or search by name. Anything you add by hand becomes a confirmed record, so the next person who scans that bottle gets it instantly."
            actions={[
              { label: 'Scan a bottle', href: '/scan' },
              { label: 'Add by hand', href: '/collection/add' },
            ]}
          />
        )}

        <div style={{ display: 'grid', gap: 11 }}>
          {sorted.map(c => (
            <BottleCard key={c.key} card={c} busy={busy}
                        onOpen={openOne} onPour={pour} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Big({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, letterSpacing: 1.2, color: 'rgba(242,237,228,0.45)' }}>{label}</div>
      <div style={{ fontSize: 19, fontWeight: 900, color: tone ?? '#F2EDE4' }}>{value}</div>
    </div>
  )
}

/** An empty shelf is the first thing every new user sees. It should point somewhere. */
function Empty({ title, body, actions }: {
  title: string; body: string; actions: { label: string; href: string }[]
}) {
  return (
    <div style={{ textAlign: 'center', padding: '46px 20px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed rgba(245,197,66,0.25)' }}>
      <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>{title}</div>
      <p style={{ color: 'rgba(242,237,228,0.55)', fontSize: 13.5, maxWidth: 430,
                  margin: '0 auto 18px' }}>{body}</p>
      <div style={{ display: 'flex', gap: 9, justifyContent: 'center', flexWrap: 'wrap' }}>
        {actions.map(a => (
          <a key={a.href} href={a.href}
             style={{ background: '#F5C542', color: '#241a04', textDecoration: 'none',
                      borderRadius: 9, padding: '10px 20px', fontWeight: 800, fontSize: 14 }}>
            {a.label}
          </a>
        ))}
      </div>
    </div>
  )
}

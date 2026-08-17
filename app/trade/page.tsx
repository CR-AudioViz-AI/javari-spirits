'use client'
// app/trade/page.tsx — the trade board
//
// A collector with two of something and none of another is the whole basis of
// this hobby. This is where that gets resolved.
//
// YOU LIST FROM YOUR OWN SHELF, not from a blank form. Typing a bottle you
// already own into a second place is how records drift apart, and the shelf
// already knows what is sealed and how many.
//
// OPENED BOTTLES ARE NOT OFFERED AT ALL, so the option never appears rather
// than appearing and being rejected. A control that exists only to say no is
// worse than no control.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { useCallback, useEffect, useState } from 'react'

interface Trade {
  id: string
  owner_id: string
  name: string
  brand: string | null
  category: string | null
  seeking: string | null
  quantity: number
  estimated_value: number | null
  location: string | null
  status: string
  notes: string | null
  created_at: string
}

interface ShelfCard {
  key: string
  name: string
  brand: string | null
  category: string | null
  sealedCount: number
  sealedRowId: string | null
  currentValue: number
}

export default function TradeBoard() {
  const [userId, setUserId] = useState('')
  const [tab, setTab] = useState<'board' | 'mine'>('board')
  const [trades, setTrades] = useState<Trade[]>([])
  const [shelf, setShelf] = useState<ShelfCard[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [listing, setListing] = useState<ShelfCard | null>(null)
  const [seeking, setSeeking] = useState('')
  const [qty, setQty] = useState(1)
  const [location, setLocation] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    try {
      setUserId(window.localStorage?.getItem('sb-user-id') ??
                window.localStorage?.getItem('userId') ?? '')
    } catch { setUserId('') }
  }, [])

  const load = useCallback(async (uid: string, which: 'board' | 'mine', q: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (which === 'mine' && uid) params.set('userId', uid)
      if (q.trim()) params.set('q', q.trim())
      const r = await fetch(`/api/trade?${params}`)
      const d = await r.json()
      setTrades(d.trades ?? [])
    } catch {
      setErr('Could not load the board.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load(userId, tab, search) }, [userId, tab, search, load])

  // Only spares are worth offering: keeping one back is what most collectors do.
  useEffect(() => {
    if (!userId) return
    void (async () => {
      try {
        const r = await fetch(`/api/collection/list?userId=${encodeURIComponent(userId)}`)
        const d = await r.json()
        setShelf((d.cards ?? []).filter((c: ShelfCard) => c.sealedCount > 1))
      } catch { /* the board still works without it */ }
    })()
  }, [userId, msg])

  const list = async () => {
    if (!listing || !userId) return
    setBusy(true); setErr(''); setMsg('')
    try {
      const r = await fetch('/api/trade', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          bottleId: listing.sealedRowId ?? undefined,
          name: listing.name, brand: listing.brand ?? undefined,
          category: listing.category ?? undefined,
          seeking: seeking.trim() || undefined,
          quantity: qty,
          estimatedValue: listing.currentValue || undefined,
          location: location.trim() || undefined,
        }),
      })
      const d = await r.json()
      if (d.error) { setErr(String(d.error)); return }
      setMsg(String(d.message))
      setListing(null); setSeeking(''); setQty(1)
      await load(userId, tab, search)
    } finally { setBusy(false) }
  }

  const setStatus = async (id: string, status: string) => {
    setBusy(true)
    try {
      const r = await fetch('/api/trade', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, id, status }),
      })
      const d = await r.json()
      setMsg(String(d.message ?? ''))
      await load(userId, tab, search)
    } finally { setBusy(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0E11', color: '#F2EDE4',
                  fontFamily: 'system-ui, sans-serif', padding: 18 }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <header style={{ marginBottom: 14 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>
            Trade <span style={{ color: '#F5C542' }}>board</span>
          </h1>
          <p style={{ color: 'rgba(242,237,228,0.55)', fontSize: 13, margin: '4px 0 0' }}>
            Sealed bottles only. Listing one keeps it on your shelf — a listing is an
            invitation, not a commitment.
          </p>
        </header>

        <div style={{ display: 'flex', gap: 7, marginBottom: 12, flexWrap: 'wrap' }}>
          <Tab on={tab === 'board'} onClick={() => setTab('board')}>Open trades</Tab>
          <Tab on={tab === 'mine'} onClick={() => setTab('mine')}>My listings</Tab>
          <input value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="Search bottles" aria-label="Search the board"
                 style={{ ...inp, flex: 1, minWidth: 150 }} />
        </div>

        {/* Offer a spare, straight from the shelf */}
        {userId && shelf.length > 0 && !listing && (
          <div style={{ marginBottom: 14, padding: '12px 14px', borderRadius: 11,
                        background: 'rgba(245,197,66,0.05)',
                        border: '1px solid rgba(245,197,66,0.18)' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>
              You have spares — offer one
            </div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {shelf.slice(0, 8).map(c => (
                <button key={c.key} onClick={() => { setListing(c); setQty(1) }}
                  style={{ background: 'rgba(255,255,255,0.05)',
                           border: '1px solid rgba(245,197,66,0.3)', borderRadius: 8,
                           padding: '7px 12px', color: '#F2EDE4', fontSize: 12.5,
                           cursor: 'pointer' }}>
                  {c.name} <span style={{ color: '#F5C542' }}>×{c.sealedCount}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {listing && (
          <div style={{ marginBottom: 14, padding: '14px', borderRadius: 11,
                        background: '#16181d', border: '1px solid rgba(245,197,66,0.35)' }}>
            <div style={{ fontWeight: 800, marginBottom: 9 }}>
              Offering {listing.name}
              <span style={{ color: 'rgba(242,237,228,0.5)', fontWeight: 500, fontSize: 12.5 }}>
                {' '}· you have {listing.sealedCount} sealed
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 9 }}>
              <input value={seeking} onChange={e => setSeeking(e.target.value)}
                     placeholder="What would you want back?" aria-label="What you are seeking"
                     style={{ ...inp, flex: 2, minWidth: 190 }} />
              <input type="number" min={1} max={Math.max(1, listing.sealedCount - 1)} value={qty}
                     onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))}
                     aria-label="How many to offer" style={{ ...inp, width: 78 }} />
              <input value={location} onChange={e => setLocation(e.target.value)}
                     placeholder="Ships from" aria-label="Location"
                     style={{ ...inp, width: 130 }} />
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(242,237,228,0.45)', marginBottom: 9 }}>
              Most collectors keep one back. You can offer up to {Math.max(1, listing.sealedCount - 1)}.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => void list()} disabled={busy} style={btn}>List it</button>
              <button onClick={() => setListing(null)} style={ghost}>Cancel</button>
            </div>
          </div>
        )}

        {err && <p style={{ color: '#FF8C4F', fontSize: 13 }}>{err}</p>}
        {msg && <p style={{ color: '#7BE495', fontSize: 13 }}>{msg}</p>}
        {loading && <p style={{ color: 'rgba(242,237,228,0.5)' }}>Loading…</p>}

        {!loading && trades.length === 0 && (
          <div style={{ textAlign: 'center', padding: '38px 20px', borderRadius: 13,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px dashed rgba(245,197,66,0.22)' }}>
            <div style={{ fontWeight: 800, marginBottom: 5 }}>
              {tab === 'mine' ? 'You have not listed anything' : 'Nothing on the board yet'}
            </div>
            <p style={{ color: 'rgba(242,237,228,0.55)', fontSize: 13, maxWidth: 400, margin: '0 auto' }}>
              {tab === 'mine'
                ? 'Bottles you own more than one of show up above, ready to offer.'
                : 'When collectors list their spares they appear here. Add bottles to your shelf and your own duplicates become offerable.'}
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gap: 9 }}>
          {trades.map(t => (
            <div key={t.id} style={{ background: '#16181d', borderRadius: 11,
                                     border: '1px solid rgba(255,255,255,0.08)', padding: '13px 15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5 }}>
                    {t.name} {t.quantity > 1 && <span style={{ color: '#F5C542' }}>×{t.quantity}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(242,237,228,0.5)' }}>
                    {[t.brand, t.category, t.location].filter(Boolean).join(' · ') || '—'}
                  </div>
                </div>
                {t.status !== 'open' && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#FF8C4F',
                                 textTransform: 'uppercase' }}>{t.status}</span>
                )}
              </div>
              {t.seeking && (
                <div style={{ marginTop: 7, fontSize: 13 }}>
                  <span style={{ color: 'rgba(242,237,228,0.5)' }}>Wants: </span>
                  <span>{t.seeking}</span>
                </div>
              )}
              {tab === 'mine' && t.status === 'open' && (
                <div style={{ display: 'flex', gap: 7, marginTop: 10 }}>
                  <button onClick={() => void setStatus(t.id, 'closed')} disabled={busy}
                          style={{ ...btn, padding: '6px 13px', fontSize: 12 }}>Traded</button>
                  <button onClick={() => void setStatus(t.id, 'withdrawn')} disabled={busy}
                          style={ghost}>Withdraw</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const inp: React.CSSProperties = {
  background: '#16181d', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9,
  padding: '9px 12px', color: '#F2EDE4', fontSize: 13.5, fontFamily: 'inherit',
}
const btn: React.CSSProperties = {
  background: '#F5C542', color: '#241a04', border: 'none', borderRadius: 8,
  padding: '9px 17px', fontWeight: 800, fontSize: 13, cursor: 'pointer',
}
const ghost: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
  color: 'rgba(242,237,228,0.7)', borderRadius: 8, padding: '9px 15px',
  fontSize: 13, cursor: 'pointer',
}

function Tab({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={on} style={{
      background: on ? '#F5C542' : 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(245,197,66,0.3)',
      color: on ? '#241a04' : 'rgba(242,237,228,0.7)',
      borderRadius: 8, padding: '8px 15px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
    }}>{children}</button>
  )
}

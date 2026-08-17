'use client'
// app/wishlist/page.tsx — the hunt list
//
// What you are looking for, which is a different thing from what you own — and
// for most collectors it is the more emotionally active list.
//
// PRIORITY IS THE POINT. A flat list of forty bottles is a wish, not a plan.
// Rating each one 1 to 5 turns it into something a person can act on when they
// find themselves in a good shop with limited money.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { useCallback, useEffect, useState } from 'react'

interface Item {
  id: string
  name: string
  brand: string | null
  category: string | null
  max_price: number | null
  priority: number
  notes: string | null
  acquired: boolean
}

export default function Wishlist() {
  const [userId, setUserId] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [totals, setTotals] = useState({ hunting: 0, found: 0, budget: 0 })
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [priority, setPriority] = useState(3)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    try {
      setUserId(window.localStorage?.getItem('sb-user-id') ??
                window.localStorage?.getItem('userId') ?? '')
    } catch { setUserId('') }
  }, [])

  const load = useCallback(async (uid: string) => {
    if (!uid) { setLoading(false); return }
    try {
      const r = await fetch(`/api/wishlist?userId=${encodeURIComponent(uid)}`)
      const d = await r.json()
      setItems(d.items ?? [])
      setTotals(d.totals ?? { hunting: 0, found: 0, budget: 0 })
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load(userId) }, [userId, load])

  const add = async () => {
    if (!name.trim() || !userId) return
    setBusy(true)
    try {
      await fetch('/api/wishlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, name: name.trim(),
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          priority,
        }),
      })
      setName(''); setMaxPrice(''); setPriority(3)
      await load(userId)
    } finally { setBusy(false) }
  }

  const found = async (id: string) => {
    setBusy(true)
    try {
      await fetch('/api/wishlist', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, id, acquired: true, addToShelf: true }),
      })
      await load(userId)
    } finally { setBusy(false) }
  }

  const remove = async (id: string) => {
    setBusy(true)
    try {
      await fetch(`/api/wishlist?id=${id}&userId=${encodeURIComponent(userId)}`, { method: 'DELETE' })
      await load(userId)
    } finally { setBusy(false) }
  }

  const hunting = items.filter(i => !i.acquired)
  const got = items.filter(i => i.acquired)

  return (
    <div style={{ minHeight: '100vh', background: '#0D0E11', color: '#F2EDE4',
                  fontFamily: 'system-ui, sans-serif', padding: 18 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <header style={{ marginBottom: 14 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>
            The <span style={{ color: '#F5C542' }}>hunt</span>
          </h1>
          <p style={{ color: 'rgba(242,237,228,0.55)', fontSize: 13, margin: '4px 0 0' }}>
            Private. What you are hunting says what you would overpay for.
          </p>
        </header>

        {totals.hunting > 0 && (
          <div style={{ display: 'flex', gap: 20, marginBottom: 14, padding: '11px 14px',
                        borderRadius: 11, background: 'rgba(245,197,66,0.05)',
                        border: '1px solid rgba(245,197,66,0.16)' }}>
            <B label="HUNTING" value={String(totals.hunting)} tone="#F5C542" />
            <B label="FOUND" value={String(totals.found)} tone="#7BE495" />
            {/* What the whole hunt costs at the prices they said they would pay. */}
            <B label="AT YOUR PRICES" value={`$${totals.budget.toFixed(0)}`} />
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <input value={name} onChange={e => setName(e.target.value)}
                 onKeyDown={e => { if (e.key === 'Enter') void add() }}
                 placeholder="What are you looking for?" aria-label="Bottle name"
                 style={{ ...inp, flex: 2, minWidth: 190 }} />
          <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                 placeholder="Max $" inputMode="decimal" aria-label="Most you would pay"
                 style={{ ...inp, width: 92 }} />
          <button onClick={() => void add()} disabled={busy || !name.trim()}
                  style={{ ...btn, opacity: name.trim() ? 1 : 0.5 }}>Add</button>
        </div>

        {/* Priority turns a wish into a plan you can act on in a shop. */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 11.5, color: 'rgba(242,237,228,0.5)' }}>How badly?</span>
          {[1, 2, 3, 4, 5].map(p => (
            <button key={p} onClick={() => setPriority(p)} aria-pressed={priority === p}
              title={p === 5 ? 'Would drive across the state' : p === 1 ? 'Idle curiosity' : ''}
              style={{
                background: priority >= p ? '#F5C542' : 'rgba(255,255,255,0.06)',
                border: 'none', borderRadius: 5, width: 26, height: 22,
                color: priority >= p ? '#241a04' : 'rgba(242,237,228,0.4)',
                fontSize: 11, fontWeight: 800, cursor: 'pointer',
              }}>{p}</button>
          ))}
        </div>

        {loading && <p style={{ color: 'rgba(242,237,228,0.5)' }}>Loading…</p>}

        {!loading && !userId && (
          <p style={{ color: 'rgba(242,237,228,0.55)' }}>
            <a href="/auth/login" style={{ color: '#F5C542' }}>Sign in</a> to keep a hunt list.
          </p>
        )}

        {!loading && userId && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '38px 20px', borderRadius: 13,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px dashed rgba(245,197,66,0.22)' }}>
            <div style={{ fontWeight: 800, marginBottom: 5 }}>Nothing on the hunt list</div>
            <p style={{ color: 'rgba(242,237,228,0.55)', fontSize: 13, maxWidth: 380, margin: '0 auto' }}>
              Add the bottles you are chasing and how much you would pay. When you find one,
              marking it found puts it straight on your shelf.
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gap: 8 }}>
          {hunting.map(i => (
            <Row key={i.id} item={i} busy={busy}
                 onFound={() => void found(i.id)} onRemove={() => void remove(i.id)} />
          ))}
        </div>

        {got.length > 0 && (
          <>
            <h2 style={{ fontSize: 14, color: 'rgba(242,237,228,0.5)', marginTop: 22 }}>
              Found ({got.length})
            </h2>
            <div style={{ display: 'grid', gap: 6, opacity: 0.6 }}>
              {got.map(i => (
                <div key={i.id} style={{ ...rowStyle, padding: '8px 12px' }}>
                  <span style={{ textDecoration: 'line-through' }}>{i.name}</span>
                  <button onClick={() => void remove(i.id)} style={ghostBtn}>remove</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Row({ item, busy, onFound, onRemove }: {
  item: Item; busy: boolean; onFound: () => void; onRemove: () => void
}) {
  return (
    <div style={rowStyle}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
        <div style={{ fontSize: 11.5, color: 'rgba(242,237,228,0.5)' }}>
          {'★'.repeat(item.priority)}{'☆'.repeat(5 - item.priority)}
          {item.max_price ? ` · up to $${Number(item.max_price).toFixed(0)}` : ''}
          {item.brand ? ` · ${item.brand}` : ''}
        </div>
      </div>
      <button onClick={onFound} disabled={busy} style={btn}>Found it</button>
      <button onClick={onRemove} disabled={busy} style={ghostBtn}>remove</button>
    </div>
  )
}

const rowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10,
  background: '#16181d', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10, padding: '11px 13px',
}
const inp: React.CSSProperties = {
  background: '#16181d', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 9, padding: '10px 12px', color: '#F2EDE4', fontSize: 14, fontFamily: 'inherit',
}
const btn: React.CSSProperties = {
  background: '#F5C542', color: '#241a04', border: 'none', borderRadius: 8,
  padding: '8px 15px', fontWeight: 800, fontSize: 13, cursor: 'pointer', flexShrink: 0,
}
const ghostBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: 'rgba(242,237,228,0.4)',
  fontSize: 11.5, cursor: 'pointer', flexShrink: 0,
}

function B({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, letterSpacing: 1.2, color: 'rgba(242,237,228,0.45)' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: tone ?? '#F2EDE4' }}>{value}</div>
    </div>
  )
}

'use client'
// app/collection/add/page.tsx — add a bottle by hand
//
// The route that unblocks testing. Roughly a third of real bottles are in no
// barcode database, so an app that can only add by scanning cannot hold a real
// collection. This is also where a scan result lands when the user confirms it.
//
// IT ASKS WHETHER THE BOTTLE IS OPEN, AND ONLY THEN ASKS THE LEVEL. Showing a
// fill slider on a sealed bottle invites someone to set it to 100 and think
// they have said something, when the model treats sealed bottles as having no
// level at all. Asking one question at a time is what keeps the data honest.
//
// SEALED BOTTLES CAN BE ADDED IN QUANTITY. Someone entering a case types 12
// once rather than filling this form twelve times, and an open bottle is forced
// to quantity one because it has its own level and history.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { useCallback, useEffect, useState } from 'react'

interface Candidate {
  name: string
  brand?: string
  category?: string
  imageUrl?: string
  confidence: number
  payload?: Record<string, unknown>
}

export default function AddBottle() {
  const [userId, setUserId] = useState('')
  const [query, setQuery] = useState('')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [searching, setSearching] = useState(false)

  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [size, setSize] = useState('750ml')
  const [barcode, setBarcode] = useState('')
  const [opened, setOpened] = useState(false)
  const [fill, setFill] = useState(100)
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState('')
  const [place, setPlace] = useState('')
  const [storage, setStorage] = useState('')
  const [notes, setNotes] = useState('')

  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    try {
      setUserId(window.localStorage?.getItem('sb-user-id') ??
                window.localStorage?.getItem('userId') ?? '')
      // A scan hands off through session storage rather than a query string,
      // so a long product name never ends up in a shareable URL.
      const handoff = window.sessionStorage?.getItem('scan-handoff')
      if (handoff) {
        const d = JSON.parse(handoff) as Candidate & { barcode?: string }
        setName(d.name ?? '')
        setBrand(d.brand ?? '')
        setCategory(d.category ?? '')
        setBarcode(d.barcode ?? '')
        window.sessionStorage.removeItem('scan-handoff')
      }
    } catch { /* private mode */ }
  }, [])

  const search = useCallback(async () => {
    if (query.trim().length < 3) return
    setSearching(true)
    try {
      const r = await fetch(`/api/barcode/lookup?query=${encodeURIComponent(query.trim())}`)
      const d = await r.json()
      setCandidates(d.candidates ?? [])
      if (!d.candidates?.length) setMsg('No matches — fill it in by hand below.')
    } catch {
      setErr('Search failed. You can still enter it by hand.')
    } finally { setSearching(false) }
  }, [query])

  const pick = (c: Candidate) => {
    setName(c.name)
    setBrand(c.brand ?? '')
    setCategory(c.category ?? '')
    const upc = c.payload?.upc
    if (typeof upc === 'string') setBarcode(upc)
    setCandidates([])
    setMsg('Filled from that match. Check it before saving.')
  }

  const save = async () => {
    setErr(''); setMsg('')
    if (!userId) { setErr('Sign in first — your collection is tied to your account.'); return }
    if (!name.trim()) { setErr('A name is required.'); return }
    setSaving(true)
    try {
      const r = await fetch('/api/collection/add', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, name: name.trim(),
          brand: brand.trim() || undefined,
          category: category.trim() || undefined,
          bottleSize: size || undefined,
          barcode: barcode.trim() || undefined,
          opened,
          fillLevel: opened ? fill : undefined,
          quantity: opened ? 1 : quantity,
          purchasePrice: price ? Number(price) : undefined,
          purchasePlace: place.trim() || undefined,
          storagePlace: storage.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      })
      const d = await r.json()
      if (d.error) { setErr(String(d.error)); return }
      setMsg(String(d.message ?? 'Added.'))
      setName(''); setBrand(''); setCategory(''); setBarcode('')
      setOpened(false); setFill(100); setQuantity(1)
      setPrice(''); setPlace(''); setNotes('')
    } catch {
      setErr('Could not save. Nothing was added.')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0E11', color: '#F2EDE4',
                  fontFamily: 'system-ui, sans-serif', padding: 18 }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>
            Add a <span style={{ color: '#F5C542' }}>bottle</span>
          </h1>
          <p style={{ color: 'rgba(242,237,228,0.55)', fontSize: 13, margin: '4px 0 0' }}>
            Search for it, or fill it in yourself. Anything you enter becomes a confirmed
            record — the next person who scans this bottle gets it instantly.
          </p>
        </header>

        {/* Search first, because typing a whole bottle by hand is nobody's preference */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input value={query} onChange={e => setQuery(e.target.value)}
                 onKeyDown={e => { if (e.key === 'Enter') void search() }}
                 placeholder="Search by name, e.g. Eagle Rare 10"
                 aria-label="Search for a bottle by name"
                 style={inputStyle} />
          <button onClick={() => void search()} disabled={searching || query.trim().length < 3}
                  style={{ ...btnStyle, opacity: query.trim().length < 3 ? 0.5 : 1 }}>
            {searching ? '…' : 'Search'}
          </button>
        </div>

        {candidates.length > 0 && (
          <div style={{ marginBottom: 14, display: 'grid', gap: 6 }}>
            {candidates.map((c, i) => (
              <button key={i} onClick={() => pick(c)} style={{
                textAlign: 'left', background: 'rgba(245,197,66,0.07)',
                border: '1px solid rgba(245,197,66,0.25)', borderRadius: 9,
                padding: '9px 12px', color: '#F2EDE4', cursor: 'pointer',
              }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{c.name}</div>
                <div style={{ fontSize: 11.5, color: 'rgba(242,237,228,0.5)' }}>
                  {[c.brand, c.category].filter(Boolean).join(' · ')} · these are name matches, confirm before saving
                </div>
              </button>
            ))}
          </div>
        )}

        <Field label="Name" required>
          <input value={name} onChange={e => setName(e.target.value)} style={inputStyle}
                 placeholder="Eagle Rare 10 Year" aria-label="Bottle name" />
        </Field>
        <Row>
          <Field label="Brand or distillery">
            <input value={brand} onChange={e => setBrand(e.target.value)} style={inputStyle}
                   placeholder="Buffalo Trace" aria-label="Brand" />
          </Field>
          <Field label="Category">
            <input value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}
                   placeholder="Bourbon" aria-label="Category" />
          </Field>
        </Row>
        <Row>
          <Field label="Size">
            <select value={size} onChange={e => setSize(e.target.value)} style={inputStyle}
                    aria-label="Bottle size">
              {['50ml', '200ml', '375ml', '500ml', '700ml', '750ml', '1L', '1.75L'].map(s =>
                <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Barcode (optional)">
            <input value={barcode} onChange={e => setBarcode(e.target.value)} style={inputStyle}
                   placeholder="088004021344" aria-label="Barcode" inputMode="numeric" />
          </Field>
        </Row>

        {/* One question at a time. The level is only asked once the answer to
            "is it open" is yes, because a sealed bottle has no level. */}
        <div style={{ margin: '14px 0', padding: '13px 14px', borderRadius: 11,
                      background: 'rgba(245,197,66,0.05)',
                      border: '1px solid rgba(245,197,66,0.18)' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8,
                        color: 'rgba(242,237,228,0.75)' }}>
            Is this bottle open?
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: opened ? 14 : 0 }}>
            <Toggle on={!opened} onClick={() => setOpened(false)} label="Sealed" />
            <Toggle on={opened} onClick={() => setOpened(true)} label="Open" />
          </div>

          {opened ? (
            <div>
              <label htmlFor="fill" style={{ fontSize: 12.5, color: 'rgba(242,237,228,0.7)' }}>
                How full is it? <b style={{ color: fill <= 20 ? '#FF8C4F' : '#F5C542' }}>{fill}%</b>
              </label>
              <input id="fill" type="range" min={0} max={100} value={fill}
                     onChange={e => setFill(Number(e.target.value))}
                     style={{ width: '100%', accentColor: '#F5C542', marginTop: 6 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between',
                            fontSize: 10.5, color: 'rgba(242,237,228,0.4)' }}>
                <span>empty</span><span>half</span><span>full</span>
              </div>
            </div>
          ) : (
            <Field label="How many sealed?">
              <input type="number" min={1} max={999} value={quantity}
                     onChange={e => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                     style={{ ...inputStyle, maxWidth: 120 }} aria-label="Quantity" />
              <div style={{ fontSize: 11.5, color: 'rgba(242,237,228,0.45)', marginTop: 4 }}>
                They stack onto one card. Open one later and it splits off with its own level.
              </div>
            </Field>
          )}
        </div>

        <Row>
          <Field label="Paid (optional)">
            <input value={price} onChange={e => setPrice(e.target.value)} style={inputStyle}
                   placeholder="34.99" inputMode="decimal" aria-label="Purchase price" />
          </Field>
          <Field label="Bought where (optional)">
            <input value={place} onChange={e => setPlace(e.target.value)} style={inputStyle}
                   placeholder="Total Wine" aria-label="Purchase place" />
          </Field>
        </Row>
        <Field label="Stored where (optional)">
          <input value={storage} onChange={e => setStorage(e.target.value)} style={inputStyle}
                 placeholder="Bar cart, top shelf" aria-label="Storage place" />
        </Field>
        <Field label="Notes (optional)">
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }}
                    placeholder="Gift from Dad, store pick, batch B4" aria-label="Notes" />
        </Field>

        {err && <p style={{ color: '#FF8C4F', fontSize: 13 }}>{err}</p>}
        {msg && <p style={{ color: '#7BE495', fontSize: 13 }}>{msg}</p>}

        <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
          <button onClick={() => void save()} disabled={saving || !name.trim()}
                  style={{ ...btnStyle, flex: 1, padding: '13px 20px', fontSize: 15,
                           opacity: !name.trim() ? 0.5 : 1 }}>
            {saving ? 'Saving…' : 'Add to my shelf'}
          </button>
          <a href="/shelf" style={{ ...btnStyle, background: 'rgba(255,255,255,0.06)',
                                    color: '#F2EDE4', textDecoration: 'none',
                                    padding: '13px 20px', fontSize: 15 }}>
            My shelf
          </a>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#16181d', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 9, padding: '10px 12px', color: '#F2EDE4', fontSize: 14,
  fontFamily: 'inherit',
}
const btnStyle: React.CSSProperties = {
  background: '#F5C542', color: '#241a04', border: 'none', borderRadius: 9,
  padding: '10px 18px', fontWeight: 800, fontSize: 14, cursor: 'pointer',
}

function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 11, flex: 1 }}>
      <div style={{ fontSize: 11.5, color: 'rgba(242,237,228,0.6)', marginBottom: 4 }}>
        {label}{required && <span style={{ color: '#F5C542' }}> *</span>}
      </div>
      {children}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{children}</div>
}

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} aria-pressed={on} style={{
      background: on ? '#F5C542' : 'rgba(255,255,255,0.05)',
      border: `1px solid ${on ? '#F5C542' : 'rgba(255,255,255,0.14)'}`,
      color: on ? '#241a04' : 'rgba(242,237,228,0.7)',
      borderRadius: 8, padding: '7px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
    }}>{label}</button>
  )
}

'use client'
// components/collection/BottleCard.tsx — one card per spirit
//
// The card Roy described: Eagle Rare with twelve bottles reads as ONE card
// showing eleven sealed and one open at 60%, with the true quantity on it.
//
// THE FILL GAUGE IS A BOTTLE, NOT A PROGRESS BAR. A collector reads liquid
// level the way they read it on a shelf — from the top down, in a bottle
// shape. A horizontal bar is technically the same information and feels like
// a download.
//
// EVERY OPEN BOTTLE GETS ITS OWN GAUGE. Averaging them would hide exactly the
// thing the collector opened the app to see.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { useState } from 'react'

export interface OpenBottle {
  id: string
  fillLevel: number
  openedDate: string | null
  daysOpen: number | null
  notes: string | null
}

export interface Card {
  key: string
  name: string
  brand: string | null
  category: string | null
  photoUrl: string | null
  totalBottles: number
  sealedCount: number
  open: OpenBottle[]
  investedValue: number
  currentValue: number
  rating: number | null
  sealedRowId: string | null
  liquidEquivalent: number
  summary?: string
}

interface Props {
  card: Card
  onOpen?: (sealedRowId: string) => void
  onPour?: (bottleId: string, toLevel: number) => void
  busy?: boolean
}

export default function BottleCard({ card, onOpen, onPour, busy }: Props) {
  // Local slider state so dragging feels immediate; the commit happens on release.
  const [dragging, setDragging] = useState<Record<string, number>>({})

  const gain = card.currentValue - card.investedValue
  const lowest = card.open.length ? Math.min(...card.open.map(o => o.fillLevel)) : null

  return (
    <div style={{
      background: '#16181d', border: '1px solid rgba(245,197,66,0.16)',
      borderRadius: 14, padding: 16, display: 'flex', gap: 14,
    }}>
      {/* Bottle image or a lettered placeholder, so a card is never blank */}
      <div style={{
        width: 64, height: 96, borderRadius: 8, flexShrink: 0,
        background: card.photoUrl ? `center/cover url(${card.photoUrl})` : 'rgba(245,197,66,0.10)',
        display: 'grid', placeItems: 'center',
        border: '1px solid rgba(255,255,255,0.07)',
      }}>
        {!card.photoUrl && (
          <span style={{ fontSize: 26, fontWeight: 900, color: 'rgba(245,197,66,0.55)' }}>
            {card.name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'start' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#F2EDE4',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {card.name}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(242,237,228,0.55)' }}>
              {[card.brand, card.category].filter(Boolean).join(' · ') || '—'}
            </div>
          </div>
          {/* The true quantity, stated plainly. This is the number Roy asked for. */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#F5C542', lineHeight: 1 }}>
              {card.totalBottles}
            </div>
            <div style={{ fontSize: 10, letterSpacing: 1, color: 'rgba(242,237,228,0.4)' }}>
              {card.totalBottles === 1 ? 'BOTTLE' : 'BOTTLES'}
            </div>
          </div>
        </div>

        {/* Sealed count and each open bottle, never averaged together */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
          {card.sealedCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <BottleGauge level={100} sealed />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#F2EDE4' }}>
                  {card.sealedCount} sealed
                </div>
                {card.sealedRowId && onOpen && (
                  <button onClick={() => onOpen(card.sealedRowId!)} disabled={busy}
                    style={{
                      background: 'rgba(245,197,66,0.14)', border: '1px solid rgba(245,197,66,0.4)',
                      color: '#F5C542', borderRadius: 6, padding: '2px 9px',
                      fontSize: 11, fontWeight: 700, cursor: busy ? 'default' : 'pointer', marginTop: 3,
                    }}>
                    Open one
                  </button>
                )}
              </div>
            </div>
          )}

          {card.open.map(o => {
            const shown = dragging[o.id] ?? o.fillLevel
            return (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <BottleGauge level={shown} />
                <div style={{ minWidth: 108 }}>
                  <div style={{ fontSize: 13, fontWeight: 700,
                                color: shown <= 20 ? '#FF8C4F' : '#F2EDE4' }}>
                    open · {shown}%
                  </div>
                  <input
                    type="range" min={0} max={100} value={shown}
                    onChange={e => setDragging(d => ({ ...d, [o.id]: Number(e.target.value) }))}
                    onMouseUp={() => { onPour?.(o.id, shown) }}
                    onTouchEnd={() => { onPour?.(o.id, shown) }}
                    aria-label={`Fill level for the open bottle of ${card.name}`}
                    style={{ width: '100%', accentColor: '#F5C542', marginTop: 2 }}
                  />
                  {o.daysOpen !== null && (
                    <div style={{ fontSize: 10.5, color: 'rgba(242,237,228,0.42)' }}>
                      {o.daysOpen === 0 ? 'opened today'
                        : o.daysOpen < 60 ? `open ${o.daysOpen} days`
                        : `open ${Math.round(o.daysOpen / 30)} months`}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 11, fontSize: 11.5, flexWrap: 'wrap' }}>
          <Stat label="Invested" value={`$${card.investedValue.toFixed(0)}`} />
          <Stat label="Value now" value={`$${card.currentValue.toFixed(0)}`}
                tone={gain > 0 ? '#7BE495' : gain < 0 ? '#FF8C4F' : undefined} />
          {/* Two half bottles is one bottle of liquid. Collectors ask this. */}
          <Stat label="Liquid" value={`${card.liquidEquivalent} btl`} />
          {lowest !== null && lowest <= 20 && (
            <span style={{ color: '#FF8C4F', fontWeight: 700 }}>running low</span>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <span style={{ color: 'rgba(242,237,228,0.5)' }}>
      {label} <b style={{ color: tone ?? '#F2EDE4' }}>{value}</b>
    </span>
  )
}

/**
 * A bottle silhouette that fills from the bottom. Reading liquid level in a
 * bottle shape is how a collector reads a shelf; a horizontal bar is the same
 * information and feels like a download.
 */
function BottleGauge({ level, sealed }: { level: number; sealed?: boolean }) {
  const h = 46
  const liquid = Math.max(0, Math.min(100, level)) / 100
  return (
    <svg width={22} height={h} viewBox="0 0 22 46" aria-hidden="true">
      <defs>
        <clipPath id={`b${sealed ? 's' : ''}${Math.round(level)}`}>
          <path d="M8 2 h6 v9 l4 6 v25 a3 3 0 0 1 -3 3 h-8 a3 3 0 0 1 -3 -3 v-25 l4 -6 z" />
        </clipPath>
      </defs>
      <path d="M8 2 h6 v9 l4 6 v25 a3 3 0 0 1 -3 3 h-8 a3 3 0 0 1 -3 -3 v-25 l4 -6 z"
            fill="rgba(255,255,255,0.05)" stroke="rgba(245,197,66,0.45)" strokeWidth="1" />
      <rect x="0" y={46 - liquid * 30} width="22" height={liquid * 30}
            fill={sealed ? '#C88A2E' : level <= 20 ? '#FF8C4F' : '#F5C542'}
            opacity={0.85}
            clipPath={`url(#b${sealed ? 's' : ''}${Math.round(level)})`} />
      {sealed && <rect x="7" y="1" width="8" height="4" rx="1" fill="rgba(245,197,66,0.7)" />}
    </svg>
  )
}

// lib/collection/model.ts — the collection model
//
// Roy's shape, and it is the right one: ONE CARD PER SPIRIT, showing the true
// quantity. Eagle Rare 10 Year with twelve bottles reads as "11 sealed · 1 open
// at 60%", not as twelve identical rows or one row with a meaningless average.
//
// WHY SEALED STACKS BUT OPEN BOTTLES DO NOT. quantity and fill_level cannot
// coexist on one row and mean anything. "quantity 2, fill_level 50" is not two
// half-empty bottles, it is nonsense — it could equally describe one full and
// one empty. So sealed bottles stack on a single row, and the moment one is
// opened it splits off as its own row with its own level, its own opened date
// and its own tasting notes. Every opened bottle has a history; sealed ones are
// interchangeable and do not.
//
// A database CHECK constraint enforces this rather than the application, so a
// future writer cannot quietly reintroduce the ambiguity.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026

export interface BottleRow {
  id: string
  user_id: string
  catalog_id: string | null
  reference_id: string | null
  name: string
  brand: string | null
  category: string | null
  bottle_size: string | null
  quantity: number
  is_open: boolean
  fill_level: number | null
  opened_date: string | null
  is_finished: boolean
  purchase_price: number | null
  market_value: number | null
  rating: number | null
  photo_url: string | null
  storage_place: string | null
  notes: string | null
  created_at: string
}

/** What the UI renders: one card per spirit, however many physical bottles. */
export interface CollectionCard {
  key: string
  name: string
  brand: string | null
  category: string | null
  photoUrl: string | null
  /** Every physical bottle, sealed and open, counted honestly. */
  totalBottles: number
  sealedCount: number
  /** One entry per open bottle, because each has its own level and history. */
  open: {
    id: string
    fillLevel: number
    openedDate: string | null
    /** Days since opening, so the UI can say "open 3 months". */
    daysOpen: number | null
    notes: string | null
  }[]
  /** Sum of what was paid, across every bottle on the card. */
  investedValue: number
  /** Current market value, sealed at full and open pro-rated by what is left. */
  currentValue: number
  rating: number | null
  sealedRowId: string | null
  /** How much liquid is actually owned, as bottle-equivalents. Two halves is one. */
  liquidEquivalent: number
}

const DAY = 86_400_000

/**
 * Group rows into cards. The grouping key is what the bottle IS — the catalogue
 * reference where we have one, falling back to a normalised name so a
 * hand-entered bottle still lands on the right card rather than creating a
 * duplicate that looks like a second spirit.
 */
export function toCards(rows: BottleRow[]): CollectionCard[] {
  const groups = new Map<string, BottleRow[]>()
  for (const r of rows) {
    if (r.is_finished) continue
    const key = r.catalog_id ?? r.reference_id ?? normaliseName(r.name, r.brand)
    const g = groups.get(key)
    if (g) g.push(r)
    else groups.set(key, [r])
  }

  const cards: CollectionCard[] = []
  for (const [key, g] of groups) {
    const sealed = g.filter(r => !r.is_open)
    const open = g.filter(r => r.is_open)
    const sealedCount = sealed.reduce((n, r) => n + Math.max(0, r.quantity), 0)
    const first = g[0]

    const invested = g.reduce((sum, r) =>
      sum + (r.purchase_price ?? 0) * (r.is_open ? 1 : Math.max(1, r.quantity)), 0)

    // An open bottle is not worth what a sealed one is. Pro-rating by fill level
    // is rough but it is far closer to true than counting a nearly-empty bottle
    // at full retail, which is how collection values end up fantasy numbers.
    const marketEach = g.find(r => r.market_value)?.market_value ?? null
    const current = marketEach
      ? sealedCount * marketEach +
        open.reduce((s, r) => s + marketEach * ((r.fill_level ?? 0) / 100), 0)
      : invested

    const liquid = sealedCount + open.reduce((s, r) => s + (r.fill_level ?? 0) / 100, 0)

    cards.push({
      key,
      name: first.name,
      brand: first.brand,
      category: first.category,
      photoUrl: g.find(r => r.photo_url)?.photo_url ?? null,
      totalBottles: sealedCount + open.length,
      sealedCount,
      open: open.map(r => ({
        id: r.id,
        fillLevel: r.fill_level ?? 0,
        openedDate: r.opened_date,
        daysOpen: r.opened_date
          ? Math.floor((Date.now() - new Date(r.opened_date).getTime()) / DAY)
          : null,
        notes: r.notes,
      })).sort((a, b) => a.fillLevel - b.fillLevel),
      investedValue: Math.round(invested * 100) / 100,
      currentValue: Math.round(current * 100) / 100,
      rating: g.find(r => r.rating)?.rating ?? null,
      sealedRowId: sealed[0]?.id ?? null,
      liquidEquivalent: Math.round(liquid * 100) / 100,
    })
  }

  return cards.sort((a, b) => a.name.localeCompare(b.name))
}

/** A stable key for bottles with no catalogue entry, so they still group. */
export function normaliseName(name: string, brand?: string | null): string {
  return `n:${[brand ?? '', name]
    .join(' ')
    .toLowerCase()
    .replace(/\b(bourbon|whiskey|whisky|scotch|vodka|gin|rum|tequila)\b/g, '')
    .replace(/\b\d+\s*(ml|l|cl|oz)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()}`
}

/** One line summarising the card, used in lists and notifications. */
export function describe(c: CollectionCard): string {
  const parts: string[] = []
  if (c.sealedCount) parts.push(`${c.sealedCount} sealed`)
  for (const o of c.open) parts.push(`1 open at ${o.fillLevel}%`)
  if (!parts.length) return 'none left'
  return parts.join(' · ')
}

/** Bottles running low, so a collector can replace a favourite before it is gone. */
export function runningLow(cards: CollectionCard[], threshold = 20): CollectionCard[] {
  return cards.filter(c =>
    c.sealedCount === 0 && c.open.some(o => o.fillLevel <= threshold))
}

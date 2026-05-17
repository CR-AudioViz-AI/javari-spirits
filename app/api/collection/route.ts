// app/api/collection/route.ts — Javari Spirits
// Personal collection tracker + AI valuation + buy/sell recommendations
// Beats Distiller, Vivino, Whiskybase
// May 17, 2026 — CR AudioViz AI, LLC
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const GROQ_KEY = process.env.GROQ_API_KEY ?? ''
const AWIN_ID  = '2692370'  // Awin publisher ID

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )
}

async function aiAnalyze(prompt: string): Promise<string> {
  if (!GROQ_KEY) return ''
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 800, messages: [{ role: 'user', content: prompt }] }),
  })
  if (res.ok) {
    const d = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
    return d.choices?.[0]?.message?.content ?? ''
  }
  return ''
}

// GET /api/collection?user_id=xxx — fetch user's collection
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  const action = req.nextUrl.searchParams.get('action') ?? 'list'

  if (action === 'capabilities') {
    return NextResponse.json({
      features: ['collection_tracking', 'ai_tasting_notes', 'valuation', 'buy_links', 'portfolio_analytics'],
      beats: ['Distiller', 'Vivino', 'Whiskybase', 'Drizly'],
      cost: '$0.00',
    })
  }

  if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

  const supabase = db()
  const { data: items, error } = await supabase
    .from('spirit_collection')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ collection: [], total_bottles: 0 })

  const total_value = items?.reduce((sum, item) => sum + (item.purchase_price ?? 0), 0) ?? 0
  const current_value = items?.reduce((sum, item) => sum + (item.current_value ?? item.purchase_price ?? 0), 0) ?? 0

  return NextResponse.json({
    collection: items ?? [],
    total_bottles: items?.length ?? 0,
    total_value,
    current_value,
    gain_loss: current_value - total_value,
    gain_loss_pct: total_value > 0 ? ((current_value - total_value) / total_value * 100).toFixed(1) : '0',
  })
}

// POST /api/collection — add bottle, get AI tasting notes, get buy links
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      action: 'add' | 'analyze' | 'tasting_notes' | 'valuation' | 'buy_links'
      user_id?: string
      bottle?: {
        name: string; distillery?: string; age?: number; abv?: number;
        purchase_price?: number; notes?: string; category?: string
      }
      bottle_name?: string
    }

    // AI tasting notes
    if (body.action === 'tasting_notes' || body.action === 'analyze') {
      const bottleName = body.bottle?.name ?? body.bottle_name ?? ''
      if (!bottleName) return NextResponse.json({ error: 'bottle name required' }, { status: 400 })

      const notes = await aiAnalyze(
        `You are a master whisky/spirits expert. Provide tasting notes for "${bottleName}".
Include: nose, palate, finish, overall impression, food pairing suggestion, and investment outlook.
Keep it under 300 words. Be specific and genuine.`
      )

      return NextResponse.json({ tasting_notes: notes, bottle: bottleName, cost: '$0.00' })
    }

    // AI valuation
    if (body.action === 'valuation') {
      const bottleName = body.bottle?.name ?? body.bottle_name ?? ''
      const valuation = await aiAnalyze(
        `You are a spirits investment expert. Provide a market valuation for "${bottleName}".
Include: current market range, investment grade (A/B/C/D), 5-year outlook, comparable bottles, and whether to hold/sell.
Keep under 200 words.`
      )
      return NextResponse.json({ valuation, bottle: bottleName })
    }

    // Buy links via Awin affiliate
    if (body.action === 'buy_links') {
      const bottleName = body.bottle?.name ?? body.bottle_name ?? ''
      // Generate affiliate buy links for popular retailers
      return NextResponse.json({
        buy_links: [
          { retailer: 'Total Wine', url: `https://www.totalwine.com/search/all?text=${encodeURIComponent(bottleName)}&s=shopping&analyticsref=${AWIN_ID}` },
          { retailer: 'Drizly', url: `https://drizly.com/search?q=${encodeURIComponent(bottleName)}` },
          { retailer: 'ReserveBar', url: `https://www.reservebar.com/search?q=${encodeURIComponent(bottleName)}` },
          { retailer: 'Wine.com', url: `https://www.wine.com/search/spirits/${encodeURIComponent(bottleName)}` },
        ],
        note: 'Some links are affiliate links supporting CR AudioViz AI at no extra cost to you',
      })
    }

    // Add to collection
    if (body.action === 'add' && body.user_id && body.bottle) {
      const supabase = db()
      const { data, error } = await supabase.from('spirit_collection').insert({
        user_id: body.user_id,
        name: body.bottle.name,
        distillery: body.bottle.distillery,
        age: body.bottle.age,
        abv: body.bottle.abv,
        purchase_price: body.bottle.purchase_price,
        notes: body.bottle.notes,
        category: body.bottle.category ?? 'whisky',
        created_at: new Date().toISOString(),
      }).select().single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ added: true, bottle: data })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// app/api/barcode/lookup/route.ts
// Enhanced barcode lookup with multiple API fallbacks

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Free UPC APIs to try (in order)
const UPC_APIS = [
  {
    name: 'UPCitemdb',
    url: (upc: string) => `https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`,
    parse: (data: any) => data.items?.[0] ? {
      name: data.items[0].title,
      brand: data.items[0].brand,
      description: data.items[0].description,
      image: data.items[0].images?.[0],
      category: data.items[0].category,
    } : null
  },
  {
    name: 'Open Food Facts',
    url: (upc: string) => `https://world.openfoodfacts.org/api/v0/product/${upc}.json`,
    parse: (data: any) => data.product ? {
      name: data.product.product_name,
      brand: data.product.brands,
      description: data.product.generic_name,
      image: data.product.image_url,
      category: data.product.categories,
      country: data.product.countries,
      abv: data.product.nutriments?.alcohol_100g,
    } : null
  }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const barcode = searchParams.get('barcode')

  if (!barcode) {
    return NextResponse.json({ error: 'Barcode required' }, { status: 400 })
  }

  // Step 1: Check our database first
  const { data: existingSpirit } = await supabase
    .from('bv_spirits')
    .select('*')
    .or(`description.ilike.%${barcode}%,name.ilike.%${barcode}%`)
    .limit(1)
    .single()

  if (existingSpirit) {
    return NextResponse.json({
      found: true,
      source: 'database',
      spirit: existingSpirit
    })
  }

  // Step 2: Try external APIs
  for (const api of UPC_APIS) {
    try {
      const response = await fetch(api.url(barcode), {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      })
      
      if (response.ok) {
        const data = await response.json()
        const parsed = api.parse(data)
        
        if (parsed && parsed.name) {
          return NextResponse.json({
            found: true,
            source: api.name,
            barcode,
            product: parsed,
            needsReview: true // User should confirm before adding
          })
        }
      }
    } catch (e) {
      console.log(`${api.name} failed:`, e)
    }
  }

  // Step 3: Not found - prompt user to add
  return NextResponse.json({
    found: false,
    barcode,
    message: 'Spirit not found. Be the first to add it!',
    suggestAdd: true
  })
}

// POST - Add new spirit from barcode scan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { barcode, name, brand, category, subcategory, abv, msrp, country, description, image_url, userId } = body

    // Validate required fields
    if (!name || !brand || !category) {
      return NextResponse.json({ error: 'Name, brand, and category required' }, { status: 400 })
    }

    // Insert new spirit
    const { data, error } = await supabase
      .from('bv_spirits')
      .insert({
        name,
        brand,
        category,
        subcategory: subcategory || category,
        country: country || 'Unknown',
        abv: abv || 40,
        proof: (abv || 40) * 2,
        msrp: msrp || 30,
        rarity: 'common',
        description: `${description || ''} Barcode: ${barcode}. Added by community.`,
        image_url,
        is_allocated: false,
        is_discontinued: false,
        // Track contributor
        producer_notes: userId ? `Added by user: ${userId}` : 'Community contribution'
      })
      .select()
      .single()

    if (error) throw error

    // Award points to contributor (if user system exists)
    if (userId) {
      await supabase.rpc('award_contribution_points', { 
        user_id: userId, 
        points: 10,
        reason: 'Added new spirit via barcode scan'
      }).catch(() => {}) // Ignore if function doesn't exist
    }

    return NextResponse.json({
      success: true,
      spirit: data,
      message: 'Spirit added successfully! Thank you for contributing.'
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

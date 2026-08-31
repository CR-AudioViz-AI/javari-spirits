// app/api/scanner/label/route.ts
// AI-powered label reading using Vision API

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { lazyAdminDb } from '@/lib/supabase/admin';
// 2026-08-31: LAZY, not module scope. A OpenAI client constructed here runs
// during `next build` when Next collects page data, so the BUILD would need a
// live OPENAI_API_KEY — and the vault cannot serve a build. Constructing on first use
// means the key is read when a request arrives, after hydration has run.
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}
const supabase = lazyAdminDb()

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json() // base64 image

    if (!image) {
      return NextResponse.json({ error: 'Image required' }, { status: 400 })
    }

    // Use GPT-4 Vision to read the label
    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a spirits expert. Analyze this bottle label and extract:
            - name: The spirit name
            - brand: The brand/distillery
            - category: (bourbon, scotch, gin, vodka, rum, tequila, mezcal, brandy, cognac, whiskey, other)
            - subcategory: Specific type (e.g., "Single Malt", "Reposado", "London Dry")
            - abv: Alcohol percentage if visible
            - age: Age statement if visible
            - country: Country of origin
            - description: Any notable text on label
            
            Return ONLY valid JSON, no markdown.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}` }
            },
            { type: 'text', text: 'Extract spirit details from this bottle label.' }
          ]
        }
      ],
      max_tokens: 500
    })

    const aiResponse = response.choices[0].message.content || '{}'
    let extracted
    try {
      extracted = JSON.parse(aiResponse.replace(/```json\n?|\n?```/g, ''))
    } catch {
      extracted = { error: 'Could not parse label', raw: aiResponse }
    }

    // Search our database for matches
    if (extracted.name || extracted.brand) {
      const searchTerm = extracted.name || extracted.brand
      const { data: matches } = await supabase
        .from('bv_spirits')
        .select('id, name, brand, category, image_url, msrp, abv')
        .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`)
        .limit(5)

      return NextResponse.json({
        success: true,
        extracted,
        matches: matches || [],
        needsConfirmation: true
      })
    }

    return NextResponse.json({
      success: true,
      extracted,
      matches: [],
      needsConfirmation: true
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

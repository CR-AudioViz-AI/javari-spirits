/**
 * COCKTAIL GENIUS API
 * ===================
 * Intelligent cocktail matching based on available ingredients
 * 
 * Endpoints:
 * GET /api/cocktails/genius - Get cocktail matches for ingredients
 * POST /api/cocktails/genius - Generate AI cocktail suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

// ============================================
// GET - Find Cocktail Matches
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ingredients = searchParams.get('ingredients')?.split(',').filter(Boolean) || [];
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const perfectOnly = searchParams.get('perfect') === 'true';
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    // Build query
    let query = supabase
      .from('bv_cocktails')
      .select('*')
      .order('name');
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (category) {
      query = query.contains('tags', [category]);
    }
    
    const { data: cocktails, error } = await query.limit(limit * 3); // Get more for filtering
    
    if (error) {
      console.error('Cocktail query error:', error);
      return NextResponse.json({ error: 'Failed to fetch cocktails' }, { status: 500 });
    }
    
    // Calculate match scores
    const matchedCocktails = (cocktails || []).map(cocktail => {
      const required = (cocktail.ingredients || [])
        .filter((i: any) => !i.optional)
        .map((i: any) => normalizeIngredient(i.name));
      
      const optional = (cocktail.ingredients || [])
        .filter((i: any) => i.optional)
        .map((i: any) => normalizeIngredient(i.name));
      
      const normalizedIngredients = ingredients.map(normalizeIngredient);
      
      let matchedRequired = 0;
      let matchedOptional = 0;
      const missing: string[] = [];
      
      for (const ing of required) {
        if (normalizedIngredients.some(ni => ingredientMatches(ni, ing))) {
          matchedRequired++;
        } else {
          missing.push(ing);
        }
      }
      
      for (const ing of optional) {
        if (normalizedIngredients.some(ni => ingredientMatches(ni, ing))) {
          matchedOptional++;
        }
      }
      
      // Score: 0-100
      const requiredScore = required.length > 0 ? (matchedRequired / required.length) * 80 : 80;
      const optionalScore = optional.length > 0 ? (matchedOptional / optional.length) * 20 : 20;
      const score = Math.round(requiredScore + optionalScore);
      
      return {
        ...cocktail,
        match_score: score,
        missing_ingredients: missing,
        matched_required: matchedRequired,
        total_required: required.length,
      };
    });
    
    // Filter and sort
    let results = matchedCocktails
      .filter(c => ingredients.length === 0 || c.match_score > 0)
      .sort((a, b) => b.match_score - a.match_score);
    
    if (perfectOnly) {
      results = results.filter(c => c.match_score === 100);
    }
    
    results = results.slice(0, limit);
    
    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        total: results.length,
        ingredients_provided: ingredients.length,
        perfect_matches: results.filter(c => c.match_score === 100).length,
      },
    });
    
  } catch (error: any) {
    console.error('Cocktail genius error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// POST - AI Cocktail Suggestions
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients, preferences, mood } = body;
    
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 400 });
    }
    
    // Build prompt
    const ingredientList = (ingredients || []).join(', ') || 'various spirits';
    const prefText = preferences ? `Preferences: ${preferences}. ` : '';
    const moodText = mood ? `Mood: ${mood}. ` : '';
    
    const prompt = `You are a master mixologist. Create 3 unique cocktail recipes using these available ingredients: ${ingredientList}.

${prefText}${moodText}

For each cocktail, provide:
1. Creative name
2. Brief description (1 sentence)
3. Ingredients with precise measurements
4. Step-by-step instructions
5. Glass type and garnish
6. Difficulty (easy/medium/hard)

Respond ONLY with valid JSON array:
[{
  "name": "Cocktail Name",
  "description": "Brief description",
  "ingredients": [{"name": "ingredient", "amount": "2", "unit": "oz", "optional": false}],
  "instructions": ["step 1", "step 2"],
  "glass_type": "Rocks",
  "garnish": "Orange peel",
  "difficulty": "easy",
  "tags": ["classic", "whiskey"]
}]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI error:', errorData);
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }
    
    // Parse JSON response
    let suggestions;
    try {
      const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
      suggestions = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Parse error:', parseError, content);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }
    
    // Add metadata
    const enrichedSuggestions = suggestions.map((s: any, idx: number) => ({
      ...s,
      id: `ai-${Date.now()}-${idx}`,
      is_ai_generated: true,
      prep_time_minutes: s.difficulty === 'easy' ? 3 : s.difficulty === 'medium' ? 5 : 8,
    }));
    
    return NextResponse.json({
      success: true,
      data: enrichedSuggestions,
      meta: {
        ai_model: 'gpt-4o-mini',
        ingredients_used: ingredients?.length || 0,
      },
    });
    
  } catch (error: any) {
    console.error('AI cocktail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function normalizeIngredient(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/whiskey/g, 'whisky')
    .replace(/bourbon/g, 'bourbon')
    .replace(/simple syrup/g, 'simplesyrup')
    .replace(/lime juice/g, 'limejuice')
    .replace(/lemon juice/g, 'lemonjuice');
}

function ingredientMatches(a: string, b: string): boolean {
  // Exact match
  if (a === b) return true;
  
  // Contains match
  if (a.includes(b) || b.includes(a)) return true;
  
  // Category matches
  const whiskeys = ['bourbon', 'rye', 'whisky', 'scotch', 'irishwhiskey'];
  const rums = ['whiterum', 'darkrum', 'goldrum', 'spicedrum', 'rum'];
  const tequilas = ['tequilablanco', 'tequilareposado', 'tequilaanejo', 'tequila'];
  const citrus = ['limejuice', 'lemonjuice', 'lime', 'lemon'];
  const orangeLiqueurs = ['triplesec', 'cointreau', 'grandmarnier', 'curacao'];
  
  // Check category groups
  if (whiskeys.includes(a) && whiskeys.includes(b)) return true;
  if (rums.includes(a) && rums.includes(b)) return true;
  if (tequilas.includes(a) && tequilas.includes(b)) return true;
  if (citrus.includes(a) && citrus.includes(b)) return true;
  if (orangeLiqueurs.includes(a) && orangeLiqueurs.includes(b)) return true;
  
  return false;
}

// app/api/barcode/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

// UPC Database API (free tier)
const UPC_API_URL = 'https://api.upcitemdb.com/prod/trial/lookup';

// Open Food Facts API (completely free)
const OFF_API_URL = 'https://world.openfoodfacts.org/api/v0/product';

interface BarcodeResult {
  found: boolean;
  source: 'database' | 'upc' | 'openfoodfacts' | 'manual';
  spirit?: any;
  rawData?: any;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get('code');

  if (!barcode) {
    return NextResponse.json({ error: 'Barcode required' }, { status: 400 });
  }

  // 1. First check our database
  const { data: existingSpirit, error: dbError } = await supabase
    .from('bv_spirits')
    .select('*')
    .or(`description.ilike.%${barcode}%,name.ilike.%${barcode}%`)
    .limit(1)
    .single();

  if (existingSpirit) {
    return NextResponse.json({
      found: true,
      source: 'database',
      spirit: existingSpirit
    });
  }

  // 2. Try Open Food Facts (free, no key needed)
  try {
    const offResponse = await fetch(`${OFF_API_URL}/${barcode}.json`);
    const offData = await offResponse.json();
    
    if (offData.status === 1 && offData.product) {
      const product = offData.product;
      const spirit = {
        name: product.product_name || `Unknown (${barcode})`,
        brand: product.brands?.split(',')[0] || 'Unknown',
        category: detectCategory(product),
        subcategory: product.categories_tags?.[0] || 'Unknown',
        country: product.countries?.split(',')[0] || 'Various',
        abv: product.alcohol_100g || null,
        proof: product.alcohol_100g ? product.alcohol_100g * 2 : null,
        image_url: product.image_url || null,
        barcode: barcode,
        description: `Barcode: ${barcode}`
      };

      return NextResponse.json({
        found: true,
        source: 'openfoodfacts',
        spirit: spirit,
        rawData: product
      });
    }
  } catch (error) {
    console.error('Open Food Facts error:', error);
  }

  // 3. Try UPC Item DB (100 free lookups/day)
  try {
    const upcResponse = await fetch(`${UPC_API_URL}?upc=${barcode}`);
    const upcData = await upcResponse.json();
    
    if (upcData.code === 'OK' && upcData.items?.length > 0) {
      const item = upcData.items[0];
      const spirit = {
        name: item.title || `Unknown (${barcode})`,
        brand: item.brand || 'Unknown',
        category: detectCategoryFromTitle(item.title || ''),
        subcategory: item.category || 'Unknown',
        country: 'Various',
        image_url: item.images?.[0] || null,
        barcode: barcode,
        description: item.description || `Barcode: ${barcode}`
      };

      return NextResponse.json({
        found: true,
        source: 'upc',
        spirit: spirit,
        rawData: item
      });
    }
  } catch (error) {
    console.error('UPC API error:', error);
  }

  // 4. Not found - return for manual entry
  return NextResponse.json({
    found: false,
    source: 'manual',
    barcode: barcode,
    message: 'Product not found. Please add details manually.'
  });
}

// POST to add a new spirit from barcode scan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const spirit = {
      name: body.name,
      brand: body.brand || 'Unknown',
      category: body.category || 'other',
      subcategory: body.subcategory || 'Unknown',
      country: body.country || 'Various',
      abv: body.abv || null,
      proof: body.proof || (body.abv ? body.abv * 2 : null),
      msrp: body.msrp || null,
      description: body.barcode ? `Barcode: ${body.barcode}` : body.description,
      image_url: body.image_url || null,
      rarity: 'common',
      is_allocated: false,
      is_discontinued: false
    };

    const { data, error } = await supabase
      .from('bv_spirits')
      .insert(spirit)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, spirit: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add spirit' }, { status: 500 });
  }
}

function detectCategory(product: any): string {
  const categories = (product.categories_tags || []).join(' ').toLowerCase();
  const name = (product.product_name || '').toLowerCase();
  const combined = `${categories} ${name}`;

  if (combined.includes('bourbon')) return 'bourbon';
  if (combined.includes('scotch') || combined.includes('whisky')) return 'scotch';
  if (combined.includes('whiskey') && combined.includes('irish')) return 'irish';
  if (combined.includes('rye')) return 'rye';
  if (combined.includes('vodka')) return 'vodka';
  if (combined.includes('gin')) return 'gin';
  if (combined.includes('rum')) return 'rum';
  if (combined.includes('tequila')) return 'tequila';
  if (combined.includes('mezcal')) return 'mezcal';
  if (combined.includes('cognac')) return 'cognac';
  if (combined.includes('brandy')) return 'brandy';
  if (combined.includes('beer') || combined.includes('lager') || combined.includes('ale')) return 'beer';
  if (combined.includes('wine')) return 'wine';
  if (combined.includes('sake')) return 'sake';
  return 'other';
}

function detectCategoryFromTitle(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('bourbon')) return 'bourbon';
  if (lower.includes('scotch')) return 'scotch';
  if (lower.includes('whiskey') || lower.includes('whisky')) return 'other';
  if (lower.includes('vodka')) return 'vodka';
  if (lower.includes('gin')) return 'gin';
  if (lower.includes('rum')) return 'rum';
  if (lower.includes('tequila')) return 'tequila';
  if (lower.includes('beer')) return 'beer';
  if (lower.includes('wine')) return 'wine';
  return 'other';
}

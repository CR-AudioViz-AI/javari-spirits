/**
 * SPIRIT DATA IMPORT API
 * =======================
 * Bulk import spirits data into the database
 * 
 * POST /api/admin/import-spirits - Import spirits data
 * GET /api/admin/import-spirits - Get import status
 */

import { NextRequest, NextResponse } from 'next/server';
import { lazyAdminDb } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';

const supabase = lazyAdminDb();

// ============================================
// SAMPLE SPIRITS DATA
// ============================================

const SAMPLE_SPIRITS = [
  // BOURBON
  { name: 'Buffalo Trace', brand: 'Buffalo Trace', category: 'Bourbon', subcategory: 'Kentucky Straight', abv: 45, price_range: '$25-35', description: 'A rich, complex bourbon with notes of vanilla, toffee, and candied fruit. Deep amber color with a long, smooth finish.', flavor_profile: { nose: ['Vanilla', 'Caramel', 'Mint'], palate: ['Toffee', 'Oak', 'Spice'], finish: ['Smooth', 'Sweet', 'Long'] }, community_rating: 4.2, verified: true },
  { name: 'Eagle Rare 10 Year', brand: 'Buffalo Trace', category: 'Bourbon', subcategory: 'Single Barrel', abv: 45, price_range: '$35-45', description: 'Bold, dry, and delicate with notes of toffee, hints of orange peel, herbs, honey, leather, and oak.', flavor_profile: { nose: ['Orange Peel', 'Honey', 'Leather'], palate: ['Toffee', 'Oak', 'Herbs'], finish: ['Dry', 'Complex', 'Long'] }, community_rating: 4.5, verified: true },
  { name: 'Blanton\'s Original', brand: 'Buffalo Trace', category: 'Bourbon', subcategory: 'Single Barrel', abv: 46.5, price_range: '$65-150', description: 'Deep amber color with notes of citrus, honey, and vanilla. The finish is long with hints of toasted oak.', flavor_profile: { nose: ['Citrus', 'Honey', 'Vanilla'], palate: ['Caramel', 'Corn', 'Spice'], finish: ['Toasted Oak', 'Sweet', 'Long'] }, community_rating: 4.6, verified: true },
  { name: 'Pappy Van Winkle 15 Year', brand: 'Old Rip Van Winkle', category: 'Bourbon', subcategory: 'Wheated', abv: 53.5, price_range: '$119-2500', description: 'Rich mahogany color with cherry and leather notes on the nose. Complex palate with caramel, vanilla, and dried fruit.', flavor_profile: { nose: ['Cherry', 'Leather', 'Tobacco'], palate: ['Caramel', 'Vanilla', 'Dried Fruit'], finish: ['Endless', 'Complex', 'Warm'] }, community_rating: 4.9, verified: true },
  { name: 'Maker\'s Mark', brand: 'Maker\'s Mark', category: 'Bourbon', subcategory: 'Wheated', abv: 45, price_range: '$25-35', description: 'Soft wheat notes with hints of caramel and vanilla. Smooth, balanced, and approachable.', flavor_profile: { nose: ['Wheat', 'Vanilla', 'Fruit'], palate: ['Caramel', 'Honey', 'Soft Oak'], finish: ['Smooth', 'Sweet', 'Medium'] }, community_rating: 4.0, verified: true },
  { name: 'Woodford Reserve', brand: 'Brown-Forman', category: 'Bourbon', subcategory: 'Small Batch', abv: 45.2, price_range: '$35-45', description: 'Rich and complex with dried fruit, vanilla, and tobacco notes. Silky smooth with a long finish.', flavor_profile: { nose: ['Dried Fruit', 'Vanilla', 'Tobacco'], palate: ['Chocolate', 'Spice', 'Oak'], finish: ['Silky', 'Long', 'Warm'] }, community_rating: 4.3, verified: true },
  { name: 'Wild Turkey 101', brand: 'Wild Turkey', category: 'Bourbon', subcategory: 'Kentucky Straight', abv: 50.5, price_range: '$22-30', description: 'Bold and spicy with vanilla, caramel, and honey notes. Classic high-proof bourbon.', flavor_profile: { nose: ['Vanilla', 'Honey', 'Spice'], palate: ['Caramel', 'Pepper', 'Oak'], finish: ['Spicy', 'Warm', 'Long'] }, community_rating: 4.1, verified: true },
  { name: 'Four Roses Single Barrel', brand: 'Four Roses', category: 'Bourbon', subcategory: 'Single Barrel', abv: 50, price_range: '$45-55', description: 'Mellow and smooth with ripe plum, cherry, and spice notes. Complex and well-balanced.', flavor_profile: { nose: ['Plum', 'Cherry', 'Rose'], palate: ['Spice', 'Honey', 'Oak'], finish: ['Smooth', 'Long', 'Fruity'] }, community_rating: 4.4, verified: true },
  { name: 'Elijah Craig Small Batch', brand: 'Heaven Hill', category: 'Bourbon', subcategory: 'Small Batch', abv: 47, price_range: '$30-40', description: 'Rich caramel and vanilla with hints of smoke and spice. Named after the father of bourbon.', flavor_profile: { nose: ['Caramel', 'Vanilla', 'Smoke'], palate: ['Toffee', 'Spice', 'Oak'], finish: ['Warm', 'Sweet', 'Long'] }, community_rating: 4.3, verified: true },
  
  // SCOTCH
  { name: 'Glenfiddich 12 Year', brand: 'Glenfiddich', category: 'Scotch', subcategory: 'Speyside', abv: 40, price_range: '$35-45', description: 'Fresh pear, subtle oak, and a hint of sweet vanilla. Light and approachable single malt.', flavor_profile: { nose: ['Pear', 'Apple', 'Oak'], palate: ['Vanilla', 'Honey', 'Malt'], finish: ['Light', 'Clean', 'Sweet'] }, community_rating: 4.0, verified: true },
  { name: 'The Glenlivet 12', brand: 'The Glenlivet', category: 'Scotch', subcategory: 'Speyside', abv: 40, price_range: '$35-45', description: 'Fruity and floral with tropical notes and a smooth, balanced finish.', flavor_profile: { nose: ['Tropical Fruit', 'Floral', 'Citrus'], palate: ['Vanilla', 'Honey', 'Almond'], finish: ['Smooth', 'Creamy', 'Medium'] }, community_rating: 4.1, verified: true },
  { name: 'Macallan 12 Double Cask', brand: 'The Macallan', category: 'Scotch', subcategory: 'Speyside', abv: 40, price_range: '$60-80', description: 'Rich sherry-oak character with dried fruits, butterscotch, and warm spices.', flavor_profile: { nose: ['Dried Fruit', 'Sherry', 'Vanilla'], palate: ['Butterscotch', 'Ginger', 'Oak'], finish: ['Warm', 'Long', 'Sweet'] }, community_rating: 4.4, verified: true },
  { name: 'Laphroaig 10 Year', brand: 'Laphroaig', category: 'Scotch', subcategory: 'Islay', abv: 40, price_range: '$45-55', description: 'Intense peat smoke with notes of seaweed, iodine, and medicinal elements. Bold and distinctive.', flavor_profile: { nose: ['Peat', 'Smoke', 'Seaweed'], palate: ['Iodine', 'Salt', 'Vanilla'], finish: ['Long', 'Smoky', 'Medicinal'] }, community_rating: 4.3, verified: true },
  { name: 'Ardbeg 10 Year', brand: 'Ardbeg', category: 'Scotch', subcategory: 'Islay', abv: 46, price_range: '$50-60', description: 'Massive peat with sweet vanilla and citrus notes. Complex and rewarding.', flavor_profile: { nose: ['Peat', 'Lemon', 'Smoke'], palate: ['Vanilla', 'Espresso', 'Black Pepper'], finish: ['Long', 'Smoky', 'Complex'] }, community_rating: 4.5, verified: true },
  
  // TEQUILA
  { name: 'Don Julio Blanco', brand: 'Don Julio', category: 'Tequila', subcategory: 'Blanco', abv: 40, price_range: '$45-55', description: 'Crisp blue agave with hints of citrus and pepper. Clean and pure expression.', flavor_profile: { nose: ['Agave', 'Citrus', 'Pepper'], palate: ['Sweet Agave', 'Lime', 'Mineral'], finish: ['Clean', 'Bright', 'Medium'] }, community_rating: 4.2, verified: true },
  { name: 'Don Julio 1942', brand: 'Don Julio', category: 'Tequila', subcategory: 'Añejo', abv: 40, price_range: '$150-180', description: 'Luxurious añejo with caramel, vanilla, and roasted agave. Silky smooth finish.', flavor_profile: { nose: ['Caramel', 'Vanilla', 'Roasted Agave'], palate: ['Butterscotch', 'Cinnamon', 'Oak'], finish: ['Silky', 'Long', 'Warm'] }, community_rating: 4.6, verified: true },
  { name: 'Patron Silver', brand: 'Patron', category: 'Tequila', subcategory: 'Blanco', abv: 40, price_range: '$40-50', description: 'Smooth and sweet with fresh agave, citrus, and light pepper notes.', flavor_profile: { nose: ['Agave', 'Citrus', 'Floral'], palate: ['Sweet', 'Pepper', 'Fruit'], finish: ['Smooth', 'Light', 'Clean'] }, community_rating: 4.0, verified: true },
  { name: 'Casamigos Reposado', brand: 'Casamigos', category: 'Tequila', subcategory: 'Reposado', abv: 40, price_range: '$50-60', description: 'Soft, silky, and smooth with caramel and cocoa notes from oak aging.', flavor_profile: { nose: ['Caramel', 'Vanilla', 'Agave'], palate: ['Cocoa', 'Oak', 'Sweet'], finish: ['Silky', 'Smooth', 'Long'] }, community_rating: 4.1, verified: true },
  
  // RUM
  { name: 'Diplomatico Reserva Exclusiva', brand: 'Diplomatico', category: 'Rum', subcategory: 'Venezuelan', abv: 40, price_range: '$35-45', description: 'Rich and sweet with notes of toffee, dark chocolate, and dried fruit.', flavor_profile: { nose: ['Toffee', 'Chocolate', 'Orange Peel'], palate: ['Caramel', 'Vanilla', 'Dried Fruit'], finish: ['Sweet', 'Long', 'Warm'] }, community_rating: 4.5, verified: true },
  { name: 'Kraken Black Spiced', brand: 'Kraken', category: 'Rum', subcategory: 'Spiced', abv: 47, price_range: '$22-28', description: 'Bold spiced rum with vanilla, cinnamon, and coffee notes. Dark and mysterious.', flavor_profile: { nose: ['Vanilla', 'Cinnamon', 'Coffee'], palate: ['Spice', 'Molasses', 'Ginger'], finish: ['Bold', 'Spicy', 'Long'] }, community_rating: 4.0, verified: true },
  { name: 'Bacardi Superior', brand: 'Bacardi', category: 'Rum', subcategory: 'White', abv: 40, price_range: '$15-20', description: 'Light and clean with subtle almond and vanilla notes. Perfect for cocktails.', flavor_profile: { nose: ['Light', 'Vanilla', 'Almond'], palate: ['Clean', 'Sweet', 'Citrus'], finish: ['Light', 'Crisp', 'Short'] }, community_rating: 3.5, verified: true },
  
  // VODKA
  { name: 'Tito\'s Handmade Vodka', brand: 'Tito\'s', category: 'Vodka', subcategory: 'Corn', abv: 40, price_range: '$20-25', description: 'Smooth and clean with a slightly sweet corn character. Great for sipping or mixing.', flavor_profile: { nose: ['Clean', 'Corn', 'Sweet'], palate: ['Smooth', 'Sweet', 'Pepper'], finish: ['Clean', 'Smooth', 'Medium'] }, community_rating: 4.1, verified: true },
  { name: 'Grey Goose', brand: 'Grey Goose', category: 'Vodka', subcategory: 'French Wheat', abv: 40, price_range: '$30-40', description: 'Soft, gently sweet with hints of almond and citrus. Premium French vodka.', flavor_profile: { nose: ['Soft', 'Citrus', 'Almond'], palate: ['Smooth', 'Sweet', 'Floral'], finish: ['Clean', 'Elegant', 'Long'] }, community_rating: 4.2, verified: true },
  { name: 'Ketel One', brand: 'Ketel One', category: 'Vodka', subcategory: 'Dutch', abv: 40, price_range: '$25-30', description: 'Crisp and fresh with subtle citrus and honey notes. Exceptionally smooth.', flavor_profile: { nose: ['Citrus', 'Honey', 'Fresh'], palate: ['Crisp', 'Clean', 'Smooth'], finish: ['Fresh', 'Clean', 'Medium'] }, community_rating: 4.1, verified: true },
  
  // GIN
  { name: 'Hendrick\'s Gin', brand: 'Hendrick\'s', category: 'Gin', subcategory: 'Scottish', abv: 41.4, price_range: '$35-40', description: 'Unique infusion of cucumber and rose petals with classic juniper backbone.', flavor_profile: { nose: ['Cucumber', 'Rose', 'Juniper'], palate: ['Floral', 'Fresh', 'Citrus'], finish: ['Smooth', 'Fresh', 'Long'] }, community_rating: 4.3, verified: true },
  { name: 'Tanqueray', brand: 'Tanqueray', category: 'Gin', subcategory: 'London Dry', abv: 43.1, price_range: '$22-28', description: 'Bold juniper with citrus, coriander, and angelica. Classic London Dry style.', flavor_profile: { nose: ['Juniper', 'Citrus', 'Coriander'], palate: ['Bold', 'Spicy', 'Herbal'], finish: ['Dry', 'Clean', 'Long'] }, community_rating: 4.1, verified: true },
  { name: 'Bombay Sapphire', brand: 'Bombay', category: 'Gin', subcategory: 'London Dry', abv: 40, price_range: '$25-30', description: 'Light and floral with 10 botanicals. Bright and refreshing.', flavor_profile: { nose: ['Floral', 'Citrus', 'Juniper'], palate: ['Light', 'Herbal', 'Spice'], finish: ['Bright', 'Clean', 'Medium'] }, community_rating: 4.0, verified: true },
  
  // COGNAC
  { name: 'Hennessy VS', brand: 'Hennessy', category: 'Cognac', subcategory: 'VS', abv: 40, price_range: '$35-45', description: 'Bold and fragrant with notes of vanilla, oak, and grilled almonds.', flavor_profile: { nose: ['Vanilla', 'Oak', 'Fruit'], palate: ['Smooth', 'Sweet', 'Spice'], finish: ['Warm', 'Medium', 'Oak'] }, community_rating: 3.9, verified: true },
  { name: 'Rémy Martin VSOP', brand: 'Rémy Martin', category: 'Cognac', subcategory: 'VSOP', abv: 40, price_range: '$50-60', description: 'Rich and complex with vanilla, apricot, and subtle oak notes.', flavor_profile: { nose: ['Vanilla', 'Apricot', 'Floral'], palate: ['Rich', 'Fruity', 'Spice'], finish: ['Long', 'Warm', 'Elegant'] }, community_rating: 4.2, verified: true },
];

// ============================================
// POST - Import Spirits
// ============================================

export async function POST(request: NextRequest) {
  try {
    // Check for admin authorization (in production, use proper auth)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes('admin')) {
      // For demo, allow import without auth
    }

    const body = await request.json();
    const spiritsToImport = body.spirits || SAMPLE_SPIRITS;

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const spirit of spiritsToImport) {
      try {
        // Check if spirit already exists
        const { data: existing } = await supabase
          .from('bv_spirits')
          .select('id')
          .eq('name', spirit.name)
          .eq('brand', spirit.brand)
          .single();

        if (existing) {
          skipped++;
          continue;
        }

        // Insert new spirit
        const { error } = await supabase
          .from('bv_spirits')
          .insert({
            name: spirit.name,
            brand: spirit.brand,
            category: spirit.category,
            subcategory: spirit.subcategory,
            abv: spirit.abv,
            price_range: spirit.price_range,
            description: spirit.description,
            flavor_profile: spirit.flavor_profile,
            community_rating: spirit.community_rating,
            verified: spirit.verified || false,
            created_at: new Date().toISOString(),
          });

        if (error) {
          errors.push(`${spirit.name}: ${error.message}`);
        } else {
          imported++;
        }
      } catch (err: any) {
        errors.push(`${spirit.name}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      message: `Imported ${imported} spirits, skipped ${skipped} duplicates`,
    });

  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// GET - Get Sample Spirits (for preview)
// ============================================

export async function GET() {
  return NextResponse.json({
    success: true,
    sampleCount: SAMPLE_SPIRITS.length,
    categories: [...new Set(SAMPLE_SPIRITS.map(s => s.category))],
    samples: SAMPLE_SPIRITS.slice(0, 5),
    message: 'POST to this endpoint to import spirits',
  });
}

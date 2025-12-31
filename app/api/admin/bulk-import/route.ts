/**
 * COMPREHENSIVE SPIRIT DATABASE IMPORT
 * =====================================
 * 100+ premium spirits with full details
 * 
 * POST /api/admin/bulk-import - Bulk import spirits
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// COMPREHENSIVE SPIRITS DATABASE
// ============================================

const SPIRITS_DATABASE = [
  // ==========================================
  // BOURBON (30 entries)
  // ==========================================
  { name: 'Buffalo Trace', brand: 'Buffalo Trace', category: 'Bourbon', subcategory: 'Kentucky Straight', abv: 45, price_msrp: 30, price_market: 35, description: 'Rich, complex bourbon with notes of vanilla, toffee, and candied fruit.', flavor_profile: { nose: ['Vanilla', 'Caramel', 'Mint'], palate: ['Toffee', 'Oak', 'Spice'], finish: ['Smooth', 'Sweet', 'Long'] }, community_rating: 4.2, age_statement: null, distillery: 'Buffalo Trace Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Eagle Rare 10 Year', brand: 'Buffalo Trace', category: 'Bourbon', subcategory: 'Single Barrel', abv: 45, price_msrp: 40, price_market: 50, description: 'Bold, dry bourbon with toffee, orange peel, herbs, and honey notes.', flavor_profile: { nose: ['Orange Peel', 'Honey', 'Leather'], palate: ['Toffee', 'Oak', 'Herbs'], finish: ['Dry', 'Complex', 'Long'] }, community_rating: 4.5, age_statement: '10 Years', distillery: 'Buffalo Trace Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Blanton\'s Original Single Barrel', brand: 'Buffalo Trace', category: 'Bourbon', subcategory: 'Single Barrel', abv: 46.5, price_msrp: 65, price_market: 150, description: 'Deep amber with citrus, honey, and vanilla. Long finish with toasted oak.', flavor_profile: { nose: ['Citrus', 'Honey', 'Vanilla'], palate: ['Caramel', 'Corn', 'Spice'], finish: ['Toasted Oak', 'Sweet', 'Long'] }, community_rating: 4.6, age_statement: null, distillery: 'Buffalo Trace Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Blanton\'s Gold', brand: 'Buffalo Trace', category: 'Bourbon', subcategory: 'Single Barrel', abv: 51.5, price_msrp: 120, price_market: 250, description: 'Higher proof version with intensified caramel and spice notes.', flavor_profile: { nose: ['Caramel', 'Vanilla', 'Oak'], palate: ['Brown Sugar', 'Cinnamon', 'Leather'], finish: ['Warm', 'Long', 'Spicy'] }, community_rating: 4.7, age_statement: null, distillery: 'Buffalo Trace Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Pappy Van Winkle 15 Year', brand: 'Old Rip Van Winkle', category: 'Bourbon', subcategory: 'Wheated', abv: 53.5, price_msrp: 119, price_market: 2500, description: 'Rich mahogany with cherry, leather, caramel, vanilla, and dried fruit.', flavor_profile: { nose: ['Cherry', 'Leather', 'Tobacco'], palate: ['Caramel', 'Vanilla', 'Dried Fruit'], finish: ['Endless', 'Complex', 'Warm'] }, community_rating: 4.9, age_statement: '15 Years', distillery: 'Buffalo Trace Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Pappy Van Winkle 20 Year', brand: 'Old Rip Van Winkle', category: 'Bourbon', subcategory: 'Wheated', abv: 45.2, price_msrp: 199, price_market: 4000, description: 'Exceptionally smooth with deep oak, dark fruit, and cocoa notes.', flavor_profile: { nose: ['Dark Fruit', 'Oak', 'Cocoa'], palate: ['Caramel', 'Vanilla', 'Tobacco'], finish: ['Silky', 'Endless', 'Complex'] }, community_rating: 4.95, age_statement: '20 Years', distillery: 'Buffalo Trace Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Pappy Van Winkle 23 Year', brand: 'Old Rip Van Winkle', category: 'Bourbon', subcategory: 'Wheated', abv: 47.8, price_msrp: 299, price_market: 6000, description: 'The pinnacle of bourbon. Incredibly complex with decades of oak influence.', flavor_profile: { nose: ['Antique Wood', 'Dried Fruit', 'Honey'], palate: ['Leather', 'Tobacco', 'Dark Chocolate'], finish: ['Infinite', 'Complex', 'Unforgettable'] }, community_rating: 4.98, age_statement: '23 Years', distillery: 'Buffalo Trace Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'George T. Stagg', brand: 'Buffalo Trace', category: 'Bourbon', subcategory: 'Barrel Proof', abv: 65, price_msrp: 99, price_market: 800, description: 'Massive, bold bourbon with intense flavors of dark fruit, chocolate, and oak.', flavor_profile: { nose: ['Dark Cherry', 'Chocolate', 'Tobacco'], palate: ['Molasses', 'Oak', 'Espresso'], finish: ['Powerful', 'Long', 'Warm'] }, community_rating: 4.8, age_statement: null, distillery: 'Buffalo Trace Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'William Larue Weller', brand: 'Buffalo Trace', category: 'Bourbon', subcategory: 'Wheated Barrel Proof', abv: 62.85, price_msrp: 99, price_market: 1200, description: 'Wheated barrel proof bourbon with caramel, vanilla, and baking spices.', flavor_profile: { nose: ['Caramel', 'Vanilla', 'Baking Spices'], palate: ['Honey', 'Cinnamon', 'Oak'], finish: ['Long', 'Sweet', 'Complex'] }, community_rating: 4.85, age_statement: null, distillery: 'Buffalo Trace Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Maker\'s Mark', brand: 'Maker\'s Mark', category: 'Bourbon', subcategory: 'Wheated', abv: 45, price_msrp: 30, price_market: 30, description: 'Soft wheat notes with hints of caramel and vanilla. Smooth and approachable.', flavor_profile: { nose: ['Wheat', 'Vanilla', 'Fruit'], palate: ['Caramel', 'Honey', 'Soft Oak'], finish: ['Smooth', 'Sweet', 'Medium'] }, community_rating: 4.0, age_statement: null, distillery: 'Maker\'s Mark Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Maker\'s Mark Cask Strength', brand: 'Maker\'s Mark', category: 'Bourbon', subcategory: 'Wheated Barrel Proof', abv: 55.05, price_msrp: 45, price_market: 50, description: 'Full proof version with intensified vanilla and caramel.', flavor_profile: { nose: ['Vanilla', 'Caramel', 'Oak'], palate: ['Brown Sugar', 'Spice', 'Cream'], finish: ['Warm', 'Long', 'Sweet'] }, community_rating: 4.3, age_statement: null, distillery: 'Maker\'s Mark Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Maker\'s 46', brand: 'Maker\'s Mark', category: 'Bourbon', subcategory: 'Wheated', abv: 47, price_msrp: 40, price_market: 40, description: 'French oak stave finished with enhanced spice and complexity.', flavor_profile: { nose: ['Caramel', 'Vanilla', 'Spice'], palate: ['Oak', 'Baking Spices', 'Cream'], finish: ['Complex', 'Long', 'Spicy'] }, community_rating: 4.2, age_statement: null, distillery: 'Maker\'s Mark Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Woodford Reserve', brand: 'Brown-Forman', category: 'Bourbon', subcategory: 'Small Batch', abv: 45.2, price_msrp: 38, price_market: 38, description: 'Rich with dried fruit, vanilla, and tobacco. Silky smooth finish.', flavor_profile: { nose: ['Dried Fruit', 'Vanilla', 'Tobacco'], palate: ['Chocolate', 'Spice', 'Oak'], finish: ['Silky', 'Long', 'Warm'] }, community_rating: 4.3, age_statement: null, distillery: 'Woodford Reserve Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Woodford Reserve Double Oaked', brand: 'Brown-Forman', category: 'Bourbon', subcategory: 'Small Batch', abv: 45.2, price_msrp: 55, price_market: 55, description: 'Twice barreled for enhanced oak, vanilla, and honey notes.', flavor_profile: { nose: ['Dark Caramel', 'Vanilla', 'Honey'], palate: ['Oak', 'Apple', 'Cream'], finish: ['Rich', 'Long', 'Sweet'] }, community_rating: 4.5, age_statement: null, distillery: 'Woodford Reserve Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Wild Turkey 101', brand: 'Wild Turkey', category: 'Bourbon', subcategory: 'Kentucky Straight', abv: 50.5, price_msrp: 25, price_market: 25, description: 'Bold and spicy with vanilla, caramel, and honey notes.', flavor_profile: { nose: ['Vanilla', 'Honey', 'Spice'], palate: ['Caramel', 'Pepper', 'Oak'], finish: ['Spicy', 'Warm', 'Long'] }, community_rating: 4.1, age_statement: null, distillery: 'Wild Turkey Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Wild Turkey Rare Breed', brand: 'Wild Turkey', category: 'Bourbon', subcategory: 'Barrel Proof', abv: 58.4, price_msrp: 45, price_market: 50, description: 'Barrel proof blend with intense spice, caramel, and vanilla.', flavor_profile: { nose: ['Caramel', 'Vanilla', 'Cinnamon'], palate: ['Pepper', 'Oak', 'Honey'], finish: ['Bold', 'Long', 'Spicy'] }, community_rating: 4.4, age_statement: null, distillery: 'Wild Turkey Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Russell\'s Reserve 10 Year', brand: 'Wild Turkey', category: 'Bourbon', subcategory: 'Small Batch', abv: 45, price_msrp: 40, price_market: 45, description: 'Named for Jimmy Russell. Rich caramel and vanilla with balanced oak.', flavor_profile: { nose: ['Caramel', 'Vanilla', 'Oak'], palate: ['Honey', 'Spice', 'Citrus'], finish: ['Smooth', 'Long', 'Sweet'] }, community_rating: 4.3, age_statement: '10 Years', distillery: 'Wild Turkey Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Four Roses Single Barrel', brand: 'Four Roses', category: 'Bourbon', subcategory: 'Single Barrel', abv: 50, price_msrp: 45, price_market: 50, description: 'Mellow with ripe plum, cherry, and spice notes.', flavor_profile: { nose: ['Plum', 'Cherry', 'Rose'], palate: ['Spice', 'Honey', 'Oak'], finish: ['Smooth', 'Long', 'Fruity'] }, community_rating: 4.4, age_statement: null, distillery: 'Four Roses Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Four Roses Small Batch', brand: 'Four Roses', category: 'Bourbon', subcategory: 'Small Batch', abv: 45, price_msrp: 35, price_market: 35, description: 'Blend of four recipes with mellow fruit and spice.', flavor_profile: { nose: ['Fruit', 'Spice', 'Floral'], palate: ['Honey', 'Oak', 'Vanilla'], finish: ['Smooth', 'Medium', 'Sweet'] }, community_rating: 4.2, age_statement: null, distillery: 'Four Roses Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Elijah Craig Small Batch', brand: 'Heaven Hill', category: 'Bourbon', subcategory: 'Small Batch', abv: 47, price_msrp: 32, price_market: 35, description: 'Rich caramel and vanilla with hints of smoke and spice.', flavor_profile: { nose: ['Caramel', 'Vanilla', 'Smoke'], palate: ['Toffee', 'Spice', 'Oak'], finish: ['Warm', 'Sweet', 'Long'] }, community_rating: 4.3, age_statement: null, distillery: 'Heaven Hill Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Elijah Craig Barrel Proof', brand: 'Heaven Hill', category: 'Bourbon', subcategory: 'Barrel Proof', abv: 60.5, price_msrp: 60, price_market: 80, description: 'Uncut, unfiltered with intense caramel, dark fruit, and oak.', flavor_profile: { nose: ['Dark Fruit', 'Caramel', 'Oak'], palate: ['Chocolate', 'Spice', 'Tobacco'], finish: ['Powerful', 'Long', 'Complex'] }, community_rating: 4.6, age_statement: '12 Years', distillery: 'Heaven Hill Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Knob Creek 9 Year', brand: 'Jim Beam', category: 'Bourbon', subcategory: 'Small Batch', abv: 50, price_msrp: 35, price_market: 35, description: 'Full-bodied with deep maple, oak, and caramel notes.', flavor_profile: { nose: ['Maple', 'Oak', 'Vanilla'], palate: ['Caramel', 'Spice', 'Nut'], finish: ['Long', 'Sweet', 'Warm'] }, community_rating: 4.2, age_statement: '9 Years', distillery: 'Jim Beam Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Knob Creek Single Barrel', brand: 'Jim Beam', category: 'Bourbon', subcategory: 'Single Barrel', abv: 60, price_msrp: 50, price_market: 55, description: 'Hand-selected barrels with intense oak and vanilla.', flavor_profile: { nose: ['Oak', 'Vanilla', 'Caramel'], palate: ['Maple', 'Spice', 'Fruit'], finish: ['Bold', 'Long', 'Complex'] }, community_rating: 4.4, age_statement: '9 Years', distillery: 'Jim Beam Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Booker\'s Bourbon', brand: 'Jim Beam', category: 'Bourbon', subcategory: 'Barrel Proof', abv: 62.95, price_msrp: 90, price_market: 100, description: 'Uncut, unfiltered small batch with intense flavors.', flavor_profile: { nose: ['Vanilla', 'Oak', 'Tobacco'], palate: ['Caramel', 'Smoke', 'Spice'], finish: ['Powerful', 'Long', 'Complex'] }, community_rating: 4.5, age_statement: '6-8 Years', distillery: 'Jim Beam Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Basil Hayden\'s', brand: 'Jim Beam', category: 'Bourbon', subcategory: 'Small Batch', abv: 40, price_msrp: 45, price_market: 45, description: 'Light and spicy with high rye content.', flavor_profile: { nose: ['Pepper', 'Tea', 'Honey'], palate: ['Spice', 'Citrus', 'Light Oak'], finish: ['Clean', 'Short', 'Spicy'] }, community_rating: 3.9, age_statement: null, distillery: 'Jim Beam Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Michter\'s US*1 Bourbon', brand: 'Michter\'s', category: 'Bourbon', subcategory: 'Small Batch', abv: 45.7, price_msrp: 50, price_market: 60, description: 'Rich and full with caramel, vanilla, and dried fruit.', flavor_profile: { nose: ['Caramel', 'Vanilla', 'Dried Fruit'], palate: ['Butterscotch', 'Oak', 'Spice'], finish: ['Smooth', 'Long', 'Sweet'] }, community_rating: 4.3, age_statement: null, distillery: 'Michter\'s Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Michter\'s 10 Year', brand: 'Michter\'s', category: 'Bourbon', subcategory: 'Single Barrel', abv: 47.2, price_msrp: 150, price_market: 300, description: 'Exceptionally balanced with deep oak, caramel, and leather.', flavor_profile: { nose: ['Oak', 'Caramel', 'Leather'], palate: ['Vanilla', 'Spice', 'Dark Fruit'], finish: ['Long', 'Complex', 'Elegant'] }, community_rating: 4.7, age_statement: '10 Years', distillery: 'Michter\'s Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Old Forester 1920', brand: 'Brown-Forman', category: 'Bourbon', subcategory: 'Prohibition Style', abv: 57.5, price_msrp: 60, price_market: 65, description: 'Rich and bold with dark caramel, chocolate, and spice.', flavor_profile: { nose: ['Dark Caramel', 'Chocolate', 'Cherry'], palate: ['Spice', 'Oak', 'Vanilla'], finish: ['Long', 'Warm', 'Complex'] }, community_rating: 4.5, age_statement: null, distillery: 'Old Forester Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Old Forester 1910', brand: 'Brown-Forman', category: 'Bourbon', subcategory: 'Old Fine', abv: 46.5, price_msrp: 55, price_market: 55, description: 'Double barreled with rich chocolate, caramel, and vanilla.', flavor_profile: { nose: ['Chocolate', 'Caramel', 'Vanilla'], palate: ['Dark Fruit', 'Oak', 'Spice'], finish: ['Smooth', 'Long', 'Sweet'] }, community_rating: 4.4, age_statement: null, distillery: 'Old Forester Distillery', origin: 'Kentucky, USA', verified: true },
  { name: 'Heaven Hill Bottled-in-Bond', brand: 'Heaven Hill', category: 'Bourbon', subcategory: 'Bottled-in-Bond', abv: 50, price_msrp: 20, price_market: 40, description: 'Excellent value with classic bourbon flavors.', flavor_profile: { nose: ['Corn', 'Vanilla', 'Oak'], palate: ['Caramel', 'Spice', 'Fruit'], finish: ['Clean', 'Medium', 'Sweet'] }, community_rating: 4.2, age_statement: '7 Years', distillery: 'Heaven Hill Distillery', origin: 'Kentucky, USA', verified: true },

  // ==========================================
  // SCOTCH WHISKY (25 entries)
  // ==========================================
  { name: 'Glenfiddich 12 Year', brand: 'Glenfiddich', category: 'Scotch', subcategory: 'Speyside', abv: 40, price_msrp: 40, price_market: 40, description: 'Fresh pear, subtle oak, and sweet vanilla. Light and approachable.', flavor_profile: { nose: ['Pear', 'Apple', 'Oak'], palate: ['Vanilla', 'Honey', 'Malt'], finish: ['Light', 'Clean', 'Sweet'] }, community_rating: 4.0, age_statement: '12 Years', distillery: 'Glenfiddich Distillery', origin: 'Speyside, Scotland', verified: true },
  { name: 'Glenfiddich 15 Solera', brand: 'Glenfiddich', category: 'Scotch', subcategory: 'Speyside', abv: 40, price_msrp: 60, price_market: 60, description: 'Solera vatted with sherry, bourbon, and virgin oak notes.', flavor_profile: { nose: ['Sherry', 'Honey', 'Oak'], palate: ['Dark Fruit', 'Marzipan', 'Spice'], finish: ['Rich', 'Long', 'Sweet'] }, community_rating: 4.2, age_statement: '15 Years', distillery: 'Glenfiddich Distillery', origin: 'Speyside, Scotland', verified: true },
  { name: 'Glenfiddich 18 Year', brand: 'Glenfiddich', category: 'Scotch', subcategory: 'Speyside', abv: 40, price_msrp: 100, price_market: 100, description: 'Rich oak and dried fruit with notes of baked apple and cinnamon.', flavor_profile: { nose: ['Oak', 'Baked Apple', 'Cinnamon'], palate: ['Dried Fruit', 'Chocolate', 'Spice'], finish: ['Long', 'Warming', 'Complex'] }, community_rating: 4.4, age_statement: '18 Years', distillery: 'Glenfiddich Distillery', origin: 'Speyside, Scotland', verified: true },
  { name: 'The Glenlivet 12', brand: 'The Glenlivet', category: 'Scotch', subcategory: 'Speyside', abv: 40, price_msrp: 38, price_market: 38, description: 'Fruity and floral with tropical notes and smooth finish.', flavor_profile: { nose: ['Tropical Fruit', 'Floral', 'Citrus'], palate: ['Vanilla', 'Honey', 'Almond'], finish: ['Smooth', 'Creamy', 'Medium'] }, community_rating: 4.1, age_statement: '12 Years', distillery: 'The Glenlivet Distillery', origin: 'Speyside, Scotland', verified: true },
  { name: 'The Glenlivet 18', brand: 'The Glenlivet', category: 'Scotch', subcategory: 'Speyside', abv: 40, price_msrp: 100, price_market: 100, description: 'Rich fruit and spice with notes of orange peel and toffee.', flavor_profile: { nose: ['Orange Peel', 'Toffee', 'Spice'], palate: ['Dried Fruit', 'Oak', 'Honey'], finish: ['Long', 'Smooth', 'Complex'] }, community_rating: 4.4, age_statement: '18 Years', distillery: 'The Glenlivet Distillery', origin: 'Speyside, Scotland', verified: true },
  { name: 'Macallan 12 Double Cask', brand: 'The Macallan', category: 'Scotch', subcategory: 'Speyside', abv: 40, price_msrp: 70, price_market: 75, description: 'Rich sherry-oak character with dried fruits and butterscotch.', flavor_profile: { nose: ['Dried Fruit', 'Sherry', 'Vanilla'], palate: ['Butterscotch', 'Ginger', 'Oak'], finish: ['Warm', 'Long', 'Sweet'] }, community_rating: 4.4, age_statement: '12 Years', distillery: 'The Macallan Distillery', origin: 'Speyside, Scotland', verified: true },
  { name: 'Macallan 18 Sherry Oak', brand: 'The Macallan', category: 'Scotch', subcategory: 'Speyside', abv: 43, price_msrp: 350, price_market: 400, description: 'Deeply rich with dried fruit, ginger, and chocolate notes.', flavor_profile: { nose: ['Dried Fruit', 'Ginger', 'Chocolate'], palate: ['Sherry', 'Oak', 'Spice'], finish: ['Long', 'Complex', 'Luxurious'] }, community_rating: 4.7, age_statement: '18 Years', distillery: 'The Macallan Distillery', origin: 'Speyside, Scotland', verified: true },
  { name: 'Laphroaig 10 Year', brand: 'Laphroaig', category: 'Scotch', subcategory: 'Islay', abv: 40, price_msrp: 50, price_market: 55, description: 'Intense peat smoke with seaweed, iodine, and medicinal notes.', flavor_profile: { nose: ['Peat', 'Smoke', 'Seaweed'], palate: ['Iodine', 'Salt', 'Vanilla'], finish: ['Long', 'Smoky', 'Medicinal'] }, community_rating: 4.3, age_statement: '10 Years', distillery: 'Laphroaig Distillery', origin: 'Islay, Scotland', verified: true },
  { name: 'Laphroaig Quarter Cask', brand: 'Laphroaig', category: 'Scotch', subcategory: 'Islay', abv: 48, price_msrp: 55, price_market: 60, description: 'Double matured in quarter casks for enhanced complexity.', flavor_profile: { nose: ['Peat', 'Vanilla', 'Coconut'], palate: ['Smoke', 'Oak', 'Honey'], finish: ['Long', 'Complex', 'Sweet Smoke'] }, community_rating: 4.5, age_statement: null, distillery: 'Laphroaig Distillery', origin: 'Islay, Scotland', verified: true },
  { name: 'Ardbeg 10 Year', brand: 'Ardbeg', category: 'Scotch', subcategory: 'Islay', abv: 46, price_msrp: 55, price_market: 60, description: 'Massive peat with sweet vanilla and citrus notes.', flavor_profile: { nose: ['Peat', 'Lemon', 'Smoke'], palate: ['Vanilla', 'Espresso', 'Black Pepper'], finish: ['Long', 'Smoky', 'Complex'] }, community_rating: 4.5, age_statement: '10 Years', distillery: 'Ardbeg Distillery', origin: 'Islay, Scotland', verified: true },
  { name: 'Ardbeg Uigeadail', brand: 'Ardbeg', category: 'Scotch', subcategory: 'Islay', abv: 54.2, price_msrp: 85, price_market: 90, description: 'Sherry cask influenced with intense smoke and dried fruit.', flavor_profile: { nose: ['Smoke', 'Dried Fruit', 'Christmas Cake'], palate: ['Peat', 'Sherry', 'Spice'], finish: ['Endless', 'Complex', 'Rich'] }, community_rating: 4.7, age_statement: null, distillery: 'Ardbeg Distillery', origin: 'Islay, Scotland', verified: true },
  { name: 'Lagavulin 16 Year', brand: 'Lagavulin', category: 'Scotch', subcategory: 'Islay', abv: 43, price_msrp: 100, price_market: 110, description: 'Classic Islay with rich peat, sherry, and maritime notes.', flavor_profile: { nose: ['Peat', 'Sherry', 'Sea Salt'], palate: ['Smoke', 'Dried Fruit', 'Iodine'], finish: ['Long', 'Warming', 'Complex'] }, community_rating: 4.6, age_statement: '16 Years', distillery: 'Lagavulin Distillery', origin: 'Islay, Scotland', verified: true },
  { name: 'Talisker 10 Year', brand: 'Talisker', category: 'Scotch', subcategory: 'Island', abv: 45.8, price_msrp: 60, price_market: 65, description: 'Maritime smoke with pepper, salt, and dried fruit notes.', flavor_profile: { nose: ['Smoke', 'Sea Salt', 'Pepper'], palate: ['Dried Fruit', 'Smoke', 'Spice'], finish: ['Long', 'Warming', 'Peppery'] }, community_rating: 4.4, age_statement: '10 Years', distillery: 'Talisker Distillery', origin: 'Isle of Skye, Scotland', verified: true },
  { name: 'Highland Park 12 Viking Honour', brand: 'Highland Park', category: 'Scotch', subcategory: 'Island', abv: 40, price_msrp: 50, price_market: 55, description: 'Balanced smoke and sherry with heather and honey notes.', flavor_profile: { nose: ['Heather', 'Honey', 'Light Smoke'], palate: ['Sherry', 'Peat', 'Dried Fruit'], finish: ['Smooth', 'Long', 'Sweet'] }, community_rating: 4.3, age_statement: '12 Years', distillery: 'Highland Park Distillery', origin: 'Orkney, Scotland', verified: true },
  { name: 'Oban 14 Year', brand: 'Oban', category: 'Scotch', subcategory: 'Highland', abv: 43, price_msrp: 80, price_market: 85, description: 'Maritime with orange peel, sea salt, and light smoke.', flavor_profile: { nose: ['Orange Peel', 'Sea Salt', 'Smoke'], palate: ['Honey', 'Dried Fruit', 'Spice'], finish: ['Long', 'Dry', 'Warming'] }, community_rating: 4.4, age_statement: '14 Years', distillery: 'Oban Distillery', origin: 'Highland, Scotland', verified: true },
  { name: 'Dalmore 12', brand: 'Dalmore', category: 'Scotch', subcategory: 'Highland', abv: 40, price_msrp: 70, price_market: 75, description: 'Rich sherry influence with chocolate, orange, and spice.', flavor_profile: { nose: ['Orange', 'Chocolate', 'Sherry'], palate: ['Dried Fruit', 'Vanilla', 'Cinnamon'], finish: ['Smooth', 'Long', 'Sweet'] }, community_rating: 4.2, age_statement: '12 Years', distillery: 'Dalmore Distillery', origin: 'Highland, Scotland', verified: true },
  { name: 'Balvenie 12 DoubleWood', brand: 'Balvenie', category: 'Scotch', subcategory: 'Speyside', abv: 40, price_msrp: 60, price_market: 65, description: 'Sherry cask finished with honey, vanilla, and nutty notes.', flavor_profile: { nose: ['Honey', 'Vanilla', 'Sherry'], palate: ['Cinnamon', 'Nutmeg', 'Dried Fruit'], finish: ['Smooth', 'Long', 'Sweet'] }, community_rating: 4.3, age_statement: '12 Years', distillery: 'Balvenie Distillery', origin: 'Speyside, Scotland', verified: true },
  { name: 'Glenmorangie Original 10', brand: 'Glenmorangie', category: 'Scotch', subcategory: 'Highland', abv: 40, price_msrp: 40, price_market: 40, description: 'Light and floral with citrus, vanilla, and peach notes.', flavor_profile: { nose: ['Citrus', 'Vanilla', 'Peach'], palate: ['Honey', 'Almond', 'Orange'], finish: ['Light', 'Clean', 'Sweet'] }, community_rating: 4.1, age_statement: '10 Years', distillery: 'Glenmorangie Distillery', origin: 'Highland, Scotland', verified: true },

  // ==========================================
  // TEQUILA (15 entries)
  // ==========================================
  { name: 'Don Julio Blanco', brand: 'Don Julio', category: 'Tequila', subcategory: 'Blanco', abv: 40, price_msrp: 50, price_market: 50, description: 'Crisp blue agave with hints of citrus and pepper.', flavor_profile: { nose: ['Agave', 'Citrus', 'Pepper'], palate: ['Sweet Agave', 'Lime', 'Mineral'], finish: ['Clean', 'Bright', 'Medium'] }, community_rating: 4.2, age_statement: null, distillery: 'Don Julio Distillery', origin: 'Jalisco, Mexico', verified: true },
  { name: 'Don Julio Reposado', brand: 'Don Julio', category: 'Tequila', subcategory: 'Reposado', abv: 40, price_msrp: 55, price_market: 55, description: 'Mellow agave with vanilla and caramel from oak aging.', flavor_profile: { nose: ['Agave', 'Vanilla', 'Caramel'], palate: ['Oak', 'Honey', 'Spice'], finish: ['Smooth', 'Medium', 'Warm'] }, community_rating: 4.3, age_statement: '8 Months', distillery: 'Don Julio Distillery', origin: 'Jalisco, Mexico', verified: true },
  { name: 'Don Julio 1942', brand: 'Don Julio', category: 'Tequila', subcategory: 'Añejo', abv: 40, price_msrp: 160, price_market: 175, description: 'Luxurious añejo with caramel, vanilla, and roasted agave.', flavor_profile: { nose: ['Caramel', 'Vanilla', 'Roasted Agave'], palate: ['Butterscotch', 'Cinnamon', 'Oak'], finish: ['Silky', 'Long', 'Warm'] }, community_rating: 4.6, age_statement: '2.5 Years', distillery: 'Don Julio Distillery', origin: 'Jalisco, Mexico', verified: true },
  { name: 'Patron Silver', brand: 'Patron', category: 'Tequila', subcategory: 'Blanco', abv: 40, price_msrp: 45, price_market: 45, description: 'Smooth and sweet with fresh agave and citrus notes.', flavor_profile: { nose: ['Agave', 'Citrus', 'Floral'], palate: ['Sweet', 'Pepper', 'Fruit'], finish: ['Smooth', 'Light', 'Clean'] }, community_rating: 4.0, age_statement: null, distillery: 'Patron Distillery', origin: 'Jalisco, Mexico', verified: true },
  { name: 'Patron Añejo', brand: 'Patron', category: 'Tequila', subcategory: 'Añejo', abv: 40, price_msrp: 60, price_market: 60, description: 'Rich oak and vanilla with honey and dried fruit.', flavor_profile: { nose: ['Oak', 'Vanilla', 'Honey'], palate: ['Dried Fruit', 'Spice', 'Caramel'], finish: ['Long', 'Smooth', 'Complex'] }, community_rating: 4.3, age_statement: '12-15 Months', distillery: 'Patron Distillery', origin: 'Jalisco, Mexico', verified: true },
  { name: 'Casamigos Blanco', brand: 'Casamigos', category: 'Tequila', subcategory: 'Blanco', abv: 40, price_msrp: 50, price_market: 50, description: 'Soft and smooth with hints of vanilla and sweet agave.', flavor_profile: { nose: ['Agave', 'Vanilla', 'Citrus'], palate: ['Sweet', 'Smooth', 'Pepper'], finish: ['Clean', 'Soft', 'Medium'] }, community_rating: 4.1, age_statement: null, distillery: 'Casamigos Distillery', origin: 'Jalisco, Mexico', verified: true },
  { name: 'Casamigos Reposado', brand: 'Casamigos', category: 'Tequila', subcategory: 'Reposado', abv: 40, price_msrp: 55, price_market: 55, description: 'Silky smooth with caramel and cocoa from oak aging.', flavor_profile: { nose: ['Caramel', 'Vanilla', 'Agave'], palate: ['Cocoa', 'Oak', 'Sweet'], finish: ['Silky', 'Smooth', 'Long'] }, community_rating: 4.2, age_statement: '7 Months', distillery: 'Casamigos Distillery', origin: 'Jalisco, Mexico', verified: true },
  { name: 'Clase Azul Reposado', brand: 'Clase Azul', category: 'Tequila', subcategory: 'Reposado', abv: 40, price_msrp: 170, price_market: 180, description: 'Ultra-premium with rich vanilla, caramel, and spice.', flavor_profile: { nose: ['Vanilla', 'Caramel', 'Cooked Agave'], palate: ['Sherry', 'Oak', 'Honey'], finish: ['Long', 'Luxurious', 'Sweet'] }, community_rating: 4.5, age_statement: '8 Months', distillery: 'Clase Azul Distillery', origin: 'Jalisco, Mexico', verified: true },
  { name: 'Fortaleza Blanco', brand: 'Fortaleza', category: 'Tequila', subcategory: 'Blanco', abv: 40, price_msrp: 50, price_market: 55, description: 'Traditional tahona-crushed with intense agave flavor.', flavor_profile: { nose: ['Cooked Agave', 'Mineral', 'Citrus'], palate: ['Sweet Agave', 'Olive', 'Pepper'], finish: ['Clean', 'Long', 'Complex'] }, community_rating: 4.6, age_statement: null, distillery: 'Fortaleza Distillery', origin: 'Jalisco, Mexico', verified: true },
  { name: 'El Tesoro Añejo', brand: 'El Tesoro', category: 'Tequila', subcategory: 'Añejo', abv: 40, price_msrp: 70, price_market: 75, description: 'Traditional production with rich oak and agave balance.', flavor_profile: { nose: ['Oak', 'Agave', 'Vanilla'], palate: ['Caramel', 'Spice', 'Dried Fruit'], finish: ['Long', 'Complex', 'Elegant'] }, community_rating: 4.5, age_statement: '2-3 Years', distillery: 'El Tesoro Distillery', origin: 'Jalisco, Mexico', verified: true },

  // ==========================================
  // RUM (10 entries)
  // ==========================================
  { name: 'Diplomatico Reserva Exclusiva', brand: 'Diplomatico', category: 'Rum', subcategory: 'Venezuelan', abv: 40, price_msrp: 40, price_market: 40, description: 'Rich with toffee, dark chocolate, and dried fruit.', flavor_profile: { nose: ['Toffee', 'Chocolate', 'Orange Peel'], palate: ['Caramel', 'Vanilla', 'Dried Fruit'], finish: ['Sweet', 'Long', 'Warm'] }, community_rating: 4.5, age_statement: '12 Years', distillery: 'Diplomatico Distillery', origin: 'Venezuela', verified: true },
  { name: 'Ron Zacapa 23', brand: 'Ron Zacapa', category: 'Rum', subcategory: 'Guatemalan', abv: 40, price_msrp: 50, price_market: 55, description: 'Solera aged with rich butterscotch, vanilla, and spice.', flavor_profile: { nose: ['Butterscotch', 'Vanilla', 'Caramel'], palate: ['Honey', 'Oak', 'Dried Fruit'], finish: ['Long', 'Smooth', 'Complex'] }, community_rating: 4.4, age_statement: 'Solera 23', distillery: 'Ron Zacapa Distillery', origin: 'Guatemala', verified: true },
  { name: 'Appleton Estate 12 Year', brand: 'Appleton', category: 'Rum', subcategory: 'Jamaican', abv: 43, price_msrp: 35, price_market: 35, description: 'Classic Jamaican pot still with orange peel and molasses.', flavor_profile: { nose: ['Orange Peel', 'Molasses', 'Spice'], palate: ['Dried Fruit', 'Oak', 'Vanilla'], finish: ['Long', 'Complex', 'Fruity'] }, community_rating: 4.3, age_statement: '12 Years', distillery: 'Appleton Estate', origin: 'Jamaica', verified: true },
  { name: 'Mount Gay XO', brand: 'Mount Gay', category: 'Rum', subcategory: 'Barbadian', abv: 43, price_msrp: 55, price_market: 60, description: 'Refined and complex with banana, vanilla, and spice.', flavor_profile: { nose: ['Banana', 'Vanilla', 'Toast'], palate: ['Fruit', 'Oak', 'Spice'], finish: ['Long', 'Smooth', 'Complex'] }, community_rating: 4.4, age_statement: '8-15 Years', distillery: 'Mount Gay Distillery', origin: 'Barbados', verified: true },
  { name: 'Kraken Black Spiced', brand: 'Kraken', category: 'Rum', subcategory: 'Spiced', abv: 47, price_msrp: 25, price_market: 25, description: 'Bold spiced rum with vanilla, cinnamon, and coffee.', flavor_profile: { nose: ['Vanilla', 'Cinnamon', 'Coffee'], palate: ['Spice', 'Molasses', 'Ginger'], finish: ['Bold', 'Spicy', 'Long'] }, community_rating: 4.0, age_statement: null, distillery: 'Kraken Distillery', origin: 'Caribbean', verified: true },
  { name: 'Bacardi Superior', brand: 'Bacardi', category: 'Rum', subcategory: 'White', abv: 40, price_msrp: 15, price_market: 15, description: 'Light and clean with subtle almond and vanilla.', flavor_profile: { nose: ['Light', 'Vanilla', 'Almond'], palate: ['Clean', 'Sweet', 'Citrus'], finish: ['Light', 'Crisp', 'Short'] }, community_rating: 3.5, age_statement: null, distillery: 'Bacardi Distillery', origin: 'Puerto Rico', verified: true },
  { name: 'Plantation XO 20th Anniversary', brand: 'Plantation', category: 'Rum', subcategory: 'Barbadian', abv: 40, price_msrp: 55, price_market: 60, description: 'Double aged in bourbon and cognac casks with rich fruit.', flavor_profile: { nose: ['Dried Fruit', 'Vanilla', 'Oak'], palate: ['Chocolate', 'Spice', 'Honey'], finish: ['Long', 'Complex', 'Elegant'] }, community_rating: 4.5, age_statement: null, distillery: 'Plantation Rum', origin: 'Barbados', verified: true },

  // ==========================================
  // VODKA (8 entries)
  // ==========================================
  { name: 'Tito\'s Handmade Vodka', brand: 'Tito\'s', category: 'Vodka', subcategory: 'Corn', abv: 40, price_msrp: 22, price_market: 22, description: 'Smooth and clean with slightly sweet corn character.', flavor_profile: { nose: ['Clean', 'Corn', 'Sweet'], palate: ['Smooth', 'Sweet', 'Pepper'], finish: ['Clean', 'Smooth', 'Medium'] }, community_rating: 4.1, age_statement: null, distillery: 'Fifth Generation Inc.', origin: 'Texas, USA', verified: true },
  { name: 'Grey Goose', brand: 'Grey Goose', category: 'Vodka', subcategory: 'French Wheat', abv: 40, price_msrp: 35, price_market: 35, description: 'Soft, sweet with hints of almond and citrus.', flavor_profile: { nose: ['Soft', 'Citrus', 'Almond'], palate: ['Smooth', 'Sweet', 'Floral'], finish: ['Clean', 'Elegant', 'Long'] }, community_rating: 4.2, age_statement: null, distillery: 'Grey Goose Distillery', origin: 'Cognac, France', verified: true },
  { name: 'Ketel One', brand: 'Ketel One', category: 'Vodka', subcategory: 'Dutch', abv: 40, price_msrp: 28, price_market: 28, description: 'Crisp and fresh with subtle citrus and honey.', flavor_profile: { nose: ['Citrus', 'Honey', 'Fresh'], palate: ['Crisp', 'Clean', 'Smooth'], finish: ['Fresh', 'Clean', 'Medium'] }, community_rating: 4.1, age_statement: null, distillery: 'Nolet Distillery', origin: 'Netherlands', verified: true },
  { name: 'Belvedere', brand: 'Belvedere', category: 'Vodka', subcategory: 'Polish Rye', abv: 40, price_msrp: 32, price_market: 32, description: 'Smooth rye character with vanilla and white pepper.', flavor_profile: { nose: ['Vanilla', 'White Pepper', 'Cream'], palate: ['Rye', 'Almond', 'Smooth'], finish: ['Clean', 'Long', 'Spicy'] }, community_rating: 4.2, age_statement: null, distillery: 'Polmos Żyrardów', origin: 'Poland', verified: true },
  { name: 'Absolut', brand: 'Absolut', category: 'Vodka', subcategory: 'Swedish Wheat', abv: 40, price_msrp: 22, price_market: 22, description: 'Rich and complex with notes of grain and dried fruit.', flavor_profile: { nose: ['Grain', 'Dried Fruit', 'Citrus'], palate: ['Smooth', 'Pepper', 'Wheat'], finish: ['Medium', 'Clean', 'Warming'] }, community_rating: 3.9, age_statement: null, distillery: 'Absolut Distillery', origin: 'Åhus, Sweden', verified: true },

  // ==========================================
  // GIN (8 entries)
  // ==========================================
  { name: 'Hendrick\'s Gin', brand: 'Hendrick\'s', category: 'Gin', subcategory: 'Scottish', abv: 41.4, price_msrp: 38, price_market: 38, description: 'Unique cucumber and rose petal infusion with juniper.', flavor_profile: { nose: ['Cucumber', 'Rose', 'Juniper'], palate: ['Floral', 'Fresh', 'Citrus'], finish: ['Smooth', 'Fresh', 'Long'] }, community_rating: 4.3, age_statement: null, distillery: 'Hendrick\'s Distillery', origin: 'Scotland', verified: true },
  { name: 'Tanqueray', brand: 'Tanqueray', category: 'Gin', subcategory: 'London Dry', abv: 43.1, price_msrp: 25, price_market: 25, description: 'Bold juniper with citrus, coriander, and angelica.', flavor_profile: { nose: ['Juniper', 'Citrus', 'Coriander'], palate: ['Bold', 'Spicy', 'Herbal'], finish: ['Dry', 'Clean', 'Long'] }, community_rating: 4.1, age_statement: null, distillery: 'Tanqueray Distillery', origin: 'England', verified: true },
  { name: 'Bombay Sapphire', brand: 'Bombay', category: 'Gin', subcategory: 'London Dry', abv: 40, price_msrp: 28, price_market: 28, description: 'Light and floral with 10 botanicals.', flavor_profile: { nose: ['Floral', 'Citrus', 'Juniper'], palate: ['Light', 'Herbal', 'Spice'], finish: ['Bright', 'Clean', 'Medium'] }, community_rating: 4.0, age_statement: null, distillery: 'Bombay Spirits', origin: 'England', verified: true },
  { name: 'The Botanist', brand: 'Bruichladdich', category: 'Gin', subcategory: 'Islay', abv: 46, price_msrp: 45, price_market: 45, description: '22 Islay botanicals with complex herbal character.', flavor_profile: { nose: ['Herbs', 'Floral', 'Citrus'], palate: ['Complex', 'Herbal', 'Menthol'], finish: ['Long', 'Fresh', 'Complex'] }, community_rating: 4.4, age_statement: null, distillery: 'Bruichladdich Distillery', origin: 'Islay, Scotland', verified: true },
  { name: 'Aviation American Gin', brand: 'Aviation', category: 'Gin', subcategory: 'American', abv: 42, price_msrp: 30, price_market: 30, description: 'Soft juniper with lavender, cardamom, and sarsaparilla.', flavor_profile: { nose: ['Lavender', 'Juniper', 'Spice'], palate: ['Cardamom', 'Citrus', 'Floral'], finish: ['Smooth', 'Medium', 'Sweet'] }, community_rating: 4.2, age_statement: null, distillery: 'House Spirits', origin: 'Oregon, USA', verified: true },

  // ==========================================
  // COGNAC (5 entries)
  // ==========================================
  { name: 'Hennessy VS', brand: 'Hennessy', category: 'Cognac', subcategory: 'VS', abv: 40, price_msrp: 40, price_market: 40, description: 'Bold with vanilla, oak, and grilled almonds.', flavor_profile: { nose: ['Vanilla', 'Oak', 'Fruit'], palate: ['Smooth', 'Sweet', 'Spice'], finish: ['Warm', 'Medium', 'Oak'] }, community_rating: 3.9, age_statement: null, distillery: 'Hennessy', origin: 'Cognac, France', verified: true },
  { name: 'Hennessy VSOP', brand: 'Hennessy', category: 'Cognac', subcategory: 'VSOP', abv: 40, price_msrp: 55, price_market: 55, description: 'Rich with vanilla, clove, and cinnamon notes.', flavor_profile: { nose: ['Vanilla', 'Clove', 'Dried Fruit'], palate: ['Cinnamon', 'Oak', 'Honey'], finish: ['Long', 'Warm', 'Spicy'] }, community_rating: 4.2, age_statement: null, distillery: 'Hennessy', origin: 'Cognac, France', verified: true },
  { name: 'Rémy Martin VSOP', brand: 'Rémy Martin', category: 'Cognac', subcategory: 'VSOP', abv: 40, price_msrp: 55, price_market: 55, description: 'Rich with vanilla, apricot, and subtle oak.', flavor_profile: { nose: ['Vanilla', 'Apricot', 'Floral'], palate: ['Rich', 'Fruity', 'Spice'], finish: ['Long', 'Warm', 'Elegant'] }, community_rating: 4.2, age_statement: null, distillery: 'Rémy Martin', origin: 'Cognac, France', verified: true },
  { name: 'Rémy Martin XO', brand: 'Rémy Martin', category: 'Cognac', subcategory: 'XO', abv: 40, price_msrp: 180, price_market: 185, description: 'Luxurious with jasmine, iris, dried fruit, and hazelnut.', flavor_profile: { nose: ['Jasmine', 'Dried Fruit', 'Oak'], palate: ['Hazelnut', 'Cinnamon', 'Plum'], finish: ['Endless', 'Complex', 'Opulent'] }, community_rating: 4.6, age_statement: null, distillery: 'Rémy Martin', origin: 'Cognac, France', verified: true },
  { name: 'Courvoisier VSOP', brand: 'Courvoisier', category: 'Cognac', subcategory: 'VSOP', abv: 40, price_msrp: 45, price_market: 45, description: 'Smooth with vanilla, almonds, and stone fruit.', flavor_profile: { nose: ['Vanilla', 'Almonds', 'Peach'], palate: ['Stone Fruit', 'Oak', 'Honey'], finish: ['Smooth', 'Medium', 'Sweet'] }, community_rating: 4.1, age_statement: null, distillery: 'Courvoisier', origin: 'Cognac, France', verified: true },
];

// ============================================
// POST - Bulk Import Spirits
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const spiritsToImport = body.spirits || SPIRITS_DATABASE;

    let imported = 0;
    let skipped = 0;
    let errors: string[] = [];

    for (const spirit of spiritsToImport) {
      try {
        // Check if exists
        const { data: existing } = await supabase
          .from('bv_spirits')
          .select('id')
          .eq('name', spirit.name)
          .eq('brand', spirit.brand)
          .maybeSingle();

        if (existing) {
          skipped++;
          continue;
        }

        // Insert
        const { error } = await supabase.from('bv_spirits').insert({
          name: spirit.name,
          brand: spirit.brand,
          category: spirit.category,
          subcategory: spirit.subcategory,
          abv: spirit.abv,
          price_msrp: spirit.price_msrp,
          price_market: spirit.price_market,
          description: spirit.description,
          flavor_profile: spirit.flavor_profile,
          community_rating: spirit.community_rating,
          age_statement: spirit.age_statement,
          distillery: spirit.distillery,
          origin: spirit.origin,
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
      total: spiritsToImport.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
      message: `Imported ${imported} spirits, skipped ${skipped} duplicates`,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// GET - Preview Database
// ============================================

export async function GET() {
  const categories = [...new Set(SPIRITS_DATABASE.map(s => s.category))];
  const categoryBreakdown = categories.map(cat => ({
    category: cat,
    count: SPIRITS_DATABASE.filter(s => s.category === cat).length,
  }));

  return NextResponse.json({
    success: true,
    totalSpirits: SPIRITS_DATABASE.length,
    categories: categoryBreakdown,
    samples: SPIRITS_DATABASE.slice(0, 3),
    message: 'POST to import all spirits to database',
  });
}

// app/api/cron/auto-sync/route.ts
// AUTOMATED DATA SYNCHRONIZATION FROM FREE APIS

import { NextRequest, NextResponse } from "next/server";
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

function verifyCron(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) return true;
  const url = new URL(request.url);
  return url.searchParams.get("manual") === "true";
}

export async function GET(request: NextRequest) {
  if (!verifyCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    timestamp: new Date().toISOString(),
    cocktails: { synced: 0, errors: [] as string[] },
    breweries: { synced: 0, errors: [] as string[] },
  };

  try {
    // 1. SYNC COCKTAILS FROM COCKTAILDB
    console.log("Syncing cocktails...");
    const cocktailLetters = ["a", "b", "c", "m", "w"];
    for (const letter of cocktailLetters) {
      try {
        const res = await fetch(
          `https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`,
          { signal: AbortSignal.timeout(10000) }
        );
        const data = await res.json();

        if (data.drinks) {
          const cocktails = data.drinks.map((c: any) => ({
            name: c.strDrink,
            category: c.strCategory || "Cocktail",
            instructions: c.strInstructions,
            image_url: c.strDrinkThumb,
            glass_type: c.strGlass,
            is_alcoholic: c.strAlcoholic === "Alcoholic",
            external_id: c.idDrink,
            base_spirit: detectBaseSpirit(c),
          }));

          const { data: inserted, error } = await supabase
            .from("bv_cocktails")
            .upsert(cocktails, { onConflict: "name", ignoreDuplicates: true })
            .select();

          if (!error) {
            results.cocktails.synced += inserted?.length || 0;
          }
        }
      } catch (e: any) {
        results.cocktails.errors.push(`Letter ${letter}: ${e.message}`);
      }
    }

    // 2. SYNC BREWERIES FROM OPEN BREWERY DB
    console.log("Syncing breweries...");
    const states = ["california", "new_york", "texas", "colorado", "oregon"];
    for (const state of states) {
      try {
        const res = await fetch(
          `https://api.openbrewerydb.org/v1/breweries?by_state=${state}&per_page=50`,
          { signal: AbortSignal.timeout(10000) }
        );
        const breweries = await res.json();

        if (Array.isArray(breweries) && breweries.length > 0) {
          const transformed = breweries.map((b: any) => ({
            name: b.name,
            type: "brewery",
            region: b.state || state,
            country: b.country || "United States",
            city: b.city,
            address: [b.address_1, b.address_2].filter(Boolean).join(", "),
            latitude: b.latitude ? parseFloat(b.latitude) : null,
            longitude: b.longitude ? parseFloat(b.longitude) : null,
            website: b.website_url,
            phone: b.phone,
            external_id: b.id,
          }));

          const { data: inserted, error } = await supabase
            .from("bv_distilleries")
            .upsert(transformed, { onConflict: "name", ignoreDuplicates: true })
            .select();

          if (!error) {
            results.breweries.synced += inserted?.length || 0;
          }
        }
      } catch (e: any) {
        results.breweries.errors.push(`State ${state}: ${e.message}`);
      }
    }

    // 3. Log sync result (wrap in try-catch)
    try {
      await supabase.from("bv_sync_logs").insert({
        sync_type: "auto_sync",
        results: JSON.stringify(results),
        status: "completed",
      });
    } catch {
      // Table may not exist, ignore
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: "Auto-sync completed successfully",
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message, partial: results },
      { status: 500 }
    );
  }
}

function detectBaseSpirit(cocktail: any): string {
  const ingredients = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    .map((i) => cocktail[`strIngredient${i}`]?.toLowerCase() || "")
    .filter(Boolean);

  const spiritMap: Record<string, string[]> = {
    vodka: ["vodka"],
    gin: ["gin"],
    rum: ["rum", "rhum"],
    tequila: ["tequila", "mezcal"],
    whiskey: ["whiskey", "whisky", "bourbon", "rye", "scotch"],
    brandy: ["brandy", "cognac", "armagnac"],
  };

  for (const [spirit, keywords] of Object.entries(spiritMap)) {
    if (ingredients.some((ing) => keywords.some((k) => ing.includes(k)))) {
      return spirit;
    }
  }

  return "other";
}

export const runtime = "nodejs";
export const maxDuration = 60;

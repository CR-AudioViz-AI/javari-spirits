// app/api/external/route.ts
// FREE API INTEGRATIONS FOR MAXIMUM DATA ENRICHMENT
// Connected APIs: Open Food Facts, UPCitemdb, CocktailDB, PunkAPI, OpenBreweryDB, WikiData

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// FREE API ENDPOINTS
const FREE_APIS = {
  // Cocktail Database - FREE, No API key needed
  cocktailDB: {
    search: (name: string) => `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`,
    random: "https://www.thecocktaildb.com/api/json/v1/1/random.php",
    byIngredient: (ingredient: string) => `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`,
    lookup: (id: string) => `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`,
    listCategories: "https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list",
    listIngredients: "https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list",
  },
  
  // Punk API - Craft Beer Database - FREE
  punkAPI: {
    beers: (page: number = 1) => `https://api.punkapi.com/v2/beers?page=${page}&per_page=80`,
    random: "https://api.punkapi.com/v2/beers/random",
    search: (name: string) => `https://api.punkapi.com/v2/beers?beer_name=${encodeURIComponent(name)}`,
    byAbv: (min: number, max: number) => `https://api.punkapi.com/v2/beers?abv_gt=${min}&abv_lt=${max}`,
  },
  
  // Open Brewery DB - Breweries - FREE
  openBreweryDB: {
    list: (page: number = 1) => `https://api.openbrewerydb.org/v1/breweries?page=${page}&per_page=50`,
    search: (name: string) => `https://api.openbrewerydb.org/v1/breweries/search?query=${encodeURIComponent(name)}`,
    byCity: (city: string) => `https://api.openbrewerydb.org/v1/breweries?by_city=${encodeURIComponent(city)}`,
    byState: (state: string) => `https://api.openbrewerydb.org/v1/breweries?by_state=${encodeURIComponent(state)}`,
    byType: (type: string) => `https://api.openbrewerydb.org/v1/breweries?by_type=${type}`,
    random: "https://api.openbrewerydb.org/v1/breweries/random",
  },
  
  // Open Food Facts - Product Database - FREE
  openFoodFacts: {
    product: (barcode: string) => `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
    search: (query: string) => `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`,
    category: (category: string) => `https://world.openfoodfacts.org/category/${encodeURIComponent(category)}.json`,
  },
  
  // UPC Item DB - Barcode Lookup - FREE (limited)
  upcItemDB: {
    lookup: (upc: string) => `https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`,
  },
  
  // WikiData - Spirit/Distillery Info - FREE
  wikiData: {
    search: (query: string) => `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&origin=*`,
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");
  const action = searchParams.get("action");
  const query = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");

  try {
    let data: any = null;
    let url = "";

    switch (source) {
      case "cocktails":
        switch (action) {
          case "search":
            url = FREE_APIS.cocktailDB.search(query || "");
            break;
          case "random":
            url = FREE_APIS.cocktailDB.random;
            break;
          case "ingredient":
            url = FREE_APIS.cocktailDB.byIngredient(query || "vodka");
            break;
          case "categories":
            url = FREE_APIS.cocktailDB.listCategories;
            break;
          default:
            url = FREE_APIS.cocktailDB.random;
        }
        break;

      case "beer":
        switch (action) {
          case "list":
            url = FREE_APIS.punkAPI.beers(page);
            break;
          case "search":
            url = FREE_APIS.punkAPI.search(query || "");
            break;
          case "random":
            url = FREE_APIS.punkAPI.random;
            break;
          default:
            url = FREE_APIS.punkAPI.beers(1);
        }
        break;

      case "breweries":
        switch (action) {
          case "list":
            url = FREE_APIS.openBreweryDB.list(page);
            break;
          case "search":
            url = FREE_APIS.openBreweryDB.search(query || "");
            break;
          case "city":
            url = FREE_APIS.openBreweryDB.byCity(query || "");
            break;
          case "state":
            url = FREE_APIS.openBreweryDB.byState(query || "");
            break;
          case "random":
            url = FREE_APIS.openBreweryDB.random;
            break;
          default:
            url = FREE_APIS.openBreweryDB.list(1);
        }
        break;

      case "food":
        switch (action) {
          case "barcode":
            url = FREE_APIS.openFoodFacts.product(query || "");
            break;
          case "search":
            url = FREE_APIS.openFoodFacts.search(query || "whiskey");
            break;
          default:
            url = FREE_APIS.openFoodFacts.search("spirits");
        }
        break;

      case "wiki":
        url = FREE_APIS.wikiData.search(query || "bourbon");
        break;

      default:
        return NextResponse.json({
          success: true,
          message: "External API Gateway",
          availableSources: ["cocktails", "beer", "breweries", "food", "wiki"],
          examples: {
            cocktails: "/api/external?source=cocktails&action=search&q=margarita",
            beer: "/api/external?source=beer&action=list&page=1",
            breweries: "/api/external?source=breweries&action=state&q=california",
            food: "/api/external?source=food&action=barcode&q=5060292302270",
            wiki: "/api/external?source=wiki&q=macallan",
          },
        });
    }

    // Fetch from external API
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }

    data = await response.json();

    return NextResponse.json({
      success: true,
      source,
      action,
      query,
      data,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Sync external data to our database
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, source } = body;

    if (action === "sync_cocktails") {
      // Fetch random cocktails and sync to database
      const cocktails = [];
      for (let i = 0; i < 10; i++) {
        const res = await fetch(FREE_APIS.cocktailDB.random);
        const data = await res.json();
        if (data.drinks?.[0]) {
          cocktails.push(data.drinks[0]);
        }
      }

      // Transform and insert
      const transformed = cocktails.map((c: any) => ({
        name: c.strDrink,
        category: c.strCategory || "Cocktail",
        instructions: c.strInstructions,
        image_url: c.strDrinkThumb,
        glass_type: c.strGlass,
        is_alcoholic: c.strAlcoholic === "Alcoholic",
        external_id: c.idDrink,
        ingredients: JSON.stringify(
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
            .map((i) => ({
              ingredient: c[`strIngredient${i}`],
              measure: c[`strMeasure${i}`],
            }))
            .filter((x) => x.ingredient)
        ),
      }));

      const { data, error } = await supabase
        .from("bv_cocktails")
        .upsert(transformed, { onConflict: "name" })
        .select();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        synced: data?.length || 0,
        message: "Cocktails synced from TheCocktailDB",
      });
    }

    if (action === "sync_breweries") {
      // Fetch breweries and sync
      const pages = [1, 2, 3, 4, 5];
      let allBreweries: any[] = [];

      for (const page of pages) {
        const res = await fetch(FREE_APIS.openBreweryDB.list(page));
        const data = await res.json();
        allBreweries = [...allBreweries, ...data];
      }

      // Transform to our distilleries table format
      const transformed = allBreweries.map((b: any) => ({
        name: b.name,
        type: "brewery",
        region: b.state || b.state_province,
        country: b.country || "USA",
        city: b.city,
        address: [b.address_1, b.address_2, b.address_3].filter(Boolean).join(", "),
        latitude: b.latitude ? parseFloat(b.latitude) : null,
        longitude: b.longitude ? parseFloat(b.longitude) : null,
        website: b.website_url,
        phone: b.phone,
        external_id: b.id,
        brewery_type: b.brewery_type,
      }));

      const { data, error } = await supabase
        .from("bv_distilleries")
        .upsert(transformed, { onConflict: "name" })
        .select();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        synced: data?.length || 0,
        message: "Breweries synced from OpenBreweryDB",
      });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

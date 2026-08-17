// app/api/random/route.ts
// RANDOM SPIRIT & COCKTAIL RECOMMENDATION API
// Returns random items for discovery features

import { NextRequest, NextResponse } from "next/server";
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "spirit";
  const count = Math.min(parseInt(searchParams.get("count") || "1"), 10);
  const category = searchParams.get("category");

  try {
    if (type === "spirit") {
      // Get random spirits from database
      let query = supabase
        .from("bv_spirits")
        .select("id, name, brand, category, type, abv, description, image_url, flavor_profile")
        .limit(count * 10); // Get more to randomize

      if (category) {
        query = query.ilike("category", `%${category}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Shuffle and take count
      const shuffled = data?.sort(() => Math.random() - 0.5).slice(0, count) || [];

      return NextResponse.json({
        success: true,
        type: "spirit",
        count: shuffled.length,
        items: shuffled,
      });
    }

    if (type === "cocktail") {
      // Try our database first
      let query = supabase
        .from("bv_cocktails")
        .select("*")
        .limit(count * 10);

      if (category) {
        query = query.ilike("category", `%${category}%`);
      }

      const { data: dbCocktails } = await query;

      if (dbCocktails && dbCocktails.length > 0) {
        const shuffled = dbCocktails.sort(() => Math.random() - 0.5).slice(0, count);
        return NextResponse.json({
          success: true,
          type: "cocktail",
          source: "database",
          count: shuffled.length,
          items: shuffled,
        });
      }

      // Fallback to CocktailDB API
      const cocktails = [];
      for (let i = 0; i < count; i++) {
        const res = await fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php", {
          signal: AbortSignal.timeout(5000),
        });
        const data = await res.json();
        if (data.drinks?.[0]) {
          const c = data.drinks[0];
          cocktails.push({
            id: c.idDrink,
            name: c.strDrink,
            category: c.strCategory,
            instructions: c.strInstructions,
            image_url: c.strDrinkThumb,
            glass_type: c.strGlass,
            is_alcoholic: c.strAlcoholic === "Alcoholic",
          });
        }
      }

      return NextResponse.json({
        success: true,
        type: "cocktail",
        source: "cocktaildb",
        count: cocktails.length,
        items: cocktails,
      });
    }

    if (type === "trivia") {
      // Random trivia question
      const { data, error } = await supabase
        .from("bv_trivia_questions")
        .select("*")
        .limit(50);

      if (error) throw error;

      const shuffled = data?.sort(() => Math.random() - 0.5).slice(0, count) || [];

      // Format for gameplay
      const questions = shuffled.map((q) => ({
        id: q.id,
        question: q.question,
        options: [q.correct_answer, ...(q.wrong_answers || [])].sort(() => Math.random() - 0.5),
        category: q.category,
        difficulty: q.difficulty,
        proofReward: q.proof_reward,
      }));

      return NextResponse.json({
        success: true,
        type: "trivia",
        count: questions.length,
        items: questions,
      });
    }

    if (type === "distillery") {
      // Random distillery
      const { data, error } = await supabase
        .from("bv_distilleries")
        .select("*")
        .limit(count * 5);

      if (error) throw error;

      const shuffled = data?.sort(() => Math.random() - 0.5).slice(0, count) || [];

      return NextResponse.json({
        success: true,
        type: "distillery",
        count: shuffled.length,
        items: shuffled,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Random Recommendation API",
      types: ["spirit", "cocktail", "trivia", "distillery"],
      endpoints: {
        randomSpirit: "/api/random?type=spirit&count=5",
        randomCocktail: "/api/random?type=cocktail&count=3",
        randomTrivia: "/api/random?type=trivia&count=10",
        byCategory: "/api/random?type=spirit&category=bourbon&count=5",
      },
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

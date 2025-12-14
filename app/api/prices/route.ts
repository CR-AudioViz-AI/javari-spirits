// app/api/prices/route.ts
// PRICE TRACKING AND MARKET DATA AGGREGATION

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function estimatePrice(spirit: any): { low: number; mid: number; high: number } {
  const baseByCategory: Record<string, number> = {
    bourbon: 35, scotch: 55, "single malt": 70, rye: 40, irish: 35,
    japanese: 85, cognac: 65, rum: 30, tequila: 40, mezcal: 50,
    gin: 30, vodka: 25, wine: 20, beer: 12,
  };

  const category = (spirit.category || spirit.type || "").toLowerCase();
  let base = 40;
  for (const [key, value] of Object.entries(baseByCategory)) {
    if (category.includes(key)) { base = value; break; }
  }

  const ageMatch = spirit.name?.match(/(\d+)\s*(?:year|yr|yo)/i);
  if (ageMatch) base *= 1 + (parseInt(ageMatch[1]) * 0.15);

  const premiumTerms = ["reserve", "limited", "special", "rare", "cask strength"];
  for (const term of premiumTerms) {
    if (spirit.name?.toLowerCase().includes(term)) { base *= 1.4; break; }
  }

  if (spirit.abv && spirit.abv > 50) base *= 1.2;

  return {
    low: Math.round(base * 0.7),
    mid: Math.round(base),
    high: Math.round(base * 1.5),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const spiritId = searchParams.get("spiritId");
  const action = searchParams.get("action");

  try {
    if (action === "trending") {
      const { data, error } = await supabase
        .from("bv_price_reports")
        .select("spirit_id, price, reported_at, bv_spirits(name, brand, category)")
        .order("reported_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return NextResponse.json({ success: true, trending: data });
    }

    if (action === "alerts") {
      const { data } = await supabase
        .from("bv_price_alerts")
        .select("*, bv_spirits(name, brand)")
        .eq("triggered", false)
        .order("created_at", { ascending: false })
        .limit(20);
      return NextResponse.json({ success: true, alerts: data || [] });
    }

    if (spiritId) {
      const { data: spirit } = await supabase
        .from("bv_spirits")
        .select("*")
        .eq("id", spiritId)
        .single();

      if (!spirit) {
        return NextResponse.json({ error: "Spirit not found" }, { status: 404 });
      }

      const { data: reports } = await supabase
        .from("bv_price_reports")
        .select("*")
        .eq("spirit_id", spiritId)
        .order("reported_at", { ascending: false })
        .limit(50);

      const prices = reports?.map((r) => r.price).filter(Boolean) || [];
      const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
      const estimates = estimatePrice(spirit);

      return NextResponse.json({
        success: true,
        spirit: { id: spirit.id, name: spirit.name, brand: spirit.brand },
        pricing: {
          community: { average: avgPrice ? Math.round(avgPrice) : null, reports: prices.length },
          estimates,
          recommendation: avgPrice || estimates.mid,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Price Tracking API",
      endpoints: {
        bySpirit: "/api/prices?spiritId={id}",
        trending: "/api/prices?action=trending",
        alerts: "/api/prices?action=alerts",
      },
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { spiritId, price, store, location, userId } = body;

    if (!spiritId || !price) {
      return NextResponse.json({ error: "Spirit ID and price required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("bv_price_reports")
      .insert({
        spirit_id: spiritId,
        price: parseFloat(price),
        store,
        location,
        user_id: userId,
        reported_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Award points - wrap in try-catch
    if (userId) {
      try {
        await supabase.rpc("increment_proof_points", { p_user_id: userId, p_amount: 5 });
      } catch {
        // Function may not exist
      }
    }

    // Check for price alerts
    const { data: alerts } = await supabase
      .from("bv_price_alerts")
      .select("*")
      .eq("spirit_id", spiritId)
      .lte("target_price", price)
      .eq("triggered", false);

    if (alerts && alerts.length > 0) {
      await supabase
        .from("bv_price_alerts")
        .update({ triggered: true, triggered_at: new Date().toISOString() })
        .in("id", alerts.map((a) => a.id));
    }

    return NextResponse.json({
      success: true,
      report: data,
      alertsTriggered: alerts?.length || 0,
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

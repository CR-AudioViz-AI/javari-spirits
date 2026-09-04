// app/api/bars/route.ts
// BAR & RETAILER FINDER API
// Free APIs: OpenStreetMap Nominatim, Overpass API

import { NextRequest, NextResponse } from "next/server";
import { requireCaller } from '@/lib/api/caller';
import { lazyAdminDb } from '@/lib/supabase/admin';
const supabase = lazyAdminDb();

const OSM_APIS = {
  geocode: (query: string) => 
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
  overpass: (lat: number, lon: number, radius: number = 5000) => {
    const query = `[out:json][timeout:25];(node["amenity"="bar"](around:${radius},${lat},${lon});node["amenity"="pub"](around:${radius},${lat},${lon});node["shop"="alcohol"](around:${radius},${lat},${lon}););out body center;`.replace(/\s+/g, " ");
    return `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  },
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lon = parseFloat(searchParams.get("lon") || "0");
  const radius = parseInt(searchParams.get("radius") || "5000");
  const type = searchParams.get("type") || "all";
  const search = searchParams.get("search");

  try {
    if (search) {
      const geoRes = await fetch(OSM_APIS.geocode(search), {
        headers: { "User-Agent": "Javari Spirits/1.0" },
        signal: AbortSignal.timeout(10000),
      });
      const geoData = await geoRes.json();
      return NextResponse.json({
        success: true,
        results: geoData.map((r: any) => ({
          name: r.display_name,
          lat: parseFloat(r.lat),
          lon: parseFloat(r.lon),
          type: r.type,
        })),
      });
    }

    if (!lat || !lon) {
      return NextResponse.json({
        success: true,
        message: "Bar & Retailer Finder API",
        endpoints: {
          nearby: "/api/bars?lat={lat}&lon={lon}&radius={meters}",
          search: "/api/bars?search={query}",
        },
      });
    }

    const overpassRes = await fetch(OSM_APIS.overpass(lat, lon, radius), {
      signal: AbortSignal.timeout(30000),
    });
    const overpassData = await overpassRes.json();

    const places = overpassData.elements?.map((el: any) => {
      const placeLat = el.lat || el.center?.lat;
      const placeLon = el.lon || el.center?.lon;
      const tags = el.tags || {};
      const placeType = tags.amenity === "bar" || tags.amenity === "pub" ? "bar" : "store";
      if (type !== "all" && placeType !== type) return null;

      return {
        id: el.id,
        name: tags.name || "Unknown",
        type: placeType,
        lat: placeLat,
        lon: placeLon,
        distance: placeLat && placeLon ? calculateDistance(lat, lon, placeLat, placeLon) : null,
        address: [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]].filter(Boolean).join(" "),
        phone: tags.phone,
        website: tags.website,
      };
    }).filter(Boolean).sort((a: any, b: any) => (a.distance || 999) - (b.distance || 999));

    // Check our database - wrap in try-catch
    let dbResults: any[] = [];
    try {
      const { data: dbBars } = await supabase
        .from("bv_bars")
        .select("*")
        .gte("latitude", lat - 0.1)
        .lte("latitude", lat + 0.1)
        .gte("longitude", lon - 0.1)
        .lte("longitude", lon + 0.1)
        .limit(50);

      dbResults = dbBars?.map((bar: any) => ({
        ...bar,
        source: "community",
        distance: calculateDistance(lat, lon, bar.latitude, bar.longitude),
      })) || [];
    } catch {
      // Table may not exist yet
    }

    const combined = [...places.slice(0, 30), ...dbResults]
      .sort((a: any, b: any) => (a.distance || 999) - (b.distance || 999));

    return NextResponse.json({
      success: true,
      location: { lat, lon },
      count: combined.length,
      places: combined,
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // user id deliberately not taken from the body.
    const {name, type, lat, lon, address, phone, website} = body;
    const _c = await requireCaller(request);
    if (!_c.ok) return _c.res;
    const userId = _c.userId;

    if (!name || !lat || !lon) {
      return NextResponse.json({ error: "Name and coordinates required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("bv_bars")
      .insert({
        name,
        type: type || "bar",
        latitude: lat,
        longitude: lon,
        address,
        phone,
        website,
        submitted_by: userId,
        verified: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Award points - wrap in try-catch
    if (userId) {
      try {
        await supabase.rpc("increment_proof_points", { p_user_id: userId, p_amount: 10 });
      } catch {
        // Function may not exist
      }
    }

    return NextResponse.json({
      success: true,
      bar: data,
      message: "Bar submitted for review",
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

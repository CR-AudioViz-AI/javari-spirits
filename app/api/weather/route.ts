// app/api/weather/route.ts
// WEATHER & TASTING CONDITIONS API
// Free APIs: Open-Meteo (no API key needed), IP-API for geolocation

import { NextRequest, NextResponse } from "next/server";
import { urlSegment } from '@craudioviz/platform-sdk/lib/egress-guard';

// Free weather API - no API key required!
const OPEN_METEO = {
  forecast: (lat: number, lon: number) => 
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl&timezone=auto`,
  air: (lat: number, lon: number) =>
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10`,
};

// Free IP geolocation
const IP_API = {
  // The ip comes from a query parameter or the X-Forwarded-For header, both
  // caller-controlled. Shape-checked as an IPv4/IPv6 literal and encoded.
  lookup: (ip: string) =>
    `http://ip-api.com/json/${urlSegment(ip, /^[0-9a-fA-F:.]{3,45}$/)}?fields=status,country,regionName,city,lat,lon,timezone`,
};

// Tasting condition recommendations based on weather
function getTastingConditions(weather: any): {
  score: number;
  recommendation: string;
  bestFor: string[];
  avoid: string[];
} {
  const temp = weather.current?.temperature_2m || 20;
  const humidity = weather.current?.relative_humidity_2m || 50;
  const pressure = weather.current?.pressure_msl || 1013;

  let score = 70; // Base score
  const bestFor: string[] = [];
  const avoid: string[] = [];

  // Temperature adjustments (ideal: 18-22°C / 64-72°F)
  if (temp >= 18 && temp <= 22) {
    score += 15;
    bestFor.push("whiskey", "cognac", "aged spirits");
  } else if (temp < 15) {
    score -= 5;
    bestFor.push("dark rum", "bourbon", "port");
    avoid.push("light cocktails", "rosé wine");
  } else if (temp > 28) {
    score -= 10;
    bestFor.push("gin & tonic", "light beer", "white wine", "tequila");
    avoid.push("heavy stouts", "cask strength whiskey");
  }

  // Humidity adjustments (ideal: 40-60%)
  if (humidity >= 40 && humidity <= 60) {
    score += 10;
  } else if (humidity > 75) {
    score -= 10;
    bestFor.push("refreshing cocktails");
    avoid.push("neat spirits");
  } else if (humidity < 30) {
    score -= 5;
    bestFor.push("hydrating cocktails");
  }

  // Pressure adjustments (high pressure = better aromas)
  if (pressure > 1020) {
    score += 5;
    bestFor.push("aromatic spirits", "complex whiskeys");
  }

  // Cap score
  score = Math.min(100, Math.max(0, score));

  const recommendation = score >= 80 
    ? "Excellent conditions for tasting - your palate will be at its best!"
    : score >= 60 
    ? "Good conditions for casual tasting"
    : "Consider waiting for better conditions for serious tasting";

  return { score, recommendation, bestFor, avoid };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let lat = searchParams.get("lat");
  let lon = searchParams.get("lon");
  const ip = searchParams.get("ip");

  try {
    // If no coords, try IP geolocation
    if (!lat || !lon) {
      const clientIp = ip || request.headers.get("x-forwarded-for")?.split(",")[0] || "";
      
      if (clientIp && clientIp !== "127.0.0.1") {
        const geoRes = await fetch(IP_API.lookup(clientIp), {
          signal: AbortSignal.timeout(5000),
        });
        const geoData = await geoRes.json();
        
        if (geoData.status === "success") {
          lat = geoData.lat.toString();
          lon = geoData.lon.toString();
        }
      }
    }

    // Default to Fort Myers, FL if no location
    lat = lat || "26.6406";
    lon = lon || "-81.8723";

    // Fetch weather data
    const [weatherRes, airRes] = await Promise.all([
      fetch(OPEN_METEO.forecast(parseFloat(lat), parseFloat(lon)), {
        signal: AbortSignal.timeout(10000),
      }),
      fetch(OPEN_METEO.air(parseFloat(lat), parseFloat(lon)), {
        signal: AbortSignal.timeout(10000),
      }).catch(() => null),
    ]);

    const weather = await weatherRes.json();
    const air = airRes ? await airRes.json() : null;

    // Calculate tasting conditions
    const conditions = getTastingConditions(weather);

    // Weather code descriptions
    const weatherCodes: Record<number, string> = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow",
      73: "Moderate snow",
      75: "Heavy snow",
      95: "Thunderstorm",
    };

    return NextResponse.json({
      success: true,
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      weather: {
        temperature: {
          celsius: weather.current?.temperature_2m,
          fahrenheit: weather.current?.temperature_2m 
            ? Math.round(weather.current.temperature_2m * 9/5 + 32) 
            : null,
        },
        humidity: weather.current?.relative_humidity_2m,
        pressure: weather.current?.pressure_msl,
        wind: weather.current?.wind_speed_10m,
        condition: weatherCodes[weather.current?.weather_code] || "Unknown",
        timezone: weather.timezone,
      },
      airQuality: air?.current ? {
        aqi: air.current.us_aqi,
        pm25: air.current.pm2_5,
        pm10: air.current.pm10,
      } : null,
      tasting: conditions,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

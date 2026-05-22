// app/page.tsx — Javari Spirits
// Premium spirits affiliate hub — Awin Publisher 2692370
// CR AudioViz AI · EIN 39-3646201 · May 2026
"use client";
import { useState } from "react";

const CATEGORIES = [
  { icon: "🥃", label: "Whiskey & Bourbon",  desc: "Scotch, Irish, American, Japanese",    href: "/whiskey" },
  { icon: "🍷", label: "Wine",               desc: "Red, White, Rosé, Sparkling",          href: "/wine" },
  { icon: "🍸", label: "Cocktail Spirits",   desc: "Gin, Vodka, Rum, Tequila",             href: "/cocktails" },
  { icon: "🍺", label: "Craft Beer",         desc: "IPAs, Stouts, Sours, Lagers",          href: "/beer" },
  { icon: "🥂", label: "Champagne & Bubbles",desc: "Champagne, Prosecco, Cava",            href: "/sparkling" },
  { icon: "🌿", label: "Non-Alcoholic",      desc: "Premium zero-proof alternatives",       href: "/non-alcoholic" },
];

const FEATURED = [
  { name: "Buffalo Trace Bourbon", category: "Bourbon", price: "$28", rating: "4.8", emoji: "🥃" },
  { name: "Clase Azul Reposado",   category: "Tequila", price: "$169", rating: "4.9", emoji: "🍸" },
  { name: "Caymus Cabernet",       category: "Red Wine", price: "$89", rating: "4.7", emoji: "🍷" },
  { name: "Hendricks Gin",         category: "Gin",     price: "$35", rating: "4.6", emoji: "🌿" },
];

export default function SpiritsHome() {
  const [mood, setMood] = useState("");
  const [rec, setRec] = useState("");
  const [loading, setLoading] = useState(false);

  async function getRecommendation() {
    if (!mood.trim()) return;
    setLoading(true); setRec("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Recommend 3 premium spirits or wines for this occasion/mood: "${mood}". For each: name, why it fits, price range, and a tasting note. Keep it knowledgeable but approachable.` }],
          stream: false,
          systemOverride: "You are an expert sommelier and spirits consultant with 20 years of experience. Provide specific, knowledgeable recommendations with tasting notes. Only recommend products available through major retailers."
        }),
      });
      const data = await res.json();
      setRec(data?.choices?.[0]?.message?.content || data?.content || "Error.");
    } catch { setRec("Connection error."); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#040912", color: "#e2e8f0", fontFamily: "system-ui" }}>
      <nav style={{ background: "#1E3A5F", padding: "0 20px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🥃</span>
          <span style={{ fontWeight: 800, color: "#00B4D8", fontSize: 15 }}>Javari Spirits</span>
          <span style={{ color: "#374151", fontSize: 11 }}>· Premium Spirits Guide</span>
        </div>
        <a href="https://craudiovizai.com/auth/signup" style={{ background: "#FF0800", color: "#fff", borderRadius: 7, padding: "5px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Sign Up Free</a>
      </nav>

      <section style={{ background: "linear-gradient(135deg,#1E3A5F,#040912)", padding: "64px 24px 56px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#FF0800", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            AI-Powered Spirits Discovery
          </p>
          <h1 style={{ fontSize: "clamp(26px,4vw,48px)", fontWeight: 900, color: "#fff", margin: "0 0 14px", lineHeight: 1.05 }}>
            Find Your Perfect<br /><span style={{ color: "#00B4D8" }}>Pour</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.65, margin: "0 0 12px" }}>
            Premium spirits, wine, and craft beer — curated by AI, delivered to your door.
          </p>
          <p style={{ fontSize: 11, color: "#374151", marginBottom: 28 }}>
            Must be 21+ to purchase. Drink responsibly. Affiliate links may earn commission.
          </p>
        </div>
      </section>

      {/* AI Recommendation */}
      <section style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 0" }}>
        <div style={{ background: "#0F1F32", border: "1px solid rgba(0,180,216,0.12)", borderRadius: 16, padding: "24px 28px" }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 800, color: "#fff" }}>AI Spirits Recommender</h2>
          <p style={{ margin: "0 0 14px", color: "#6B7280", fontSize: 13 }}>Tell Javari the occasion or mood and get expert recommendations.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={mood} onChange={e => setMood(e.target.value)} onKeyDown={e => e.key === "Enter" && getRecommendation()}
              placeholder="Celebrating a promotion, hosting a dinner party, relaxing solo..."
              style={{ flex: 1, background: "#172D48", border: "1px solid rgba(0,180,216,0.15)", borderRadius: 8, padding: "11px 14px", color: "#e2e8f0", fontSize: 13, outline: "none", fontFamily: "system-ui" }} />
            <button onClick={getRecommendation} disabled={loading || !mood.trim()}
              style={{ background: loading || !mood.trim() ? "#0F1F32" : "#1E3A5F", color: loading || !mood.trim() ? "#374151" : "#00B4D8", border: "1px solid rgba(0,180,216,0.2)", borderRadius: 8, padding: "11px 16px", fontSize: 13, fontWeight: 700, cursor: loading || !mood.trim() ? "not-allowed" : "pointer", fontFamily: "system-ui", whiteSpace: "nowrap" }}>
              {loading ? "..." : "🥃 Recommend"}
            </button>
          </div>
          {rec && (
            <div style={{ marginTop: 16, padding: "14px 16px", background: "rgba(0,180,216,0.05)", border: "1px solid rgba(0,180,216,0.12)", borderRadius: 10 }}>
              <pre style={{ margin: 0, fontSize: 13, color: "#e2e8f0", lineHeight: 1.65, whiteSpace: "pre-wrap", fontFamily: "system-ui" }}>{rec}</pre>
            </div>
          )}
        </div>
      </section>

      {/* Featured */}
      <section style={{ maxWidth: 900, margin: "40px auto 0", padding: "0 20px" }}>
        <h2 style={{ fontSize: "clamp(16px,2.5vw,24px)", fontWeight: 800, color: "#fff", margin: "0 0 20px" }}>Featured This Month</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
          {FEATURED.map(f => (
            <div key={f.name} style={{ background: "#0F1F32", border: "1px solid rgba(0,180,216,0.08)", borderRadius: 14, padding: "18px 16px" }}>
              <span style={{ fontSize: 32, display: "block", marginBottom: 10 }}>{f.emoji}</span>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0", marginBottom: 4 }}>{f.name}</div>
              <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 8 }}>{f.category}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#FF0800", fontWeight: 700, fontSize: 14 }}>{f.price}</span>
                <span style={{ color: "#00B4D8", fontSize: 12 }}>⭐ {f.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px 72px" }}>
        <h2 style={{ fontSize: "clamp(16px,2.5vw,24px)", fontWeight: 800, color: "#fff", margin: "0 0 20px" }}>Browse by Category</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          {CATEGORIES.map(c => (
            <a key={c.href} href={c.href} style={{ background: "#0F1F32", border: "1px solid rgba(0,180,216,0.08)", borderRadius: 14, padding: "18px", textDecoration: "none", display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{c.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0", marginBottom: 3 }}>{c.label}</div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>{c.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: "1px solid rgba(0,180,216,0.08)", padding: "14px 24px", textAlign: "center" }}>
        <p style={{ color: "#374151", fontSize: 11, margin: "0 0 4px" }}>
          Awin Publisher ID: 2692370 · Must be 21+ · Please drink responsibly
        </p>
        <p style={{ color: "#374151", fontSize: 11, margin: 0 }}>
          © 2026 CR AudioViz AI, LLC — EIN: 39-3646201
        </p>
      </footer>
    </div>
  );
}
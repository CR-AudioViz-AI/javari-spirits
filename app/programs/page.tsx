// app/programs/page.tsx — Awin Alcohol Affiliate Programs
// Publisher id is an account identifier, not display copy — removed 2026-08-17
// CR AudioViz AI · EIN 39-3646201 · May 2026
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Affiliate Programs | Javari Spirits",
  description: "Shop premium spirits, wine, and beer from top-rated retailers.",
};

const PROGRAMS = [
  { name: "Total Wine & More",    url: "https://www.totalwine.com",       emoji: "🍷", cat: "Multi-Category",   desc: "Largest wine, spirits & beer retailer in the US" },
  { name: "Drizly",               url: "https://drizly.com",              emoji: "🚀", cat: "Delivery",         desc: "On-demand alcohol delivery in under 60 minutes" },
  { name: "Wine.com",             url: "https://wine.com",                emoji: "🍾", cat: "Wine",             desc: "Premier online wine shop — 30,000+ selections" },
  { name: "ReserveBar",           url: "https://reservebar.com",          emoji: "🥃", cat: "Premium Spirits",  desc: "Curated selection of ultra-premium spirits" },
  { name: "Flaviar",              url: "https://flaviar.com",             emoji: "🎁", cat: "Spirits Club",     desc: "Spirits discovery club with rare finds" },
  { name: "Caskers",              url: "https://caskers.com",             emoji: "🛢️", cat: "Whiskey",          desc: "Rare and exclusive American whiskey" },
  { name: "Master of Malt",       url: "https://masterofmalt.com",       emoji: "⚗️",  cat: "Whisky/Spirits",   desc: "World-leading drinks retailer — 40,000+ products" },
  { name: "The Whisky Exchange",  url: "https://thewhiskyexchange.com",  emoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", cat: "Whisky",           desc: "World's largest online whisky shop" },
  { name: "Vinfolio",             url: "https://vinfolio.com",            emoji: "📦", cat: "Investment Wine",  desc: "Fine wine investment and trading" },
  { name: "Minibar Delivery",     url: "https://minibardelivery.com",    emoji: "🛒", cat: "Delivery",         desc: "Alcohol delivery from local stores" },
  { name: "BoozeBud",             url: "https://boozebud.com.au",        emoji: "🇦🇺", cat: "Australia",        desc: "Australia top online liquor store" },
  { name: "Vintage Wine Estates", url: "https://vintagewineestates.com", emoji: "🌿", cat: "Direct from Winery", desc: "California wines direct from the vineyard" },
];

export default function ProgramsPage() {
  return (
    <div style={{ minHeight:"100vh", background:"#040912", color:"#e2e8f0", fontFamily:"system-ui" }}>
      <nav style={{ background:"#1E3A5F", padding:"0 20px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <a href="/" style={{ fontWeight:800, color:"#00B4D8", textDecoration:"none", fontSize:15 }}>🥃 Javari Spirits</a>
      </nav>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"48px 20px 72px" }}>
        <h1 style={{ fontSize:"clamp(22px,4vw,36px)", fontWeight:900, color:"#fff", margin:"0 0 10px" }}>
          Shop by Retailer
        </h1>
        <p style={{ color:"#6B7280", fontSize:14, margin:"0 0 36px" }}>
          Premium spirits, wine, and beer from our trusted retail partners.
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:14 }}>
          {PROGRAMS.map(p => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
              style={{ background:"#0F1F32", border:"1px solid rgba(0,180,216,0.1)", borderRadius:16, padding:"20px 20px", textDecoration:"none", display:"block" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <span style={{ fontSize:28 }}>{p.emoji}</span>
                <span style={{ background:"rgba(0,180,216,0.1)", color:"#00B4D8", borderRadius:20, padding:"2px 10px", fontSize:10, fontWeight:700 }}>{p.cat}</span>
              </div>
              <div style={{ fontWeight:700, fontSize:14, color:"#fff", marginBottom:6 }}>{p.name}</div>
              <div style={{ fontSize:12, color:"#6B7280", lineHeight:1.5 }}>{p.desc}</div>
            </a>
          ))}
        </div>

        <p style={{ textAlign:"center", marginTop:32, fontSize:11, color:"#374151" }}>
          Affiliate links · Must be 21+ · Please drink responsibly
        </p>
      </div>
    </div>
  );
}
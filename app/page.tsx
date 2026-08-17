"use client";
// app/page.tsx — Javari Spirits — Javari branded (not Javari Spirits)
// Awin Publisher ID: 2692370
// CR AudioViz AI · EIN 39-3646201 · May 2026
import { useState } from "react";

// PARTNERS REMOVED 2026-08-17.
// Six entries stood here with hardcoded AWIN merchant ids (11006, 10924, 14563,
// 15832, 13254, 9876) under publisher 2692370, labelled "Real affiliate partners
// from Awin network". None of the fourteen ids hardcoded across this codebase
// matched any of the 146 merchants in affiliate_merchants, where every real
// AWIN, CJ and Rakuten relationship lives. 11006 is NOW TV. 13254 is Street One.
// A customer clicking "Vivino" landed on a French clothing retailer, and the
// clicks were driving unapproved traffic under a live publisher id.
//
// Nothing is hardcoded back in. When real spirits merchants are approved, this
// list is read from affiliate_merchants where is_approved and is_active, so a
// fabricated partner is structurally impossible rather than merely absent.
const FEATURED: { name: string; url: string; category: string; badge: string; desc: string }[] = [];

const CATEGORIES = ["All","Spirits","Wine","Beer","Delivery","Subscription","Premium","Gifts"];

export default function JavariSpirits() {
  const [cat,setCat]=useState("All");
  const [search,setSearch]=useState("");

  const filtered = FEATURED.filter(p =>
    (cat==="All" || p.category===cat || p.category.includes(cat)) &&
    (search==="" || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{minHeight:"100vh",background:"#0a0806",color:"#e2d5c3",fontFamily:"system-ui"}}>
      <nav style={{background:"rgba(20,14,8,0.95)",padding:"0 20px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100,borderBottom:"1px solid rgba(212,175,55,0.12)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>🥃</span>
          <span style={{fontWeight:900,color:"#D4AF37",fontSize:17}}>Javari Spirits</span>
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <a href="https://craudiovizai.com" style={{color:"rgba(212,175,55,0.5)",textDecoration:"none",fontSize:12}}>CR AudioViz AI</a>
          <a href="https://javariai.com" style={{color:"#D4AF37",textDecoration:"none",fontSize:12,fontWeight:600}}>Javari AI →</a>
        </div>
      </nav>

      <section style={{background:"linear-gradient(180deg,#1a0f06 0%,#0a0806 100%)",padding:"64px 24px 52px",textAlign:"center",borderBottom:"1px solid rgba(212,175,55,0.08)"}}>
        <p style={{fontSize:11,fontWeight:700,color:"#D4AF37",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:12}}>
          Awin Publisher · ID: 2692370
        </p>
        <h1 style={{fontSize:"clamp(28px,5vw,56px)",fontWeight:900,color:"#fff",margin:"0 0 14px",lineHeight:1.0}}>
          Javari Spirits
        </h1>
        <p style={{fontSize:16,color:"rgba(226,213,195,0.7)",margin:"0 0 28px",maxWidth:520,marginLeft:"auto",marginRight:"auto"}}>
          The finest wines, spirits, and craft beverages. Curated for the discerning palate.
        </p>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search spirits, wine, beer..."
          style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(212,175,55,0.2)",borderRadius:10,padding:"12px 18px",color:"#e2d5c3",fontSize:14,outline:"none",fontFamily:"system-ui",width:"100%",maxWidth:400,boxSizing:"border-box"}}/>
      </section>

      <div style={{maxWidth:1060,margin:"0 auto",padding:"32px 20px 72px"}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:24}}>
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setCat(c)}
              style={{background:cat===c?"rgba(212,175,55,0.15)":"rgba(255,255,255,0.03)",color:cat===c?"#D4AF37":"rgba(226,213,195,0.5)",border:`1px solid ${cat===c?"rgba(212,175,55,0.3)":"rgba(255,255,255,0.06)"}`,borderRadius:20,padding:"6px 14px",cursor:"pointer",fontFamily:"system-ui",fontSize:12,fontWeight:cat===c?700:400}}>
              {c}
            </button>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
          {filtered.map(p=>(
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
              style={{background:"rgba(20,14,8,0.8)",border:"1px solid rgba(212,175,55,0.1)",borderRadius:14,padding:"20px 18px",textDecoration:"none",display:"block",position:"relative"}}>
              {p.badge&&<span style={{position:"absolute",top:-8,right:12,background:"#D4AF37",color:"#0a0806",borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:800}}>{p.badge}</span>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <span style={{fontSize:20,fontWeight:900,color:"#fff"}}>{p.name}</span>
                <span style={{fontSize:10,color:"rgba(212,175,55,0.6)",background:"rgba(212,175,55,0.08)",borderRadius:20,padding:"2px 8px",marginLeft:8,whiteSpace:"nowrap"}}>{p.category}</span>
              </div>
              <p style={{fontSize:13,color:"rgba(226,213,195,0.6)",margin:"0 0 14px",lineHeight:1.4}}>{p.desc}</p>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:11,color:"#D4AF37",fontWeight:600}}>Shop Now →</span>
                <span style={{fontSize:9,color:"rgba(212,175,55,0.3)"}}>Affiliate link</span>
              </div>
            </a>
          ))}
        </div>

        <p style={{textAlign:"center",marginTop:32,fontSize:11,color:"rgba(212,175,55,0.2)"}}>
          Affiliate disclosure: Javari Spirits earns commissions through Awin affiliate partnerships (Publisher ID: 2692370).<br/>
          CR AudioViz AI, LLC · EIN: 39-3646201 · Fort Myers, Florida
        </p>
      </div>
    </div>
  );
}
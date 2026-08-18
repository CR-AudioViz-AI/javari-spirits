// app/api/auth/sso/consume/route.ts — spend the handoff code, on this domain
//
// STEP 4b OF THE HANDOFF, ON THE BRANDED SITE. The browser hands this route the
// opaque code it arrived with. This route calls craudiovizai.com server to
// server with the shared secret and gets back a single-use sign-in hash.
//
// WHY THE BROWSER DOES NOT CALL CORE DIRECTLY. The reply contains a sign-in
// hash. If the browser fetched it, the hash would be in a response the page can
// read and in any URL that carried it — which is precisely the leak the old
// implementation had when it put a live access token in a query string. The
// hash crosses machines, never addresses.
//
// CR AudioViz AI, LLC · EIN 39-3646201 · August 2026
import { NextRequest, NextResponse } from "next/server";
import { getSecret } from "@/lib/vault/getSecret";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

/** The identity origin. Every branded site in the ecosystem points here. */
const CORE_ORIGIN = "https://craudiovizai.com";

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
} as const;

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { code?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400, headers: NO_STORE });
  }

  const code = body.code?.trim();
  if (!code) {
    return NextResponse.json({ error: "code is required" }, { status: 400, headers: NO_STORE });
  }

  const secret = await getSecret("SSO_SHARED_SECRET");
  if (!secret) {
    // Fail closed and say so plainly. A misconfigured site must not look like a
    // rejected sign-in, or nobody will ever find out it is misconfigured.
    return NextResponse.json({ error: "Sign-in is not configured on this site" }, { status: 503, headers: NO_STORE });
  }

  // The origin this site actually is, taken from the request rather than
  // guessed, so previews and production both redeem against their own origin.
  const origin = req.nextUrl.origin;

  try {
    const res = await fetch(`${CORE_ORIGIN}/api/auth/sso/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-sso-secret": secret },
      body: JSON.stringify({ code, origin }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const detail = (await res.json().catch(() => ({}))) as { error?: string };
      return NextResponse.json(
        { error: detail.error ?? "That sign-in link is no longer valid" },
        { status: res.status === 401 ? 401 : 502, headers: NO_STORE },
      );
    }

    const { tokenHash } = (await res.json()) as { tokenHash: string };
    return NextResponse.json({ tokenHash }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ error: "Could not reach the sign-in service" }, { status: 502, headers: NO_STORE });
  }
}

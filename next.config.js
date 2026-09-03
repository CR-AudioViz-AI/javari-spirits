/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // 2026-09-02: this app served ONE of six security headers while core served
    // all six. Verify's own security-posture check found it against the live
    // site, which is the point of the product.
    //
    // X-Frame-Options: without it the page can be framed and overlaid, so a user
    // clicks an invisible target instead of the button they can see. On a page
    // with a buy button that is a real attack.
    // nosniff: without it a user-uploaded file can be coaxed into executing.
    // HSTS: without it the FIRST request of a session can be downgraded before
    // any redirect fires, and a padlock later does not undo that.
    // Referrer-Policy: full URLs — including tokens and ids in them — leak to
    // every third party the page contacts.
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  // 2026-08-29: required for @craudioviz/platform-sdk. The SDK ships raw
  // TypeScript and Next does not run node_modules through SWC by default, so
  // any import carrying a `type` re-export fails the build without this.
  transpilePackages: ["@craudioviz/platform-sdk"],
  // 2026-08-20: /collections and /login were `redirect()` calls inside page
  // components, which in Next return HTTP 200 with a rendered shell - a BLANK
  // PAGE, not a redirect. Anyone following an old /login link reached nothing.
  //
  // Route aliases belong here, where they are a real 308 at the edge that
  // crawlers follow and that actually moves the visitor. The same defect was
  // found 36 times in the core platform and 19 more across the fleet;
  // scripts/audit-ecosystem.mjs now fails the build on it.
  async redirects() {
    return [
      { source: "/collections", destination: "/collection", permanent: true },
      { source: "/login", destination: "/auth/login", permanent: true },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  }
};


// 2026-08-30: Next 15 compiles instrumentation.ts for the EDGE runtime as well
// as node, so the vault env-shim's `crypto` import is pulled into an edge
// bundle even though register() returns early off nodejs. Marking it
// unavailable for the edge compilation is what stops it. The import must stay
// a BARE `crypto` specifier: webpack rejects the `node:` scheme before
// resolve.fallback is ever consulted, so `node:crypto` fails here too.
const _edgeCryptoOff = (config, { nextRuntime }) => {
  if (nextRuntime === "edge") {
    config.resolve = config.resolve || {};
    config.resolve.fallback = { ...(config.resolve.fallback || {}), crypto: false };
  }
  return config;
};

// 2026-09-05 Next 16: webpack config removed.
//
// Turbopack is the default builder in Next 16 and refuses to start when a
// webpack config exists with no turbopack equivalent.
//
// This block existed only to disable the crypto fallback on the edge runtime.
// It is scaffolding for a problem Turbopack does not have: node:crypto resolves
// correctly on edge. Proven on javari-logo and javari-forge, both of which built
// and deployed on 16.3.4 with it deleted.
//
// Thirty-seven repos carried a byte-identical copy - one sha256 across all of
// them - so this is one fix applied thirty-seven times, not thirty-seven fixes.
module.exports = { ...nextConfig };

/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = { ...nextConfig, webpack: _edgeCryptoOff };

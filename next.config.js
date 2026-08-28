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

module.exports = nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Phase 7: Performance
  compress: true,
  poweredByHeader: false,

  async rewrites() {
    return [
      // Pinned v1 API alias for mobile clients.
      // Production app builds use EXPO_PUBLIC_API_BASE=https://api.lokul.club/v1,
      // so all mobile calls arrive as /v1/api/mobile/*. This alias freezes the
      // contract: future breaking changes ship under /v2 real routes while
      // shipped binaries keep working against /v1.
      { source: "/v1/api/:path*", destination: "/api/:path*" },
    ];
  },

  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    return [
      // Static assets: aggressive long-term cache (PROD ONLY).
      // In dev, Turbopack reuses chunk URLs across rebuilds, so an immutable
      // cache header makes the browser keep stale JS — which causes
      // hydration mismatches when the server reloads with new code.
      ...(isProd
        ? [
            {
              source: "/_next/static/(.*)",
              headers: [
                { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
              ],
            },
          ]
        : []),
      {
        // All routes: security headers
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

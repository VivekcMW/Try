/**
 * Cloudflare Worker — Geo Header Injector for lokul.club
 *
 * This worker reads Cloudflare's built-in geo data (available on ALL plans
 * including free) from `request.cf` and injects it as custom HTTP headers
 * before proxying the request to the Firebase Hosting origin. Next.js reads
 * them in src/lib/geo.ts via parseGeoHeaders().
 *
 * Setup (one-time):
 *  1. Install Wrangler:  npm install -g wrangler
 *  2. Login:             wrangler login
 *  3. Deploy:            wrangler deploy   (from the lokul.club project root)
 *  4. In Cloudflare dashboard → Workers & Pages → lokul-geo → Settings →
 *     add a Route:  lokul.club/*  (zone: lokul.club)
 *
 * The worker proxies to whatever Firebase Hosting URL is behind Cloudflare.
 * Make sure Firebase Hosting is set as the "default" origin for lokul.club.
 */
export default {
  async fetch(request, _env, _ctx) {
    const url     = new URL(request.url);
    const headers = new Headers(request.headers);

    // Inject Cloudflare geo properties as custom headers
    const cf = /** @type {any} */ (request.cf) ?? {};
    if (cf.postalCode) headers.set("X-Geo-Postal",  String(cf.postalCode));
    if (cf.city)       headers.set("X-Geo-City",    String(cf.city));
    if (cf.region)     headers.set("X-Geo-Region",  String(cf.region));
    if (cf.country)    headers.set("X-Geo-Country", String(cf.country));

    return fetch(
      new Request(url.toString(), {
        method:   request.method,
        headers:  headers,
        body:     ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
        redirect: "follow",
      })
    );
  },

  /**
   * Cron handler — fires every minute ("* * * * *").
   * Calls the Next.js escalate-batch route to escalate unresponded SOS
   * incidents from 200 m → 400 m when no one accepts within 2 minutes.
   */
  async scheduled(_event, env, _ctx) {
    const appUrl     = env.APP_URL ?? "https://lokul.club";
    const cronSecret = env.CRON_SECRET ?? "";

    try {
      const res = await fetch(`${appUrl}/api/mobile/sos/escalate-batch`, {
        method:  "POST",
        headers: {
          "Content-Type":   "application/json",
          "x-cron-secret":  cronSecret,
        },
      });
      const body = await res.json();
      console.log("[sos-escalate-cron]", body);
    } catch (err) {
      console.error("[sos-escalate-cron] failed", err);
    }
  },
};

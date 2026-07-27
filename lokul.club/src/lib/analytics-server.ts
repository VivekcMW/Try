/**
 * Server-side PostHog capture — fire-and-forget, no SDK dependency.
 *
 * The mobile app has no analytics SDK, so funnel events are captured at the
 * API boundary instead. Distinct id = lokul userId, so the funnel
 *   onboarding_completed → post_created → order_created
 * can be built directly in PostHog (Insights → Funnels).
 *
 * Uses NEXT_PUBLIC_POSTHOG_KEY / NEXT_PUBLIC_POSTHOG_HOST (same project as
 * the web client). No-ops when the key is missing or a placeholder, and never
 * throws — analytics must not affect request handling.
 */

const E2E =
  process.env.E2E_TEST === "1" ||
  (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

export function captureServerEvent(
  distinctId: string,
  event: string,
  properties: Record<string, string | number | boolean | null> = {}
): void {
  const key  = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";

  if (E2E || !key || key.startsWith("phc_xxx")) return;

  // Fire-and-forget: don't await, don't block the response.
  void fetch(`${host.replace(/\/$/, "")}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      event,
      distinct_id: distinctId,
      properties: { ...properties, $lib: "lokul-server" },
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => {
    // swallow — analytics is best-effort
  });
}

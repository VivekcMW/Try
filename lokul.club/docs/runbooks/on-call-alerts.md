# Runbook — On-Call Alerts

## Uptime — `/api/health`

`GET https://lokul.club/api/health` returns:
- `200 {status:"ok", checks:{db,redis}}` — healthy
- `503 {status:"degraded"}` — Postgres unreachable (Redis failure is reported but non-gating; the rate limiter fails open)

Configure an external probe (BetterStack / UptimeRobot / Checkly):
- Interval: 60s, locations ≥ 2, alert after 2 consecutive failures
- Assert: HTTP 200 **and** body contains `"status":"ok"`
- Also probe `https://lokul.club/` (checks the Cloudflare Worker → Vercel path end-to-end, not just the origin)

## Sentry alert policy

Sentry (`@sentry/nextjs`) alert rules, in priority order:

| Rule | Filter | Threshold | Severity |
|---|---|---|---|
| SOS pipeline errors | `url:*/api/mobile/sos*` | ≥ 1 event / 5 min | **SEV-1, page** |
| Payment/webhook errors | `url:*/api/mobile/wallet/* OR url:*/api/webhooks/*` | ≥ 1 event / 5 min | **SEV-1, page** |
| Health degraded | uptime probe (above) | 2 consecutive fails | **SEV-1, page** |
| API error-rate spike | all `/api/*` | > 1% of requests / 10 min | SEV-2, notify |
| New issue in prod | any first-seen issue | immediate | SEV-3, Slack only |

Route SEV-1 to the paging channel (PagerDuty/Opsgenie or Slack + phone escalation); SEV-2/3 to `#lokul-alerts`.

## Cron monitoring

- **Cloudflare Worker cron** (SOS escalation, every minute): Cloudflare dashboard → Workers → Cron Events. Add a dead-man switch: the escalate-batch handler pings a heartbeat URL (healthchecks.io) on success; alert if no ping for 5 min.
- **Vercel cron** (`/api/cron/news-refresh`, every 30 min): Vercel dashboard → Cron; non-critical, SEV-3.

## Payments daily check (non-paging)

Scheduled daily job or manual morning routine:
```
GET /api/admin/reconciliation          → summary.driftPaise == 0
GET /api/admin/reconciliation?format=csv  → attach to finance channel
```
Any `paidOrdersWithoutLedgerEntry` row = user paid but not credited → treat as SEV-2, credit manually via admin wallet tools after verifying in the Razorpay dashboard.

## First 10 minutes of any page

1. `curl -s https://lokul.club/api/health | jq` — scope the blast radius (db? redis? whole app?).
2. Check the Vercel deployments page — did a deploy just go out? If yes → rollback.md.
3. Check Sentry issue → is it one route or everything?
4. SOS-related? → sos-pipeline-failure.md immediately, everything else waits.
5. Post a status line in `#lokul-incidents` (what, impact, who's on it) before deep-diving.

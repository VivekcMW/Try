# Runbook — SOS Pipeline Failure

**Severity: SEV-1.** The SOS pipeline is safety-critical. Treat any suspected failure as an active incident until proven otherwise.

## How the pipeline works

1. User triggers SOS in the mobile app → `POST /api/mobile/sos` creates a `SosIncident` (status `open`, `escalationLevel 0`) and sends the **200 m proximity wave** (push to nearby users via `UserLocation` bounding box; `notifiedUserIds` prevents double-push).
2. **Escalation cron**: the Cloudflare Worker (`wrangler.toml`, schedule `* * * * *`) calls `POST {APP_URL}/api/mobile/sos/escalate-batch` with header `x-cron-secret: ${CRON_SECRET}`. Incidents still `open` past the escalation window get the **400 m wave** (`escalationLevel 1`, `escalatedAt` set).
3. Responders acknowledge via `SosResponder`; incident is resolved via status `ack` → `resolved`.

## Detection

- Sentry alert on any 5xx from `/api/mobile/sos*` routes (see on-call-alerts.md).
- Cloudflare Worker cron failures: Cloudflare dashboard → Workers → lokul worker → Logs / Cron Events.
- Synthetic check: staging cron dry-run — an `open` incident older than the escalation window with `escalationLevel 0` and `firstAlertAt` set is a **stuck escalation**.

```sql
-- Stuck escalations (should normally return 0 rows)
SELECT id, "pinCode", category, severity, "createdAt", "firstAlertAt"
FROM "SosIncident"
WHERE status = 'open'
  AND "escalationLevel" = 0
  AND "firstAlertAt" < now() - interval '10 minutes';
```

## Triage (in order)

1. **Is the app up?** `curl -s https://lokul.club/api/health` — if `db.ok=false`, this is a database incident; see rollback.md § database.
2. **Is the cron firing?** Cloudflare dashboard → Cron Events. If no invocations: check the Worker deployment (`wrangler deployments list`) and re-deploy (`wrangler deploy`).
3. **Is the cron authorized?** 401s from `/api/mobile/sos/escalate-batch` mean either `CRON_SECRET` mismatch between the Worker secret (`wrangler secret put CRON_SECRET`) and Vercel env, or `CRON_SECRET` is unset on one side — the route fails closed (rejects all requests) when its own `CRON_SECRET` env var is empty, it does NOT skip the check. Rotate/set on BOTH sides simultaneously.
4. **Are pushes delivered?** Check the push provider logs (`/api/admin/push/send` path) and Ably status (status.ably.com) for the realtime channels.
5. **Is escalation logic failing?** Sentry issues filtered to `escalate-batch`; check the `@@index([escalationLevel, firstAlertAt])` query plan if timeouts.

## Mitigation

- **Cron dead, app healthy** → manually trigger escalation every few minutes until cron restored:
  ```bash
  curl -X POST https://lokul.club/api/mobile/sos/escalate-batch \
    -H "x-cron-secret: $CRON_SECRET"
  ```
- **App down** → roll back the web deploy first (see rollback.md); SOS creation matters more than escalation.
- **Push provider down** → escalate to manual moderation: admin console → incidents view; contact incident authors by phone (`SafetyContact` numbers on the incident author).

## Post-incident

- Verify every incident opened during the outage reached `escalationLevel` ≥ its expected level; manually notify where waves were missed.
- Write a post-mortem; add a synthetic SOS canary test to staging if the gap was detection.

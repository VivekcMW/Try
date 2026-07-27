# Runbook — Rollback Procedure

## 1. Web app (Vercel) — instant rollback

Use when a deploy causes elevated errors, broken pages, or failed payments.

```bash
# List recent production deployments
vercel ls lokul.club --prod

# Instant rollback to the previous good deployment (aliases prod domain)
vercel rollback <deployment-url>
```

Or: Vercel dashboard → Project → Deployments → ⋯ on the last good deploy → **Promote to Production**. This is instant (alias switch, no rebuild).

**After rollback:** confirm `curl https://lokul.club/api/health` returns 200 and Sentry error rate drops. Note that the Cloudflare Worker in front is versioned separately — if the bad change was in `cloudflare-worker.js`, roll it back with `wrangler rollback` (or `wrangler deployments list` → `wrangler versions deploy`).

## 2. Database migrations — down-plan

Prisma has **no automatic down migrations**. Policy:

### Before every production migration
1. Migrations run via `prisma migrate deploy` (never `db push`, never `migrate dev`) against prod.
2. Snapshot first: take a manual backup / verify PITR restore point on the managed Postgres before applying.
3. Every migration PR must state its **down-plan** in the description: either "additive — roll forward only" or an explicit reverse SQL script.

### Additive-only rule (strongly preferred)
Ship schema changes so old app code keeps working against the new schema:
- ✅ add nullable columns, add tables, add indexes (`CONCURRENTLY` for big tables)
- ❌ never drop/rename a column in the same release that stops using it — drop it one release later

With additive-only migrations, **web rollback (step 1) never requires a DB rollback**.

### If a migration must be reverted
1. Freeze writes if data corruption is possible (put the app in maintenance via Vercel env flag / rollback first).
2. Apply the reverse SQL from the migration PR manually:
   ```bash
   psql "$DATABASE_URL" -f revert_<migration_name>.sql
   # then mark it rolled back so migrate deploy doesn't re-apply state confusion
   npx prisma migrate resolve --rolled-back <migration_name>
   ```
3. Worst case (no reverse script possible): PITR-restore to a new instance, repoint `DATABASE_URL`, accept the data-loss window, and reconcile payments afterwards via `/api/admin/reconciliation`.

## 3. Mobile app

- **OTA (JS-only) regression**: republish the previous update to the channel:
  ```bash
  cd apps/mobile
  eas update:republish --channel production   # pick the last good update
  ```
- **Native/binary regression**: OTA rollback does not help across runtime versions. Halt the store rollout (Play Console staged rollout → halt; App Store → remove from sale is last resort), fix forward with an expedited build.
- The API keeps the `/v1` alias stable (see next.config.ts rewrites) — never break `/v1/api/mobile/*` while any store binary is live.

## 4. Payments-specific rollback rules

- Never roll back across a deploy that changed wallet/webhook logic without running the reconciliation report immediately after:
  `GET /api/admin/reconciliation?from=<deploy-date>` — `driftPaise` must be 0 and mismatch lists empty.
- Webhooks are idempotent (`WebhookEvent` claim table), so Razorpay's 24h retry window will safely re-deliver events missed during downtime — **do not** replay events manually unless they are older than 24h (then use Razorpay dashboard → Webhooks → resend).

/**
 * Seed soft-launch feature flags for pilot societies/pincodes.
 *
 * The mobile app resolves flags via GET /api/mobile/flags with scope priority
 * user > society > pincode > city > global. This script sets:
 *   - `soft_launch` global    = disabled  (everyone off by default)
 *   - `soft_launch` per pilot = enabled   (pincode:/society:/city: overrides)
 *
 * Usage (from repo root, DATABASE_URL in env):
 *   node scripts/seed-pilot-flags.mjs pincode:560001 society:<societyId>
 *   node scripts/seed-pilot-flags.mjs --disable pincode:560001   # roll a pilot back
 *   node scripts/seed-pilot-flags.mjs global:on                  # full launch
 *
 * Widening the launch = run again with more scopes.
 */
import pg from "pg";
import { randomUUID } from "node:crypto";

const FLAG_KEY = "soft_launch";

const args    = process.argv.slice(2);
const disable = args.includes("--disable");
const targets = args.filter((a) => !a.startsWith("--"));

if (targets.length === 0) {
  console.error(
    "Usage: node scripts/seed-pilot-flags.mjs [--disable] pincode:560001 society:<id> city:<name> [global:on]"
  );
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

async function upsertFlag(scope, scopeValue, enabled, description) {
  const existing = await client.query(
    `SELECT id FROM "FeatureFlag"
     WHERE key = $1 AND scope = $2::"FeatureFlagScope"
       AND "scopeValue" IS NOT DISTINCT FROM $3`,
    [FLAG_KEY, scope, scopeValue]
  );

  if (existing.rows.length > 0) {
    await client.query(
      `UPDATE "FeatureFlag"
       SET enabled = $2, description = $3, "updatedAt" = now()
       WHERE id = $1`,
      [existing.rows[0].id, enabled, description]
    );
  } else {
    await client.query(
      `INSERT INTO "FeatureFlag"
         (id, key, enabled, scope, "scopeValue", description, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4::"FeatureFlagScope", $5, $6, now(), now())`,
      [randomUUID(), FLAG_KEY, enabled, scope, scopeValue, description]
    );
  }
  console.log(
    `  ${enabled ? "✓ enabled " : "✗ disabled"}  ${FLAG_KEY}  [${scope}${scopeValue ? `:${scopeValue}` : ""}]`
  );
}

try {
  // Ensure the global default exists — OFF unless explicitly `global:on`
  const globalOn = targets.includes("global:on");
  await upsertFlag(
    "global",
    null,
    globalOn,
    "Soft-launch master switch — off globally, enabled per pilot scope"
  );

  for (const target of targets) {
    if (target === "global:on") continue;
    const [kind, ...rest] = target.split(":");
    const value = rest.join(":");
    if (!value || !["pincode", "society", "city"].includes(kind)) {
      console.error(`Skipping invalid target "${target}" (expected pincode:|society:|city:<value>)`);
      continue;
    }
    await upsertFlag(kind, value, !disable, `Pilot cohort ${kind}:${value} (soft launch)`);
  }

  const all = await client.query(
    `SELECT enabled, scope, "scopeValue" FROM "FeatureFlag" WHERE key = $1 ORDER BY scope`,
    [FLAG_KEY]
  );
  console.log(`\n${FLAG_KEY} flags now in DB:`);
  for (const f of all.rows) {
    console.log(`  ${f.enabled ? "ON " : "off"}  ${f.scope}${f.scopeValue ? `:${f.scopeValue}` : ""}`);
  }
} finally {
  await client.end();
}

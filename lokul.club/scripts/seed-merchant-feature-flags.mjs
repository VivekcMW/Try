/**
 * One-off idempotent seed for the new merchant/back-office feature flags
 * introduced 2026-08-17 (see prisma/seed.ts feature-flags block for the
 * canonical list). Safe to re-run — upserts by (key, scope, scopeValue).
 *
 * Usage: node scripts/seed-merchant-feature-flags.mjs
 */
import pg from "pg";
import { randomUUID } from "node:crypto";

const FLAGS = [
  { key: "merchant_broadcasts",    enabled: true,  description: "Merchants push messages to their past customers" },
  { key: "merchant_coupons",       enabled: true,  description: "Merchants create their own discount codes" },
  { key: "merchant_subscriptions", enabled: true,  description: "Merchants sell recurring subscription plans" },
  { key: "merchant_branches",      enabled: true,  description: "Merchants add multiple business locations" },
  { key: "merchant_pages",         enabled: true,  description: "Public merchant directory/storefront listings" },
  { key: "sos_broadcast",          enabled: false, description: 'Emergency "sos" post type in the feed' },
  { key: "kyc_gold_tier",          enabled: true,  description: "Aadhaar liveness/face-match gold KYC tier flow" },
];

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

for (const f of FLAGS) {
  const existing = await client.query(
    `SELECT id FROM "FeatureFlag" WHERE key = $1 AND scope = 'global'::"FeatureFlagScope" AND "scopeValue" IS NULL`,
    [f.key]
  );

  if (existing.rows.length > 0) {
    await client.query(
      `UPDATE "FeatureFlag" SET description = $2, "updatedAt" = now() WHERE id = $1`,
      [existing.rows[0].id, f.description]
    );
    console.log(`  = kept existing  ${f.key} (enabled state left as-is)`);
  } else {
    await client.query(
      `INSERT INTO "FeatureFlag" (id, key, enabled, scope, "scopeValue", description, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, 'global'::"FeatureFlagScope", NULL, $4, now(), now())`,
      [randomUUID(), f.key, f.enabled, f.description]
    );
    console.log(`  + inserted       ${f.key} (enabled=${f.enabled})`);
  }
}

await client.end();
console.log("Done.");

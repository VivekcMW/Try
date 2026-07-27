/**
 * Seed demo ads data: one approved advertiser + live campaign + approved
 * creative + approved booking (pincode 560001), and one pending advertiser
 * with a campaign/creative/booking awaiting review — so every admin queue
 * has something in it.
 *
 * Usage (from repo root, DATABASE_URL in env):
 *   node scripts/seed-ads.mjs
 *
 * Idempotent: re-running updates the same rows (fixed ids).
 */
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const now = new Date();
const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

async function upsert(table, id, columns, values, casts = {}) {
  const cols = ["id", ...columns];
  const params = [id, ...values];
  const placeholders = cols.map((c, i) => `$${i + 1}${casts[c] ? `::"${casts[c]}"` : ""}`);
  const updates = columns
    .map((c, i) => `"${c}" = $${i + 2}${casts[c] ? `::"${casts[c]}"` : ""}`)
    .join(", ");
  await client.query(
    `INSERT INTO "${table}" (${cols.map(c => `"${c}"`).join(", ")}, "createdAt", "updatedAt")
     VALUES (${placeholders.join(", ")}, now(), now())
     ON CONFLICT (id) DO UPDATE SET ${updates}, "updatedAt" = now()`,
    params,
  );
  console.log(`  ✓ ${table} ${id}`);
}

try {
  // ── Advertiser 1: approved, live campaign in 560001 ──
  await upsert("Advertiser", "adv_seed_sharma",
    ["name", "contactName", "contactEmail", "contactPhone", "status"],
    ["Sharma Kirana", "Ramesh Sharma", "ramesh@sharmakirana.in", "+919810000001", "approved"],
    { status: "AdvertiserStatus" });

  await upsert("AdCampaign", "cmp_seed_paneer",
    ["advertiserId", "name", "objective", "packageTier", "pricingModel", "budgetPaise", "spentPaise", "startDate", "endDate", "targeting", "status"],
    ["adv_seed_sharma", "Paneer Push", "Drive orders for fresh paneer", "micro_local", "cpm", 500000, 0, monthStart, monthEnd, JSON.stringify({ pincodes: ["560001"] }), "live"],
    { packageTier: "AdPackageTier", pricingModel: "AdPricingModel", status: "AdCampaignStatus" });

  await upsert("AdCreative", "cr_seed_paneer",
    ["campaignId", "placement", "headline", "body", "ctaLabel", "ctaUrl", "status"],
    ["cmp_seed_paneer", "feed_post", "Fresh paneer stock just arrived", "₹280/kg · Delivery available till 9 PM", "Order Now", "https://lokul.club/m/sharma-kirana", "approved"],
    { placement: "AdPlacementType", status: "AdCreativeStatus" });

  // AdBooking has no updatedAt column — insert directly.
  await client.query(
    `INSERT INTO "AdBooking" (id, "campaignId", placement, "pinCode", "startDate", "endDate", "quotePaise", status, "createdAt")
     VALUES ($1, $2, $3::"AdPlacementType", $4, $5, $6, $7, $8::"AdBookingStatus", now())
     ON CONFLICT (id) DO UPDATE SET status = $8::"AdBookingStatus", "startDate" = $5, "endDate" = $6`,
    ["bk_seed_paneer", "cmp_seed_paneer", "feed_post", "560001", monthStart, monthEnd, 500000, "approved"],
  );
  console.log("  ✓ AdBooking bk_seed_paneer");

  // ── Advertiser 2: pending everything (fills each review queue) ──
  await upsert("Advertiser", "adv_seed_freshco",
    ["name", "contactName", "contactEmail", "contactPhone", "status"],
    ["FreshCo Beverages", "Anita Desai", "anita@freshco.in", null, "pending"],
    { status: "AdvertiserStatus" });

  await upsert("AdCampaign", "cmp_seed_coolers",
    ["advertiserId", "name", "objective", "packageTier", "pricingModel", "budgetPaise", "spentPaise", "startDate", "endDate", "targeting", "status"],
    ["adv_seed_freshco", "Summer Coolers", "Awareness for chilled beverages", "growth", "cpc", 2000000, 0, monthStart, monthEnd, JSON.stringify({ pincodes: ["560001"] }), "pending_approval"],
    { packageTier: "AdPackageTier", pricingModel: "AdPricingModel", status: "AdCampaignStatus" });

  await upsert("AdCreative", "cr_seed_coolers",
    ["campaignId", "placement", "headline", "body", "ctaLabel", "ctaUrl", "status"],
    ["cmp_seed_coolers", "feed_post", "Beat the heat with FreshCo", "Chilled lemonade delivered in 20 min", "Try now", null, "pending_review"],
    { placement: "AdPlacementType", status: "AdCreativeStatus" });

  await client.query(
    `INSERT INTO "AdBooking" (id, "campaignId", placement, "pinCode", "startDate", "endDate", "quotePaise", status, "createdAt")
     VALUES ($1, $2, $3::"AdPlacementType", $4, $5, $6, $7, $8::"AdBookingStatus", now())
     ON CONFLICT (id) DO NOTHING`,
    ["bk_seed_coolers", "cmp_seed_coolers", "feed_post", "560001", monthStart, monthEnd, 2000000, "requested"],
  );
  console.log("  ✓ AdBooking bk_seed_coolers");

  console.log("\nDone. Visit /admin/ads to review the queues.");
} finally {
  await client.end();
}

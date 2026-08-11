/**
 * Seed demo feed posts for the new content types (pin 560001):
 * recommendation (with a merchant-linked reply), outage, help_request.
 *
 * Usage: DATABASE_URL in env → node scripts/seed-feed-posts.mjs
 * Idempotent: fixed ids.
 */
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const PIN = "560001";

async function upsertPost(id, authorId, type, body, meta, expiresAt) {
  await client.query(
    `INSERT INTO "Post" (id, "authorId", type, body, visibility, "pinCode", status, meta, "expiresAt", "createdAt", "updatedAt")
     VALUES ($1, $2, $3::"PostType", $4, 'neighborhood'::"PostVisibility", $5, 'active'::"ContentStatus", $6, $7, now(), now())
     ON CONFLICT (id) DO UPDATE SET body = $4, meta = $6, "expiresAt" = $7, "updatedAt" = now()`,
    [id, authorId, type, body, PIN, meta ? JSON.stringify(meta) : null, expiresAt],
  );
  console.log(`  ✓ Post ${id} (${type})`);
}

try {
  await upsertPost(
    "post_seed_rec1", "owner_seed_2", "recommendation",
    "Looking for a good family clinic for my parents — someone gentle with elderly patients. Any recommendations near Gate 2?",
    { recCategory: "Doctor" }, null,
  );

  // Merchant-linked reply on the recommendation ask
  await client.query(
    `INSERT INTO "Comment" (id, "postId", "authorId", body, status, "recommendedMerchantId", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, 'active'::"ContentStatus", $5, now(), now())
     ON CONFLICT (id) DO UPDATE SET body = $4, "updatedAt" = now()`,
    ["cmt_seed_rec1", "post_seed_rec1", "owner_seed_3",
     "Dr. Meera Nair at Sunrise Family Clinic is wonderful with seniors — my mother sees her every month.", "7"],
  );
  await client.query(
    `UPDATE "Post" SET "commentCount" = (SELECT count(*) FROM "Comment" WHERE "postId" = 'post_seed_rec1') WHERE id = 'post_seed_rec1'`,
  );
  console.log("  ✓ Comment cmt_seed_rec1 (links Sunrise Family Clinic)");

  await upsertPost(
    "post_seed_outage1", "owner_seed_4", "outage",
    "No water supply in Tower B since 7 AM. Tanker has been requested — expected by noon.",
    { outageKind: "water" }, null,
  );

  await upsertPost(
    "post_seed_help1", "owner_seed_5", "help_request",
    "Need a strip of paracetamol urgently for my daughter — can pay via UPI. Anyone nearby?",
    { urgency: "high" }, new Date(Date.now() + 2 * 60 * 60 * 1000),
  );

  console.log("Done.");
} finally {
  await client.end();
}

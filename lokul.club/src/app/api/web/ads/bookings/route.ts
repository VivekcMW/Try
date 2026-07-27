import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

const PLACEMENTS = ["feed_post", "search_slot", "story", "banner"];
const TIERS = ["micro_local", "growth", "brand", "national"];
// Pricing model follows the package (PRD rate card).
const TIER_PRICING: Record<string, "cpm" | "cpc" | "fixed"> = {
  micro_local: "cpm", growth: "cpc", brand: "fixed", national: "fixed",
};
const MIN_BUDGET_PAISE = 50000; // ₹500 — Micro Local weekly minimum

/**
 * POST /api/web/ads/bookings — self-serve ad booking request.
 *
 * Creates (in one transaction):
 *   Advertiser  (pending — reused by contactEmail if they've applied before)
 *   AdCampaign  (pending_approval)
 *   AdCreative  (pending_review)
 *   AdBooking   (requested)
 * Everything lands in the /admin/ads review queues — nothing serves until
 * an admin approves the booking, the creative AND the campaign.
 */
export async function POST(req: NextRequest) {
  let body: {
    business?: { name?: string; contactName?: string; email?: string; phone?: string };
    campaign?: { name?: string; packageTier?: string; budgetPaise?: number; startDate?: string; endDate?: string };
    creative?: { placement?: string; headline?: string; body?: string; ctaLabel?: string; ctaUrl?: string };
    booking?: { pinCode?: string };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const biz = body.business ?? {};
  const cmp = body.campaign ?? {};
  const cr  = body.creative ?? {};
  const bk  = body.booking ?? {};

  // ── Boundary validation ──
  if (!biz.name?.trim() || !biz.contactName?.trim()) {
    return NextResponse.json({ error: "Business name and contact name are required." }, { status: 400 });
  }
  if (!biz.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(biz.email)) {
    return NextResponse.json({ error: "A valid contact email is required." }, { status: 400 });
  }
  if (!cmp.name?.trim()) {
    return NextResponse.json({ error: "Campaign name is required." }, { status: 400 });
  }
  if (!TIERS.includes(cmp.packageTier ?? "")) {
    return NextResponse.json({ error: "Invalid package." }, { status: 400 });
  }
  const budgetPaise = Number(cmp.budgetPaise);
  if (!Number.isInteger(budgetPaise) || budgetPaise < MIN_BUDGET_PAISE) {
    return NextResponse.json({ error: "Minimum budget is ₹500." }, { status: 400 });
  }
  const startDate = new Date(cmp.startDate ?? "");
  const endDate   = new Date(cmp.endDate ?? "");
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) {
    return NextResponse.json({ error: "Valid start and end dates are required." }, { status: 400 });
  }
  if (!PLACEMENTS.includes(cr.placement ?? "")) {
    return NextResponse.json({ error: "Invalid placement." }, { status: 400 });
  }
  if (!cr.headline?.trim() || !cr.body?.trim()) {
    return NextResponse.json({ error: "Creative headline and body are required." }, { status: 400 });
  }
  const pinCode = bk.pinCode ?? "";
  if (!/^\d{6}$/.test(pinCode)) {
    return NextResponse.json({ error: "A 6-digit pincode is required." }, { status: 400 });
  }

  if (E2E) {
    return NextResponse.json({ ok: true, bookingId: "bk_e2e", campaignId: "cmp_e2e" }, { status: 201 });
  }

  try {
    const email = biz.email.trim().toLowerCase();

    const result = await prisma.$transaction(async (tx) => {
      // Repeat advertisers keep one account (and their approved status).
      let advertiser = await tx.advertiser.findFirst({ where: { contactEmail: email } });
      advertiser ??= await tx.advertiser.create({
        data: {
          name: biz.name!.trim(),
          contactName: biz.contactName!.trim(),
          contactEmail: email,
          contactPhone: biz.phone?.trim() || null,
          status: "pending",
        },
      });

      const campaign = await tx.adCampaign.create({
        data: {
          advertiserId: advertiser.id,
          name: cmp.name!.trim(),
          packageTier: cmp.packageTier as never,
          pricingModel: TIER_PRICING[cmp.packageTier!],
          budgetPaise,
          startDate,
          endDate,
          targeting: { pincodes: [pinCode] },
          status: "pending_approval",
        },
      });

      const creative = await tx.adCreative.create({
        data: {
          campaignId: campaign.id,
          placement: cr.placement as never,
          headline: cr.headline!.trim(),
          body: cr.body!.trim(),
          ctaLabel: cr.ctaLabel?.trim() || "Learn more",
          ctaUrl: cr.ctaUrl?.trim() || null,
          status: "pending_review",
        },
      });

      const booking = await tx.adBooking.create({
        data: {
          campaignId: campaign.id,
          placement: cr.placement as never,
          pinCode,
          startDate,
          endDate,
          quotePaise: budgetPaise,
          status: "requested",
        },
      });

      return { advertiserId: advertiser.id, campaignId: campaign.id, creativeId: creative.id, bookingId: booking.id };
    });

    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to submit booking request." }, { status: 500 });
  }
}

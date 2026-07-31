import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePincodesInRadius, DAYPARTS, type AdTargetingJson } from "@/lib/ad-targeting";
import { CommunityType, AgeBand } from "@/generated/prisma/enums";

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
const MAX_PINCODES = 25; // guard against a single booking fanning out unbounded rows
const MAX_RADIUS_KM = 50;
const COMMUNITY_TYPES = Object.values(CommunityType);
const AGE_BANDS = Object.values(AgeBand);

/**
 * POST /api/web/ads/bookings — self-serve ad booking request.
 *
 * Creates (in one transaction):
 *   Advertiser  (pending — reused by contactEmail if they've applied before)
 *   AdCampaign  (pending_approval)
 *   AdCreative  (pending_review)
 *   AdBooking × N (requested) — one row per resolved pincode (explicit list
 *     and/or a radius around a center pincode, resolved once here rather
 *     than as a live geo query on every ad-serve request)
 * Everything lands in the /admin/ads review queues — nothing serves until
 * an admin approves the booking, the creative AND the campaign.
 */
export async function POST(req: NextRequest) {
  let body: {
    business?: { name?: string; contactName?: string; email?: string; phone?: string };
    campaign?: { name?: string; packageTier?: string; budgetPaise?: number; startDate?: string; endDate?: string };
    creative?: {
      placement?: string; headline?: string; body?: string; ctaLabel?: string; ctaUrl?: string;
      mediaKey?: string; categories?: string[];
    };
    booking?: {
      pinCode?: string; pinCodes?: string[]; radiusKm?: number;
      daysOfWeek?: number[]; daypart?: string;
    };
    audience?: {
      interestCohorts?: string[]; societyIds?: string[]; newResidentsOnly?: boolean; ageBands?: string[];
    };
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
  const aud = body.audience ?? {};

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

  // ── Location targeting: explicit pincode list ∪ radius-around-a-center ──
  const explicitPincodes = (bk.pinCodes ?? (bk.pinCode ? [bk.pinCode] : [])).filter((p) => /^\d{6}$/.test(p));
  if (explicitPincodes.length === 0) {
    return NextResponse.json({ error: "At least one 6-digit pincode is required." }, { status: 400 });
  }
  let pincodes = new Set(explicitPincodes);
  if (bk.radiusKm) {
    const radiusKm = Number(bk.radiusKm);
    if (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > MAX_RADIUS_KM) {
      return NextResponse.json({ error: `Radius must be between 1 and ${MAX_RADIUS_KM} km.` }, { status: 400 });
    }
    // Radius is centered on the first explicit pincode (the "home base" the advertiser typed).
    const nearby = await resolvePincodesInRadius(explicitPincodes[0], radiusKm);
    pincodes = new Set([...pincodes, ...nearby]);
  }
  if (pincodes.size > MAX_PINCODES) {
    return NextResponse.json({ error: `A single booking can target at most ${MAX_PINCODES} pincodes — narrow the radius or pincode list.` }, { status: 400 });
  }

  // ── Dayparting ──
  const daysOfWeek = (bk.daysOfWeek ?? []).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
  if (bk.daypart && !DAYPARTS.includes(bk.daypart as never)) {
    return NextResponse.json({ error: "Invalid daypart." }, { status: 400 });
  }

  // ── Content categories (contextual — Phase 1) ──
  const categories = (cr.categories ?? []).map((c) => c.trim()).filter(Boolean);

  // ── Audience targeting (Phase 2/3 — only ever applied to consenting logged-in users) ──
  const interestCohorts = (aud.interestCohorts ?? []).filter((c) => COMMUNITY_TYPES.includes(c as never));
  const ageBands = (aud.ageBands ?? []).filter((a) => AGE_BANDS.includes(a as never));
  const societyIds = (aud.societyIds ?? []).filter((s) => typeof s === "string" && s.trim());
  const targeting: AdTargetingJson = {
    ...(interestCohorts.length ? { interestCohorts: interestCohorts as never } : {}),
    ...(societyIds.length ? { societyIds } : {}),
    ...(aud.newResidentsOnly ? { newResidentsOnly: true } : {}),
    ...(ageBands.length ? { ageBands: ageBands as never } : {}),
  };

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
          targeting: { pincodes: [...pincodes], categories, ...targeting },
          status: "pending_approval",
        },
      });

      const creative = await tx.adCreative.create({
        data: {
          campaignId: campaign.id,
          placement: cr.placement as never,
          headline: cr.headline!.trim(),
          body: cr.body!.trim(),
          mediaKey: cr.mediaKey?.trim() || null,
          categories,
          ctaLabel: cr.ctaLabel?.trim() || "Learn more",
          ctaUrl: cr.ctaUrl?.trim() || null,
          status: "pending_review",
        },
      });

      const bookings = await tx.adBooking.createManyAndReturn({
        data: [...pincodes].map((pinCode) => ({
          campaignId: campaign.id,
          placement: cr.placement as never,
          pinCode,
          startDate,
          endDate,
          daysOfWeek,
          daypart: bk.daypart ?? null,
          quotePaise: budgetPaise,
          status: "requested" as never,
        })),
      });

      return { advertiserId: advertiser.id, campaignId: campaign.id, creativeId: creative.id, bookingIds: bookings.map((b) => b.id) };
    });

    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to submit booking request." }, { status: 500 });
  }
}

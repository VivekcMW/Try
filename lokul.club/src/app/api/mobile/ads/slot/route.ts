import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { r2PublicUrl } from "@/lib/r2";
import {
  currentDaypart, hasAudienceTargeting, audienceMatches, resolveAudience,
  type AdTargetingJson,
} from "@/lib/ad-targeting";

export const dynamic = "force-dynamic";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

const PLACEMENTS = ["feed_post", "search_slot", "story", "banner"];
const CANDIDATE_LIMIT = 20; // small self-serve inventory — cheap to rank in-process

/**
 * GET /api/mobile/ads/slot?placement=feed_post&pin=560001&category=pets
 *
 * Returns one eligible creative for the placement × pincode × moment, or
 * { item: null }. Eligibility, in order:
 *   1. Contextual (always checked, no auth needed): creative approved,
 *      campaign live/budgeted, an approved booking covers placement × pin ×
 *      today's date/day-of-week/daypart, and the creative's content
 *      categories (if any) match the requested `category`.
 *   2. Audience (only for logged-in users with personalizedAds enabled):
 *      among contextually-eligible creatives, campaigns that set audience
 *      targeting (interest cohorts / society / new-resident / age band) only
 *      serve to users who match ALL of it — they never fall back to showing
 *      to non-matching or anonymous traffic. Untargeted creatives serve to
 *      everyone as before.
 *
 * Frequency capping (1-in-8 cards, hide-this-ad) is enforced client-side —
 * sacred zones return a null slot component before ever calling this endpoint.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const placement = sp.get("placement") ?? "feed_post";
  const pin = sp.get("pin") ?? "";
  const category = sp.get("category");

  if (!PLACEMENTS.includes(placement)) {
    return NextResponse.json({ error: "Invalid placement" }, { status: 400 });
  }
  if (!/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: "pin (6-digit pincode) required" }, { status: 400 });
  }

  if (E2E) {
    return NextResponse.json({
      item: {
        creativeId: "cr1", campaignId: "cmp1", placement,
        headline: "Fresh paneer stock just arrived", body: "₹280/kg · Delivery available till 9 PM",
        mediaUrl: null, ctaLabel: "Order Now", ctaUrl: "https://lokul.club/m/sharma-kirana",
        advertiserName: "Sharma Kirana", label: "Sponsored",
      },
    });
  }

  try {
    const now = new Date();
    const dow = now.getDay();
    const daypart = currentDaypart(now);

    // Lazily flip scheduled campaigns whose window has opened.
    await prisma.adCampaign.updateMany({
      where: { status: "scheduled", startDate: { lte: now }, endDate: { gte: now } },
      data: { status: "live" },
    });

    const candidates = await prisma.adCreative.findMany({
      where: {
        status: "approved",
        placement: placement as never,
        ...(category ? { OR: [{ categories: { isEmpty: true } }, { categories: { has: category } }] } : {}),
        campaign: {
          status: "live",
          startDate: { lte: now },
          endDate: { gte: now },
          advertiser: { status: "approved" },
          bookings: {
            some: {
              status: "approved",
              placement: placement as never,
              pinCode: pin,
              startDate: { lte: now },
              endDate: { gte: now },
              OR: [{ daysOfWeek: { isEmpty: true } }, { daysOfWeek: { has: dow } }],
              AND: [{ OR: [{ daypart: null }, { daypart }] }],
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: CANDIDATE_LIMIT,
      include: {
        campaign: {
          select: { id: true, budgetPaise: true, spentPaise: true, targeting: true, advertiser: { select: { name: true } } },
        },
      },
    });

    const eligible = candidates.filter((c) => c.campaign.spentPaise < c.campaign.budgetPaise);
    if (eligible.length === 0) return NextResponse.json({ item: null });

    const targeted: typeof eligible = [];
    const untargeted: typeof eligible = [];
    for (const c of eligible) {
      (hasAudienceTargeting(c.campaign.targeting as AdTargetingJson) ? targeted : untargeted).push(c);
    }

    let creative = untargeted[0] ?? null;
    if (targeted.length > 0) {
      const audience = await resolveAudience(req);
      if (audience) {
        const match = targeted.find((c) => audienceMatches(c.campaign.targeting as AdTargetingJson, audience));
        if (match) creative = match; // precision-targeted match wins over a generic fallback
      }
    }

    if (!creative) return NextResponse.json({ item: null });

    return NextResponse.json({
      item: {
        creativeId: creative.id,
        campaignId: creative.campaign.id,
        placement: creative.placement,
        headline: creative.headline,
        body: creative.body,
        mediaUrl: creative.mediaKey ? r2PublicUrl(creative.mediaKey) : null,
        ctaLabel: creative.ctaLabel,
        ctaUrl: creative.ctaUrl,
        advertiserName: creative.campaign.advertiser.name,
        label: "Sponsored", // mandatory on every render — PRD §3.2
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ item: null }); // ads must never break the feed
  }
}

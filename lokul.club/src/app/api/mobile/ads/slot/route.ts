import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

const PLACEMENTS = ["feed_post", "search_slot", "story", "banner"];

/**
 * GET /api/mobile/ads/slot?placement=feed_post&pin=560001
 *
 * Returns one eligible creative for the placement × pincode, or { item: null }.
 * Eligibility: creative approved AND campaign scheduled/live within its date
 * range with budget remaining AND an approved booking covering placement ×
 * pincode × today.
 *
 * Frequency capping (1-in-8 cards, hide-this-ad) is enforced client-side —
 * sacred zones return a null slot component before ever calling this endpoint.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const placement = sp.get("placement") ?? "feed_post";
  const pin = sp.get("pin") ?? "";

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

    // Lazily flip scheduled campaigns whose window has opened.
    await prisma.adCampaign.updateMany({
      where: { status: "scheduled", startDate: { lte: now }, endDate: { gte: now } },
      data: { status: "live" },
    });

    const creative = await prisma.adCreative.findFirst({
      where: {
        status: "approved",
        placement: placement as never,
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
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      include: { campaign: { select: { id: true, budgetPaise: true, spentPaise: true, advertiser: { select: { name: true } } } } },
    });

    if (!creative || creative.campaign.spentPaise >= creative.campaign.budgetPaise) {
      return NextResponse.json({ item: null });
    }

    return NextResponse.json({
      item: {
        creativeId: creative.id,
        campaignId: creative.campaign.id,
        placement: creative.placement,
        headline: creative.headline,
        body: creative.body,
        mediaUrl: creative.mediaKey,
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

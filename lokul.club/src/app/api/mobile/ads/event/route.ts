import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

// Rate card (PRD §Placement 01 pricing): Micro Local ₹40 CPM → 4p/impression;
// Growth ₹5 CPC → 500p/click; fixed packages accrue no per-event spend.
const CPM_PAISE_PER_IMPRESSION = 4;
const CPC_PAISE_PER_CLICK = 500;

const EVENTS = ["impression", "click", "hide"] as const;
type AdEvent = (typeof EVENTS)[number];

/** POST /api/mobile/ads/event — body: { creativeId, event: impression|click|hide } */
export async function POST(req: NextRequest) {
  let body: { creativeId?: string; event?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { creativeId, event } = body;
  if (!creativeId || !EVENTS.includes(event as AdEvent)) {
    return NextResponse.json({ error: "creativeId and event (impression|click|hide) required" }, { status: 400 });
  }

  if (E2E) return NextResponse.json({ ok: true });

  try {
    const creative = await prisma.adCreative.findUnique({
      where: { id: creativeId },
      select: { id: true, campaignId: true, campaign: { select: { pricingModel: true } } },
    });
    if (!creative) return NextResponse.json({ error: "Creative not found" }, { status: 404 });

    const { pricingModel } = creative.campaign;
    let spendPaise = 0;
    if (event === "impression" && pricingModel === "cpm") spendPaise = CPM_PAISE_PER_IMPRESSION;
    if (event === "click" && pricingModel === "cpc") spendPaise = CPC_PAISE_PER_CLICK;

    const day = new Date(); day.setUTCHours(0, 0, 0, 0);
    const inc = {
      impressions: event === "impression" ? 1 : 0,
      clicks: event === "click" ? 1 : 0,
      hides: event === "hide" ? 1 : 0,
    };

    await prisma.$transaction([
      prisma.adEventDaily.upsert({
        where: { creativeId_date: { creativeId, date: day } },
        create: { creativeId, date: day, ...inc, spendPaise },
        update: {
          impressions: { increment: inc.impressions },
          clicks: { increment: inc.clicks },
          hides: { increment: inc.hides },
          spendPaise: { increment: spendPaise },
        },
      }),
      ...(spendPaise > 0
        ? [prisma.adCampaign.update({ where: { id: creative.campaignId }, data: { spentPaise: { increment: spendPaise } } })]
        : []),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}

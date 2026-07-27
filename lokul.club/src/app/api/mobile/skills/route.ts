/**
 * GET  /api/mobile/skills — skill offers for a pinCode (optionally filter by ownerId for "my posts")
 * POST /api/mobile/skills — post a new skill offer
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MODES = ["teach", "learn", "exchange"];

export async function GET(req: NextRequest) {
  const pinCode = req.nextUrl.searchParams.get("pinCode");
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  const requesterId = req.nextUrl.searchParams.get("requesterId");

  if (!pinCode && !ownerId) {
    return NextResponse.json({ error: "pinCode or ownerId required" }, { status: 400 });
  }

  try {
    const offers = await prisma.skillOffer.findMany({
      where: {
        ...(pinCode ? { pinCode } : {}),
        ...(ownerId ? { ownerId } : {}),
        isActive: true,
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 100,
      include: { owner: { select: { id: true, name: true } } },
    });

    let connectedOfferIds = new Set<string>();
    if (requesterId) {
      const connections = await prisma.skillConnection.findMany({
        where: { requesterId, offerId: { in: offers.map((o) => o.id) } },
        select: { offerId: true },
      });
      connectedOfferIds = new Set(connections.map((c) => c.offerId));
    }

    return NextResponse.json({
      offers: offers.map((o) => ({ ...o, connected: connectedOfferIds.has(o.id) })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load skill offers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ownerId, skill, category, description, experience, mode, availability, pricePaise, pinCode } = await req.json();

    if (!ownerId || !skill || !category || !mode || !pinCode) {
      return NextResponse.json({ error: "ownerId, skill, category, mode, pinCode required" }, { status: 400 });
    }
    if (!MODES.includes(mode)) {
      return NextResponse.json({ error: "invalid mode" }, { status: 400 });
    }

    const offer = await prisma.skillOffer.create({
      data: {
        ownerId, skill, category,
        description: description ?? "No description provided.",
        experience: experience ?? "Not specified",
        mode, availability: availability ?? "Flexible",
        pricePaise: pricePaise ?? null,
        pinCode,
      },
      include: { owner: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ offer }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to post skill offer" }, { status: 400 });
  }
}

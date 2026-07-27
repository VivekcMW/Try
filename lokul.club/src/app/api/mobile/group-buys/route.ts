/**
 * GET  /api/mobile/group-buys   — list group buys for a pinCode
 * POST /api/mobile/group-buys   — create a group buy
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pinCode = searchParams.get("pinCode");
  const limit   = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));

  if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });

  try {
    const buys = await prisma.groupBuy.findMany({
      where: { pinCode, status: { in: ["open", "locked"] } },
      include: {
        organizer: { select: { id: true, name: true, avatarUrl: true } },
        _count:    { select: { commits: true } },
      },
      orderBy: { closesAt: "asc" },
      take: limit,
    });
    return NextResponse.json({
      items: buys.map((b) => ({
        ...b,
        pricePerUnit: b.pricePaise / 100,
        marketPrice: b.marketPricePaise != null ? b.marketPricePaise / 100 : undefined,
      })),
    });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { organizerId, title, description, pricePaise, marketPricePaise, unit,
            minQty, targetQty, facilitatorFeePaise, pinCode, imageUrl, closesAt } = await req.json();
    if (!organizerId || !title || !pricePaise || !minQty || !targetQty || !pinCode || !closesAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const gb = await prisma.groupBuy.create({
      data: {
        organizerId, title, description, pricePaise, marketPricePaise,
        unit: unit ?? "unit", minQty, targetQty,
        facilitatorFeePaise: facilitatorFeePaise ?? 0,
        pinCode, imageUrl, closesAt: new Date(closesAt),
      },
    });
    return NextResponse.json(gb, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

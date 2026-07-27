/**
 * GET /api/mobile/group-buys/[id]  — single group buy detail
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = req.nextUrl.searchParams.get("userId");

  try {
    const gb = await prisma.groupBuy.findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, name: true, avatarUrl: true, kycTier: true } },
        _count: { select: { commits: true } },
        commits: userId
          ? { where: { userId }, select: { id: true, quantity: true, status: true, totalPaise: true } }
          : false,
      },
    });

    if (!gb) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      ...gb,
      priceRs:       gb.pricePaise / 100,
      marketPriceRs: gb.marketPricePaise / 100,
      commitCount:   gb._count.commits,
      myCommit:      (gb.commits as { quantity: number }[])?.[0] ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load group buy" }, { status: 500 });
  }
}

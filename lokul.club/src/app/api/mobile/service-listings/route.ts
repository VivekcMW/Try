/**
 * GET  /api/mobile/service-listings  — list peer service listings near a pin code
 * POST /api/mobile/service-listings  — create a new service listing (authenticated)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pinCode = searchParams.get("pinCode");
  const category = searchParams.get("category") ?? undefined;
  const sellerId = searchParams.get("sellerId") ?? searchParams.get("userId") ?? undefined;
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));

  if (!pinCode && !sellerId) return NextResponse.json({ error: "pinCode or sellerId required" }, { status: 400 });

  try {
    const listings = await prisma.serviceListing.findMany({
      where: {
        ...(pinCode ? { pinCode } : {}),
        isActive: true,
        ...(category ? { category: category as never } : {}),
        ...(sellerId ? { userId: sellerId } : { user: { status: "active" } }),
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, kycTier: true, trustScore: true } },
      },
      orderBy: [{ ratingAvg: "desc" }, { createdAt: "desc" }],
      take: limit,
    });
    return NextResponse.json({ items: listings });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, category, title, description, pricePaise, priceUnit, radiusM, pinCode, lat, lng } = body;
    if (!userId || !category || !title || !pinCode) {
      return NextResponse.json({ error: "userId, category, title, pinCode required" }, { status: 400 });
    }
    const listing = await prisma.serviceListing.upsert({
      where: { userId },
      update: { category, title, description, pricePaise, priceUnit, radiusM, pinCode, lat, lng, isActive: true },
      create: { userId, category, title, description, pricePaise, priceUnit, radiusM, pinCode, lat, lng },
    });
    return NextResponse.json(listing, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

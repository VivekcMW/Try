/**
 * GET  /api/mobile/merchants  — list merchants by pinCode + category
 * POST /api/mobile/merchants  — onboard / update own merchant profile
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pinCode  = searchParams.get("pinCode");
  const category = searchParams.get("category") ?? undefined;
  const userId   = searchParams.get("userId");
  const limit    = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);

  if (!pinCode && !userId) {
    return NextResponse.json({ error: "pinCode or userId required" }, { status: 400 });
  }

  try {
    const where: Record<string, unknown> = {
      status: "active",
      isBlacklisted: false,
    };
    if (pinCode)  where.pinCode  = pinCode;
    if (category) where.category = category;
    if (userId)   where.ownerId  = userId;

    const merchants = await prisma.merchant.findMany({
      where,
      orderBy: [{ isEndorsed: "desc" }, { ratingAvg: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true, kycTier: true } },
      },
    });

    return NextResponse.json({ items: merchants });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name, category, description, pinCode, city, lat, lng } = body;

    if (!userId || !name?.trim() || !category || !pinCode || !city) {
      return NextResponse.json(
        { error: "userId, name, category, pinCode, city required" },
        { status: 400 }
      );
    }

    const merchant = await prisma.merchant.upsert({
      where: { ownerId: userId },
      update: { name: name.trim(), category, description, pinCode, city, lat, lng },
      create: {
        ownerId: userId,
        name:    name.trim(),
        category,
        description: description ?? null,
        pinCode,
        city,
        lat: lat ?? null,
        lng: lng ?? null,
      },
    });

    return NextResponse.json(merchant, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create merchant profile" }, { status: 500 });
  }
}

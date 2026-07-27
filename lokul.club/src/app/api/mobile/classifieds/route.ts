/**
 * GET  /api/mobile/classifieds  — list active classifieds by pinCode + category filter
 * POST /api/mobile/classifieds  — create a new classified listing
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pinCode  = searchParams.get("pinCode");
  const category = searchParams.get("category") ?? undefined;
  const userId   = searchParams.get("userId");
  const cursor   = searchParams.get("cursor") ?? undefined;
  const limit    = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);

  if (!pinCode && !userId) {
    return NextResponse.json({ error: "pinCode or userId required" }, { status: 400 });
  }

  const where: Record<string, unknown> = {
    status: "active",
    expiresAt: { gt: new Date() },
  };

  if (pinCode) where.pinCode = pinCode;
  if (userId) where.sellerId = userId;
  if (category) where.category = category;

  try {
    const items = await prisma.classified.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        seller: { select: { id: true, name: true, avatarUrl: true, kycTier: true } },
        photos: { orderBy: { orderIndex: "asc" }, take: 3, select: { storageKey: true } },
      },
    });

    const hasMore    = items.length > limit;
    const page       = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? page[page.length - 1].id : null;

    return NextResponse.json({
      items: page.map((c) => ({
        ...c,
        priceRs: c.pricePaise > 0 ? c.pricePaise / 100 : c.pricePaise === 0 ? 0 : -1,
        photos: c.photos.map((p) => p.storageKey),
      })),
      nextCursor,
      hasMore,
    });
  } catch {
    return NextResponse.json({ items: [], nextCursor: null, hasMore: false });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, title, description, category, pricePaise, condition, pinCode } = body;

    if (!userId || !title?.trim() || !category || !pinCode) {
      return NextResponse.json({ error: "userId, title, category, pinCode required" }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const classified = await prisma.classified.create({
      data: {
        sellerId:    userId,
        title:       title.trim(),
        description: description?.trim() ?? "",
        category,
        pricePaise:  pricePaise ?? 0,
        condition:   condition ?? "used",
        pinCode,
        expiresAt,
      },
      include: {
        seller: { select: { id: true, name: true, avatarUrl: true, kycTier: true } },
      },
    });

    return NextResponse.json(classified, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}

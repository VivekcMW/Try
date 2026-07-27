/**
 * GET /api/mobile/classifieds/[id]  — single classified detail
 * PATCH /api/mobile/classifieds/[id] — mark as reserved/sold
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const item = await prisma.classified.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, name: true, avatarUrl: true, kycTier: true, trustScore: true } },
        photos: { orderBy: { orderIndex: "asc" }, select: { storageKey: true } },
      },
    });

    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.classified.update({ where: { id }, data: { viewCount: { increment: 1 } } });

    return NextResponse.json({
      ...item,
      priceRs: item.pricePaise > 0 ? item.pricePaise / 100 : item.pricePaise === 0 ? 0 : -1,
      photos: item.photos.map((p) => p.storageKey),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load listing" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { status, userId } = await req.json();

    const item = await prisma.classified.findUnique({ where: { id }, select: { sellerId: true } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (item.sellerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updated = await prisma.classified.update({
      where: { id },
      data: { status, ...(status === "sold" ? { soldAt: new Date() } : {}) },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

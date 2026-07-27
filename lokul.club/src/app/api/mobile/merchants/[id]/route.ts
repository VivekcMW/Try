/**
 * GET /api/mobile/merchants/[id]  — single merchant storefront detail
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id, isBlacklisted: false },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true, kycTier: true, trustScore: true } },
      },
    });

    if (!merchant) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(merchant);
  } catch {
    return NextResponse.json({ error: "Failed to load merchant" }, { status: 500 });
  }
}

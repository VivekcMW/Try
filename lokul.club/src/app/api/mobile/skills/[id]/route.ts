/**
 * GET /api/mobile/skills/[id] — skill offer detail
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requesterId = req.nextUrl.searchParams.get("requesterId");

  try {
    const offer = await prisma.skillOffer.findUnique({
      where: { id },
      include: { owner: { select: { id: true, name: true } } },
    });

    if (!offer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let connected = false;
    if (requesterId) {
      const existing = await prisma.skillConnection.findUnique({
        where: { offerId_requesterId: { offerId: id, requesterId } },
      });
      connected = !!existing;
    }

    return NextResponse.json({ offer, connected });
  } catch {
    return NextResponse.json({ error: "Failed to load skill offer" }, { status: 500 });
  }
}

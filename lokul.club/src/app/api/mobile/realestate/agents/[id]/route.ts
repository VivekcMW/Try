/**
 * GET /api/mobile/realestate/agents/[id] — agent detail + their active listings
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const agent = await prisma.realEstateAgentProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true } } },
    });

    if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const listings = await prisma.propertyListing.findMany({
      where: { ownerId: agent.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ agent, listings });
  } catch {
    return NextResponse.json({ error: "Failed to load agent" }, { status: 500 });
  }
}

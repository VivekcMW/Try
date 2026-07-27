/**
 * GET /api/mobile/realestate/properties/[id] — property detail
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const property = await prisma.propertyListing.findUnique({
      where: { id },
      include: { owner: { select: { id: true, name: true, kycTier: true } } },
    });

    if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ property });
  } catch {
    return NextResponse.json({ error: "Failed to load property" }, { status: 500 });
  }
}

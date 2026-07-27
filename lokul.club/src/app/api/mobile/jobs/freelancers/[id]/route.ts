/**
 * GET /api/mobile/jobs/freelancers/[id] — freelancer profile detail
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const freelancer = await prisma.freelancerProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true } } },
    });

    if (!freelancer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ freelancer });
  } catch {
    return NextResponse.json({ error: "Failed to load freelancer" }, { status: 500 });
  }
}

/**
 * GET /api/mobile/kids/activities/[id] — activity detail
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const activity = await prisma.kidsActivity.findUnique({
      where: { id },
      include: { host: { select: { id: true, name: true } } },
    });
    if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ activity });
  } catch {
    return NextResponse.json({ error: "Failed to load activity" }, { status: 500 });
  }
}

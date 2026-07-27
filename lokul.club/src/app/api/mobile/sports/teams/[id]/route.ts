/**
 * GET /api/mobile/sports/teams/[id] — team detail
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const team = await prisma.sportsTeam.findUnique({
      where: { id },
      include: { league: { select: { id: true, name: true } } },
    });
    if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ team });
  } catch {
    return NextResponse.json({ error: "Failed to load team" }, { status: 500 });
  }
}

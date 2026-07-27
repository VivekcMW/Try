/**
 * GET /api/mobile/sports/leagues/[id] — league detail with registered teams
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const league = await prisma.sportsLeague.findUnique({
      where: { id },
      include: { teams: { orderBy: { createdAt: "desc" } } },
    });
    if (!league) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ league });
  } catch {
    return NextResponse.json({ error: "Failed to load league" }, { status: 500 });
  }
}

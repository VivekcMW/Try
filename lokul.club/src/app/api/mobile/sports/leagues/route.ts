/**
 * GET  /api/mobile/sports/leagues — leagues for a pinCode
 * POST /api/mobile/sports/leagues — organize a league
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const pinCode = req.nextUrl.searchParams.get("pinCode");
  if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });

  try {
    const leagues = await prisma.sportsLeague.findMany({
      where: { pinCode },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { _count: { select: { teams: true } } },
    });
    return NextResponse.json({ leagues });
  } catch {
    return NextResponse.json({ error: "Failed to load leagues" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      ownerId, name, sport, format, description, venue, entryFeePaise, prize,
      startDate, endDate, maxTeams, pinCode,
    } = await req.json();

    if (!ownerId || !name || !sport || !format || !venue || !startDate || !endDate || !maxTeams || !pinCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const league = await prisma.sportsLeague.create({
      data: {
        ownerId, name, sport, format,
        description: description || "",
        venue,
        entryFeePaise: entryFeePaise ?? 0,
        prize: prize || "Bragging rights",
        startDate, endDate, maxTeams, pinCode,
      },
    });

    return NextResponse.json({ league }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create league" }, { status: 400 });
  }
}

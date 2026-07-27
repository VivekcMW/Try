/**
 * GET  /api/mobile/sports/teams — teams for a pinCode (optional ?leagueId=)
 * POST /api/mobile/sports/teams — create a team (independent or registered to a league)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const pinCode = req.nextUrl.searchParams.get("pinCode");
  const leagueId = req.nextUrl.searchParams.get("leagueId");
  if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });

  try {
    const teams = await prisma.sportsTeam.findMany({
      where: { pinCode, ...(leagueId ? { leagueId } : {}) },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ teams });
  } catch {
    return NextResponse.json({ error: "Failed to load teams" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      ownerId, name, sport, leagueId, captain, captainFlat, maxMembers, lookingForPlayers, pinCode,
    } = await req.json();

    if (!ownerId || !name || !sport || !captain || !maxMembers || !pinCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (leagueId) {
      const league = await prisma.sportsLeague.findUnique({ where: { id: leagueId } });
      if (!league) return NextResponse.json({ error: "League not found" }, { status: 404 });
    }

    const team = await prisma.sportsTeam.create({
      data: {
        ownerId, name, sport,
        leagueId: leagueId || null,
        captain,
        captainFlat: captainFlat || "",
        maxMembers,
        lookingForPlayers: lookingForPlayers ?? true,
        pinCode,
      },
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create team" }, { status: 400 });
  }
}

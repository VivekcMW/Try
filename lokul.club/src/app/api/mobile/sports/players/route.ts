/**
 * GET  /api/mobile/sports/players?userId= — the caller's player profile
 * POST /api/mobile/sports/players — create or update the caller's player profile (upsert by userId)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  try {
    const profile = await prisma.sportsPlayerProfile.findUnique({ where: { userId } });
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, flat, sports, skill, lookingToJoin, available, bio, pinCode } = await req.json();

    if (!userId || !Array.isArray(sports) || sports.length === 0 || !pinCode) {
      return NextResponse.json({ error: "userId, sports, pinCode required" }, { status: 400 });
    }

    const profile = await prisma.sportsPlayerProfile.upsert({
      where: { userId },
      create: {
        userId,
        flat: flat || "",
        sports,
        skill: skill ?? "beginner",
        lookingToJoin: lookingToJoin ?? true,
        available: available ?? [],
        bio: bio || null,
        pinCode,
      },
      update: {
        flat: flat || "",
        sports,
        skill: skill ?? "beginner",
        lookingToJoin: lookingToJoin ?? true,
        available: available ?? [],
        bio: bio || null,
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save profile" }, { status: 400 });
  }
}

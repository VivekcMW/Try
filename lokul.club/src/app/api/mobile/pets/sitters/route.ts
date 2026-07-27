/**
 * GET  /api/mobile/pets/sitters — pet sitters for a pinCode
 * POST /api/mobile/pets/sitters — register as a pet sitter (one profile per user)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const pinCode = req.nextUrl.searchParams.get("pinCode");
  if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });

  try {
    const sitters = await prisma.petSitterProfile.findMany({
      where: { pinCode },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ sitters });
  } catch {
    return NextResponse.json({ error: "Failed to load sitters" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, petTypes, experience, bio, pricePerDayPaise, pinCode } = await req.json();

    if (!userId || !Array.isArray(petTypes) || petTypes.length === 0 || !pinCode) {
      return NextResponse.json({ error: "userId, petTypes, pinCode required" }, { status: 400 });
    }
    if (typeof pricePerDayPaise !== "number" || pricePerDayPaise < 0) {
      return NextResponse.json({ error: "invalid pricePerDayPaise" }, { status: 400 });
    }

    const sitter = await prisma.petSitterProfile.upsert({
      where: { userId },
      update: { petTypes, experience: experience ?? "New sitter", bio: bio ?? null, pricePerDayPaise, pinCode, available: true },
      create: {
        userId,
        petTypes,
        experience: experience ?? "New sitter",
        bio: bio ?? null,
        pricePerDayPaise,
        pinCode,
      },
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ sitter }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to register sitter" }, { status: 400 });
  }
}

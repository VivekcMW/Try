/**
 * GET /api/mobile/safety/journey/[id]
 * Fetches a single SafetyJourney by id (used by guardian.tsx to show
 * a shared journey to a watcher).
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const E2E =
  process.env.E2E_TEST === "1" ||
  (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (E2E) {
    return NextResponse.json({
      id,
      destination: "Home",
      status: "active",
      expectedArrival: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      lastCheckInAt: null,
      createdAt: new Date().toISOString(),
    });
  }

  try {
    const journey = await prisma.safetyJourney.findUnique({
      where: { id },
      select: {
        id: true,
        destination: true,
        status: true,
        expectedArrival: true,
        lastCheckInAt: true,
        checkInIntervalMin: true,
        watcherPhones: true,
        createdAt: true,
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    if (!journey) {
      return NextResponse.json({ error: "Journey not found" }, { status: 404 });
    }

    return NextResponse.json(journey);
  } catch {
    return NextResponse.json({ error: "Failed to fetch journey" }, { status: 500 });
  }
}

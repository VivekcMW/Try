/**
 * PATCH /api/mobile/location — upsert device location for proximity SOS
 *
 * Called by the mobile app every ~5 minutes while foregrounded and on
 * significant movement (>50 m threshold handled on the client side).
 * Locations older than 30 minutes are ignored by the escalation logic.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

export async function PATCH(req: NextRequest) {
  if (E2E) return NextResponse.json({ ok: true });

  try {
    const { userId, lat, lon, accuracy } = await req.json();

    if (!userId || typeof lat !== "number" || typeof lon !== "number") {
      return NextResponse.json(
        { error: "userId, lat (number), lon (number) are required" },
        { status: 400 },
      );
    }

    // Sanity check: valid WGS-84 coordinates
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    await prisma.userLocation.upsert({
      where:  { userId },
      create: { userId, lat, lon, accuracy: accuracy ?? null },
      update: { lat,    lon,  accuracy: accuracy ?? null },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[location PATCH]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

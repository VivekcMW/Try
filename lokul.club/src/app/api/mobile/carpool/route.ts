/**
 * GET  /api/mobile/carpool   — list carpool trips by pinCode (optionally filtered by proximity)
 * POST /api/mobile/carpool   — create a new trip
 *
 * GET params:
 *   pinCode (required)
 *   lat, lng, radiusKm (optional) — if provided, filter trips whose fromLat/fromLng
 *     are within radiusKm km using Haversine formula
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isFeatureEnabled } from "@/lib/feature-flags-server";

/** Haversine distance in km between two lat/lng pairs */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pinCode  = searchParams.get("pinCode");
  const limit    = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));
  const lat      = searchParams.get("lat")      ? parseFloat(searchParams.get("lat")!)      : null;
  const lng      = searchParams.get("lng")      ? parseFloat(searchParams.get("lng")!)      : null;
  const radiusKm = searchParams.get("radiusKm") ? parseFloat(searchParams.get("radiusKm")!) : 10;

  if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });

  try {
    const trips = await prisma.carpoolTrip.findMany({
      where: {
        pinCode,
        status: "open",
        departureAt: { gte: new Date() },
      },
      include: {
        driver: { select: { id: true, name: true, avatarUrl: true, kycTier: true } },
        _count:  { select: { joins: true } },
      },
      orderBy: { departureAt: "asc" },
      take: limit * 3, // over-fetch so we can filter by proximity
    });

    let filtered = trips;

    // Apply proximity filter if caller provided coordinates
    if (lat !== null && lng !== null) {
      filtered = trips.filter((t) => {
        if (t.fromLat === null || t.fromLng === null) return true; // include trips without coords
        return haversineKm(lat, lng, t.fromLat, t.fromLng) <= radiusKm;
      });
    }

    return NextResponse.json({ items: filtered.slice(0, limit) });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { driverId, fromLabel, toLabel, fromLat, fromLng, toLat, toLng,
            departureAt, seatsTotal, pricePaise, pinCode, notes } = await req.json();
    if (!(await isFeatureEnabled("carpool", { pinCode, userId: driverId }))) {
      return NextResponse.json({ error: "Carpooling is currently unavailable" }, { status: 403 });
    }

    if (!driverId || !fromLabel || !toLabel || !departureAt || !seatsTotal || !pinCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const trip = await prisma.carpoolTrip.create({
      data: {
        driverId, fromLabel, toLabel, fromLat, fromLng, toLat, toLng,
        departureAt: new Date(departureAt),
        seatsTotal, seatsLeft: seatsTotal,
        pricePaise: pricePaise ?? 0,
        pinCode, notes,
      },
    });
    return NextResponse.json(trip, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

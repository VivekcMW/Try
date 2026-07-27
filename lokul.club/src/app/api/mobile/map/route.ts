/**
 * GET  /api/mobile/map  — aggregated nearby data for the map screen
 * Query: pinCode (required)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const pinCode = req.nextUrl.searchParams.get("pinCode");

  if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });

  try {
    const [posts, carpoolTrips, groupBuys, merchants] = await Promise.all([
      prisma.post.findMany({
        where: { pinCode, status: "active", deletedAt: null, type: { in: ["safety", "sos", "event", "lost"] } },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, type: true, body: true, lat: true, lng: true, createdAt: true,
          author: { select: { id: true, name: true, avatarUrl: true } } },
      }),
      prisma.carpoolTrip.findMany({
        where: { pinCode, status: "open", departureAt: { gte: new Date() } },
        take: 20,
        select: { id: true, fromLabel: true, toLabel: true, fromLat: true, fromLng: true,
          departureAt: true, seatsLeft: true, pricePaise: true,
          driver: { select: { id: true, name: true } } },
      }),
      prisma.groupBuy.findMany({
        where: { pinCode, status: { in: ["open", "locked"] } },
        take: 20,
        select: { id: true, title: true, pricePaise: true, marketPricePaise: true,
          closesAt: true, currentQty: true, targetQty: true },
      }),
      prisma.merchant.findMany({
        where: { pinCode, status: "active", isBlacklisted: false, lat: { not: null } },
        take: 30,
        select: { id: true, name: true, category: true, lat: true, lng: true, ratingAvg: true },
      }),
    ]);

    return NextResponse.json({ posts, carpoolTrips, groupBuys, merchants });
  } catch {
    return NextResponse.json({ posts: [], carpoolTrips: [], groupBuys: [], merchants: [] });
  }
}

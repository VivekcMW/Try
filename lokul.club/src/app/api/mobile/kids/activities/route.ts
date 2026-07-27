/**
 * GET  /api/mobile/kids/activities — activities for a pinCode (optional ?category=)
 * POST /api/mobile/kids/activities — host a new activity
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PRICE_TYPES = ["session", "month"];

export async function GET(req: NextRequest) {
  const pinCode = req.nextUrl.searchParams.get("pinCode");
  const category = req.nextUrl.searchParams.get("category");
  if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });

  try {
    const activities = await prisma.kidsActivity.findMany({
      where: { pinCode, ...(category ? { category } : {}) },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { host: { select: { id: true, name: true } } },
    });
    return NextResponse.json({ activities });
  } catch {
    return NextResponse.json({ error: "Failed to load activities" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      hostId, name, category, ageGroup, schedule, duration, location, description,
      totalSpots, pricePaise, priceType, pinCode,
    } = await req.json();

    if (!hostId || !name || !category || !ageGroup || !schedule || !totalSpots || pricePaise == null || !pinCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (priceType && !PRICE_TYPES.includes(priceType)) {
      return NextResponse.json({ error: "invalid priceType" }, { status: 400 });
    }

    const activity = await prisma.kidsActivity.create({
      data: {
        hostId, name, category, ageGroup, schedule,
        duration: duration || "Not specified",
        location: location || null,
        description: description || null,
        totalSpots,
        spotsLeft: totalSpots,
        pricePaise,
        priceType: priceType ?? "session",
        pinCode,
      },
      include: { host: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create activity" }, { status: 400 });
  }
}

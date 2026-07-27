/**
 * GET  /api/mobile/parking/visitor-requests?pinCode= — visitor parking requests for a society
 * POST /api/mobile/parking/visitor-requests — book visitor parking (auto-assigns a visitor slot)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const pinCode = req.nextUrl.searchParams.get("pinCode");
  if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });

  try {
    const requests = await prisma.parkingVisitorRequest.findMany({
      where: { pinCode },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ error: "Failed to load requests" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      requesterId, visitorName, vehicleNumber, vehicleType, purpose, requestedTime, duration, notes, pinCode,
    } = await req.json();

    if (!requesterId || !visitorName || !vehicleNumber || !requestedTime || !pinCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingCount = await prisma.parkingVisitorRequest.count({ where: { pinCode } });
    const requestedSlot = `V-${existingCount + 1}`;

    const request = await prisma.parkingVisitorRequest.create({
      data: {
        requesterId, visitorName, vehicleNumber,
        vehicleType: vehicleType || "Car",
        purpose: purpose || "Other",
        requestedSlot,
        requestedTime,
        duration: duration || "2 Hours",
        notes: notes || null,
        pinCode,
      },
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to book visitor parking" }, { status: 400 });
  }
}

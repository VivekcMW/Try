/**
 * GET  /api/mobile/parking/vehicles?ownerId= — a resident's parked vehicles
 * POST /api/mobile/parking/vehicles — register a vehicle to a slot
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TYPES = ["car", "bike"];

export async function GET(req: NextRequest) {
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  if (!ownerId) return NextResponse.json({ error: "ownerId required" }, { status: 400 });

  try {
    const vehicles = await prisma.parkingVehicle.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ vehicles });
  } catch {
    return NextResponse.json({ error: "Failed to load vehicles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ownerId, number, vehicleType, color, slotNumber, location, type, pinCode } = await req.json();

    if (!ownerId || !number || !slotNumber || !location || !type || !pinCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!TYPES.includes(type)) {
      return NextResponse.json({ error: "invalid type" }, { status: 400 });
    }

    const vehicle = await prisma.parkingVehicle.create({
      data: {
        ownerId,
        number,
        vehicleType: vehicleType || (type === "car" ? "Sedan" : "Scooter"),
        color: color || "Unspecified",
        slotNumber,
        location,
        type,
        pinCode,
      },
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add vehicle" }, { status: 400 });
  }
}

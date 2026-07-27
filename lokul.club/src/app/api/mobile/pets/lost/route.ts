/**
 * GET  /api/mobile/pets/lost — active + recently-found lost-pet reports for a pinCode
 * POST /api/mobile/pets/lost — report a lost pet
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const pinCode = req.nextUrl.searchParams.get("pinCode");
  if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });

  try {
    const reports = await prisma.lostPetReport.findMany({
      where: { pinCode },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { reporter: { select: { id: true, name: true, phone: true } } },
    });

    return NextResponse.json({ reports });
  } catch {
    return NextResponse.json({ error: "Failed to load lost pet reports" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { reporterId, name, type, breed, description, location, pinCode } = await req.json();

    if (!reporterId || !name || !location || !pinCode) {
      return NextResponse.json({ error: "reporterId, name, location, pinCode required" }, { status: 400 });
    }

    const report = await prisma.lostPetReport.create({
      data: {
        reporterId,
        name,
        type: type ?? "Pet",
        breed: breed ?? "Not specified",
        description: description ?? "No description provided.",
        location,
        pinCode,
      },
      include: { reporter: { select: { id: true, name: true, phone: true } } },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to report lost pet" }, { status: 400 });
  }
}

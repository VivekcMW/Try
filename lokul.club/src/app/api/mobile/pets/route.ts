/**
 * GET  /api/mobile/pets — community pet directory for a pinCode (optionally filter by ownerId for "my pets")
 * POST /api/mobile/pets — register a pet
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PET_TYPES = ["dog", "cat", "bird", "fish", "other"];

export async function GET(req: NextRequest) {
  const pinCode = req.nextUrl.searchParams.get("pinCode");
  const ownerId = req.nextUrl.searchParams.get("ownerId");

  if (!pinCode && !ownerId) {
    return NextResponse.json({ error: "pinCode or ownerId required" }, { status: 400 });
  }

  try {
    const pets = await prisma.pet.findMany({
      where: {
        ...(pinCode ? { pinCode } : {}),
        ...(ownerId ? { ownerId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { owner: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ pets });
  } catch {
    return NextResponse.json({ error: "Failed to load pets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ownerId, name, type, breed, age, vaccinated, notes, pinCode } = await req.json();

    if (!ownerId || !name || !type || !pinCode) {
      return NextResponse.json({ error: "ownerId, name, type, pinCode required" }, { status: 400 });
    }
    if (!PET_TYPES.includes(type)) {
      return NextResponse.json({ error: "invalid type" }, { status: 400 });
    }

    const pet = await prisma.pet.create({
      data: {
        ownerId,
        name,
        type,
        breed: breed ?? "Mixed breed",
        age: age ?? "Not specified",
        vaccinated: !!vaccinated,
        notes: notes ?? null,
        pinCode,
      },
      include: { owner: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ pet }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add pet" }, { status: 400 });
  }
}

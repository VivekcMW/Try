/**
 * POST /api/mobile/pets/playdates — schedule a pet playdate
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { requesterId, petId, location, note, pinCode } = await req.json();

    if (!requesterId || !petId || !location || !pinCode) {
      return NextResponse.json({ error: "requesterId, petId, location, pinCode required" }, { status: 400 });
    }

    const request = await prisma.playdateRequest.create({
      data: { requesterId, petId, location, note: note ?? null, pinCode },
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to schedule playdate" }, { status: 400 });
  }
}

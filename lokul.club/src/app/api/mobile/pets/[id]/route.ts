/**
 * GET /api/mobile/pets/[id] — pet detail
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const pet = await prisma.pet.findUnique({
      where: { id },
      include: { owner: { select: { id: true, name: true } } },
    });

    if (!pet) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ pet });
  } catch {
    return NextResponse.json({ error: "Failed to load pet" }, { status: 500 });
  }
}

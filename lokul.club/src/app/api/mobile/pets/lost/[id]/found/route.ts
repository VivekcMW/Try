/**
 * POST /api/mobile/pets/lost/[id]/found — mark a lost-pet report as found
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const report = await prisma.lostPetReport.update({
      where: { id },
      data: { found: true },
    });

    return NextResponse.json({ report });
  } catch {
    return NextResponse.json({ error: "Failed to update report" }, { status: 404 });
  }
}

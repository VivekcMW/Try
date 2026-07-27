/**
 * POST /api/mobile/skills/[id]/connect — request a connection with a skill offer owner
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { requesterId } = await req.json();
    if (!requesterId) return NextResponse.json({ error: "requesterId required" }, { status: 400 });

    const existing = await prisma.skillConnection.findUnique({
      where: { offerId_requesterId: { offerId: id, requesterId } },
    });
    if (existing) {
      return NextResponse.json({ connection: existing, alreadyConnected: true });
    }

    const [connection] = await prisma.$transaction([
      prisma.skillConnection.create({ data: { offerId: id, requesterId } }),
      prisma.skillOffer.update({ where: { id }, data: { responseCount: { increment: 1 } } }),
    ]);

    return NextResponse.json({ connection, alreadyConnected: false }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to connect" }, { status: 400 });
  }
}

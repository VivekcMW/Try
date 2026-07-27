/**
 * GET  /api/mobile/realestate/agents — real estate agents for a pinCode
 * POST /api/mobile/realestate/agents — register as an agent (one profile per user)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const pinCode = req.nextUrl.searchParams.get("pinCode");
  if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });

  try {
    const agents = await prisma.realEstateAgentProfile.findMany({
      where: { pinCode },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: {
          select: {
            id: true, name: true,
            _count: { select: { propertyListings: true } },
          },
        },
      },
    });

    return NextResponse.json({ agents });
  } catch {
    return NextResponse.json({ error: "Failed to load agents" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, specialization, experience, pinCode } = await req.json();

    if (!userId || !Array.isArray(specialization) || specialization.length === 0 || !pinCode) {
      return NextResponse.json({ error: "userId, specialization, pinCode required" }, { status: 400 });
    }

    const agent = await prisma.realEstateAgentProfile.upsert({
      where: { userId },
      update: { specialization, experience: experience ?? "New agent", pinCode },
      create: { userId, specialization, experience: experience ?? "New agent", pinCode },
      include: {
        user: {
          select: { id: true, name: true, _count: { select: { propertyListings: true } } },
        },
      },
    });

    return NextResponse.json({ agent }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to register agent" }, { status: 400 });
  }
}

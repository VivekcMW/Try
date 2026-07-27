/**
 * GET  /api/mobile/communities  — list communities by pinCode
 * POST /api/mobile/communities  — create a new community
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pinCode = searchParams.get("pinCode");
  const userId  = searchParams.get("userId") ?? undefined;
  const limit   = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));

  if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });

  try {
    const communities = await prisma.community.findMany({
      where: { pinCode, isActive: true },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        members: userId
          ? { where: { userId }, select: { role: true, status: true } }
          : false,
        _count: { select: { members: true } },
      },
      orderBy: { memberCount: "desc" },
      take: limit,
    });
    return NextResponse.json({ items: communities });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { creatorId, name, description, type, joinPolicy, radiusM, pinCode, coverUrl } = await req.json();
    if (!creatorId || !name || !pinCode) {
      return NextResponse.json({ error: "creatorId, name, pinCode required" }, { status: 400 });
    }
    const community = await prisma.$transaction(async (tx) => {
      const c = await tx.community.create({
        data: { creatorId, name, description, type, joinPolicy, radiusM, pinCode, coverUrl },
      });
      // Auto-add creator as admin member
      await tx.communityMember.create({
        data: { communityId: c.id, userId: creatorId, role: "admin", status: "active" },
      });
      await tx.community.update({ where: { id: c.id }, data: { memberCount: 1 } });
      return c;
    });
    return NextResponse.json(community, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * POST /api/mobile/communities/[id]/join   — join or request to join a community
 * DELETE /api/mobile/communities/[id]/join — leave a community
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: communityId } = await params;
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const community = await prisma.community.findUnique({ where: { id: communityId } });
    if (!community) return NextResponse.json({ error: "Community not found" }, { status: 404 });

    const status = community.joinPolicy === "open" ? "active" : "pending";
    const membership = await prisma.communityMember.upsert({
      where: { communityId_userId: { communityId, userId } },
      update: { status },
      create: { communityId, userId, role: "member", status },
    });

    if (status === "active") {
      await prisma.community.update({
        where: { id: communityId },
        data: { memberCount: { increment: 1 } },
      });
    }
    return NextResponse.json({ membership, status }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: communityId } = await params;
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const existing = await prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId, userId } },
    });
    if (!existing) return NextResponse.json({ error: "Not a member" }, { status: 404 });

    await prisma.communityMember.delete({
      where: { communityId_userId: { communityId, userId } },
    });
    if (existing.status === "active") {
      await prisma.community.update({
        where: { id: communityId },
        data: { memberCount: { decrement: 1 } },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

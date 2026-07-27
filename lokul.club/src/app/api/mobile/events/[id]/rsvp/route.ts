/**
 * POST   /api/mobile/events/[id]/rsvp   — create or update an RSVP
 * GET    /api/mobile/events/[id]/rsvp   — get RSVP count + viewer's own status
 * DELETE /api/mobile/events/[id]/rsvp   — remove RSVP
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params;
  try {
    const [yes, maybe, no] = await Promise.all([
      prisma.eventRsvp.count({ where: { postId, status: "yes" } }),
      prisma.eventRsvp.count({ where: { postId, status: "maybe" } }),
      prisma.eventRsvp.count({ where: { postId, status: "no" } }),
    ]);
    const attendees = await prisma.eventRsvp.findMany({
      where: { postId, status: "yes" },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      take: 20,
    });
    return NextResponse.json({ counts: { yes, maybe, no }, attendees });
  } catch {
    return NextResponse.json({ counts: { yes: 0, maybe: 0, no: 0 }, attendees: [] });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params;
  try {
    const { userId, status } = await req.json();
    if (!userId || !status) {
      return NextResponse.json({ error: "userId and status required" }, { status: 400 });
    }
    const rsvp = await prisma.eventRsvp.upsert({
      where: { postId_userId: { postId, userId } },
      update: { status },
      create: { postId, userId, status },
    });
    return NextResponse.json(rsvp, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: postId } = await params;
  try {
    const { userId } = await req.json();
    await prisma.eventRsvp.deleteMany({ where: { postId, userId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

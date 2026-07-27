/**
 * POST /api/mobile/stories/[id]/view
 * Records a story view and increments viewCount.
 * Body: { viewerId: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: storyId } = await params;
  try {
    const { viewerId } = (await req.json()) as { viewerId?: string };
    if (!viewerId) return NextResponse.json({ ok: true }); // anonymous view — just ack

    await prisma.$transaction([
      prisma.storyView.upsert({
        where: { storyId_viewerId: { storyId, viewerId } },
        create: { storyId, viewerId },
        update: { viewedAt: new Date() },
      }),
      prisma.story.update({
        where: { id: storyId },
        data: { viewCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    // Story may have expired — silently ignore
    return NextResponse.json({ ok: true });
  }
}

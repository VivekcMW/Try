/**
 * POST /api/mobile/stories/[id]/react
 * Records an emoji reaction to a story (fire-and-forget; no DB schema needed
 * as Story has no reactions table — we use a Post reaction-style approach and
 * store on the story author's notification feed in future. For now: 200 ack).
 * Body: { userId: string; reaction: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: storyId } = await params;
  try {
    const { userId, reaction } = (await req.json()) as {
      userId?: string;
      reaction?: string;
    };
    if (!userId || !reaction) return NextResponse.json({ ok: true });

    // Verify story exists (don't fail hard if expired)
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { authorId: true },
    });
    if (!story) return NextResponse.json({ ok: true });

    // Future: create a notification for story.authorId
    // For now just acknowledge so the mobile optimistic UI works
    return NextResponse.json({ ok: true, storyId, reaction });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

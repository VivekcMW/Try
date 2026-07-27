/**
 * POST /api/mobile/stories/[id]/reply
 * Sends a reply to a story by opening / reusing a DM thread between
 * the replier and the story author, then posting the message.
 * Body: { senderId: string; message: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: storyId } = await params;
  try {
    const { senderId, message } = (await req.json()) as {
      senderId?: string;
      message?: string;
    };
    if (!senderId || !message?.trim()) {
      return NextResponse.json({ error: "senderId and message required" }, { status: 400 });
    }

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { authorId: true },
    });
    if (!story) return NextResponse.json({ error: "Story not found" }, { status: 404 });

    const authorId = story.authorId;
    if (authorId === senderId) return NextResponse.json({ ok: true }); // no self-reply needed

    // Find or create a DM thread between sender and author
    const existingThread = await prisma.chatThread.findFirst({
      where: {
        memberships: { every: { userId: { in: [senderId, authorId] } } },
      },
      select: { id: true },
    });

    let threadId: string;
    if (existingThread) {
      threadId = existingThread.id;
    } else {
      const newThread = await prisma.chatThread.create({
        data: {
          type: "dm",
          createdById: senderId,
          memberships: {
            create: [{ userId: senderId }, { userId: authorId }],
          },
        },
      });
      threadId = newThread.id;
    }

    await prisma.chatMessage.create({
      data: {
        threadId,
        senderId,
        body: message.trim(),
        kind: "text",
      },
    });

    return NextResponse.json({ ok: true, threadId });
  } catch {
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}

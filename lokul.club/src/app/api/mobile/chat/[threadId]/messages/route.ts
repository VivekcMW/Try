/**
 * GET   /api/mobile/chat/[threadId]/messages  — paginated message history
 * POST  /api/mobile/chat/[threadId]/messages  — send a message (also publishes to Ably)
 * PATCH /api/mobile/chat/[threadId]/messages  — mark thread as read for a user
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishChatMessage } from "@/lib/ably";
import { moderateText } from "@/lib/moderation";
import { sendPush } from "@/lib/push";

export async function GET(req: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const { searchParams } = req.nextUrl;
  const before = searchParams.get("before") ?? undefined;
  const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "30", 10));

  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        threadId,
        deletedAt: null,
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true, kycTier: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json({ items: messages.reverse() });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  try {
    const { senderId, body, kind, mediaKey } = await req.json();
    if (!senderId || !body) {
      return NextResponse.json({ error: "senderId and body required" }, { status: 400 });
    }

    // Moderation check
    const modResult = await moderateText(body);
    if (!modResult.ok) {
      return NextResponse.json({ error: modResult.reason ?? "Message not allowed." }, { status: 422 });
    }

    const [msg] = await prisma.$transaction([
      prisma.chatMessage.create({
        data: { threadId, senderId, body, kind: kind ?? "text", mediaKey },
        include: { sender: { select: { id: true, name: true, avatarUrl: true, kycTier: true } } },
      }),
      prisma.chatThread.update({
        where: { id: threadId },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    // Publish to Ably channel for real-time delivery (best-effort, non-blocking)
    publishChatMessage(threadId, {
      id:        msg.id,
      threadId,
      senderId:  msg.senderId,
      body:      msg.body,
      kind:      msg.kind,
      sender:    (msg as { sender?: unknown }).sender,
      createdAt: msg.createdAt,
    });

    // Push notification to offline members (excluding sender)
    prisma.chatMembership.findMany({
      where:  { threadId, leftAt: null, userId: { not: senderId } },
      select: { userId: true },
    }).then((members) => {
      const memberIds = members.map((m) => m.userId);
      return Promise.all(
        memberIds.map((uid) =>
          sendPush(
            { userId: uid },
            {
              title:    (msg as { sender?: { name?: string } }).sender?.name ?? "New message",
              body:     body.slice(0, 100),
              data:     { type: "chat", threadId },
              priority: "normal",
            }
          )
        )
      );
    }).catch(() => {});

    return NextResponse.json(msg, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/** PATCH — mark thread as read. Body: { userId: string } */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
    await prisma.chatMembership.updateMany({
      where: { threadId, userId },
      data:  { lastReadAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * GET  /api/mobile/chat/threads  — list chat threads for a user
 * POST /api/mobile/chat/threads  — create a DM thread
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  try {
    const memberships = await prisma.chatMembership.findMany({
      where: { userId, leftAt: null },
      orderBy: { thread: { lastMessageAt: "desc" } },
      take: 50,
      include: {
        thread: {
          include: {
            memberships: {
              where: { leftAt: null },
              include: { user: { select: { id: true, name: true, avatarUrl: true, kycTier: true } } },
              take: 10,
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: { sender: { select: { id: true, name: true } } },
            },
            _count: { select: { messages: true } },
          },
        },
      },
    });

    const threads = memberships.map((m) => {
      const t = m.thread;
      const lastMsg = t.messages[0] ?? null;
      const unread = m.lastReadAt && lastMsg
        ? (lastMsg.createdAt > m.lastReadAt ? 1 : 0)
        : lastMsg ? 1 : 0;

      return {
        id:            t.id,
        type:          t.type,
        name:          t.name,
        avatarUrl:     t.avatarUrl,
        memberCount:   t.memberships.length,
        members:       t.memberships.map((mb) => mb.user),
        lastMessage:   lastMsg ? { body: lastMsg.body, senderName: lastMsg.sender.name, createdAt: lastMsg.createdAt } : null,
        lastMessageAt: t.lastMessageAt,
        unreadCount:   unread,
        messageCount:  t._count.messages,
      };
    });

    return NextResponse.json({ items: threads });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, recipientId, name, type } = body;

    if (!userId || (!recipientId && !name)) {
      return NextResponse.json({ error: "userId + recipientId (DM) or name (group) required" }, { status: 400 });
    }

    const threadType = type ?? "dm";

    // For DMs, check if a thread already exists between these two users
    if (threadType === "dm" && recipientId) {
      const existing = await prisma.chatThread.findFirst({
        where: {
          type: "dm",
          memberships: {
            every: { userId: { in: [userId, recipientId] } },
          },
        },
        include: { memberships: { include: { user: { select: { id: true, name: true } } } } },
      });
      if (existing) return NextResponse.json(existing, { status: 200 });
    }

    const thread = await prisma.chatThread.create({
      data: {
        type:        threadType,
        name:        name ?? null,
        createdById: userId,
        memberships: {
          create: [
            { userId },
            ...(recipientId ? [{ userId: recipientId }] : []),
          ],
        },
      },
      include: {
        memberships: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      },
    });

    return NextResponse.json(thread, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create thread" }, { status: 500 });
  }
}

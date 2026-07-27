/**
 * GET  /api/mobile/notifications  — recent notification-worthy events for a user
 * POST /api/mobile/notifications/mark-read — mark a notification read (client state handles this)
 *
 * Note: There is no Notification table in the DB; this route synthesises
 * notifications from recent Posts (comments on user's posts) and GroupBuyCommits.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const since  = req.nextUrl.searchParams.get("since");

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const sinceDate = since ? new Date(since) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    // Comments on user's posts
    const comments = await prisma.comment.findMany({
      where: {
        post: { authorId: userId },
        authorId: { not: userId },
        status: "active",
        createdAt: { gte: sinceDate },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: { select: { id: true, name: true } },
        post:   { select: { id: true, body: true } },
      },
    });

    // Group buy status changes for user's commits
    const commits = await prisma.groupBuyCommit.findMany({
      where: { userId, createdAt: { gte: sinceDate } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { groupBuy: { select: { id: true, title: true, status: true } } },
    });

    // Safety posts in user's pinCode
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { localities: { where: { isPrimary: true } } } });
    const pinCode = user?.localities?.[0]?.pinCode;
    const safetyPosts = pinCode ? await prisma.post.findMany({
      where: { pinCode, type: { in: ["safety", "sos"] }, status: "active", createdAt: { gte: sinceDate } },
      orderBy: { createdAt: "desc" }, take: 10,
      select: { id: true, body: true, type: true, createdAt: true, author: { select: { name: true } } },
    }) : [];

    // SOS incidents the user has responded to (status updates)
    const sosResponses = await prisma.sosResponder.findMany({
      where: { userId },
      orderBy: { respondedAt: "desc" },
      take: 5,
      include: { incident: { select: { id: true, status: true, body: true, createdAt: true } } },
    });

    // Unread chat messages in threads where user is a member (sent by others)
    const chatMemberships = await prisma.chatMembership.findMany({
      where: { userId },
      select: { threadId: true },
    });
    const threadIds = chatMemberships.map((m) => m.threadId);
    const chatMessages = threadIds.length ? await prisma.chatMessage.findMany({
      where: {
        threadId: { in: threadIds },
        senderId: { not: userId },
        createdAt: { gte: sinceDate },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, body: true, threadId: true, createdAt: true, sender: { select: { name: true } } },
    }) : [];

    const notifications = [
      ...comments.map((c) => ({
        id:       `comment_${c.id}`,
        category: "community",
        emoji:    "💬",
        title:    `${c.author.name} commented on your post`,
        body:     c.body.slice(0, 80),
        ts:       c.createdAt.getTime(),
        cta:      { label: "View post", href: `/(feed)/post/${c.post.id}` },
      })),
      ...commits.map((c) => ({
        id:       `commit_${c.id}`,
        category: "groupbuy",
        emoji:    "🛒",
        title:    `Group buy update: ${c.groupBuy.title}`,
        body:     `Status: ${c.groupBuy.status}`,
        ts:       c.createdAt.getTime(),
        cta:      { label: "View", href: `/(groupbuy)/${c.groupBuy.id}` },
      })),
      ...safetyPosts.map((p) => ({
        id:       `safety_${p.id}`,
        category: "safety",
        emoji:    "🚨",
        title:    p.type === "sos" ? "SOS alert near you" : "Safety alert near you",
        body:     p.body.slice(0, 80),
        ts:       p.createdAt.getTime(),
        cta:      { label: "View", href: `/(feed)/post/${p.id}` },
      })),
      ...sosResponses.map((r) => ({
        id:       `sos_${r.incident.id}`,
        category: "safety",
        emoji:    "🆘",
        title:    `SOS incident ${r.incident.status === "resolved" ? "resolved" : "updated"}`,
        body:     r.incident.body.slice(0, 80),
        ts:       r.incident.createdAt.getTime(),
        cta:      { label: "View SOS", href: `/(safety)/sos/${r.incident.id}` },
      })),
      ...chatMessages.map((m) => ({
        id:       `chat_${m.id}`,
        category: "chat",
        emoji:    "💬",
        title:    `${m.sender.name} sent you a message`,
        body:     m.body.slice(0, 80),
        ts:       m.createdAt.getTime(),
        cta:      { label: "Reply", href: `/(chat)/${m.threadId}` },
      })),
    ].sort((a, b) => b.ts - a.ts);

    return NextResponse.json({ items: notifications });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

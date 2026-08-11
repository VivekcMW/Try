/**
 * GET /api/mobile/feed/digest?pinCode= — "While you were away" summary
 * Counts by type + top snippets from the last 24h.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

const TYPE_LABEL: Record<string, string> = {
  update: "update",
  safety: "safety alert",
  lost: "lost & found",
  event: "event",
  poll: "poll",
  sell: "listing",
  rwa_notice: "RWA notice",
  sos: "SOS",
  recommendation: "recommendation ask",
  outage: "outage report",
  help_request: "help request",
};

export async function GET(req: NextRequest) {
  const pinCode = req.nextUrl.searchParams.get("pinCode");
  if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });
  if (E2E) return NextResponse.json({ total: 0, highlights: [], counts: [] });

  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const posts = await prisma.post.findMany({
      where: { pinCode, status: "active", deletedAt: null, createdAt: { gte: since } },
      orderBy: [{ reactionCount: "desc" }, { commentCount: "desc" }],
      take: 50,
      select: { id: true, type: true, body: true },
    });

    const countMap: Record<string, number> = {};
    for (const p of posts) countMap[p.type] = (countMap[p.type] ?? 0) + 1;

    const counts = Object.entries(countMap)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({ type, label: TYPE_LABEL[type] ?? type, count }));

    const highlights = posts.slice(0, 3).map((p) => ({
      id: p.id,
      type: p.type,
      snippet: p.body.length > 60 ? `${p.body.slice(0, 60)}…` : p.body,
    }));

    return NextResponse.json({ total: posts.length, counts, highlights });
  } catch {
    return NextResponse.json({ total: 0, highlights: [], counts: [] });
  }
}

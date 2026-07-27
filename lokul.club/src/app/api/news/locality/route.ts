import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/news/locality?pinCode=400001&city=Mumbai&lang=en&limit=10
 *
 * Returns AI-summarised locality news for a given pin code, pre-cached by the
 * cron job at /api/cron/news-refresh.  Falls back to an empty array when no
 * data exists yet (first run, or DB unavailable).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const pinCode = searchParams.get("pinCode")?.trim();
  const city    = searchParams.get("city")?.trim();
  const lang    = searchParams.get("lang")?.trim() ?? "en";
  const limit   = Math.min(Number(searchParams.get("limit") ?? "20"), 50);

  if (!pinCode && !city) {
    return NextResponse.json(
      { error: "Provide at least one of: pinCode, city" },
      { status: 400 },
    );
  }

  try {
    const now = new Date();

    const items = await prisma.localityNews.findMany({
      where: {
        expiresAt: { gt: now },
        ...(pinCode ? { pinCode } : {}),
        ...(city    ? { city }    : {}),
      },
      orderBy: [
        { isAlert: "desc" },
        { publishedAt: "desc" },
      ],
      take: limit,
      select: {
        id: true,
        headline: true,
        summary: true,
        sourceUrl: true,
        sourceName: true,
        category: true,
        lang: true,
        isAlert: true,
        publishedAt: true,
        pinCode: true,
        city: true,
      },
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    console.error("[api/news/locality] DB error:", err);
    // Return empty gracefully — mobile falls back to cached data
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}

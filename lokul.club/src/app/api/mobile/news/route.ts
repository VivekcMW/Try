/**
 * GET /api/mobile/news  — locality news for a user's pincode / city
 *
 * Query params:
 *   pinCode  — filter by pincode (required if city not given)
 *   city     — filter by city   (required if pinCode not given)
 *   limit    — max results (default 20, max 50)
 *   lang     — language code (default "en")
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pinCode = searchParams.get("pinCode");
  const city    = searchParams.get("city");
  const lang    = searchParams.get("lang") ?? "en";
  const limit   = Math.min(50, Number.parseInt(searchParams.get("limit") ?? "20", 10));

  if (!pinCode && !city) {
    return NextResponse.json({ error: "pinCode or city required" }, { status: 400 });
  }

  const now = new Date();

  try {
    const items = await prisma.localityNews.findMany({
      where: {
        ...(pinCode ? { pinCode } : {}),
        ...(city    ? { city }    : {}),
        lang,
        expiresAt: { gt: now },
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
        category: true,
        sourceName: true,
        sourceUrl: true,
        isAlert: true,
        publishedAt: true,
        expiresAt: true,
      },
    });

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed to load news" }, { status: 500 });
  }
}

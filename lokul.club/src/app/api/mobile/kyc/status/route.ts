/**
 * GET /api/mobile/kyc/status  — poll KYC review status for a user
 * Query: userId
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  try {
    const docs = await prisma.kycDocument.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, type: true, status: true, reviewedAt: true, reviewNotes: true, createdAt: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { kycTier: true },
    });

    return NextResponse.json({
      kycTier: user?.kycTier ?? "bronze",
      documents: docs,
    });
  } catch {
    return NextResponse.json({ kycTier: "bronze", documents: [] });
  }
}

/**
 * GET  /api/mobile/referrals   — get referral stats for a user
 * POST /api/mobile/referrals   — record a new referral invite
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  try {
    const records = await prisma.referralRecord.findMany({
      where: { referrerId: userId },
      include: {
        referee: { select: { id: true, name: true, avatarUrl: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const totalCredits = records.reduce((a, r) => a + r.creditPaise, 0);
    return NextResponse.json({ records, totalCreditPaise: totalCredits });
  } catch {
    return NextResponse.json({ records: [], totalCreditPaise: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { referrerId, refereePhone } = await req.json();
    if (!referrerId || !refereePhone) {
      return NextResponse.json({ error: "referrerId, refereePhone required" }, { status: 400 });
    }
    // Idempotent — one invite per phone per referrer
    const existing = await prisma.referralRecord.findFirst({
      where: { referrerId, refereePhone },
    });
    if (existing) return NextResponse.json(existing);

    const record = await prisma.referralRecord.create({
      data: { referrerId, refereePhone },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

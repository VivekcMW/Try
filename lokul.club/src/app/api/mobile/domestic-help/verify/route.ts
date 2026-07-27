/**
 * POST /api/mobile/domestic-help/verify — pay for background verification of one or more helpers.
 * Debits the requesting user's wallet (₹199/helper) and marks each helper "pending" —
 * the actual background check is a manual/ops process, so we don't fake an instant "verified".
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VERIFICATION_FEE_PAISE = 19900;

export async function POST(req: NextRequest) {
  try {
    const { userId, helperIds } = await req.json();

    if (!userId || !Array.isArray(helperIds) || helperIds.length === 0) {
      return NextResponse.json({ error: "userId and helperIds required" }, { status: 400 });
    }

    const helpers = await prisma.domesticHelper.findMany({
      where: { id: { in: helperIds }, ownerId: userId },
    });
    if (helpers.length !== helperIds.length) {
      return NextResponse.json({ error: "Some helpers were not found" }, { status: 404 });
    }

    const totalPaise = helpers.length * VERIFICATION_FEE_PAISE;

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { walletBalancePaise: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.walletBalancePaise < totalPaise) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 422 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { walletBalancePaise: { decrement: totalPaise } },
      });

      await tx.walletEntry.create({
        data: {
          userId,
          type: "spend",
          amountPaise: -totalPaise,
          description: `Background verification × ${helpers.length}`,
          status: "completed",
        },
      });

      return tx.domesticHelper.updateManyAndReturn({
        where: { id: { in: helperIds } },
        data: { verificationStatus: "pending" },
      });
    });

    return NextResponse.json({ helpers: updated, totalPaise });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to start verification" }, { status: 500 });
  }
}

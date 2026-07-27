/**
 * POST /api/mobile/insurance/policies/[id]/renew — pay the premium and extend cover 12 months
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const policy = await prisma.insurancePolicy.findUnique({ where: { id } });
    if (!policy) return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    if (policy.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { walletBalancePaise: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.walletBalancePaise < policy.premiumPaise) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 422 });
    }

    const base = policy.nextDueAt.getTime() > Date.now() ? policy.nextDueAt : new Date();
    const nextDueAt = new Date(base);
    nextDueAt.setMonth(nextDueAt.getMonth() + 12);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { walletBalancePaise: { decrement: policy.premiumPaise } },
      });
      await tx.walletEntry.create({
        data: {
          userId,
          type: "spend",
          amountPaise: -policy.premiumPaise,
          description: `Insurance renewal: ${policy.planName}`,
          status: "completed",
        },
      });
      return tx.insurancePolicy.update({
        where: { id },
        data: { nextDueAt, status: "active" },
      });
    });

    return NextResponse.json({ policy: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to renew policy" }, { status: 400 });
  }
}

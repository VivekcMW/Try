/**
 * GET  /api/mobile/insurance/policies?ownerId= — a resident's policies
 * POST /api/mobile/insurance/policies — buy a policy (debits the wallet for the first premium)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isFeatureEnabled } from "@/lib/feature-flags-server";

export async function GET(req: NextRequest) {
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  if (!ownerId) return NextResponse.json({ error: "ownerId required" }, { status: 400 });

  try {
    const policies = await prisma.insurancePolicy.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ policies });
  } catch {
    return NextResponse.json({ error: "Failed to load policies" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      ownerId, provider, planName, category, categoryIcon,
      coverAmountPaise, premiumPaise, pinCode,
    } = await req.json();

    if (!(await isFeatureEnabled("insurance", { pinCode, userId: ownerId }))) {
      return NextResponse.json({ error: "Insurance is currently unavailable" }, { status: 403 });
    }

    if (!ownerId || !provider || !planName || !category || !coverAmountPaise || !premiumPaise || !pinCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: ownerId }, select: { walletBalancePaise: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.walletBalancePaise < premiumPaise) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 422 });
    }

    const nextDueAt = new Date();
    nextDueAt.setMonth(nextDueAt.getMonth() + 12);
    const policyNumber = `LKL-${Date.now().toString().slice(-8)}`;

    const policy = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: ownerId },
        data: { walletBalancePaise: { decrement: premiumPaise } },
      });
      await tx.walletEntry.create({
        data: {
          userId: ownerId,
          type: "spend",
          amountPaise: -premiumPaise,
          description: `Insurance: ${planName}`,
          status: "completed",
        },
      });
      return tx.insurancePolicy.create({
        data: {
          ownerId, provider, planName, category, categoryIcon: categoryIcon ?? "Shield",
          policyNumber, coverAmountPaise, premiumPaise, nextDueAt, pinCode,
        },
      });
    });

    return NextResponse.json({ policy }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to buy policy" }, { status: 400 });
  }
}

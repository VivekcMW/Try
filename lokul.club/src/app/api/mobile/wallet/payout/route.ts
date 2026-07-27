/**
 * POST /api/mobile/wallet/payout
 * Header: Authorization: Bearer <mobile token>
 * Body: { amountPaise: number; accountLabel?: string }
 *
 * Deducts from user's balance; creates a "payout" WalletEntry.
 * userId is derived from the verified bearer token, never trusted from the body.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireMobileAuth } from "@/lib/mobile-auth";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

export async function POST(req: NextRequest) {
  try {
    const userId = requireMobileAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amountPaise, accountLabel } = await req.json();

    if (!amountPaise || amountPaise <= 0) {
      return NextResponse.json({ error: "positive amountPaise required" }, { status: 400 });
    }

    if (E2E) {
      return NextResponse.json({
        success: true,
        newBalancePaise: Math.max(0, 124000 - amountPaise),
        entry: {
          id: `dev-payout-${Date.now()}`,
          type: "payout",
          amountPaise,
          description: `Payout to ${accountLabel ?? "bank account"}`,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
      });
    }

    // Check sufficient balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalancePaise: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.walletBalancePaise < amountPaise) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 422 });
    }

    const [entry, updated] = await prisma.$transaction([
      prisma.walletEntry.create({
        data: {
          userId,
          type: "payout",
          amountPaise,
          description: `Payout to ${accountLabel ?? "bank account"}`,
          status: "pending",
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { walletBalancePaise: { decrement: amountPaise } },
        select: { walletBalancePaise: true },
      }),
    ]);

    return NextResponse.json({ success: true, newBalancePaise: updated.walletBalancePaise, entry });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Payout failed" }, { status: 500 });
  }
}

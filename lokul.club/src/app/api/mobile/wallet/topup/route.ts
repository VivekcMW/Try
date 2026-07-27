/**
 * POST /api/mobile/wallet/topup
 * Header: Authorization: Bearer <mobile token>
 * Body: { amountPaise: number; reference?: string }
 *
 * Adds the amount to the user's wallet balance and creates a WalletEntry.
 * userId is derived from the verified bearer token, never trusted from the body.
 *
 * NOTE: this is a direct-credit path with no payment-provider proof — it exists
 * for non-cash credits (referral/promo/manual ops top-ups). Real cash top-ups go
 * through the Razorpay-verified /api/mobile/wallet/payment/verify path instead.
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

    const { amountPaise, reference } = await req.json();

    if (!amountPaise || amountPaise <= 0) {
      return NextResponse.json({ error: "positive amountPaise required" }, { status: 400 });
    }

    if (E2E) {
      return NextResponse.json({
        success: true,
        newBalancePaise: 124000 + amountPaise,
        entry: {
          id: `dev-topup-${Date.now()}`,
          type: "topup",
          amountPaise,
          description: "Wallet top-up",
          status: "completed",
          createdAt: new Date().toISOString(),
        },
      });
    }

    const [entry, updated] = await prisma.$transaction([
      prisma.walletEntry.create({
        data: {
          userId,
          type: "topup",
          amountPaise,
          description: "Wallet top-up",
          reference: reference ?? null,
          status: "completed",
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { walletBalancePaise: { increment: amountPaise } },
        select: { walletBalancePaise: true },
      }),
    ]);

    return NextResponse.json({ success: true, newBalancePaise: updated.walletBalancePaise, entry });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Topup failed" }, { status: 500 });
  }
}

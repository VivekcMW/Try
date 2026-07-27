/**
 * GET  /api/mobile/wallet?userId=  — balance + recent ledger
 * PATCH /api/mobile/wallet         — update balance (internal, used by topup/payout)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  if (E2E) {
    return NextResponse.json({
      balancePaise:  124000,
      heldPaise:     0,
      earningsPaise: 380000,
      entries: [],
    });
  }

  try {
    const [user, entries] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { walletBalancePaise: true, walletHeldPaise: true, walletEarningsPaise: true },
      }),
      prisma.walletEntry.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      balancePaise:  user.walletBalancePaise,
      heldPaise:     user.walletHeldPaise,
      earningsPaise: user.walletEarningsPaise,
      entries,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load wallet" }, { status: 500 });
  }
}

/**
 * POST /api/mobile/referrals/rewards/redeem
 * Body: { userId, rewardId, txId }
 * Returns: { ok, rewardId, txId }
 *
 * In production: validates txId, updates points balance in DB,
 * triggers cashback / subscription activation.
 */
import { NextRequest, NextResponse } from "next/server";

const VALID_REWARDS = ['plus_1month', 'cashback_25', 'refer_badge', 'cashback_50'];

export async function POST(req: NextRequest) {
  const { userId, rewardId, txId } = await req.json();

  if (!userId || !rewardId || !txId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!VALID_REWARDS.includes(rewardId)) {
    return NextResponse.json({ error: "Unknown reward" }, { status: 400 });
  }

  // Production: look up user points balance, deduct, create redemption record in DB
  console.log(`[rewards] User ${userId} redeemed ${rewardId} (txId: ${txId})`);

  return NextResponse.json({ ok: true, rewardId, txId });
}

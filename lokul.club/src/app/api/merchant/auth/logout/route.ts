import { NextResponse } from "next/server";
import { clearMerchantSession } from "@/lib/merchant-auth";

/**
 * POST /api/merchant/auth/logout
 * Clear merchant session
 */
export async function POST() {
  await clearMerchantSession();
  return NextResponse.json({ success: true });
}

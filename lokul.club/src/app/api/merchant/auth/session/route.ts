import { NextResponse } from "next/server";
import { getOptionalMerchant } from "@/lib/merchant-auth";

/**
 * GET /api/merchant/auth/session
 * Get current merchant session
 */
export async function GET() {
  const merchantData = await getOptionalMerchant();
  
  if (!merchantData) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    merchant: {
      id: merchantData.merchant.id,
      name: merchantData.merchant.name,
      category: merchantData.merchant.category,
      status: merchantData.merchant.status,
      avatarUrl: merchantData.merchant.avatarUrl,
      subscriptionTier: merchantData.merchant.subscriptionTier,
      ratingAvg: merchantData.merchant.ratingAvg,
      ratingCount: merchantData.merchant.ratingCount,
    },
    user: {
      id: merchantData.merchant.owner.id,
      name: merchantData.merchant.owner.name,
      phone: merchantData.merchant.owner.phone,
      avatarUrl: merchantData.merchant.owner.avatarUrl,
    },
  });
}

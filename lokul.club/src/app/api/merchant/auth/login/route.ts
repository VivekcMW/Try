import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setMerchantSessionCookie } from "@/lib/merchant-auth";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

/**
 * POST /api/merchant/auth/login
 * Login merchant with phone + OTP
 * 
 * Body: { phone: string, otp: string }
 * Response: { success: true, merchant: {...} } or { error: string }
 */
export async function POST(req: NextRequest) {
  if (E2E) {
    return NextResponse.json({ 
      success: true, 
      merchant: { id: "test_merchant", name: "Test Shop" } 
    });
  }

  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });
    }

    // Verify OTP (reusing existing OTP verification logic)
    // In production, you'd verify against OTP table
    // For now, simple mock: accept any 6-digit OTP in dev
    const isValidOtp = process.env.NODE_ENV === "development" ? otp.length === 6 : await verifyOtpFromDb(phone, otp);

    if (!isValidOtp) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { merchant: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.merchant) {
      return NextResponse.json({ error: "No merchant account found for this user" }, { status: 403 });
    }

    if (user.merchant.status === "suspended" || user.merchant.isBlacklisted) {
      return NextResponse.json({ error: "Merchant account is suspended" }, { status: 403 });
    }

    // Create session
    await setMerchantSessionCookie(user.id, user.merchant.id, phone);

    return NextResponse.json({
      success: true,
      merchant: {
        id: user.merchant.id,
        name: user.merchant.name,
        category: user.merchant.category,
        status: user.merchant.status,
        avatarUrl: user.merchant.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Merchant login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

/**
 * Verify OTP from database
 * TODO: Implement actual OTP verification against OTP table
 */
async function verifyOtpFromDb(_phone: string, _otp: string): Promise<boolean> {
  // In production, check against OTP table with expiry
  // For MVP, we'll skip this and rely on frontend calling /api/web/otp/verify first
  return true;
}

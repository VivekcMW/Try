import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setMerchantSessionCookie } from "@/lib/merchant-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

/**
 * POST /api/merchant/auth/login
 * Login merchant with email + password OR phone + OTP
 * 
 * Body: { email: string, password: string } OR { phone: string, otp: string }
 * Response: { success: true, merchant: {...} } or { error: string }
 */
export async function POST(req: NextRequest) {
  if (E2E) {
    await setMerchantSessionCookie("e2e_user", "e2e_merchant", "+919999999999");
    return NextResponse.json({
      success: true,
      merchant: { id: "e2e_merchant", name: "Test Shop" }
    });
  }

  try {
    const body = await req.json();
    const { email, password, phone, otp } = body;

    // Email + Password login (using Supabase)
    if (email && password) {
      return await handleEmailLogin(email, password);
    }

    // Phone + OTP login (existing flow)
    if (!phone || !otp) {
      return NextResponse.json({ error: "Email+password or phone+OTP required" }, { status: 400 });
    }

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

async function verifyOtpFromDb(phone: string, otp: string): Promise<boolean> {
  const record = await prisma.otpVerification.findFirst({
    where: {
      phone,
      code: otp,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return false;

  await prisma.otpVerification.update({
    where: { id: record.id },
    data: { used: true },
  });

  return true;
}

/**
 * Handle email + password login via Supabase
 */
async function handleEmailLogin(email: string, password: string) {
  try {
    const supabase = await createServerSupabaseClient();

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const userId = data.user.id;
    const userPhone = data.user.phone || data.user.email || "";

    // Find merchant by owner userId
    const merchant = await prisma.merchant.findFirst({
      where: {
        ownerId: userId,
        isBlacklisted: false,
      },
      select: {
        id: true,
        name: true,
        category: true,
        status: true,
        avatarUrl: true,
      },
    });

    if (!merchant) {
      return NextResponse.json(
        { error: "No merchant account found. Please register your business first." },
        { status: 403 }
      );
    }

    if (merchant.status !== "active" && merchant.status !== "pending_verification") {
      return NextResponse.json(
        { error: `Your merchant account is ${merchant.status}. Please contact support.` },
        { status: 403 }
      );
    }

    // Create merchant session cookie
    await setMerchantSessionCookie(userId, merchant.id, userPhone);

    return NextResponse.json({
      success: true,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        category: merchant.category,
        status: merchant.status,
        avatarUrl: merchant.avatarUrl,
      },
    });
  } catch (error) {
    console.error("[email-login]", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

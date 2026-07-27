/**
 * POST /api/mobile/otp/send
 * Body: { phone: string }  — E.164 (+91XXXXXXXXXX)
 *
 * Stores OTP in DB (OtpVerification model — serverless-safe, survives restarts).
 * In production sends via MSG91 flow-based SMS.
 * In dev/E2E: fixed code "1123" is used and logged; SMS is not sent.
 */
import { randomInt } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOtpSms } from "@/lib/sms";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^\+91\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const isProd = process.env.NODE_ENV === "production";
    const code   = isProd
      ? randomInt(1000, 10000).toString()
      : "1123";
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    if (E2E) {
      if (!isProd) console.log(`[OTP][E2E] ${phone} → ${code}`);
      return NextResponse.json({ success: true });
    }

    // Invalidate any existing unexpired OTPs for this phone
    await prisma.otpVerification.updateMany({
      where: { phone, used: false, expiresAt: { gt: new Date() } },
      data:  { used: true },
    });

    await prisma.otpVerification.create({ data: { phone, code, expiresAt } });

    if (!isProd) {
      console.log(`[OTP] ${phone} → ${code}`);
    } else {
      await sendOtpSms(phone, code);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[otp/send]", e);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

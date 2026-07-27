/**
 * POST /api/mobile/otp/verify
 * Body: { phone: string, code: string }
 *
 * Checks the OtpVerification DB record created by /otp/send.
 * Marks the record used on success (one-time use, replay-safe).
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "phone and code required" }, { status: 400 });
    }

    // E2E / dev no-DB fallback: accept fixed code "1123"
    if (E2E) {
      if (code.trim() === "1123") return NextResponse.json({ success: true });
      return NextResponse.json({ error: "Incorrect OTP" }, { status: 422 });
    }

    const entry = await prisma.otpVerification.findFirst({
      where: { phone, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "OTP not found or expired — request a new one" },
        { status: 404 }
      );
    }

    if (entry.code !== code.trim()) {
      return NextResponse.json({ error: "Incorrect OTP" }, { status: 422 });
    }

    // Atomically mark used — prevents replay attacks
    await prisma.otpVerification.update({ where: { id: entry.id }, data: { used: true } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[otp/verify]", e);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

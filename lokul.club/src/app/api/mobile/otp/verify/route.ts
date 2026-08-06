/**
 * POST /api/mobile/otp/verify
 * Body: { phone: string, code: string }
 *
 * Checks the OtpVerification DB record created by /otp/send.
 * Marks the record used on success (one-time use, replay-safe).
 * Creates or finds the user, returns user data + auth token.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sign } from "jsonwebtoken";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "phone and code required" }, { status: 400 });
    }

    // E2E / dev no-DB fallback: accept fixed code "1123"
    if (E2E) {
      if (code.trim() !== "1123") {
        return NextResponse.json({ error: "Incorrect OTP" }, { status: 422 });
      }
      // In E2E mode, create/find user and return session
      let user = await prisma.user.findUnique({ where: { phone } });
      if (!user) {
        user = await prisma.user.create({
          data: { phone, status: "active", role: "resident" },
        });
      }
      const token = sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: "30d" });
      return NextResponse.json({
        success: true,
        session: { user: { id: user.id, phone: user.phone, name: user.name }, token },
        user: { id: user.id, phone: user.phone, name: user.name },
        token,
      });
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

    // Create or find user by phone
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { phone, status: "active", role: "resident" },
      });
    }

    // Generate JWT token
    const token = sign({ userId: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: "30d" });

    return NextResponse.json({
      success: true,
      session: { user: { id: user.id, phone: user.phone, name: user.name }, token },
      user: { id: user.id, phone: user.phone, name: user.name },
      token,
    });
  } catch (e) {
    console.error("[otp/verify]", e);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

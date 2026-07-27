/**
 * OTP store — backed by the OtpVerification table so codes survive across
 * serverless instances/restarts (an in-memory Map does not).
 */
import { prisma } from "@/lib/prisma";

const TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

export async function storeOtp(phone: string, code: string): Promise<void> {
  // Invalidate any existing unexpired OTPs for this phone before issuing a new one
  await prisma.otpVerification.updateMany({
    where: { phone, used: false, expiresAt: { gt: new Date() } },
    data: { used: true },
  });
  await prisma.otpVerification.create({
    data: { phone, code, expiresAt: new Date(Date.now() + TTL_MS) },
  });
}

export type OtpResult = "ok" | "expired" | "invalid" | "too_many";

export async function verifyOtp(phone: string, code: string): Promise<OtpResult> {
  const rec = await prisma.otpVerification.findFirst({
    where: { phone, used: false },
    orderBy: { createdAt: "desc" },
  });

  if (!rec || rec.expiresAt < new Date()) return "expired";
  if (rec.attempts >= MAX_ATTEMPTS) return "too_many";

  if (rec.code !== code) {
    await prisma.otpVerification.update({
      where: { id: rec.id },
      data: { attempts: { increment: 1 } },
    });
    return "invalid";
  }

  await prisma.otpVerification.update({
    where: { id: rec.id },
    data: { used: true }, // one-time use
  });
  return "ok";
}

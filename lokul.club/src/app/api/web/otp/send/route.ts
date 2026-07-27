import { randomInt } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { storeOtp } from "@/lib/otp-store";
import { sendOtpSms } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const phone: string | undefined = body?.phone;

  if (!phone || !/^\+91\d{10}$/.test(phone)) {
    return NextResponse.json({ error: "Valid +91 phone number required" }, { status: 400 });
  }

  // In dev / E2E always use code 123456 so tests are predictable
  const isDev = process.env.E2E_TEST === "1" || process.env.NODE_ENV === "development";
  const code = isDev ? "123456" : randomInt(100_000, 1_000_000).toString();

  await storeOtp(phone, code);

  if (isDev) {
    console.log(`[OTP DEV] ${phone} → ${code}`);
  } else {
    await sendOtpSms(phone, `Your Lokul OTP is ${code}. Valid for 5 minutes. Do not share.`);
  }

  return NextResponse.json({ sent: true });
}

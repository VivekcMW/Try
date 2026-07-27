import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp-store";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const phone: string | undefined = body?.phone;
  const code: string | undefined = body?.code;

  if (!phone || !code) {
    return NextResponse.json({ error: "phone and code required" }, { status: 400 });
  }

  const result = await verifyOtp(phone, code.trim());

  if (result === "ok") {
    return NextResponse.json({ verified: true });
  }

  const messages: Record<string, string> = {
    expired:  "OTP expired. Please request a new one.",
    invalid:  "Incorrect OTP. Please try again.",
    too_many: "Too many attempts. Please request a new OTP.",
  };

  return NextResponse.json({ verified: false, error: messages[result] ?? "Verification failed." }, { status: 400 });
}

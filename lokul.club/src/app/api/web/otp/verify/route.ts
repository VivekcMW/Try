import { NextRequest, NextResponse } from "next/server";
import { OTPService } from "@/lib/otp/otp-service";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const phone: string | undefined = body?.phone;
  const email: string | undefined = body?.email;
  const code: string | undefined = body?.code;
  const transactionId: string | undefined = body?.transactionId;

  if ((!phone && !email) || !code) {
    return NextResponse.json({ error: "Phone/email and code required" }, { status: 400 });
  }

  try {
    const otpService = new OTPService();
    
    // OTPService.verifyOTP signature: (transactionId, code, phone, email)
    const result = await otpService.verifyOTP(
      transactionId || '', 
      code.trim(), 
      phone, 
      email
    );

    if (result.success) {
      return NextResponse.json({ verified: true, userId: result.userId });
    }

    return NextResponse.json({ 
      verified: false, 
      error: result.error || "Verification failed." 
    }, { status: 400 });
  } catch (error) {
    console.error("[OTP] Verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

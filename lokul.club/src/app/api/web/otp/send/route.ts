import { NextRequest, NextResponse } from "next/server";
import { OTPService } from "@/lib/otp/otp-service";

export async function POST(req: NextRequest) {
  console.log('[OTP API] POST /api/web/otp/send called');
  
  const body = await req.json().catch(() => null);
  const phone: string | undefined = body?.phone;
  const email: string | undefined = body?.email;

  console.log('[OTP API] Request body:', { phone, email });

  // Require either phone or email
  if (!phone && !email) {
    return NextResponse.json({ error: "Phone or email required" }, { status: 400 });
  }

  if (phone && !/^\+91\d{10}$/.test(phone)) {
    return NextResponse.json({ error: "Valid +91 phone number required" }, { status: 400 });
  }

  try {
    console.log('[OTP API] Initializing OTP service...');
    const otpService = new OTPService();
    
    console.log('[OTP API] Checking for pending OTP...');
    // Check for pending OTP (rate limiting)
    const hasPending = await otpService.hasPendingOTP(phone, email);
    if (hasPending) {
      return NextResponse.json({ error: "Please wait before requesting another OTP" }, { status: 429 });
    }

    console.log('[OTP API] Sending OTP via service...');
    // Send OTP via our new multi-provider system
    const result = await otpService.sendOTP(phone, email);

    console.log('[OTP API] Send result:', result);

    if (!result.success) {
      console.error("[OTP] Failed to send:", result.error);
      return NextResponse.json({ error: result.error || "Failed to send OTP" }, { status: 500 });
    }

    // In dev mode, log the OTP for testing
    if (process.env.NODE_ENV === "development" || process.env.E2E_TEST === "1") {
      console.log(`[OTP DEV] ${phone || email} → ${result.otp} (transactionId: ${result.transactionId})`);
    }

    return NextResponse.json({ 
      sent: true, 
      transactionId: result.transactionId,
      provider: result.provider 
    });
  } catch (error) {
    console.error("[OTP] Send error:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

/**
 * POST /api/mobile/kyc/aadhaar/otp
 * Body: { aadhaarNumber: string; userId: string }
 *
 * Sends an OTP to the Aadhaar-linked mobile via eKYC gateway.
 * Returns { transactionId } to pass back in the verify call.
 */
import { NextRequest, NextResponse } from "next/server";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

function isEkycConfigured() {
  return !!(process.env.EKYC_BASE_URL && process.env.EKYC_API_KEY && process.env.EKYC_API_SECRET);
}

async function getEkycToken(): Promise<string> {
  const res = await fetch(`${process.env.EKYC_BASE_URL}/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      _username: process.env.EKYC_API_KEY,
      _password: process.env.EKYC_API_SECRET,
    }),
  });
  const data = await res.json() as { access_token?: string };
  if (!data.access_token) throw new Error("eKYC auth failed");
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { aadhaarNumber, userId } = await req.json();

    if (!userId || !aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      return NextResponse.json(
        { error: "userId and valid 12-digit aadhaarNumber required" },
        { status: 400 }
      );
    }

    if (E2E || !isEkycConfigured()) {
      // Dev stub — return a fixed transactionId
      return NextResponse.json({ transactionId: `txn_dev_${Date.now()}`, isStub: true });
    }

    const token = await getEkycToken();
    const res   = await fetch(
      `${process.env.EKYC_BASE_URL}/kyc/aadhaar/okyc/generate-otp`,
      {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          Authorization:   `Bearer ${token}`,
          "x-api-version": "2.0",
        },
        body: JSON.stringify({ "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request", "aadhaar_number": aadhaarNumber }),
      }
    );

    const data = await res.json() as { data?: { transaction_id?: string }; message?: string };
    if (!res.ok || !data.data?.transaction_id) {
      return NextResponse.json({ error: data.message ?? "OTP request failed" }, { status: 422 });
    }

    return NextResponse.json({ transactionId: data.data.transaction_id });
  } catch (e) {
    console.error("[kyc/aadhaar/otp]", e);
    return NextResponse.json({ error: "eKYC OTP request failed" }, { status: 500 });
  }
}

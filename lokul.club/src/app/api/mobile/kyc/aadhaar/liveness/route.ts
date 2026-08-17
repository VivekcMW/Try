/**
 * POST /api/mobile/kyc/aadhaar/liveness
 * Body: { userId: string; imageDataUrl: string (base64 selfie); sessionId?: string }
 *
 * Runs a liveness / face-match check against the Aadhaar photo via the eKYC gateway.
 * On success: upgrades kycTier to "gold" (document + liveness verified).
 * In dev/stub: returns { ok: true, liveness: "pass" } immediately.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isR2Configured, uploadToR2, dataUrlToBuffer } from "@/lib/r2";
import { isFeatureEnabled } from "@/lib/feature-flags-server";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

export async function POST(req: NextRequest) {
  try {
    const { userId, imageDataUrl } = await req.json();

    if (!(await isFeatureEnabled("kyc_gold_tier", { userId }))) {
      return NextResponse.json({ error: "Gold tier verification is currently unavailable" }, { status: 403 });
    }

    if (!userId || !imageDataUrl) {
      return NextResponse.json(
        { error: "userId and imageDataUrl required" },
        { status: 400 }
      );
    }

    if (!imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "imageDataUrl must be a base64-encoded image" },
        { status: 400 }
      );
    }

    if (E2E) {
      return NextResponse.json({ ok: true, liveness: "pass", kycTier: "gold", isStub: true });
    }

    // Store selfie in R2 (if configured)
    if (isR2Configured()) {
      try {
        const { buffer, contentType } = dataUrlToBuffer(imageDataUrl);
        await uploadToR2({
          key:         `kyc/${userId}/liveness/${Date.now()}.jpg`,
          body:        buffer,
          contentType,
        });
      } catch (e) {
        console.error("[kyc/liveness] R2 upload failed", e);
        // Non-fatal — proceed with liveness check
      }
    }

    // eKYC gateway liveness check (Sandbox.co.in / KARZA)
    const ekycBase = process.env.EKYC_BASE_URL;
    const ekycKey  = process.env.EKYC_API_KEY;

    if (!ekycBase || !ekycKey) {
      // No gateway configured — stub pass for staging
      console.warn("[kyc/liveness] eKYC not configured — stub pass");
      await prisma.user.update({ where: { id: userId }, data: { kycTier: "gold" } });
      return NextResponse.json({ ok: true, liveness: "pass", kycTier: "gold" });
    }

    const authRes  = await fetch(`${ekycBase}/authenticate`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ _username: ekycKey, _password: process.env.EKYC_API_SECRET }),
    });
    const { access_token } = await authRes.json() as { access_token?: string };
    if (!access_token) throw new Error("eKYC auth failed");

    const livenessRes = await fetch(`${ekycBase}/kyc/liveness`, {
      method:  "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${access_token}`,
      },
      body: JSON.stringify({ image: imageDataUrl.split(",")[1] }),
    });

    const livenessData = await livenessRes.json() as { data?: { liveness?: string }; message?: string };
    const result       = livenessData.data?.liveness ?? "fail";

    if (result !== "pass") {
      return NextResponse.json(
        { ok: false, liveness: result, error: livenessData.message ?? "Liveness check failed" },
        { status: 422 }
      );
    }

    await prisma.user.update({ where: { id: userId }, data: { kycTier: "gold" } });

    return NextResponse.json({ ok: true, liveness: "pass", kycTier: "gold" });
  } catch (e) {
    console.error("[kyc/aadhaar/liveness]", e);
    return NextResponse.json({ error: "Liveness check failed" }, { status: 500 });
  }
}

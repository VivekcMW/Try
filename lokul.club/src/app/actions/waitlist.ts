"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const schema = z.object({
  name:          z.string().min(2).max(100),
  email:         z.email(),
  pincode:       z.string().regex(/^\d{6}$/, "Must be a 6-digit pin code"),
  role:          z.enum(["resident", "merchant", "rwa"]),
  notify:        z.preprocess((v) => v === "on" || v === true, z.boolean()),
  detectedCity:  z.string().max(100).optional(),
});

export type WaitlistResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function joinWaitlist(
  _prev: WaitlistResult | null,
  formData: FormData
): Promise<WaitlistResult> {
  // Validate
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, pincode, role, notify, detectedCity } = parsed.data;

  // Persist
  const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
  const skipDb   = process.env.E2E_TEST === "1" || noRealDb;

  try {
    if (!skipDb) {
      await prisma.waitlistEntry.upsert({
        where:  { email },
        update: { name, pincode, role, notify },
        create: { name, email, pincode, role, notify },
      });
    }
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }

  // Send confirmation email (fire-and-forget — gracefully skip if unconfigured)
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith("re_xxx")) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.RESEND_FROM_EMAIL ?? "Lokul <hello@lokul.club>";
      await resend.emails.send({
        from,
        to:      email,
        subject: "You're on the Lokul waitlist 🎉",
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1e293b">
            <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:24px">
              <span style="display:flex;align-items:center;justify-content:center;height:36px;width:36px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#4338ca);font-size:14px;font-weight:700;color:white">L</span>
              <span style="font-size:16px;font-weight:700">lokul<span style="color:#4f46e5">.club</span></span>
            </div>
            <h1 style="font-size:24px;font-weight:700;margin:0 0 8px">You're on the list, ${name}! 🙌</h1>
            <p style="color:#64748b;margin:0 0 20px">We've reserved your spot for pin code <strong>${pincode}</strong>${detectedCity ? ` (${detectedCity})` : ""}. You'll be among the first to know when Lokul goes live in your neighborhood.</p>
            <div style="background:#eef2ff;border-radius:12px;padding:16px 20px;margin-bottom:24px">
              <p style="margin:0;font-size:14px;font-weight:600;color:#4338ca">Want priority access?</p>
              <p style="margin:4px 0 0;font-size:14px;color:#64748b">Share <strong>lokul.club</strong> with 3 neighbors and skip the queue.</p>
            </div>
            <p style="font-size:12px;color:#94a3b8;margin:0">You subscribed as <strong>${role}</strong>. ${notify ? "We'll notify you the moment your pin code area goes live." : ""}</p>
          </div>
        `,
      });
    } catch {
      // Non-fatal: email failure doesn't block registration
    }
  }

  return { success: true };
}

/**
 * POST /api/mobile/users  — create a new user at the end of onboarding
 * Body: {
 *   phone: string;       // E.164 (+91XXXXXXXXXX)
 *   name: string;
 *   avatarUrl?: string;
 *   pin: string;
 *   city?: string;
 *   locationType?: string;
 *   societyId?: string;
 *   tower?: string;
 *   flat?: string;
 *   houseLabel?: string;
 *   streetAddress?: string;
 *   interests?: string[];
 *   roles?: string[];    // declared peer/business roles from onboarding
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { captureServerEvent } from "@/lib/analytics-server";
import { signMobileToken } from "@/lib/mobile-auth";

const noRealDb = (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
const E2E = process.env.E2E_TEST === "1" || noRealDb;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      phone,
      name,
      avatarUrl,
      pin,
      city,
    } = body as Record<string, string | undefined>;

    if (!phone || !name || !pin) {
      return NextResponse.json(
        { error: "phone, name, and pin are required" },
        { status: 400 }
      );
    }

    if (!/^\+91\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    if (name.trim().length < 2) {
      return NextResponse.json({ error: "Name too short" }, { status: 400 });
    }

    if (E2E) {
      // Return a synthetic user for dev / E2E — no DB write
      const id = `dev-${phone.replace(/\D/g, "").slice(-10)}`;
      return NextResponse.json(
        {
          id,
          phone,
          name: name.trim(),
          avatarUrl: avatarUrl ?? null,
          kycTier: "bronze",
          role: "resident",
          createdAt: new Date().toISOString(),
          token: signMobileToken(id),
        },
        { status: 201 }
      );
    }

    // Upsert: if phone already registered return existing user
    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return NextResponse.json({ ...existing, token: signMobileToken(existing.id) });
    }

    const user = await prisma.user.create({
      data: {
        phone,
        name: name.trim(),
        avatarUrl: avatarUrl ?? null,
        localities: {
          create: {
            pinCode: pin,
            city: city ?? "",
            isPrimary: true,
          },
        },
      },
      select: {
        id: true,
        phone: true,
        name: true,
        avatarUrl: true,
        kycTier: true,
        role: true,
        createdAt: true,
      },
    });

    // Credit referrer if an unclaimed ReferralRecord exists for this phone
    try {
      const referralRecord = await prisma.referralRecord.findFirst({
        where: { refereePhone: phone, creditedAt: null },
      });
      if (referralRecord) {
        const REFERRAL_CREDIT_PAISE = 5000; // ₹50
        await prisma.$transaction([
          prisma.referralRecord.update({
            where: { id: referralRecord.id },
            data: {
              refereeId:   user.id,
              creditPaise: REFERRAL_CREDIT_PAISE,
              creditedAt:  new Date(),
            },
          }),
          prisma.walletEntry.create({
            data: {
              userId:      referralRecord.referrerId,
              type:        "earn",
              amountPaise: REFERRAL_CREDIT_PAISE,
              description: "Referral bonus",
            },
          }),
        ]);
      }
    } catch (refErr) {
      // Non-fatal — log but don't fail user creation
      console.error("[referral-credit]", refErr);
    }

    // Funnel step 1/3: onboarding → first post → first order
    captureServerEvent(user.id, "onboarding_completed", {
      pinCode: pin ?? null,
      city: city ?? null,
    });

    return NextResponse.json({ ...user, token: signMobileToken(user.id) }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

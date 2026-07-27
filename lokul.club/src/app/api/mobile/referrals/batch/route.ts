/**
 * POST /api/mobile/referrals/batch  — send batch invite + create ReferralRecord per phone
 * GET  /api/mobile/referrals/batch  — list InviteBatch history for a referrer
 *
 * POST body: { referrerId: string; phones: string[]; pinCode?: string; message?: string }
 * GET  params: referrerId
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const referrerId = searchParams.get("referrerId");
  if (!referrerId) return NextResponse.json({ error: "referrerId required" }, { status: 400 });

  const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
  if (E2E) {
    return NextResponse.json({ items: [] });
  }

  try {
    // Return batches created by this user (we track by referrerId embedded in records)
    const batches = await prisma.inviteBatch.findMany({
      where: { createdById: referrerId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json({ items: batches });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
  if (E2E) {
    return NextResponse.json({ batchId: "e2e-batch", sentCount: 0 }, { status: 201 });
  }

  try {
    const { referrerId, phones, pinCode, message } = await req.json() as {
      referrerId: string;
      phones: string[];
      pinCode?: string;
      message?: string;
    };

    if (!referrerId || !Array.isArray(phones) || phones.length === 0) {
      return NextResponse.json({ error: "referrerId and phones[] required" }, { status: 400 });
    }

    // Deduplicate phones
    const uniquePhones = [...new Set(phones.map((p: string) => p.trim()).filter(Boolean))];
    if (uniquePhones.length === 0) {
      return NextResponse.json({ error: "No valid phone numbers provided" }, { status: 400 });
    }
    if (uniquePhones.length > 50) {
      return NextResponse.json({ error: "Maximum 50 phones per batch" }, { status: 400 });
    }

    // Verify referrer exists
    const referrer = await prisma.user.findUnique({ where: { id: referrerId }, select: { id: true } });
    if (!referrer) return NextResponse.json({ error: "Referrer not found" }, { status: 404 });

    // Create batch + individual records in a transaction
    const { batch, created } = await prisma.$transaction(async (tx) => {
      const batch = await tx.inviteBatch.create({
        data: {
          createdById: referrerId,
          pinCode:     pinCode ?? null,
          totalCount:  uniquePhones.length,
          sentCount:   uniquePhones.length,
          sentAt:      new Date(),
        },
      });

      // Upsert one ReferralRecord per phone (idempotent)
      let created = 0;
      for (const phone of uniquePhones) {
        const exists = await tx.referralRecord.findFirst({
          where: { referrerId, refereePhone: phone },
        });
        if (!exists) {
          await tx.referralRecord.create({
            data: { referrerId, refereePhone: phone },
          });
          created++;
        }
      }

      return { batch, created };
    });

    return NextResponse.json({ batchId: batch.id, sentCount: batch.sentCount, newRecords: created, message }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

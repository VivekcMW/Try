/**
 * GET  /api/mobile/domestic-help/helpers
 *   - ?ownerId=       — helpers owned/managed by this resident ("My Helpers")
 *   - ?pinCode=&pool=true[&roleId=] — verified community pool listings for a pinCode
 *   - ?pinCode=&countsByRole=true   — helper counts per role in the community pool
 * POST /api/mobile/domestic-help/helpers — add a helper (personal list, or pool referral)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const OWNER_SELECT = { id: true, name: true };

export async function GET(req: NextRequest) {
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  const pinCode = req.nextUrl.searchParams.get("pinCode");
  const pool = req.nextUrl.searchParams.get("pool") === "true";
  const roleId = req.nextUrl.searchParams.get("roleId");
  const countsByRole = req.nextUrl.searchParams.get("countsByRole") === "true";

  try {
    if (countsByRole) {
      if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });
      const grouped = await prisma.domesticHelper.groupBy({
        by: ["roleId"],
        where: { pinCode, isPoolListed: true, verificationStatus: "verified" },
        _count: { roleId: true },
      });
      const counts: Record<string, number> = {};
      for (const g of grouped) {
        if (g.roleId) counts[g.roleId] = g._count.roleId;
      }
      return NextResponse.json({ counts });
    }

    if (ownerId) {
      const helpers = await prisma.domesticHelper.findMany({
        where: { ownerId },
        orderBy: { createdAt: "desc" },
        include: { owner: { select: OWNER_SELECT } },
      });
      return NextResponse.json({ helpers });
    }

    if (pinCode && pool) {
      const helpers = await prisma.domesticHelper.findMany({
        where: {
          pinCode,
          isPoolListed: true,
          verificationStatus: "verified",
          ...(roleId && roleId !== "all" ? { roleId } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 100,
        // Public community listing — never include phone here; contact happens
        // via chat (see pool/[id].tsx), not a direct number.
        select: {
          id: true,
          ownerId: true,
          name: true,
          photo: true,
          roleId: true,
          role: true,
          verificationStatus: true,
          rating: true,
          reviews: true,
          worksAt: true,
          workingDays: true,
          workingHours: true,
          monthlyPayPaise: true,
          joiningDate: true,
          lastVerifiedAt: true,
          notes: true,
          recommendedBy: true,
          areas: true,
          experience: true,
          languages: true,
          monthlyRateMinPaise: true,
          monthlyRateMaxPaise: true,
          availability: true,
          isPoolListed: true,
          pinCode: true,
          createdAt: true,
          updatedAt: true,
          owner: { select: OWNER_SELECT },
        },
      });
      return NextResponse.json({ helpers });
    }

    return NextResponse.json({ error: "ownerId or pinCode+pool required" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to load helpers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      ownerId,
      name,
      phone,
      photo,
      roleId,
      role,
      workingDays,
      workingHours,
      monthlyPayPaise,
      notes,
      pinCode,
      isPoolListed,
      areas,
      experience,
      languages,
      availability,
      monthlyRateMinPaise,
      monthlyRateMaxPaise,
    } = await req.json();

    if (!ownerId || !name || !role || !pinCode) {
      return NextResponse.json({ error: "ownerId, name, role, pinCode required" }, { status: 400 });
    }

    const helper = await prisma.domesticHelper.create({
      data: {
        ownerId,
        name,
        phone: phone || null,
        photo: photo || null,
        roleId: roleId || null,
        role,
        workingDays: workingDays ?? [],
        workingHours: workingHours ?? "",
        monthlyPayPaise: monthlyPayPaise ?? 0,
        notes: notes || null,
        pinCode,
        isPoolListed: !!isPoolListed,
        areas: areas ?? [],
        experience: experience || null,
        languages: languages ?? [],
        availability: availability || null,
        monthlyRateMinPaise: monthlyRateMinPaise ?? null,
        monthlyRateMaxPaise: monthlyRateMaxPaise ?? null,
        documents: {
          aadhaar: { verified: false },
          police: { verified: false },
          photo: { verified: false },
          address: { verified: false },
        },
      },
      include: { owner: { select: OWNER_SELECT } },
    });

    return NextResponse.json({ helper }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add helper" }, { status: 400 });
  }
}

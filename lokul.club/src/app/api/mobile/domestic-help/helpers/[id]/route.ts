/**
 * GET    /api/mobile/domestic-help/helpers/[id] — helper detail
 * PATCH  /api/mobile/domestic-help/helpers/[id] — edit helper fields
 * DELETE /api/mobile/domestic-help/helpers/[id] — remove a helper
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const OWNER_SELECT = { id: true, name: true };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const helper = await prisma.domesticHelper.findUnique({
      where: { id },
      include: { owner: { select: OWNER_SELECT } },
    });

    if (!helper) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ helper });
  } catch {
    return NextResponse.json({ error: "Failed to load helper" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const {
      name,
      phone,
      photo,
      roleId,
      role,
      workingDays,
      workingHours,
      monthlyPayPaise,
      notes,
      verificationStatus,
    } = body;

    const helper = await prisma.domesticHelper.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(photo !== undefined ? { photo } : {}),
        ...(roleId !== undefined ? { roleId } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(workingDays !== undefined ? { workingDays } : {}),
        ...(workingHours !== undefined ? { workingHours } : {}),
        ...(monthlyPayPaise !== undefined ? { monthlyPayPaise } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(verificationStatus !== undefined
          ? {
              verificationStatus,
              lastVerifiedAt: verificationStatus === "verified" ? new Date() : undefined,
            }
          : {}),
      },
      include: { owner: { select: OWNER_SELECT } },
    });

    return NextResponse.json({ helper });
  } catch {
    return NextResponse.json({ error: "Failed to update helper" }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.domesticHelper.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove helper" }, { status: 400 });
  }
}

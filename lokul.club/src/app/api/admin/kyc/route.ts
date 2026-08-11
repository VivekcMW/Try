/**
 * GET   /api/admin/kyc   — list KYC documents pending review
 * PATCH /api/admin/kyc   — approve or reject a KYC document
 */
import { getServerUser } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getServerUser();
  if ((user as { role?: string } | null)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? "pending";
  const limit  = Math.min(100, parseInt(searchParams.get("limit") ?? "50", 10));

  try {
    const docs = await prisma.kycDocument.findMany({
      where: { status },
      include: {
        user: { select: { id: true, name: true, phone: true, kycTier: true, createdAt: true } },
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
    return NextResponse.json({ items: docs });
  } catch {
    return NextResponse.json({ items: [] });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getServerUser();
  if ((user as { role?: string } | null)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { docId, action, reviewNote, reviewedBy } = await req.json();
    if (!docId || !action || !reviewedBy) {
      return NextResponse.json({ error: "docId, action, reviewedBy required" }, { status: 400 });
    }
    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
    }

    const doc = await prisma.kycDocument.findUnique({ where: { id: docId } });
    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    const newStatus = action === "approve" ? "approved" : "rejected";

    const updated = await prisma.$transaction(async (tx) => {
      const d = await tx.kycDocument.update({
        where: { id: docId },
        data: { status: newStatus, reviewNotes: reviewNote, reviewedBy, reviewedAt: new Date() },
      });
      // Upgrade kycTier when silver doc approved
      if (action === "approve") {
        const approvedDocs = await tx.kycDocument.findMany({
          where: { userId: doc.userId, status: "approved" },
        });
        const kinds = new Set(approvedDocs.map((x) => x.type));
        const hasAadhaar = kinds.has("aadhaar");
        const hasAddressProof = kinds.has("rent_agreement") || kinds.has("electricity_bill") || kinds.has("society_noc");
        const newTier =
          hasAadhaar && hasAddressProof
            ? "gold"
            : hasAadhaar
            ? "silver"
            : "bronze";
        await tx.user.update({ where: { id: doc.userId }, data: { kycTier: newTier } });
      }
      return d;
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

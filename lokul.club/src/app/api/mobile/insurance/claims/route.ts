/**
 * GET  /api/mobile/insurance/claims?ownerId= — claims across all of a resident's policies
 * POST /api/mobile/insurance/claims — file a claim against a policy
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const ownerId = req.nextUrl.searchParams.get("ownerId");
  if (!ownerId) return NextResponse.json({ error: "ownerId required" }, { status: 400 });

  try {
    const claims = await prisma.insuranceClaim.findMany({
      where: { policy: { ownerId } },
      orderBy: { createdAt: "desc" },
      include: { policy: { select: { id: true, planName: true, provider: true, policyNumber: true } } },
    });
    return NextResponse.json({ claims });
  } catch {
    return NextResponse.json({ error: "Failed to load claims" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { policyId, description } = await req.json();
    if (!policyId || !description || description.trim().length < 5) {
      return NextResponse.json({ error: "policyId and a description (5+ chars) required" }, { status: 400 });
    }

    const policy = await prisma.insurancePolicy.findUnique({ where: { id: policyId } });
    if (!policy) return NextResponse.json({ error: "Policy not found" }, { status: 404 });

    const claim = await prisma.insuranceClaim.create({
      data: { policyId, description: description.trim() },
      include: { policy: { select: { id: true, planName: true, provider: true, policyNumber: true } } },
    });

    return NextResponse.json({ claim }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to file claim" }, { status: 400 });
  }
}

/**
 * POST /api/mobile/jobs/[id]/apply — apply to a job (idempotent per applicant)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const existing = await prisma.jobApplication.findUnique({
      where: { jobId_applicantId: { jobId: id, applicantId: userId } },
    });
    if (!existing) {
      await prisma.jobApplication.create({ data: { jobId: id, applicantId: userId } });
    }

    const applicantCount = await prisma.jobApplication.count({ where: { jobId: id } });

    return NextResponse.json({ applicantCount, appliedByMe: true });
  } catch {
    return NextResponse.json({ error: "Failed to apply" }, { status: 400 });
  }
}

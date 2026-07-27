/**
 * GET /api/mobile/jobs/[id] — job detail (pass ?userId= to annotate appliedByMe)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = req.nextUrl.searchParams.get("userId");

  try {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        poster: { select: { id: true, name: true } },
        _count: { select: { applications: true } },
        ...(userId ? { applications: { where: { applicantId: userId }, select: { id: true } } } : {}),
      },
    });

    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const shaped = {
      ...job,
      applicantCount: job._count.applications,
      appliedByMe: userId ? (job as unknown as { applications: unknown[] }).applications.length > 0 : false,
    };

    return NextResponse.json({ job: shaped });
  } catch {
    return NextResponse.json({ error: "Failed to load job" }, { status: 500 });
  }
}

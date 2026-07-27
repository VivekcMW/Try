/**
 * GET   /api/mobile/sos/[id]  — incident detail + responders
 * PATCH /api/mobile/sos/[id]  — update status (author or admin)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  if (E2E) return NextResponse.json({ id, status: "open", responders: [] });

  try {
    const incident = await prisma.sosIncident.findUnique({
      where: { id },
      include: {
        author:     { select: { id: true, name: true, avatarUrl: true } },
        responders: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { respondedAt: "asc" },
        },
      },
    });
    if (!incident) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(incident);
  } catch (e) {
    console.error("[sos/[id] GET]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * PATCH body: { status: "open" | "ack" | "resolved", requesterId: string }
 * Only the author (or admin) can update status.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  if (E2E) return NextResponse.json({ ok: true });

  try {
    const { status, requesterId } = await req.json();
    if (!status || !requesterId) {
      return NextResponse.json({ error: "status and requesterId required" }, { status: 400 });
    }

    const incident = await prisma.sosIncident.findUnique({ where: { id } });
    if (!incident) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const user = await prisma.user.findUnique({ where: { id: requesterId }, select: { role: true } });
    const isAdmin  = user?.role === "super_admin" || user?.role === "moderator";
    const isAuthor = incident.authorId === requesterId;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.sosIncident.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === "resolved" ? new Date() : null,
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("[sos/[id] PATCH]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

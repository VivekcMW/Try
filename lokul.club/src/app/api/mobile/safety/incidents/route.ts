/**
 * GET   /api/mobile/safety/incidents?pinCode=&status=all|pending|verified
 * POST  /api/mobile/safety/incidents          — community incident report
 * PATCH /api/mobile/safety/incidents?id=&action=verify|reject  — moderation
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const E2E = process.env.E2E_TEST === '1' || (process.env.DATABASE_URL ?? '').includes('USER:PASSWORD');

export async function GET(req: NextRequest) {
  if (E2E) return NextResponse.json({ items: [] });
  const pinCode = req.nextUrl.searchParams.get('pinCode');
  const status  = req.nextUrl.searchParams.get('status') ?? 'all';
  if (!pinCode) return NextResponse.json({ error: 'pinCode required' }, { status: 400 });

  const items = await prisma.incidentReport.findMany({
    where: {
      pinCode,
      ...(status !== 'all' ? { status } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true, category: true, severity: true, status: true,
      title: true, body: true, pinCode: true, lat: true, lng: true,
      photoUrl: true, resolvedAt: true, createdAt: true,
      author: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({
    items: items.map((i) => ({
      ...i,
      authorId: i.author.id,
      authorName: i.author.name,
      verifiedAt: i.resolvedAt?.toISOString() ?? null,
      createdAt: i.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  if (E2E) return NextResponse.json({ id: 'e2e-inc-1' }, { status: 201 });
  const body = await req.json();
  const { category, severity, title, body: text, pinCode, lat, lng, photoUrl, authorId } = body as {
    category: string;
    severity?: string;
    title?: string;
    body: string;
    pinCode: string;
    lat?: number;
    lng?: number;
    photoUrl?: string;
    authorId: string;
  };

  if (!category || !text || !pinCode || !authorId) {
    return NextResponse.json({ error: 'category, body, pinCode, authorId required' }, { status: 400 });
  }

  const incident = await prisma.incidentReport.create({
    data: {
      authorId,
      category,
      severity: severity ?? 'medium',
      title: title ?? category,
      body: text,
      pinCode,
      lat: lat ?? null,
      lng: lng ?? null,
      photoUrl: photoUrl ?? null,
      status: 'pending',
    },
    select: { id: true },
  });
  return NextResponse.json({ id: incident.id }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (E2E) return NextResponse.json({ ok: true });
  const id     = req.nextUrl.searchParams.get('id');
  const action = req.nextUrl.searchParams.get('action');
  if (!id || !action) return NextResponse.json({ error: 'id and action required' }, { status: 400 });

  const newStatus = action === 'verify' ? 'verified' : action === 'reject' ? 'rejected' : null;
  if (!newStatus) return NextResponse.json({ error: 'action must be verify or reject' }, { status: 400 });

  const updated = await prisma.incidentReport.updateMany({
    where: { id },
    data: { status: newStatus, resolvedAt: new Date() },
  });
  if (updated.count === 0) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

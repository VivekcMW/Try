/**
 * GET    /api/mobile/safety/contacts?userId=
 * POST   /api/mobile/safety/contacts          — upsert contact
 * DELETE /api/mobile/safety/contacts?id=      — remove contact
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const E2E = process.env.E2E_TEST === '1' || (process.env.DATABASE_URL ?? '').includes('USER:PASSWORD');

export async function GET(req: NextRequest) {
  if (E2E) return NextResponse.json({ contacts: [] });
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const contacts = await prisma.safetyContact.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, phone: true, relation: true, createdAt: true },
  });
  return NextResponse.json({ contacts });
}

export async function POST(req: NextRequest) {
  if (E2E) return NextResponse.json({ ok: true });
  const body = await req.json();
  const { userId, contact } = body as {
    userId: string;
    contact: { id?: string; name: string; phone: string; relation?: string };
  };
  if (!userId || !contact?.name || !contact?.phone) {
    return NextResponse.json({ error: 'userId, contact.name and contact.phone required' }, { status: 400 });
  }

  if (contact.id) {
    await prisma.safetyContact.updateMany({
      where: { id: contact.id, userId },
      data: { name: contact.name, phone: contact.phone, relation: contact.relation ?? null },
    });
    return NextResponse.json({ ok: true, id: contact.id });
  }

  const created = await prisma.safetyContact.create({
    data: { userId, name: contact.name, phone: contact.phone, relation: contact.relation ?? null },
    select: { id: true },
  });
  return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (E2E) return NextResponse.json({ ok: true });
  const userId = req.nextUrl.searchParams.get('userId');
  const id     = req.nextUrl.searchParams.get('id');
  if (!userId || !id) {
    return NextResponse.json({ error: 'userId and id required' }, { status: 400 });
  }
  await prisma.safetyContact.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}

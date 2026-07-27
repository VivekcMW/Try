/**
 * GET  /api/mobile/safety/volunteer?pinCode=  — nearby active volunteers
 * POST /api/mobile/safety/volunteer           — register / update volunteer
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const E2E = process.env.E2E_TEST === '1' || (process.env.DATABASE_URL ?? '').includes('USER:PASSWORD');

export async function GET(req: NextRequest) {
  if (E2E) return NextResponse.json({ volunteers: [] });
  const pinCode = req.nextUrl.searchParams.get('pinCode');
  if (!pinCode) return NextResponse.json({ error: 'pinCode required' }, { status: 400 });

  const volunteers = await prisma.volunteer.findMany({
    where: { pinCode, active: true },
    include: { user: { select: { name: true, phone: true } } },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({
    volunteers: volunteers.map((v) => ({
      userId: v.userId,
      name: v.user.name,
      phone: v.user.phone,
      skills: v.skills,
      pinCode: v.pinCode,
      active: v.active,
    })),
  });
}

export async function POST(req: NextRequest) {
  if (E2E) return NextResponse.json({ ok: true });
  const body = await req.json();
  const { userId, skills, pinCode, active } = body as {
    userId: string;
    skills?: string[];
    pinCode: string;
    active?: boolean;
  };
  if (!userId || !pinCode) {
    return NextResponse.json({ error: 'userId and pinCode required' }, { status: 400 });
  }

  await prisma.volunteer.upsert({
    where: { userId },
    create: { userId, skills: skills ?? [], pinCode, active: active ?? true },
    update: { skills: skills ?? [], pinCode, active: active ?? true },
  });
  return NextResponse.json({ ok: true });
}

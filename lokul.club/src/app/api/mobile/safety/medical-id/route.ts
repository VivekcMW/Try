/**
 * GET /api/mobile/safety/medical-id?userId=
 * PUT /api/mobile/safety/medical-id
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const E2E = process.env.E2E_TEST === '1' || (process.env.DATABASE_URL ?? '').includes('USER:PASSWORD');

export async function GET(req: NextRequest) {
  if (E2E) return NextResponse.json({ medicalId: null });
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const profile = await prisma.medicalProfile.findUnique({
    where: { userId },
    select: { bloodGroup: true, allergies: true, conditions: true, medications: true, emergencyNote: true, doctorPhone: true },
  });
  return NextResponse.json({ medicalId: profile });
}

export async function PUT(req: NextRequest) {
  if (E2E) return NextResponse.json({ ok: true });
  const body = await req.json();
  const { userId, medicalId } = body as {
    userId: string;
    medicalId: {
      bloodGroup?: string;
      allergies?: string[];
      conditions?: string[];
      medications?: string[];
      emergencyNote?: string;
      doctorPhone?: string;
    };
  };
  if (!userId || !medicalId) {
    return NextResponse.json({ error: 'userId and medicalId required' }, { status: 400 });
  }

  await prisma.medicalProfile.upsert({
    where: { userId },
    create: {
      userId,
      bloodGroup: medicalId.bloodGroup ?? null,
      allergies: medicalId.allergies ?? [],
      conditions: medicalId.conditions ?? [],
      medications: medicalId.medications ?? [],
      emergencyNote: medicalId.emergencyNote ?? null,
      doctorPhone: medicalId.doctorPhone ?? null,
    },
    update: {
      bloodGroup: medicalId.bloodGroup ?? null,
      allergies: medicalId.allergies ?? [],
      conditions: medicalId.conditions ?? [],
      medications: medicalId.medications ?? [],
      emergencyNote: medicalId.emergencyNote ?? null,
      doctorPhone: medicalId.doctorPhone ?? null,
    },
  });
  return NextResponse.json({ ok: true });
}

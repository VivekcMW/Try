/**
 * POST /api/mobile/safety/journey   action: "start" | "checkin" | "end"
 * GET  /api/mobile/safety/journey?userId=  — list active journeys
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const E2E = process.env.E2E_TEST === '1' || (process.env.DATABASE_URL ?? '').includes('USER:PASSWORD');

export async function GET(req: NextRequest) {
  if (E2E) return NextResponse.json({ journeys: [] });
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const journeys = await prisma.safetyJourney.findMany({
    where: { userId, status: 'active' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, destination: true, status: true, expectedArrival: true, lastCheckInAt: true, createdAt: true },
  });
  return NextResponse.json({ journeys });
}

export async function POST(req: NextRequest) {
  if (E2E) return NextResponse.json({ id: 'e2e-journey-1', status: 'active' }, { status: 201 });

  const body = await req.json();
  const { action, journeyId, userId, destination, checkInIntervalMin, watcherPhones, expectedArrivalIso } = body as {
    action: string;
    journeyId?: string;
    userId?: string;
    destination?: string;
    checkInIntervalMin?: number;
    watcherPhones?: string[];
    expectedArrivalIso?: string;
  };

  if (action === 'start') {
    if (!userId || !destination) {
      return NextResponse.json({ error: 'userId and destination required' }, { status: 400 });
    }
    const intervalMin = checkInIntervalMin ?? 30;
    const expectedArrival = expectedArrivalIso
      ? new Date(expectedArrivalIso)
      : new Date(Date.now() + intervalMin * 60 * 1000);

    const journey = await prisma.safetyJourney.create({
      data: {
        userId,
        destination,
        checkInIntervalMin: intervalMin,
        watcherPhones: watcherPhones ?? [],
        status: 'active',
        expectedArrival,
      },
      select: { id: true, status: true, expectedArrival: true },
    });

    // Notify watchers via SMS (best-effort, non-blocking)
    void notifyWatchers(watcherPhones ?? [], `${destination}`, 'started', journey.id);

    return NextResponse.json({ ...journey, expectedArrival: journey.expectedArrival.toISOString() }, { status: 201 });
  }

  if (action === 'checkin') {
    if (!journeyId) return NextResponse.json({ error: 'journeyId required' }, { status: 400 });
    const updated = await prisma.safetyJourney.update({
      where: { id: journeyId },
      data: { lastCheckInAt: new Date() },
      select: { id: true, watcherPhones: true, destination: true },
    });
    void notifyWatchers(updated.watcherPhones, updated.destination, 'checkin', journeyId);
    return NextResponse.json({ ok: true, journeyId });
  }

  if (action === 'end') {
    if (!journeyId) return NextResponse.json({ error: 'journeyId required' }, { status: 400 });
    const updated = await prisma.safetyJourney.update({
      where: { id: journeyId },
      data: { status: 'completed' },
      select: { watcherPhones: true, destination: true },
    });
    void notifyWatchers(updated.watcherPhones, updated.destination, 'arrived', journeyId);
    return NextResponse.json({ ok: true, journeyId, status: 'arrived' });
  }

  return NextResponse.json({ error: 'invalid action' }, { status: 400 });
}

/** Best-effort MSG91 SMS to all watchers */
async function notifyWatchers(phones: string[], destination: string, event: string, journeyId: string) {
  const authKey = process.env.MSG91_AUTH_KEY;
  if (!authKey || !phones.length) return;

  const messages: Record<string, string> = {
    started: `Lokul: Journey to ${destination} started. Journey ID: ${journeyId}`,
    checkin: `Lokul: Safe check-in on journey to ${destination}. Journey ID: ${journeyId}`,
    arrived: `Lokul: Arrived safely at ${destination}. Journey ID: ${journeyId}`,
  };
  const text = messages[event] ?? `Lokul: Journey update for ${destination}`;

  await Promise.allSettled(
    phones.map((phone) =>
      fetch('https://api.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authkey: authKey },
        body: JSON.stringify({
          template_id: process.env.MSG91_TEMPLATE_ID,
          sender: process.env.MSG91_SENDER ?? 'LOKUL',
          short_url: '0',
          mobiles: phone.replace('+', ''),
          VAR1: text,
        }),
      })
    )
  );
}

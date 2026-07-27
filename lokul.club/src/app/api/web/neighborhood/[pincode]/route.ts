import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

const STUB = {
  pinCode: "560038",
  city: "Bengaluru",
  areaName: "HSR Layout",
  stats: { businesses: 47, residents: 1_240, eventsThisWeek: 5, safetyAlerts: 2 },
  businesses: [
    { id: "m1", name: "Ramesh Kirana", category: "grocery",  city: "Bengaluru", ratingAvg: 4.7, ratingCount: 213, isEndorsed: true },
    { id: "m2", name: "FitZone Studio", category: "fitness", city: "Bengaluru", ratingAvg: 4.9, ratingCount: 88, isEndorsed: false },
    { id: "m3", name: "Meena's Tiffin", category: "food",    city: "Bengaluru", ratingAvg: 4.8, ratingCount: 142, isEndorsed: true },
    { id: "m4", name: "QuickFix Plumber", category: "plumbing", city: "Bengaluru", ratingAvg: 4.5, ratingCount: 62, isEndorsed: false },
    { id: "m5", name: "BrightMinds Tutor", category: "tutoring", city: "Bengaluru", ratingAvg: 5.0, ratingCount: 29, isEndorsed: false },
    { id: "m6", name: "PetLove Clinic",   category: "pet_care", city: "Bengaluru", ratingAvg: 4.6, ratingCount: 51, isEndorsed: true },
  ],
  recentPosts: [
    { id: "p1", type: "event",  body: "Sunday morning yoga in the park — all levels welcome! Meet at Gate 2 at 6:30 AM.", createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(), imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&q=70&auto=format" },
    { id: "p2", type: "update", body: "Water supply disruption on 3rd Cross tomorrow 10 AM – 2 PM. Please store water in advance.", createdAt: new Date(Date.now() - 5 * 3600_000).toISOString() },
    { id: "p3", type: "lost",   body: "Lost: Golden Retriever puppy named Bruno near 9th Main. Last seen Sunday evening. Please call if spotted!", createdAt: new Date(Date.now() - 12 * 3600_000).toISOString() },
    { id: "p4", type: "sell",   body: "Selling: Trek mountain bike (2022), barely used, original accessories. ₹18,000. DM for photos.", createdAt: new Date(Date.now() - 24 * 3600_000).toISOString(), imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=70&auto=format" },
    { id: "p5", type: "rwa_notice", body: "Society AGM this Saturday at 10 AM in the clubhouse. Agenda: maintenance budget, new watchmen schedule, and parking rules.", createdAt: new Date(Date.now() - 36 * 3600_000).toISOString() },
  ],
  safetyAlerts: [
    { id: "a1", body: "Chain-snatching reported near Metro Station Gate 3. Avoid deserted routes after 9 PM.", createdAt: new Date(Date.now() - 3 * 3600_000).toISOString() },
    { id: "a2", body: "Suspicious vehicle parked on 7th Cross. Residents alerted. Police informed.", createdAt: new Date(Date.now() - 9 * 3600_000).toISOString() },
  ],
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pincode: string }> }
) {
  const { pincode } = await params;

  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: "Invalid pincode" }, { status: 400 });
  }

  if (E2E) {
    return NextResponse.json({ neighborhood: { ...STUB, pinCode: pincode } });
  }

  try {
    // Fetch merchants in this pincode
    const merchants = await prisma.merchant.findMany({
      where: { pinCode: pincode, status: "active", isBlacklisted: false },
      orderBy: [{ isEndorsed: "desc" }, { ratingAvg: "desc" }],
      take: 6,
      select: { id: true, name: true, category: true, city: true, ratingAvg: true, ratingCount: true, isEndorsed: true },
    });

    // Fetch recent public posts (type ≠ sos, visibility = neighborhood)
    const posts = await prisma.post.findMany({
      where: {
        pinCode: pincode,
        visibility: "neighborhood",
        status: "active",
        type: { not: "sos" },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true, type: true, body: true, createdAt: true,
        media: { select: { storageKey: true }, take: 1 },
      },
    });

    // Safety alerts separately
    const alerts = await prisma.post.findMany({
      where: { pinCode: pincode, type: "safety", status: "active" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, body: true, createdAt: true },
    });

    // Derive area name from locality news or use first merchant's city
    const cityName = merchants[0]?.city ?? pincode;

    return NextResponse.json({
      neighborhood: {
        pinCode: pincode,
        city: cityName,
        areaName: cityName,
        stats: {
          businesses: merchants.length,
          residents: 0,
          eventsThisWeek: posts.filter((p) => p.type === "event").length,
          safetyAlerts: alerts.length,
        },
        businesses: merchants,
        recentPosts: posts.map(({ media, ...p }) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
          imageUrl: media[0]?.storageKey ?? null,
        })),
        safetyAlerts: alerts.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

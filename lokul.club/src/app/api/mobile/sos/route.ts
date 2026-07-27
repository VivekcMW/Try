/**
 * GET  /api/mobile/sos         — list open/recent incidents for a pinCode
 * POST /api/mobile/sos         — create a new SOS incident
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { publishSosAlert } from "@/lib/ably";
import { sendPush, findNearbyTokens } from "@/lib/push";

const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pinCode = searchParams.get("pinCode");
  const status  = searchParams.get("status") ?? "open";
  const limit   = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));

  if (!pinCode) return NextResponse.json({ error: "pinCode required" }, { status: 400 });

  if (E2E) {
    return NextResponse.json({ items: [] });
  }

  try {
    const incidents = await prisma.sosIncident.findMany({
      where: { pinCode, ...(status !== "all" ? { status: status as "open" | "ack" | "resolved" } : {}) },
      include: {
        author:     { select: { id: true, name: true, avatarUrl: true } },
        responders: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json({ items: incidents });
  } catch (e) {
    console.error("[sos GET]", e);
    return NextResponse.json({ items: [] });
  }
}

export async function POST(req: NextRequest) {
  if (E2E) return NextResponse.json({ id: "e2e-sos-1", status: "open" }, { status: 201 });

  try {
    const { authorId, pinCode, category, severity, body, lat, lng } = await req.json();

    if (!authorId || !pinCode || !category || !body) {
      return NextResponse.json(
        { error: "authorId, pinCode, category, body are required" },
        { status: 400 }
      );
    }

    const incident = await prisma.sosIncident.create({
      data: {
        authorId,
        pinCode,
        category,
        severity: severity ?? "medium",
        body,
        lat:          lat  ?? null,
        lng:          lng  ?? null,
        firstAlertAt: new Date(), // mark when wave-1 fires
      },
      include: {
        author:     { select: { id: true, name: true, avatarUrl: true } },
        responders: true,
      },
    });

    const categoryLabel = category.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
    const alertPayload = {
      id:        incident.id,
      authorId:  incident.authorId,
      pinCode:   incident.pinCode,
      category:  incident.category,
      severity:  incident.severity,
      body:      incident.body,
      lat:       incident.lat,
      lng:       incident.lng,
      status:    incident.status,
      createdAt: incident.createdAt,
      author:    incident.author,
    };

    // Ably WebSocket (non-blocking, best-effort)
    publishSosAlert(pinCode, alertPayload).catch(() => {});

    // --- Proximity push: 200 m wave ---
    // If lat/lng available, push only nearby devices; fall back to whole pinCode
    let notifiedUserIds: string[] = [];
    if (typeof lat === "number" && typeof lng === "number") {
      const nearby = await findNearbyTokens(lat, lng, 200).catch(() => ({ tokens: [], userIds: [] }));
      notifiedUserIds = nearby.userIds;

      if (nearby.tokens.length) {
        sendPush(
          { tokens: nearby.tokens },
          {
            title:    `🚨 ${categoryLabel} Alert — 200 m away`,
            body:     `${incident.author.name}: ${incident.body.slice(0, 80)}`,
            data:     { type: "sos", incidentId: incident.id, pinCode, radiusM: 200 },
            priority: "high",
          },
        ).catch(() => {});
      } else {
        // No nearby tokens — fall back to pinCode broadcast
        sendPush(
          { pinCode },
          {
            title:    `🚨 ${categoryLabel} Alert`,
            body:     `${incident.author.name}: ${incident.body.slice(0, 80)}`,
            data:     { type: "sos", incidentId: incident.id, pinCode },
            priority: "high",
          },
        ).catch(() => {});
      }
    } else {
      // No coordinates — pinCode broadcast
      sendPush(
        { pinCode },
        {
          title:    `🚨 ${categoryLabel} Alert`,
          body:     `${incident.author.name}: ${incident.body.slice(0, 80)}`,
          data:     { type: "sos", incidentId: incident.id, pinCode },
          priority: "high",
        },
      ).catch(() => {});
    }

    // Persist the list of already-notified users so the 400 m wave skips them
    if (notifiedUserIds.length) {
      prisma.sosIncident.update({
        where: { id: incident.id },
        data:  { notifiedUserIds },
      }).catch(() => {});
    }

    return NextResponse.json(incident, { status: 201 });
  } catch (e) {
    console.error("[sos POST]", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

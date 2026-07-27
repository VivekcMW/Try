/**
 * Server-side push notification utility.
 *
 * Uses the Expo Push Service which handles FCM (Android) and APNs (iOS) routing
 * automatically — no direct FCM/APNs credentials needed on the server.
 *
 * Tokens are stored in the PushToken table via POST /api/mobile/push/register.
 */
import { prisma } from "@/lib/prisma";
import { boundingBox, haversineM } from "@/lib/geo";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const BATCH_SIZE    = 100; // Expo limit per request

interface ExpoMessage {
  to:     string | string[];
  title:  string;
  body:   string;
  data?:  Record<string, unknown>;
  sound?: "default" | null;
  badge?: number;
  ttl?:   number;
  priority?: "default" | "normal" | "high";
}

interface PushFilter {
  /** Send to one user */
  userId?: string;
  /** Send to all active tokens in a pinCode (area-broadcast) */
  pinCode?: string;
  /** Send to all active tokens in a society */
  societyId?: string;
  /** Proximity-based: send to devices within radiusM of (lat, lon) */
  nearbyLat?: number;
  nearbyLon?: number;
  nearbyRadiusM?: number;
  /** Exclude these userIds (used by escalation to skip wave-1 recipients) */
  excludeUserIds?: string[];
  /** Broadcast to all — use sparingly */
  all?: true;
  /** Explicit list of Expo tokens */
  tokens?: string[];
}

async function sendBatch(messages: ExpoMessage[]): Promise<void> {
  try {
    await fetch(EXPO_PUSH_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body:    JSON.stringify(messages),
    });
  } catch (e) {
    console.error("[push] batch send failed", e);
  }
}

/** Location records are considered stale after this many minutes */
const LOCATION_STALE_MINUTES = 30;

/**
 * Find active Expo push tokens belonging to devices that are within
 * `radiusM` metres of the given coordinate.
 *
 * Uses bounding-box SQL pre-filter then Haversine exact check.
 * Only includes devices whose location was updated within the last 30 min.
 *
 * @param excludeUserIds  Users to skip (already notified in a prior wave)
 */
export async function findNearbyTokens(
  lat: number,
  lon: number,
  radiusM: number,
  excludeUserIds: string[] = [],
): Promise<{ tokens: string[]; userIds: string[] }> {
  const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
  if (E2E) return { tokens: [], userIds: [] };

  const staleThreshold = new Date(Date.now() - LOCATION_STALE_MINUTES * 60 * 1_000);
  const bbox = boundingBox(lat, lon, radiusM);

  const locations = await prisma.userLocation.findMany({
    where: {
      lat:       { gte: bbox.minLat, lte: bbox.maxLat },
      lon:       { gte: bbox.minLon, lte: bbox.maxLon },
      updatedAt: { gte: staleThreshold },
      ...(excludeUserIds.length ? { userId: { notIn: excludeUserIds } } : {}),
    },
    select: { userId: true, lat: true, lon: true },
  });

  // Exact Haversine filter
  const nearbyUserIds = locations
    .filter((l) => haversineM(lat, lon, l.lat, l.lon) <= radiusM)
    .map((l) => l.userId);

  if (!nearbyUserIds.length) return { tokens: [], userIds: [] };

  const rows = await prisma.pushToken.findMany({
    where: { userId: { in: nearbyUserIds }, isActive: true },
    select: { token: true, userId: true },
  });

  return {
    tokens:  rows.map((r) => r.token),
    userIds: [...new Set(rows.map((r) => r.userId))],
  };
}

/**
 * Send a push notification to one or more targets.
 */
export async function sendPush(
  filter: PushFilter,
  notification: { title: string; body: string; data?: Record<string, unknown>; priority?: "normal" | "high" }
): Promise<number> {
  const E2E = process.env.E2E_TEST === "1" || (process.env.DATABASE_URL ?? "").includes("USER:PASSWORD");
  if (E2E) return 0; // skip in test mode

  let tokens: string[] = [];

  if (filter.tokens?.length) {
    tokens = filter.tokens;
  } else if (
    filter.nearbyLat !== undefined &&
    filter.nearbyLon !== undefined &&
    filter.nearbyRadiusM !== undefined
  ) {
    // Proximity-based: bounding box + Haversine
    const result = await findNearbyTokens(
      filter.nearbyLat,
      filter.nearbyLon,
      filter.nearbyRadiusM,
      filter.excludeUserIds ?? [],
    );
    tokens = result.tokens;
  } else {
    // Build Prisma where clause
    const where: Record<string, unknown> = { isActive: true };
    if (filter.userId) {
      where.userId = filter.userId;
    } else if (filter.pinCode) {
      where.user = { localities: { some: { pinCode: filter.pinCode } } };
    } else if (filter.societyId) {
      where.user = { residences: { some: { societyId: filter.societyId } } };
    }
    // "all" = no extra filter
    const rows = await prisma.pushToken.findMany({ where, select: { token: true } });
    tokens = rows.map((r) => r.token);
  }

  if (!tokens.length) return 0;

  const baseMessage = {
    title:    notification.title,
    body:     notification.body,
    data:     notification.data,
    sound:    "default" as const,
    priority: (notification.priority ?? "high") as "normal" | "high",
  };

  let sent = 0;
  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const chunk = tokens.slice(i, i + BATCH_SIZE);
    await sendBatch([{ ...baseMessage, to: chunk }]);
    sent += chunk.length;
  }
  return sent;
}

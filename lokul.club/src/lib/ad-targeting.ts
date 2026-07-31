/**
 * Shared ad-targeting types and matching helpers.
 *
 * Phase 1 (contextual — no auth, no privacy surface): daypart, day-of-week,
 * content category, and multi-pincode/radius (resolved to concrete AdBooking
 * rows at booking-creation time, not matched here).
 *
 * Phase 2/3 (audience — requires a consenting logged-in user): interest
 * cohorts, society/tower membership, "new resident" recency, and self-declared
 * age band. Stored in AdCampaign.targeting (JSON) and only ever matched when
 * the viewer is authenticated AND has personalizedAds enabled — see
 * resolveAudience() below.
 */
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireMobileAuth } from "@/lib/mobile-auth";
import type { CommunityType, AgeBand } from "@/generated/prisma/enums";

export const DAYPARTS = ["morning", "afternoon", "evening", "night"] as const;
export type Daypart = (typeof DAYPARTS)[number];

export interface AdTargetingJson {
  interestCohorts?: CommunityType[];
  societyIds?: string[];
  newResidentsOnly?: boolean;
  ageBands?: AgeBand[];
}

const NEW_RESIDENT_WINDOW_DAYS = 90;

/** Server-local hour bucket — advertiser dayparts are wall-clock, not per-user timezone. */
export function currentDaypart(now: Date): Daypart {
  const h = now.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

export function matchesDaysOfWeek(daysOfWeek: number[], now: Date): boolean {
  return daysOfWeek.length === 0 || daysOfWeek.includes(now.getDay());
}

export function matchesDaypart(daypart: string | null, now: Date): boolean {
  return !daypart || daypart === currentDaypart(now);
}

/** categories: [] on the creative means "matches any content category". */
export function matchesCategory(creativeCategories: string[], requestedCategory: string | null): boolean {
  if (!requestedCategory) return true; // generic placements show any creative
  return creativeCategories.length === 0 || creativeCategories.includes(requestedCategory);
}

/** True if this campaign's targeting JSON specifies any audience restriction. */
export function hasAudienceTargeting(targeting: AdTargetingJson | null | undefined): boolean {
  if (!targeting) return false;
  return Boolean(
    targeting.interestCohorts?.length ||
    targeting.societyIds?.length ||
    targeting.newResidentsOnly ||
    targeting.ageBands?.length
  );
}

export interface ResolvedAudience {
  userId: string;
  interestCohorts: CommunityType[];
  societyIds: string[];
  isNewResident: boolean;
  ageBand: AgeBand | null;
}

/**
 * Resolves the requesting user's audience attributes for targeting — but ONLY
 * if they're authenticated AND have personalizedAds enabled. Returns null
 * otherwise (anonymous traffic, or a logged-in user who opted out), in which
 * case callers must restrict serving to untargeted creatives only.
 */
export async function resolveAudience(req: Request): Promise<ResolvedAudience | null> {
  let userId = requireMobileAuth(req);
  if (!userId) {
    const session = await getServerSession(authOptions).catch(() => null);
    userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  }
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ageBand: true,
      privacySettings: true,
      residences: { select: { societyId: true, verifiedAt: true }, where: { isPrimary: true }, take: 1 },
      communityMemberships: { select: { community: { select: { type: true } } } },
    },
  });
  if (!user) return null;

  const privacy = user.privacySettings as { personalizedAds?: boolean } | null;
  if (!privacy?.personalizedAds) return null; // opt-in required — default is off

  const residence = user.residences[0];
  const isNewResident = Boolean(
    residence?.verifiedAt &&
    Date.now() - residence.verifiedAt.getTime() < NEW_RESIDENT_WINDOW_DAYS * 24 * 60 * 60 * 1000
  );

  return {
    userId,
    interestCohorts: user.communityMemberships.map((m) => m.community.type),
    societyIds: residence ? [residence.societyId] : [],
    isNewResident,
    ageBand: user.ageBand,
  };
}

/** True if a resolved audience satisfies ALL restrictions a campaign specified. */
export function audienceMatches(targeting: AdTargetingJson, audience: ResolvedAudience): boolean {
  if (targeting.interestCohorts?.length && !targeting.interestCohorts.some((c) => audience.interestCohorts.includes(c))) {
    return false;
  }
  if (targeting.societyIds?.length && !targeting.societyIds.some((s) => audience.societyIds.includes(s))) {
    return false;
  }
  if (targeting.newResidentsOnly && !audience.isNewResident) {
    return false;
  }
  if (targeting.ageBands?.length && (!audience.ageBand || !targeting.ageBands.includes(audience.ageBand))) {
    return false;
  }
  return true;
}

const EARTH_RADIUS_KM = 6371;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Resolves a center pincode + radius to the set of pincodes within range,
 * using Society.lat/lng. Snapshotted once at booking-creation time (matching
 * the existing single-pincode design) rather than a live geo query on every
 * ad-serve request — new societies added later within the radius won't
 * automatically join a campaign created earlier.
 */
export async function resolvePincodesInRadius(centerPinCode: string, radiusKm: number): Promise<string[]> {
  const center = await prisma.society.findFirst({
    where: { pinCode: centerPinCode, lat: { not: null }, lng: { not: null } },
    select: { lat: true, lng: true },
  });
  if (!center?.lat || !center?.lng) return [centerPinCode]; // no geo data — fall back to exact match

  const candidates = await prisma.society.findMany({
    where: { lat: { not: null }, lng: { not: null } },
    select: { pinCode: true, lat: true, lng: true },
  });

  const within = candidates.filter(
    (s) => s.lat != null && s.lng != null && haversineKm(center.lat!, center.lng!, s.lat, s.lng) <= radiusKm
  );
  const pincodes = new Set(within.map((s) => s.pinCode));
  pincodes.add(centerPinCode);
  return [...pincodes];
}

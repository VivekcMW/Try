/**
 * Location Tracker — reports device GPS to /api/mobile/location for proximity SOS.
 *
 * Behaviour:
 *  • Asks for "whenInUse" permission.
 *  • Watches position while the app is in the foreground.
 *  • Sends an update to the server on:
 *    - First fix
 *    - Every move of more than DISTANCE_THRESHOLD_M metres
 *    - At most once every THROTTLE_MS milliseconds (even for large moves)
 *  • Automatically stops when `stopTracking()` is called or the component unmounts.
 *
 * Usage:
 *   import { startTracking, stopTracking } from '@/lib/locationTracker';
 *
 *   useEffect(() => {
 *     startTracking(userId);
 *     return () => stopTracking();
 *   }, [userId]);
 */

import * as Location from 'expo-location';

const BASE                  = process.env.EXPO_PUBLIC_API_BASE ?? '';
const DISTANCE_THRESHOLD_M  = 50;   // only report if moved more than 50 m
const THROTTLE_MS           = 5 * 60 * 1_000; // max one report per 5 min

let subscription: Location.LocationSubscription | null = null;
let lastReportedLat: number | null = null;
let lastReportedLon: number | null = null;
let lastReportedAt = 0;

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R     = 6_371_000;
  const dLat  = ((lat2 - lat1) * Math.PI) / 180;
  const dLon  = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function reportLocation(userId: string, lat: number, lon: number, accuracy: number | null) {
  try {
    await fetch(`${BASE}/api/mobile/location`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ userId, lat, lon, accuracy }),
    });
    lastReportedLat = lat;
    lastReportedLon = lon;
    lastReportedAt  = Date.now();
  } catch {
    // Non-critical — silently ignore network failures
  }
}

/**
 * Start tracking the user's location.  Safe to call multiple times;
 * the previous subscription is automatically cleaned up.
 */
export async function startTracking(userId: string): Promise<void> {
  if (!userId) return;

  // Stop any existing subscription
  stopTracking();

  // Request foreground permission
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return;

  subscription = await Location.watchPositionAsync(
    {
      accuracy:           Location.Accuracy.Balanced,
      distanceInterval:   DISTANCE_THRESHOLD_M,
      timeInterval:       THROTTLE_MS,
    },
    async (location) => {
      const { latitude: lat, longitude: lon, accuracy } = location.coords;
      const now = Date.now();

      const movedFarEnough =
        lastReportedLat === null ||
        lastReportedLon === null ||
        haversineM(lastReportedLat, lastReportedLon, lat, lon) >= DISTANCE_THRESHOLD_M;

      const enoughTimeElapsed = now - lastReportedAt >= THROTTLE_MS;

      if (movedFarEnough || enoughTimeElapsed) {
        await reportLocation(userId, lat, lon, accuracy);
      }
    },
  );
}

/** Stop watching position and clean up. */
export function stopTracking(): void {
  if (subscription) {
    subscription.remove();
    subscription      = null;
    lastReportedLat   = null;
    lastReportedLon   = null;
    lastReportedAt    = 0;
  }
}

/**
 * One-shot: get current position and report it immediately.
 * Useful when the SOS button is tapped — ensures we have the freshest location.
 */
export async function reportCurrentLocation(userId: string): Promise<{ lat: number; lon: number } | null> {
  if (!userId) return null;
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    const { latitude: lat, longitude: lon, accuracy } = location.coords;
    await reportLocation(userId, lat, lon, accuracy);
    return { lat, lon };
  } catch {
    return null;
  }
}

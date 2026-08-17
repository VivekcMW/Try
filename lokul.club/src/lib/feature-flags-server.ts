/**
 * Feature Flags Server Utilities
 * 
 * Server-side only functions for checking feature flags.
 * These use Prisma and should NOT be imported in client components.
 * 
 * Usage: 
 * - In API routes: import { isFeatureEnabled } from '@/lib/feature-flags-server'
 * - In Server Components: import { getEnabledFeatures } from '@/lib/feature-flags-server'
 */

import { prisma } from './prisma';

export type FlagContext = {
  pinCode?: string | null;
  societyId?: string | null;
  city?: string | null;
  userId?: string | null;
};

const SCOPE_PRIORITY: Record<string, number> = { global: 0, city: 1, pincode: 2, society: 3, user: 4 };

/**
 * Check if a feature is enabled, resolving admin-configured scope overrides
 * (global < city < pincode < society < user — most specific wins), matching
 * the resolution order used by GET /api/mobile/flags.
 *
 * Pass locality/user context when available so per-society/city/pincode/user
 * overrides set in /admin/flags actually take effect; omitting context falls
 * back to the global flag only.
 *
 * Use on server-side only (API routes, server components).
 */
export async function isFeatureEnabled(
  featureKey: string,
  context: FlagContext = {}
): Promise<boolean> {
  try {
    const { pinCode, societyId, city, userId } = context;
    const flags = await prisma.featureFlag.findMany({
      where: {
        key: featureKey,
        OR: [
          { scope: 'global' },
          ...(city ? [{ scope: 'city' as const, scopeValue: city }] : []),
          ...(pinCode ? [{ scope: 'pincode' as const, scopeValue: pinCode }] : []),
          ...(societyId ? [{ scope: 'society' as const, scopeValue: societyId }] : []),
          ...(userId ? [{ scope: 'user' as const, scopeValue: userId }] : []),
        ],
      },
      select: { scope: true, enabled: true },
    });

    let resolved: boolean | undefined;
    let resolvedPriority = -1;
    for (const flag of flags) {
      const p = SCOPE_PRIORITY[flag.scope] ?? 0;
      if (p >= resolvedPriority) {
        resolved = flag.enabled;
        resolvedPriority = p;
      }
    }

    // If flag doesn't exist, default to disabled for safety
    return resolved ?? false;
  } catch (error) {
    console.error(`Error checking feature flag ${featureKey}:`, error);
    return false; // Fail closed - disable feature if check fails
  }
}

/**
 * Get all enabled features (for bulk checking)
 * Use on server-side to send to client
 */
export async function getEnabledFeatures(): Promise<string[]> {
  try {
    const flags = await prisma.featureFlag.findMany({
      where: {
        enabled: true,
        scope: 'global',
      },
      select: { key: true },
    });

    return flags.map(f => f.key);
  } catch (error) {
    console.error('Error fetching enabled features:', error);
    return [];
  }
}

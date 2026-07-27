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

/**
 * Check if a feature is enabled
 * Use on server-side only (API routes, server components)
 */
export async function isFeatureEnabled(
  featureKey: string,
  scope: 'global' | 'society' | 'city' | 'pincode' | 'user' = 'global',
  scopeValue: string | null = null
): Promise<boolean> {
  try {
    const flag = await prisma.featureFlag.findFirst({
      where: {
        key: featureKey,
        scope,
        scopeValue,
      },
      select: { enabled: true },
    });

    // If flag doesn't exist, default to disabled for safety
    return flag?.enabled ?? false;
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

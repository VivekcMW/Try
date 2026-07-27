/**
 * GET /api/features
 * 
 * Returns list of enabled feature flags.
 * Used by mobile app and web app to conditionally show/hide features.
 * 
 * Response format:
 * {
 *   "enabled": ["feed", "services", "wallet", "classifieds", ...],
 *   "metadata": { "feed": { name: "Home Feed", ... }, ... }
 * }
 */

import { NextResponse } from 'next/server';
import { getEnabledFeatures } from '@/lib/feature-flags-server';
import { FEATURE_METADATA } from '@/lib/feature-flags';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const enabled = await getEnabledFeatures();

    return NextResponse.json({
      enabled,
      metadata: FEATURE_METADATA,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    
    // Fail safe - return only Phase 1 core features if DB fails
    return NextResponse.json(
      {
        enabled: [
          'feed',
          'services',
          'wallet',
          'classifieds',
          'events',
          'lost_found',
          'safety_contacts',
          'shop_directory',
        ],
        metadata: FEATURE_METADATA,
        timestamp: new Date().toISOString(),
        error: 'Failed to fetch from database, returning safe defaults',
      },
      { status: 500 }
    );
  }
}

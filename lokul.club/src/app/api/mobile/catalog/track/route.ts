import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Track user catalog activity for ML recommendation system
 * 
 * POST body:
 * {
 *   userId: string (required)
 *   activityType: 'view_merchant' | 'view_catalog_item' | 'search' | 'order_placed' | 'add_to_cart' | 'favorite' | 'share'
 *   merchantId?: string
 *   catalogItemId?: string
 *   category?: string
 *   durationSec?: number (how long user viewed)
 *   metadata?: object (any additional context)
 *   lat?: number (user location)
 *   lng?: number (user location)
 * }
 * 
 * Note: This endpoint is fire-and-forget for performance.
 * It should not block user interactions.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
      activityType,
      merchantId,
      catalogItemId,
      category,
      durationSec,
      metadata,
      lat,
      lng,
    } = body;

    // Validate required fields
    if (!userId || !activityType) {
      return NextResponse.json(
        { error: 'userId and activityType are required' },
        { status: 400 }
      );
    }

    // Validate activityType enum
    const validTypes = [
      'view_merchant',
      'view_catalog_item',
      'search',
      'order_placed',
      'add_to_cart',
      'favorite',
      'share',
    ];

    if (!validTypes.includes(activityType)) {
      return NextResponse.json(
        { error: `Invalid activityType. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify user exists (quick check)
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create activity record
    const activity = await prisma.userCatalogActivity.create({
      data: {
        userId,
        activityType,
        merchantId: merchantId || null,
        catalogItemId: catalogItemId || null,
        category: category || null,
        durationSec: durationSec || null,
        metadata: metadata || null,
        lat: lat || null,
        lng: lng || null,
      },
    });

    // Trigger async interest profile update (fire-and-forget)
    // In production, this would be a queue job or background task
    updateUserInterestProfile(userId).catch((err) => {
      console.error('[Interest Profile Update Error]:', err);
    });

    return NextResponse.json({
      success: true,
      data: {
        id: activity.id,
        recorded: true,
      },
    });
  } catch (error) {
    console.error('[Catalog Track API Error]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update user interest profile based on recent activity
 * This runs async and doesn't block the tracking response
 */
async function updateUserInterestProfile(userId: string) {
  try {
    // Get last 30 days of activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activities = await prisma.userCatalogActivity.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        merchant: {
          select: {
            category: true,
            deliveryFeePaise: true,
          },
        },
        catalogItem: {
          select: {
            pricePaise: true,
            attributes: true,
          },
        },
      },
    });

    if (activities.length === 0) {
      return; // Not enough data yet
    }

    // Analyze categories
    const categoryMap: Record<string, number> = {};
    activities.forEach((a) => {
      const cat = a.category || a.merchant?.category;
      if (cat) {
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      }
    });

    // Get top 5 categories
    const topCategories = Object.entries(categoryMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    // Analyze price range from catalog item views
    const prices = activities
      .filter((a) => a.catalogItem?.pricePaise)
      .map((a) => a.catalogItem!.pricePaise);

    let preferredPriceRange: string | null = null;
    if (prices.length > 0) {
      const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      preferredPriceRange = JSON.stringify({
        avgPaise: Math.round(avg),
        minPaise: min,
        maxPaise: max,
      });
    }

    // Calculate order frequency
    const orders = activities.filter((a) => a.activityType === 'order_placed');
    const avgOrderFrequency = orders.length > 0 ? Math.round(orders.length / 4.3) : 0; // per week

    // Analyze time slots (when user is most active)
    const hourMap: Record<number, number> = {};
    activities.forEach((a) => {
      const hour = a.createdAt.getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });

    const favoriteTimeSlots = Object.entries(hourMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Analyze dietary preferences from catalog item attributes
    const dietaryPrefs: Set<string> = new Set();
    activities.forEach((a) => {
      if (a.catalogItem?.attributes) {
        const attrs = a.catalogItem.attributes as any;
        if (attrs.isVeg) dietaryPrefs.add('vegetarian');
        if (attrs.isVegan) dietaryPrefs.add('vegan');
        if (attrs.isGlutenFree) dietaryPrefs.add('gluten-free');
        if (attrs.isHalal) dietaryPrefs.add('halal');
      }
    });

    // Upsert interest profile
    await prisma.userInterestProfile.upsert({
      where: { userId },
      create: {
        userId,
        topCategories,
        preferredPriceRange,
        avgOrderFrequency,
        favoriteTimeSlots,
        dietaryPreferences: Array.from(dietaryPrefs),
        lastUpdated: new Date(),
      },
      update: {
        topCategories,
        preferredPriceRange,
        avgOrderFrequency,
        favoriteTimeSlots,
        dietaryPreferences: Array.from(dietaryPrefs),
        lastUpdated: new Date(),
      },
    });

    console.log(`[Interest Profile] Updated for user ${userId}`);
  } catch (error) {
    console.error('[updateUserInterestProfile Error]:', error);
    throw error;
  }
}

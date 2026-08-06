import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Get personalized merchant recommendations for a user
 * 
 * Query params:
 * - userId: User ID (required)
 * - lat: User latitude (optional)
 * - lng: User longitude (optional)
 * - limit: Max results (default: 10)
 * - excludeVisited: Exclude recently visited merchants (default: false)
 */

// Haversine distance
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const userId = searchParams.get('userId');
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const limit = parseInt(searchParams.get('limit') || '10');
    const excludeVisited = searchParams.get('excludeVisited') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const hasCoordinates = !isNaN(lat) && !isNaN(lng);

    // Fetch user interest profile
    const interestProfile = await prisma.userInterestProfile.findUnique({
      where: { userId },
    });

    // Get recently visited merchants (last 7 days) if excludeVisited
    let visitedMerchantIds: string[] = [];
    if (excludeVisited) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentActivity = await prisma.userCatalogActivity.findMany({
        where: {
          userId,
          activityType: { in: ['view_merchant', 'order_placed'] },
          createdAt: { gte: sevenDaysAgo },
        },
        distinct: ['merchantId'],
        select: { merchantId: true },
      });

      visitedMerchantIds = recentActivity
        .map((a) => a.merchantId)
        .filter((id): id is string => id !== null);
    }

    // Build where clause
    const where: any = {
      status: 'active',
      isBlacklisted: false,
      acceptingOrders: true,
    };

    if (excludeVisited && visitedMerchantIds.length > 0) {
      where.id = { notIn: visitedMerchantIds };
    }

    if (hasCoordinates) {
      where.lat = { not: null };
      where.lng = { not: null };
    }

    // If user has interest profile, filter by preferred categories
    if (interestProfile?.topCategories) {
      const topCats = (interestProfile.topCategories as any[]).map((c) => c.category);
      if (topCats.length > 0) {
        where.category = { in: topCats };
      }
    }

    // Fetch merchants
    const merchants = await prisma.merchant.findMany({
      where,
      include: {
        offers: {
          where: {
            isActive: true,
            startsAt: { lte: new Date() },
            endsAt: { gte: new Date() },
          },
          take: 1,
        },
        catalogItems: {
          take: 5,
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      take: limit * 3, // Fetch more than needed for scoring
    });

    // Score and rank merchants
    const merchantsWithScores = merchants.map((merchant) => {
      let score = 0;
      let distance = 0;

      // Distance score (closer = better)
      if (hasCoordinates && merchant.lat && merchant.lng) {
        distance = calculateDistance(lat, lng, merchant.lat, merchant.lng);
        score += Math.max(0, 10 - distance) * 0.3; // Max 10km, 30% weight
      }

      // Category match score
      if (interestProfile?.topCategories) {
        const topCats = interestProfile.topCategories as any[];
        const matchingCat = topCats.find(
          (c: any) => c.category === merchant.category
        );
        if (matchingCat) {
          score += (matchingCat.count / 10) * 0.25; // 25% weight
        }
      }

      // Rating score
      if (merchant.ratingAvg) {
        score += (merchant.ratingAvg / 5) * 0.2; // 20% weight
      }

      // Popularity score (order count)
      const orderCount = merchant._count.orders;
      score += Math.min(orderCount / 100, 1) * 0.15; // 15% weight, cap at 100

      // Subscription tier boost
      if (merchant.subscriptionTier === 'premium') {
        score += 0.05;
      } else if (merchant.subscriptionTier === 'plus') {
        score += 0.03;
      }

      // Endorsement boost
      if (merchant.isEndorsed) {
        score += 0.02;
      }

      return {
        ...merchant,
        distance,
        distanceKm: parseFloat(distance.toFixed(2)),
        recommendationScore: parseFloat(score.toFixed(2)),
        hasOffer: merchant.offers.length > 0,
      };
    });

    // Sort by recommendation score
    merchantsWithScores.sort((a, b) => b.recommendationScore - a.recommendationScore);

    // Take top N
    const topMerchants = merchantsWithScores.slice(0, limit);

    // Format response
    const response = topMerchants.map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category,
      description: m.description,
      avatarUrl: m.avatarUrl,
      lat: m.lat,
      lng: m.lng,
      distanceKm: hasCoordinates ? m.distanceKm : null,
      rating: m.ratingAvg,
      ratingCount: m.ratingCount,
      recommendationScore: m.recommendationScore,
      subscriptionTier: m.subscriptionTier,
      isEndorsed: m.isEndorsed,
      hasOffer: m.hasOffer,
      offer: m.offers[0]
        ? {
            id: m.offers[0].id,
            title: m.offers[0].title,
            type: m.offers[0].type,
            value: m.offers[0].value,
          }
        : null,
      popularItems: m.catalogItems.slice(0, 3).map((item) => ({
        id: item.id,
        name: item.name,
        pricePaise: item.pricePaise,
        imageUrl: item.imageUrl,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        total: topMerchants.length,
        limit,
        hasInterestProfile: !!interestProfile,
        filters: {
          userId,
          lat: hasCoordinates ? lat : null,
          lng: hasCoordinates ? lng : null,
          excludeVisited,
        },
      },
    });
  } catch (error) {
    console.error('[Catalog Recommendations API Error]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

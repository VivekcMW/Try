import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Get trending merchants (popular + highly rated)
 * 
 * Query params:
 * - lat: User latitude (optional)
 * - lng: User longitude (optional)
 * - pinCode: User's pin code (optional, fallback if no lat/lng)
 * - radius: Search radius in km if lat/lng provided (default: 10)
 * - days: Consider orders from last N days (default: 7)
 * - limit: Max results (default: 10)
 * - category: Filter by category (optional)
 */

// Haversine formula
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

// Calculate trending score
function calculateTrendingScore(
  orderCount: number,
  rating: number,
  distance: number,
  daysActive: number
): number {
  // Weighted formula:
  // - Order count: 40% (orders in last 7 days)
  // - Rating: 30% (4.0-5.0 scale)
  // - Proximity: 20% (closer is better)
  // - Recency: 10% (newer merchants get boost)
  
  const orderScore = Math.min(orderCount / 50, 1) * 0.4; // Normalize to 50 orders
  const ratingScore = ((rating || 4.0) / 5.0) * 0.3;
  const proximityScore = Math.max(0, 1 - distance / 20) * 0.2; // 20km = 0
  const recencyScore = Math.min(daysActive / 180, 1) * 0.1; // 6 months = max
  
  return orderScore + ratingScore + proximityScore + recencyScore;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const pinCode = searchParams.get('pinCode');
    const radius = parseFloat(searchParams.get('radius') || '10');
    const days = parseInt(searchParams.get('days') || '7');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');

    // Validate location (either lat/lng or pinCode required)
    const hasCoordinates = !isNaN(lat) && !isNaN(lng);
    if (!hasCoordinates && !pinCode) {
      return NextResponse.json(
        { error: 'Either lat/lng or pinCode is required' },
        { status: 400 }
      );
    }

    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Build where clause
    const where: any = {
      status: 'active',
      isBlacklisted: false,
      acceptingOrders: true,
    };

    if (category) {
      where.category = category;
    }

    if (hasCoordinates) {
      where.lat = { not: null };
      where.lng = { not: null };
    } else if (pinCode) {
      where.pinCode = pinCode;
    }

    // Fetch merchants with recent orders
    const merchants = await prisma.merchant.findMany({
      where,
      include: {
        orders: {
          where: {
            createdAt: { gte: dateThreshold },
            status: 'completed',
          },
          select: { id: true, createdAt: true },
        },
        offers: {
          where: {
            isActive: true,
            startsAt: { lte: new Date() },
            endsAt: { gte: new Date() },
          },
          take: 1,
        },
      },
    });

    // Calculate scores and filter
    const merchantsWithScores = merchants
      .map((merchant) => {
        let distance = 0;
        if (hasCoordinates && merchant.lat && merchant.lng) {
          distance = calculateDistance(lat, lng, merchant.lat, merchant.lng);
        }

        const orderCount = merchant.orders.length;
        const daysActive = Math.floor(
          (Date.now() - merchant.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        const trendingScore = calculateTrendingScore(
          orderCount,
          merchant.ratingAvg || 4.0,
          distance,
          daysActive
        );

        return {
          ...merchant,
          distance,
          distanceKm: parseFloat(distance.toFixed(2)),
          orderCount,
          trendingScore,
          hasOffer: merchant.offers.length > 0,
        };
      })
      .filter((m) => {
        // Filter by radius if coordinates provided
        if (hasCoordinates) {
          return m.distance <= radius;
        }
        return true;
      })
      .filter((m) => m.orderCount > 0 || (m.ratingAvg || 0) >= 4.5); // Only trending merchants

    // Sort by trending score
    merchantsWithScores.sort((a, b) => b.trendingScore - a.trendingScore);

    // Take top N
    const trendingMerchants = merchantsWithScores.slice(0, limit);

    // Clean up response
    const response = trendingMerchants.map((m) => ({
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
      recentOrders: m.orderCount,
      trendingScore: parseFloat(m.trendingScore.toFixed(2)),
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
    }));

    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        total: trendingMerchants.length,
        limit,
        filters: {
          lat: hasCoordinates ? lat : null,
          lng: hasCoordinates ? lng : null,
          pinCode: pinCode || null,
          radius: hasCoordinates ? radius : null,
          days,
          category,
        },
      },
    });
  } catch (error) {
    console.error('[Catalog Trending API Error]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

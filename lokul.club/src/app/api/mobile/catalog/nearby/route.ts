import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Get nearby merchants by category and location
 * 
 * Query params:
 * - lat: User latitude (required)
 * - lng: User longitude (required)
 * - radius: Search radius in km (default: 5)
 * - category: Filter by category (optional)
 * - openNow: Filter by open now (optional, boolean)
 * - minRating: Minimum rating filter (optional, float 0-5)
 * - sort: Sort by distance|rating|popularity (default: distance)
 * - limit: Max results (default: 20)
 * - offset: Pagination offset (default: 0)
 */

// Haversine formula to calculate distance between two lat/lng points
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
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

// Check if merchant is currently open
function isOpenNow(merchant: any): boolean {
  if (!merchant.businessHoursStart || !merchant.businessHoursEnd) {
    return true; // Assume open if hours not set
  }

  const now = new Date();
  const currentTime = now.getHours() * 100 + now.getMinutes(); // Format: HHMM
  const [startHour, startMin] = merchant.businessHoursStart.split(':').map(Number);
  const [endHour, endMin] = merchant.businessHoursEnd.split(':').map(Number);
  const startTime = startHour * 100 + startMin;
  const endTime = endHour * 100 + endMin;

  return currentTime >= startTime && currentTime <= endTime;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');
    const radius = parseFloat(searchParams.get('radius') || '5');
    const category = searchParams.get('category');
    const openNowFilter = searchParams.get('openNow') === 'true';
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const sort = searchParams.get('sort') || 'distance';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate required parameters
    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Invalid or missing lat/lng parameters' },
        { status: 400 }
      );
    }

    // Build where clause
    const where: any = {
      status: 'active', // Only show active merchants
      isBlacklisted: false,
      lat: { not: null },
      lng: { not: null },
    };

    if (category) {
      where.category = category;
    }

    if (minRating > 0) {
      where.ratingAvg = { gte: minRating };
    }

    // Fetch merchants with basic filters
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
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    // Calculate distance and filter by radius
    const merchantsWithDistance = merchants
      .map((merchant) => {
        const distance = calculateDistance(lat, lng, merchant.lat!, merchant.lng!);
        return {
          ...merchant,
          distance,
          distanceKm: parseFloat(distance.toFixed(2)),
          isOpenNow: isOpenNow(merchant),
          hasOffer: merchant.offers.length > 0,
          offer: merchant.offers[0] || null,
          orderCount: merchant._count.orders,
        };
      })
      .filter((m) => m.distance <= radius);

    // Filter by open now if requested
    let filteredMerchants = openNowFilter
      ? merchantsWithDistance.filter((m) => m.isOpenNow && m.acceptingOrders)
      : merchantsWithDistance;

    // Sort merchants
    switch (sort) {
      case 'rating':
        filteredMerchants.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
        break;
      case 'popularity':
        filteredMerchants.sort((a, b) => b.orderCount - a.orderCount);
        break;
      case 'distance':
      default:
        filteredMerchants.sort((a, b) => a.distance - b.distance);
        break;
    }

    // Pagination
    const paginatedMerchants = filteredMerchants.slice(offset, offset + limit);

    // Clean up response (remove internal fields)
    const response = paginatedMerchants.map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category,
      description: m.description,
      avatarUrl: m.avatarUrl,
      lat: m.lat,
      lng: m.lng,
      distanceKm: m.distanceKm,
      rating: m.ratingAvg,
      ratingCount: m.ratingCount,
      isOpenNow: m.isOpenNow,
      acceptingOrders: m.acceptingOrders,
      closedReason: m.closedReason,
      businessHours: {
        start: m.businessHoursStart,
        end: m.businessHoursEnd,
      },
      estimatedDeliveryMins: m.estimatedDeliveryMins,
      deliveryFeePaise: m.deliveryFeePaise,
      minimumOrderPaise: m.minimumOrderPaise,
      freeDeliveryAbovePaise: m.freeDeliveryAbovePaise,
      offer: m.offer
        ? {
            id: m.offer.id,
            title: m.offer.title,
            type: m.offer.type,
            value: m.offer.value,
            minSpendPaise: m.offer.minSpendPaise,
          }
        : null,
      subscriptionTier: m.subscriptionTier,
      isEndorsed: m.isEndorsed,
    }));

    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        total: filteredMerchants.length,
        limit,
        offset,
        hasMore: filteredMerchants.length > offset + limit,
        filters: {
          lat,
          lng,
          radius,
          category,
          openNow: openNowFilter,
          minRating,
          sort,
        },
      },
    });
  } catch (error) {
    console.error('[Catalog Nearby API Error]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

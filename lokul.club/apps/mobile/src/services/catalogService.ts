import { apiFetch } from './apiClient';

export interface MerchantNearby {
  id: string;
  name: string;
  category: string;
  description: string | null;
  avatarUrl: string | null;
  lat: number;
  lng: number;
  distanceKm: number;
  rating: number | null;
  ratingCount: number;
  isOpenNow: boolean;
  acceptingOrders: boolean;
  closedReason: string | null;
  businessHours: {
    start: string | null;
    end: string | null;
  };
  estimatedDeliveryMins: number | null;
  deliveryFeePaise: number | null;
  minimumOrderPaise: number | null;
  freeDeliveryAbovePaise: number | null;
  offer: {
    id: string;
    title: string;
    type: string;
    value: number;
    minSpendPaise: number | null;
  } | null;
  subscriptionTier: string | null;
  isEndorsed: boolean;
}

export interface MerchantTrending {
  id: string;
  name: string;
  category: string;
  description: string | null;
  avatarUrl: string | null;
  lat: number | null;
  lng: number | null;
  distanceKm: number | null;
  rating: number | null;
  ratingCount: number;
  recentOrders: number;
  trendingScore: number;
  subscriptionTier: string | null;
  isEndorsed: boolean;
  hasOffer: boolean;
  offer: {
    id: string;
    title: string;
    type: string;
    value: number;
  } | null;
}

export interface MerchantRecommendation {
  id: string;
  name: string;
  category: string;
  description: string | null;
  avatarUrl: string | null;
  lat: number | null;
  lng: number | null;
  distanceKm: number | null;
  rating: number | null;
  ratingCount: number;
  recommendationScore: number;
  subscriptionTier: string | null;
  isEndorsed: boolean;
  hasOffer: boolean;
  offer: {
    id: string;
    title: string;
    type: string;
    value: number;
  } | null;
  popularItems: {
    id: string;
    name: string;
    pricePaise: number;
    imageUrl: string | null;
  }[];
}

export interface NearbyParams {
  lat: number;
  lng: number;
  radius?: number;
  category?: string;
  openNow?: boolean;
  minRating?: number;
  sort?: 'distance' | 'rating' | 'popularity';
  limit?: number;
  offset?: number;
}

export interface TrendingParams {
  lat?: number;
  lng?: number;
  pinCode?: string;
  radius?: number;
  days?: number;
  limit?: number;
  category?: string;
}

export interface RecommendationsParams {
  userId: string;
  lat?: number;
  lng?: number;
  limit?: number;
  excludeVisited?: boolean;
}

export interface TrackActivityParams {
  userId: string;
  activityType: 'view_merchant' | 'view_catalog_item' | 'search' | 'order_placed' | 'add_to_cart' | 'favorite' | 'share';
  merchantId?: string;
  catalogItemId?: string;
  category?: string;
  durationSec?: number;
  metadata?: Record<string, unknown>;
  lat?: number;
  lng?: number;
}

/**
 * Fetch nearby merchants based on user location
 */
export async function getNearbyMerchants(params: NearbyParams) {
  const searchParams = new URLSearchParams();
  searchParams.append('lat', params.lat.toString());
  searchParams.append('lng', params.lng.toString());
  if (params.radius) searchParams.append('radius', params.radius.toString());
  if (params.category) searchParams.append('category', params.category);
  if (params.openNow) searchParams.append('openNow', 'true');
  if (params.minRating) searchParams.append('minRating', params.minRating.toString());
  if (params.sort) searchParams.append('sort', params.sort);
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.offset) searchParams.append('offset', params.offset.toString());

  const response = await apiFetch<{
    success: boolean;
    data: MerchantNearby[];
    meta: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }>(`/api/mobile/catalog/nearby?${searchParams.toString()}`, {
    skipAuth: true,
  });

  return response;
}

/**
 * Fetch trending merchants
 */
export async function getTrendingMerchants(params: TrendingParams) {
  const searchParams = new URLSearchParams();
  if (params.lat) searchParams.append('lat', params.lat.toString());
  if (params.lng) searchParams.append('lng', params.lng.toString());
  if (params.pinCode) searchParams.append('pinCode', params.pinCode);
  if (params.radius) searchParams.append('radius', params.radius.toString());
  if (params.days) searchParams.append('days', params.days.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.category) searchParams.append('category', params.category);

  const response = await apiFetch<{
    success: boolean;
    data: MerchantTrending[];
    meta: {
      total: number;
      limit: number;
    };
  }>(`/api/mobile/catalog/trending?${searchParams.toString()}`, {
    skipAuth: true,
  });

  return response;
}

/**
 * Fetch personalized recommendations for a user
 */
export async function getRecommendations(params: RecommendationsParams) {
  const searchParams = new URLSearchParams();
  searchParams.append('userId', params.userId);
  if (params.lat) searchParams.append('lat', params.lat.toString());
  if (params.lng) searchParams.append('lng', params.lng.toString());
  if (params.limit) searchParams.append('limit', params.limit.toString());
  if (params.excludeVisited) searchParams.append('excludeVisited', 'true');

  const response = await apiFetch<{
    success: boolean;
    data: MerchantRecommendation[];
    meta: {
      total: number;
      limit: number;
      hasInterestProfile: boolean;
    };
  }>(`/api/mobile/catalog/recommendations?${searchParams.toString()}`, {
    skipAuth: true,
  });

  return response;
}

/**
 * Track user catalog activity (fire-and-forget)
 */
export async function trackActivity(params: TrackActivityParams) {
  try {
    await apiFetch('/api/mobile/catalog/track', {
      method: 'POST',
      body: params,
      skipAuth: true,
    });
  } catch (error) {
    // Silent fail - don't block user experience
    console.warn('[CatalogService] Track activity failed:', error);
  }
}

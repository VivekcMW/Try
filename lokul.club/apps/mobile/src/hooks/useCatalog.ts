import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { 
  getNearbyMerchants, 
  getTrendingMerchants, 
  getRecommendations,
  trackActivity,
  type MerchantNearby,
  type MerchantTrending,
  type MerchantRecommendation,
  type NearbyParams,
  type TrendingParams,
  type RecommendationsParams,
} from '@/services/catalogService';

interface UseCatalogOptions {
  autoFetch?: boolean;
  userId?: string;
}

interface LocationCoords {
  lat: number;
  lng: number;
}

export function useCatalog(options: UseCatalogOptions = {}) {
  const { autoFetch = false, userId } = options;

  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [nearbyMerchants, setNearbyMerchants] = useState<MerchantNearby[]>([]);
  const [trendingMerchants, setTrendingMerchants] = useState<MerchantTrending[]>([]);
  const [recommendations, setRecommendations] = useState<MerchantRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Request location permission and get current location
  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationPermission('denied');
        return null;
      }

      setLocationPermission('granted');
      
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        lat: currentLocation.coords.latitude,
        lng: currentLocation.coords.longitude,
      };

      setLocation(coords);
      return coords;
    } catch (err) {
      console.error('[useCatalog] Location error:', err);
      setLocationPermission('denied');
      return null;
    }
  }, []);

  // Fetch nearby merchants
  const fetchNearby = useCallback(async (params?: Partial<NearbyParams>) => {
    const coords = location || await requestLocation();
    if (!coords) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getNearbyMerchants({
        lat: coords.lat,
        lng: coords.lng,
        radius: 10, // Default 10km
        limit: 20,
        ...params,
      });

      setNearbyMerchants(response.data);
    } catch (err) {
      console.error('[useCatalog] Nearby fetch error:', err);
      setError('Failed to load nearby merchants');
    } finally {
      setLoading(false);
    }
  }, [location, requestLocation]);

  // Fetch trending merchants
  const fetchTrending = useCallback(async (params?: Partial<TrendingParams>) => {
    const coords = location || await requestLocation();

    setLoading(true);
    setError(null);

    try {
      const response = await getTrendingMerchants({
        lat: coords?.lat,
        lng: coords?.lng,
        radius: 15, // Default 15km for trending
        days: 7,
        limit: 10,
        ...params,
      });

      setTrendingMerchants(response.data);
    } catch (err) {
      console.error('[useCatalog] Trending fetch error:', err);
      setError('Failed to load trending merchants');
    } finally {
      setLoading(false);
    }
  }, [location, requestLocation]);

  // Fetch personalized recommendations
  const fetchRecommendations = useCallback(async (params?: Partial<RecommendationsParams>) => {
    if (!userId) return;

    const coords = location || await requestLocation();

    setLoading(true);
    setError(null);

    try {
      const response = await getRecommendations({
        userId,
        lat: coords?.lat,
        lng: coords?.lng,
        limit: 10,
        ...params,
      });

      setRecommendations(response.data);
    } catch (err) {
      console.error('[useCatalog] Recommendations fetch error:', err);
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [userId, location, requestLocation]);

  // Track activity helper
  const track = useCallback((activityType: 'view_merchant' | 'view_catalog_item' | 'search' | 'order_placed' | 'add_to_cart' | 'favorite' | 'share', params: {
    merchantId?: string;
    catalogItemId?: string;
    category?: string;
    durationSec?: number;
    metadata?: Record<string, unknown>;
  }) => {
    if (!userId) return;

    trackActivity({
      userId,
      activityType,
      lat: location?.lat,
      lng: location?.lng,
      ...params,
    });
  }, [userId, location]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      requestLocation().then((coords) => {
        if (coords) {
          fetchNearby();
          fetchTrending();
          if (userId) {
            fetchRecommendations();
          }
        }
      });
    }
  }, [autoFetch, userId]); // Intentionally only run on mount

  return {
    location,
    locationPermission,
    nearbyMerchants,
    trendingMerchants,
    recommendations,
    loading,
    error,
    requestLocation,
    fetchNearby,
    fetchTrending,
    fetchRecommendations,
    track,
  };
}

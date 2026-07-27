import { useEffect, useState } from 'react';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export interface FeatureFlagsResponse {
  enabled: string[];
  metadata: Record<string, any>;
  timestamp: string;
}

/**
 * Hook to fetch enabled feature flags from the API
 * Returns array of enabled feature keys
 */
export function useFeatureFlags() {
  const [enabled, setEnabled] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchFlags() {
      try {
        console.log('[FeatureFlags] Fetching from:', `${BASE}/api/features`);
        const res = await fetch(`${BASE}/api/features`);
        console.log('[FeatureFlags] Response status:', res.status);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data: FeatureFlagsResponse = await res.json();
        console.log('[FeatureFlags] Enabled features:', data.enabled.length);
        
        if (isMounted) {
          setEnabled(data.enabled);
          setLoading(false);
        }
      } catch (err) {
        console.error('[FeatureFlags] Error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch feature flags'));
          setLoading(false);
          // Fallback to all features enabled on error
          setEnabled([]);
        }
      }
    }

    fetchFlags();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Check if a specific feature is enabled
   */
  const isEnabled = (featureKey: string): boolean => {
    // If still loading, hide features
    if (loading) return false;
    // If error occurred, show all features (graceful degradation)
    if (error) return true;
    // Otherwise check if feature is in enabled list
    return enabled.includes(featureKey);
  };

  return { enabled, loading, error, isEnabled };
}

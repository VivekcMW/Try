import { useEffect, useState } from 'react';
import { useOnboardingStore } from '@/store/onboardingStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export interface FeatureFlagsResponse {
  flags: Record<string, boolean>;
}

/**
 * Hook to fetch resolved feature flags for the current user's pin code from
 * `/api/mobile/flags` — this is the scoped endpoint (global < city < pincode
 * < society < user), matching what admins configure per-locality in
 * /admin/flags. Falls back to the flat global list if the scoped call fails.
 */
export function useFeatureFlags() {
  const pinCode = useOnboardingStore((s) => s.pin);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchFlags() {
      try {
        const params = new URLSearchParams();
        if (pinCode) params.set('pinCode', pinCode);
        const res = await fetch(`${BASE}/api/mobile/flags?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: FeatureFlagsResponse = await res.json();
        if (isMounted) {
          setFlags(data.flags ?? {});
          setLoading(false);
        }
      } catch (err) {
        console.error('[FeatureFlags] Error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch feature flags'));
          setLoading(false);
          setFlags({});
        }
      }
    }

    fetchFlags();

    return () => {
      isMounted = false;
    };
  }, [pinCode]);

  /**
   * Check if a specific feature is enabled
   */
  const isEnabled = (featureKey: string): boolean => {
    // If still loading, hide features
    if (loading) return false;
    // If error occurred, show all features (graceful degradation)
    if (error) return true;
    return flags[featureKey] === true;
  };

  const enabled = Object.keys(flags).filter((k) => flags[k]);

  return { enabled, loading, error, isEnabled };
}

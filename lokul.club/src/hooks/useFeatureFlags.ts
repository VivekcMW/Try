'use client';

import { useEffect, useState } from 'react';

type FeatureFlags = {
  enabled: string[];
  loading: boolean;
  error: boolean;
};

let cachedFlags: string[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 60 seconds

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>({
    enabled: cachedFlags || [],
    loading: cachedFlags === null,
    error: false,
  });

  useEffect(() => {
    const now = Date.now();
    
    // Use cache if valid
    if (cachedFlags !== null && now - cacheTimestamp < CACHE_TTL) {
      setFlags({ enabled: cachedFlags, loading: false, error: false });
      return;
    }

    // Fetch from API
    const fetchFlags = async () => {
      try {
        const res = await fetch('/api/features');
        
        if (!res.ok) {
          console.warn('[useFeatureFlags] API returned non-OK status:', res.status);
          setFlags({ enabled: [], loading: false, error: true });
          return;
        }

        const data = await res.json();
        const enabled = data.enabled || [];
        
        // Update cache
        cachedFlags = enabled;
        cacheTimestamp = Date.now();
        
        setFlags({ enabled, loading: false, error: false });
        console.log('[useFeatureFlags] Loaded', enabled.length, 'enabled features');
      } catch (err) {
        console.error('[useFeatureFlags] Fetch failed:', err);
        setFlags({ enabled: [], loading: false, error: true });
      }
    };

    fetchFlags();
  }, []);

  const isEnabled = (featureKey: string) => {
    // While loading, hide features
    if (flags.loading) return false;
    
    // On error, show all features (graceful degradation)
    if (flags.error) return true;
    
    return flags.enabled.includes(featureKey);
  };

  return {
    enabled: flags.enabled,
    loading: flags.loading,
    error: flags.error,
    isEnabled,
  };
}

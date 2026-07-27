/**
 * useNetworkStatus — tracks online/offline state and effective connection type.
 * Used to show offline banners and conditionally queue writes.
 */
import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isOnline: boolean;
  is2G: boolean;         // true for 2g / edge / cellular with low bandwidth
  isWifi: boolean;
  effectiveType: string | null;
}

function classify(state: NetInfoState): NetworkStatus {
  const connected = !!(state.isConnected && state.isInternetReachable);
  const type = (state as { type?: string }).type ?? '';
  const details = (state as { details?: { cellularGeneration?: string } }).details;
  const cell = details?.cellularGeneration ?? '';
  const effectiveType = cell || type;

  const is2G = connected && ['2g', 'edge', 'gprs', 'cdma2000'].includes(cell.toLowerCase());
  const isWifi = type === 'wifi';

  return { isOnline: connected, is2G, isWifi, effectiveType };
}

const DEFAULT: NetworkStatus = {
  isOnline: true,
  is2G: false,
  isWifi: false,
  effectiveType: null,
};

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(DEFAULT);

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then((s) => setStatus(classify(s)));

    const unsub = NetInfo.addEventListener((s) => setStatus(classify(s)));
    return unsub;
  }, []);

  return status;
}

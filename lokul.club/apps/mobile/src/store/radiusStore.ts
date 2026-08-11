import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { apiFetch } from '@/services/apiClient';
import { useWalletStore } from '@/store/walletStore';

// PRD §02.3.2 — Radius is the core discovery primitive.
export type RadiusKey = '200m' | '500m' | '2km' | '5km';

export const RADIUS_METERS: Record<RadiusKey, number> = {
  '200m': 200,
  '500m': 500,
  '2km': 2_000,
  '5km': 5_000,
};

export const RADIUS_LABEL: Record<RadiusKey, string> = {
  '200m': '200 m',
  '500m': '500 m',
  '2km': '2 km',
  '5km': '5 km',
};

export const RADIUS_ORDER: RadiusKey[] = ['200m', '500m', '2km', '5km'];

interface RadiusState {
  active: RadiusKey;
  setRadius: (r: RadiusKey) => void;
}

export const useRadiusStore = create<RadiusState>()(
  persist(
    (set) => ({
      active: '200m',
      setRadius: (active) => {
        set({ active });
        const userId = useWalletStore.getState().userId;
        if (userId) {
          apiFetch(`/api/mobile/users/${userId}`, {
            method: 'PATCH',
            body: { radiusKm: RADIUS_METERS[active] / 1000 },
          }).catch(() => {});
        }
      },
    }),
    {
      name: 'lokul.radius',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

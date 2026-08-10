import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type LocationType = 'society' | 'independent' | 'chawl' | 'business' | 'skip' | null;

export interface OnboardingState {
  // Phone & OTP
  phone: string | null;

  // Profile basics
  name: string;
  photoUri: string | null;

  // Locality
  pin: string;
  city: string | null;

  // Residence type — determines which address fields are collected
  locationType: LocationType;

  // Society path (only when locationType === 'society')
  societyId: string | null;
  societyName: string | null;
  tower: string | null;
  flat: string;

  // Non-society path (independent / chawl / business)
  houseLabel: string;    // house/room/shop number — optional, user-provided
  streetAddress: string; // street/lane/market name — optional

  // Interests
  interests: string[];

  // Declared peer/business roles
  declaredRoles: string[];

  // Actions
  setPhone: (phone: string) => void;
  setProfile: (p: { name: string; photoUri: string | null }) => void;
  setLocality: (p: { pin: string; city: string | null }) => void;
  setLocationType: (type: LocationType) => void;
  setSociety: (p: { id: string; name: string }) => void;
  setTowerFlat: (p: { tower: string; flat: string }) => void;
  setAddress: (p: { houseLabel: string; streetAddress: string }) => void;
  toggleInterest: (id: string) => void;
  setDeclaredRoles: (roles: string[]) => void;
  reset: () => void;
}

const initial = {
  phone: null,
  name: 'Test User',
  photoUri: null,
  pin: '560001',
  city: 'Bangalore',
  locationType: 'society' as LocationType,
  societyId: 'test-society-1',
  societyName: 'Kumar Sienna',
  tower: 'A',
  flat: 'A-101',
  houseLabel: '',
  streetAddress: '',
  interests: ['sports', 'food', 'events'] as string[],
  declaredRoles: [] as string[],
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initial,
      setPhone: (phone) => set({ phone }),
      setProfile: ({ name, photoUri }) => set({ name, photoUri }),
      setLocality: ({ pin, city }) => set({ pin, city }),
      setLocationType: (locationType) => set({ locationType }),
      setSociety: ({ id, name }) =>
        set({ societyId: id, societyName: name, tower: null, flat: '' }),
      setTowerFlat: ({ tower, flat }) => set({ tower, flat }),
      setAddress: ({ houseLabel, streetAddress }) => set({ houseLabel, streetAddress }),
      toggleInterest: (id) =>
        set((state) => ({
          interests: state.interests.includes(id)
            ? state.interests.filter((i) => i !== id)
            : [...state.interests, id],
        })),
      setDeclaredRoles: (roles) => set({ declaredRoles: roles }),
      reset: () => set(initial),
    }),
    {
      name: 'lokul.onboarding.v2',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

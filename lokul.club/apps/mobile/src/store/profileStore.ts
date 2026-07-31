import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_PRIVACY, type AgeBand, type ProfilePrivacy, type ProfileUpdateInput, type UserProfile } from '@/types/profile';
import { useWalletStore } from '@/store/walletStore';
import { apiFetch } from '@/services/apiClient';

async function syncProfileToServer(userId: string | null, patch: { privacy?: ProfilePrivacy; ageBand?: AgeBand | null }) {
  if (!userId) return;
  try {
    await apiFetch(`/api/mobile/users/${userId}`, { method: 'PATCH', body: patch });
  } catch {
    // fire-and-forget — local store is source of truth if offline
  }
}

type OnboardingSeed = {
  name: string;
  photoUri: string | null;
  phone: string | null;
  societyName: string | null;
  tower: string | null;
  flat: string;
  city: string | null;
  pin: string;
  interests: string[];
};

type ProfileState = {
  profile: UserProfile;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  syncFromOnboarding: (seed: OnboardingSeed) => void;
  updateProfile: (input: ProfileUpdateInput) => void;
  updatePrivacy: (input: Partial<ProfilePrivacy>) => void;
  updateAgeBand: (ageBand: AgeBand | null) => void;
  resetProfile: () => void;
};

const createInitialProfile = (): UserProfile => ({
  name: '',
  photoUri: null,
  bio: '',
  phone: null,
  societyName: null,
  tower: null,
  flat: '',
  city: null,
  pin: '',
  interests: [],
  ageBand: null,
  privacy: DEFAULT_PRIVACY,
  updatedAt: Date.now(),
});

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: createInitialProfile(),
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      syncFromOnboarding: (seed) =>
        set((state) => {
          const nextProfile: UserProfile = {
            ...state.profile,
            name: state.profile.name || seed.name || '',
            photoUri: state.profile.photoUri ?? seed.photoUri,
            phone: state.profile.phone ?? seed.phone,
            societyName: state.profile.societyName ?? seed.societyName,
            tower: state.profile.tower ?? seed.tower,
            flat: state.profile.flat || seed.flat,
            city: state.profile.city ?? seed.city,
            pin: state.profile.pin || seed.pin,
            interests: state.profile.interests.length ? state.profile.interests : seed.interests,
          };

          const changed =
            nextProfile.name !== state.profile.name ||
            nextProfile.photoUri !== state.profile.photoUri ||
            nextProfile.phone !== state.profile.phone ||
            nextProfile.societyName !== state.profile.societyName ||
            nextProfile.tower !== state.profile.tower ||
            nextProfile.flat !== state.profile.flat ||
            nextProfile.city !== state.profile.city ||
            nextProfile.pin !== state.profile.pin ||
            nextProfile.interests !== state.profile.interests;

          if (!changed) {
            return state;
          }

          return { profile: nextProfile };
        }),
      updateProfile: (input) =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...input,
            updatedAt: Date.now(),
          },
        })),
      updatePrivacy: (input) =>
        set((state) => {
          const nextPrivacy = { ...state.profile.privacy, ...input };
          const userId = useWalletStore.getState().userId;
          syncProfileToServer(userId, { privacy: nextPrivacy }).catch(() => {});
          return {
            profile: {
              ...state.profile,
              privacy: nextPrivacy,
              updatedAt: Date.now(),
            },
          };
        }),
      updateAgeBand: (ageBand) =>
        set((state) => {
          const userId = useWalletStore.getState().userId;
          syncProfileToServer(userId, { ageBand }).catch(() => {});
          return {
            profile: { ...state.profile, ageBand, updatedAt: Date.now() },
          };
        }),
      resetProfile: () => set({ profile: createInitialProfile() }),
    }),
    {
      name: 'lokul.profile.v1',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

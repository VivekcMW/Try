// PRD §03 — Community Groups store
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboardingStore } from './onboardingStore';
import { useWalletStore } from './walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const JOIN_POLICY: Record<CommunityPrivacy, string> = {
  open: 'open',
  request: 'request',
  invite: 'invite_only',
};

export type CommunityCategory =
  | 'sports'
  | 'parenting'
  | 'pets'
  | 'fitness'
  | 'hobby'
  | 'civic'
  | 'business'
  | 'spiritual'
  | 'youth'
  | 'other';

export type CommunityPrivacy = 'open' | 'request' | 'invite';

export interface Community {
  id: string;
  name: string;
  slug: string;
  category: CommunityCategory;
  privacy: CommunityPrivacy;
  bio: string;
  emoji: string;
  bannerColor: string;
  createdAt: number;
  ownerId: string;
  memberCount: number;
  postCount: number;
  rulesCount: number;
  pinned: boolean;
}

interface State {
  myCommunities: Community[];
  joinedIds: string[];
  createCommunity: (
    input: Omit<Community, 'id' | 'createdAt' | 'memberCount' | 'postCount' | 'rulesCount' | 'pinned' | 'ownerId'>,
  ) => Promise<Community>;
  joinCommunity: (id: string) => void;
  leaveCommunity: (id: string) => void;
}

export const useCommunityStore = create<State>()(
  persist(
    (set) => ({
      myCommunities: [],
      joinedIds: [],
      createCommunity: async (input) => {
        const userId  = useWalletStore.getState().userId ?? 'me';
        const pinCode = useOnboardingStore.getState().pin;

        let remoteId: string | null = null;
        try {
          const res = await fetch(`${BASE}/api/mobile/communities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              creatorId: userId,
              name: input.name,
              description: input.bio,
              type: input.category,
              joinPolicy: JOIN_POLICY[input.privacy],
              pinCode,
              coverUrl: undefined,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            remoteId = data?.id ?? null;
          }
        } catch {
          // Network error — still create a local-only fallback so the UI keeps working.
        }

        const community: Community = {
          ...input,
          id: remoteId ?? `c_${Date.now()}`,
          createdAt: Date.now(),
          ownerId: 'me',
          memberCount: 1,
          postCount: 0,
          rulesCount: 0,
          pinned: false,
        };
        set((s) => ({
          myCommunities: [community, ...s.myCommunities],
          joinedIds: [community.id, ...s.joinedIds],
        }));
        return community;
      },
      joinCommunity: (id) => set((s) => (s.joinedIds.includes(id) ? s : { ...s, joinedIds: [id, ...s.joinedIds] })),
      leaveCommunity: (id) => set((s) => ({ ...s, joinedIds: s.joinedIds.filter((x) => x !== id) })),
    }),
    { name: 'lokul.community', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export const COMMUNITY_CATEGORY_META: Record<CommunityCategory, { label: string; emoji: string; tint: string }> = {
  sports: { label: 'Sports', emoji: '⚽', tint: '#16A34A' },
  parenting: { label: 'Parenting', emoji: '👶', tint: '#F472B6' },
  pets: { label: 'Pets', emoji: '🐶', tint: '#A855F7' },
  fitness: { label: 'Fitness & Yoga', emoji: '🧘', tint: '#10B981' },
  hobby: { label: 'Hobby & Art', emoji: '🎨', tint: '#EC4899' },
  civic: { label: 'Civic', emoji: '🏛', tint: '#1D65AF' },
  business: { label: 'Business / Network', emoji: '💼', tint: '#0D9488' },
  spiritual: { label: 'Spiritual', emoji: '🕊', tint: '#F59E0B' },
  youth: { label: 'Youth & Students', emoji: '🎓', tint: '#6366F1' },
  other: { label: 'Other', emoji: '✨', tint: '#64748B' },
};

// Local-only store for peer-role inventories that have no matching backend model
// (ServiceListing is one-row-per-user, so it can't represent a cook's multi-item
// menu or a coach's multiple batches). Follows the communityStore.ts pattern:
// Zustand + AsyncStorage persistence, no backend calls.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type MenuItem, type CoachBatch } from '@/data/peer-seed';

interface State {
  menuItems: MenuItem[];
  coachBatches: CoachBatch[];
  addMenuItem: (input: Omit<MenuItem, 'id'>) => MenuItem;
  toggleMenuItem: (id: string) => void;
  addCoachBatch: (input: Omit<CoachBatch, 'id' | 'enrolled' | 'waitlist' | 'rating'>) => CoachBatch;
}

export const usePeerListingsStore = create<State>()(
  persist(
    (set) => ({
      // Starts empty — a new seller hasn't actually listed anything yet.
      menuItems: [],
      coachBatches: [],
      addMenuItem: (input) => {
        const item: MenuItem = { ...input, id: `m_${Date.now()}` };
        set((s) => ({ menuItems: [item, ...s.menuItems] }));
        return item;
      },
      toggleMenuItem: (id) =>
        set((s) => ({
          menuItems: s.menuItems.map((i) => (i.id === id ? { ...i, available: !i.available } : i)),
        })),
      addCoachBatch: (input) => {
        const batch: CoachBatch = { ...input, id: `b_${Date.now()}`, enrolled: 0, waitlist: 0, rating: 0 };
        set((s) => ({ coachBatches: [batch, ...s.coachBatches] }));
        return batch;
      },
    }),
    { name: 'lokul.peerListings', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

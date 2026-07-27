// PRD §08 — Group buying store
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GroupBuy {
  id: string;
  title: string;
  description: string;
  organizerName: string;
  organizerFlat: string;
  pricePerUnit: number;
  marketPrice: number;
  unit: string; // kg / piece / pack
  minQty: number;
  currentQty: number;
  targetQty: number;
  closesAt: number; // ts
  deliveryDate: string;
  radiusKm: 0.5 | 1 | 2 | 5;
  category: 'produce' | 'staples' | 'electronics' | 'home' | 'apparel' | 'other';
  emoji: string;
  participants: Array<{ name: string; flat: string; qty: number }>;
  status: 'open' | 'committed' | 'delivered' | 'cancelled';
}

interface State {
  groupBuys: GroupBuy[];
  joinedIds: Record<string, number>; // id -> qty
  createGroupBuy: (input: Omit<GroupBuy, 'id' | 'currentQty' | 'participants' | 'status'>) => GroupBuy;
  joinGroupBuy: (id: string, qty: number, name: string, flat: string) => void;
}

export const useGroupBuyStore = create<State>()(
  persist(
    (set, get) => ({
      groupBuys: [],
      joinedIds: {},
      createGroupBuy: (input) => {
        const gb: GroupBuy = { ...input, id: `gb_${Date.now()}`, currentQty: 0, participants: [], status: 'open' };
        set((s) => ({ groupBuys: [gb, ...s.groupBuys] }));
        return gb;
      },
      joinGroupBuy: (id, qty, name, flat) => {
        const existing = get().joinedIds[id] ?? 0;
        const delta = qty - existing;
        set((s) => ({
          joinedIds: { ...s.joinedIds, [id]: qty },
          groupBuys: s.groupBuys.map((g) => {
            if (g.id !== id) return g;
            const others = g.participants.filter((p) => p.flat !== flat);
            return {
              ...g,
              currentQty: g.currentQty + delta,
              participants: qty > 0 ? [...others, { name, flat, qty }] : others,
            };
          }),
        }));
      },
    }),
    { name: 'lokul.groupbuy', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

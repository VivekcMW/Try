import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CartItem = {
  id: string; // catalogItemId
  merchantId: string;
  merchantName: string;
  name: string;
  pricePaise: number;
  unit?: string;
  imageUrl?: string;
  quantity: number;
  kind: string;
};

type CartStore = {
  items: CartItem[];
  merchantId: string | null; // Cart is locked to one merchant at a time
  
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Computed
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (itemId: string) => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      merchantId: null,

      addItem: (item, quantity = 1) => {
        const state = get();
        
        // If adding item from different merchant, clear cart first
        if (state.merchantId && state.merchantId !== item.merchantId && state.items.length > 0) {
          // In production, you'd want to show a confirmation dialog
          set({ items: [], merchantId: item.merchantId });
        }
        
        const existingItem = state.items.find((i) => i.id === item.id);
        
        if (existingItem) {
          // Update quantity
          set({
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          // Add new item
          set({
            items: [...state.items, { ...item, quantity }],
            merchantId: item.merchantId,
          });
        }
      },

      removeItem: (itemId) => {
        const state = get();
        const newItems = state.items.filter((i) => i.id !== itemId);
        set({
          items: newItems,
          merchantId: newItems.length === 0 ? null : state.merchantId,
        });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => {
        set({ items: [], merchantId: null });
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0);
      },

      getItemQuantity: (itemId) => {
        const item = get().items.find((i) => i.id === itemId);
        return item?.quantity ?? 0;
      },
    }),
    {
      name: 'lokul-cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

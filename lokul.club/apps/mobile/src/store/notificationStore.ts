// PRD §08 — Notification Inbox store
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotifCategory = 'safety' | 'community' | 'peer' | 'business' | 'groupbuy' | 'wallet' | 'system';

export interface Notification {
  id: string;
  category: NotifCategory;
  title: string;
  body: string;
  ts: number;
  read: boolean;
  cta?: { label: string; href: string };
  emoji?: string;
}

interface State {
  inbox: Notification[];
  unread: () => number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  push: (n: Omit<Notification, 'id' | 'ts' | 'read'>) => void;
  clear: () => void;
}

const seed: Notification[] = [
  { id: 'n1', category: 'safety', emoji: '🚨', title: 'Safety alert near you', body: 'Suspicious activity reported in Tower B parking. Stay vigilant.', ts: Date.now() - 30 * 60000, read: false, cta: { label: 'Open Safety', href: '/(safety)' } },
  { id: 'n2', category: 'groupbuy', emoji: '🛒', title: 'Group buy unlocked!', body: 'Alphonso Mangoes group buy hit minimum. Confirmed orders shipping tomorrow.', ts: Date.now() - 2 * 3600000, read: false, cta: { label: 'View order', href: '/(groupbuy)' } },
  { id: 'n3', category: 'peer', emoji: '👨‍🍳', title: 'New cook order', body: 'Priya M. ordered 2 thalis for tonight 8pm.', ts: Date.now() - 4 * 3600000, read: false, cta: { label: 'Open Cook', href: '/(peer)/cook' } },
  { id: 'n4', category: 'community', emoji: '💬', title: 'Replies to your post', body: '3 neighbours commented on “Morning walkers group?”', ts: Date.now() - 6 * 3600000, read: true, cta: { label: 'Open post', href: '/(feed)' } },
  { id: 'n5', category: 'wallet', emoji: '💰', title: 'Payout received', body: '₹280 from Cook order #c2 credited to your wallet.', ts: Date.now() - 18 * 3600000, read: true, cta: { label: 'See wallet', href: '/(wallet)' } },
  { id: 'n6', category: 'business', emoji: '🏪', title: 'Sharma Kirana posted an offer', body: '10% off on daily essentials this weekend.', ts: Date.now() - 26 * 3600000, read: true, cta: { label: 'Visit shop', href: '/(business)/nearby' } },
  { id: 'n7', category: 'system', emoji: '🆕', title: 'Welcome to Lokul v2', body: 'Peer roles, group buys, business hub and more. Tap to explore.', ts: Date.now() - 3 * 86400000, read: true },
];

export const useNotificationStore = create<State>()(
  persist(
    (set, get) => ({
      inbox: seed,
      unread: () => get().inbox.filter((n) => !n.read).length,
      markRead: (id) => set((s) => ({ inbox: s.inbox.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllRead: () => set((s) => ({ inbox: s.inbox.map((n) => ({ ...n, read: true })) })),
      push: (n) => set((s) => ({ inbox: [{ ...n, id: `n_${Date.now()}`, ts: Date.now(), read: false }, ...s.inbox] })),
      clear: () => set({ inbox: [] }),
    }),
    { name: 'lokul.notifications', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export const CATEGORY_META: Record<NotifCategory, { label: string; tint: string }> = {
  safety: { label: 'Safety', tint: '#DC2626' },
  community: { label: 'Community', tint: '#2563EB' },
  peer: { label: 'Peer', tint: '#9333EA' },
  business: { label: 'Business', tint: '#0891B2' },
  groupbuy: { label: 'Group buy', tint: '#16A34A' },
  wallet: { label: 'Wallet', tint: '#CA8A04' },
  system: { label: 'System', tint: '#475569' },
};

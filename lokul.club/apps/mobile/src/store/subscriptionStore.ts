/**
 * Lokul Plus subscription store
 * Tracks subscription tier, expiry, and feature-gate helpers.
 * PRD §monetisation — Lokul Plus paywall.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SubscriptionTier = 'free' | 'plus' | 'business';

export interface Subscription {
  tier: SubscriptionTier;
  expiresAt: string | null;  // ISO date or null for free
  autoRenew: boolean;
  pricePaise: number;        // last paid amount
  transactionId: string | null;
}

/** Features gated behind Lokul Plus */
export const PLUS_FEATURES = new Set([
  'ai_assistant',
  'ai_digest_unlimited',
  'priority_feed',
  'ad_free',
  'business_analytics',
  'custom_radius',
  'bulk_broadcast',
  'guardian_live_map',
  'group_buy_create',
  'stories_extended_duration',
]);

/** Features gated behind Lokul Business */
export const BUSINESS_FEATURES = new Set([
  'merchant_dashboard',
  'sponsored_posts',
  'booking_management',
  'customer_insights',
  'bulk_sms_broadcast',
  'invoice_generator',
]);

interface SubscriptionState {
  subscription: Subscription;
  // Actions
  activate: (tier: SubscriptionTier, months?: number, transactionId?: string | null, pricePaise?: number) => void;
  cancel: () => void;
  restore: (sub: Subscription) => void;
  // Helpers
  isPlus: () => boolean;
  isBusiness: () => boolean;
  canAccess: (feature: string) => boolean;
}

const FREE_SUB: Subscription = {
  tier: 'free',
  expiresAt: null,
  autoRenew: false,
  pricePaise: 0,
  transactionId: null,
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscription: FREE_SUB,

      activate: (tier, months = 1, transactionId = null, pricePaise = 0) => {
        const expiresAt = new Date(
          Date.now() + months * 30 * 24 * 60 * 60 * 1000,
        ).toISOString();
        set({
          subscription: { tier, expiresAt, autoRenew: true, pricePaise, transactionId },
        });
      },

      cancel: () => {
        set((s) => ({
          subscription: { ...s.subscription, autoRenew: false },
        }));
      },

      restore: (sub) => set({ subscription: sub }),

      isPlus: () => {
        const { subscription } = get();
        if (subscription.tier === 'free') return false;
        if (!subscription.expiresAt) return false;
        return new Date(subscription.expiresAt) > new Date();
      },

      isBusiness: () => {
        const { subscription } = get();
        if (subscription.tier !== 'business') return false;
        if (!subscription.expiresAt) return false;
        return new Date(subscription.expiresAt) > new Date();
      },

      canAccess: (feature: string) => {
        const { isPlus, isBusiness } = get();
        if (BUSINESS_FEATURES.has(feature)) return isBusiness();
        if (PLUS_FEATURES.has(feature)) return isPlus() || isBusiness();
        return true; // free features
      },
    }),
    {
      name: 'lokul.subscription.v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/**
 * Reward / points store — tracks LokuPoints balance, ledger, and redeemable rewards.
 *
 * Points economy:
 *   +50  per referral invite sent
 *   +200 per referral that joins
 *   +500 at Silver referral tier (5+ joins)
 *   +25  per verified review posted
 *   +10  per community poll vote
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PointsAction =
  | 'referral_invite'
  | 'referral_join'
  | 'referral_silver_tier'
  | 'referral_gold_tier'
  | 'review_posted'
  | 'poll_voted'
  | 'redemption';

export interface PointsLedgerEntry {
  id: string;
  action: PointsAction;
  points: number;        // negative for redemptions
  description: string;
  timestamp: number;
  refId?: string;        // referral / review / redemption id
}

export type RewardId = 'plus_1month' | 'cashback_25' | 'refer_badge' | 'cashback_50';

export interface Reward {
  id: RewardId;
  title: string;
  description: string;
  cost: number;       // LokuPoints
  category: 'subscription' | 'cashback' | 'badge';
}

export const REWARDS: Reward[] = [
  { id: 'cashback_25', title: '₹25 Cashback', description: 'Credited to your Lokul Wallet', cost: 500,  category: 'cashback' },
  { id: 'cashback_50', title: '₹50 Cashback', description: 'Credited to your Lokul Wallet', cost: 900,  category: 'cashback' },
  { id: 'plus_1month', title: 'Lokul Plus — 1 Month',  description: 'Free AI assistant, ad-free & more', cost: 1000, category: 'subscription' },
  { id: 'refer_badge', title: 'Top Referrer Badge', description: 'Displayed on your profile',   cost: 200,  category: 'badge' },
];

export const POINTS_PER_ACTION: Record<PointsAction, number> = {
  referral_invite:      50,
  referral_join:        200,
  referral_silver_tier: 500,
  referral_gold_tier:   1000,
  review_posted:        25,
  poll_voted:           10,
  redemption:           0,  // variable — handled by redeem()
};

interface RewardState {
  balance: number;
  ledger: PointsLedgerEntry[];
  redeemedRewards: Array<{ rewardId: RewardId; redeemedAt: number; txId: string }>;

  earn: (action: PointsAction, description: string, refId?: string) => void;
  redeem: (reward: Reward, txId: string) => boolean;   // returns false if insufficient points
  totalEarned: () => number;
  recentLedger: (n?: number) => PointsLedgerEntry[];
  hasRedeemed: (rewardId: RewardId) => boolean;
}

export const useRewardStore = create<RewardState>()(
  persist(
    (set, get) => ({
      balance: 0,
      ledger:  [],
      redeemedRewards: [],

      earn(action, description, refId) {
        const points = POINTS_PER_ACTION[action];
        const entry: PointsLedgerEntry = {
          id: `${Date.now()}-${Math.random()}`,
          action,
          points,
          description,
          timestamp: Date.now(),
          refId,
        };
        set((s) => ({ balance: s.balance + points, ledger: [entry, ...s.ledger].slice(0, 200) }));
      },

      redeem(reward, txId) {
        const { balance } = get();
        if (balance < reward.cost) return false;
        const entry: PointsLedgerEntry = {
          id: txId,
          action: 'redemption',
          points: -reward.cost,
          description: `Redeemed: ${reward.title}`,
          timestamp: Date.now(),
          refId: reward.id,
        };
        set((s) => ({
          balance: s.balance - reward.cost,
          ledger: [entry, ...s.ledger].slice(0, 200),
          redeemedRewards: [
            { rewardId: reward.id, redeemedAt: Date.now(), txId },
            ...s.redeemedRewards,
          ],
        }));
        return true;
      },

      totalEarned() {
        return get().ledger.filter((e) => e.points > 0).reduce((sum, e) => sum + e.points, 0);
      },

      recentLedger(n = 20) {
        return get().ledger.slice(0, n);
      },

      hasRedeemed(rewardId) {
        return get().redeemedRewards.some((r) => r.rewardId === rewardId);
      },
    }),
    {
      name: 'lokul.rewards.v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

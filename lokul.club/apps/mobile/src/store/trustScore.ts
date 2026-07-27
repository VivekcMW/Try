// PRD §03 — Trust Score derivation (composite of verification + peer + community signals)
import { useVerificationStore } from './verificationStore';
import { usePeerStore } from './peerRoleStore';
import { useWalletStore } from './walletStore';

export interface TrustBreakdown {
  total: number; // 0-100
  band: 'bronze' | 'silver' | 'gold' | 'platinum';
  signals: {
    label: string;
    points: number;
    maxPoints: number;
    description: string;
  }[];
}

export function computeTrust(): TrustBreakdown {
  const tier = useVerificationStore.getState().tier;
  const roles = usePeerStore.getState().roles;
  const ledger = useWalletStore.getState().ledger;

  // Identity signal
  const idPts = tier === 'gold' ? 30 : tier === 'silver' ? 18 : 8;

  // Activity signal: completed orders across roles
  const completed = Object.values(roles).reduce((acc, r) => acc + r.completedOrders, 0);
  const actPts = Math.min(25, completed * 3 + 5);

  // Reputation signal: average rating (when present)
  const ratings = Object.values(roles).filter((r) => r.rating > 0).map((r) => r.rating);
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 4.6;
  const repPts = Math.round((avgRating / 5) * 20);

  // Transactional signal: ledger volume
  const ledgerCount = ledger.length;
  const txnPts = Math.min(15, ledgerCount * 2);

  // Tenure signal (placeholder — seeded constant)
  const tenurePts = 8;

  const total = idPts + actPts + repPts + txnPts + tenurePts;

  let band: TrustBreakdown['band'] = 'bronze';
  if (total >= 85) band = 'platinum';
  else if (total >= 65) band = 'gold';
  else if (total >= 45) band = 'silver';

  return {
    total,
    band,
    signals: [
      { label: 'Identity verification', points: idPts, maxPoints: 30, description: `${tier} tier KYC` },
      { label: 'Activity', points: actPts, maxPoints: 25, description: `${completed} completed orders` },
      { label: 'Reputation', points: repPts, maxPoints: 20, description: `${avgRating.toFixed(1)} avg rating` },
      { label: 'Transactional', points: txnPts, maxPoints: 15, description: `${ledgerCount} wallet entries` },
      { label: 'Tenure', points: tenurePts, maxPoints: 10, description: 'Active member since onboarding' },
    ],
  };
}

export const TRUST_BAND_META: Record<TrustBreakdown['band'], { label: string; tint: string }> = {
  bronze: { label: 'Bronze', tint: '#A16207' },
  silver: { label: 'Silver', tint: '#475569' },
  gold: { label: 'Gold', tint: '#CA8A04' },
  platinum: { label: 'Platinum', tint: '#6D28D9' },
};

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Tier = 'bronze' | 'silver' | 'gold';
export type ProofType =
  | 'rent'
  | 'bill'
  | 'noc'
  | 'aadhaar'
  | 'pan'
  | 'passport'
  | 'driving'
  | 'voter'
  | 'ration'
  | 'digilocker';
export type SilverStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type GoldStatus = 'none' | 'aadhaar_consented' | 'liveness_done' | 'approved' | 'rejected';

export interface SilverDoc {
  type: ProofType;
  uri: string;
  fileName?: string | null;
  submittedAt: number; // epoch ms
}

export interface VerificationState {
  tier: Tier;

  // Silver
  silverStatus: SilverStatus;
  silverDoc: SilverDoc | null;

  // Gold
  goldStatus: GoldStatus;

  /** True when the user chose "Skip for now" on a verification screen.
   *  They may fill in service profiles but cannot place/accept orders or
   *  make wallet transactions until tier is upgraded from bronze. */
  verificationSkipped: boolean;

  // Actions — demo wiring (no backend yet)
  submitSilverProof: (doc: SilverDoc) => void;
  approveSilver: () => void; // call from review screen after countdown
  rejectSilver: (reason?: string) => void;

  consentAadhaar: () => void;
  completeLiveness: () => void;
  approveGold: () => void;

  skipVerification: () => void;
  resetVerification: () => void;
}

const initial: Pick<VerificationState, 'tier' | 'silverStatus' | 'silverDoc' | 'goldStatus' | 'verificationSkipped'> = {
  tier: 'bronze',
  silverStatus: 'none',
  silverDoc: null,
  goldStatus: 'none',
  verificationSkipped: false,
};

export const useVerificationStore = create<VerificationState>()(
  persist(
    (set, get) => ({
      ...initial,

      submitSilverProof: (doc) => set({ silverDoc: doc, silverStatus: 'pending' }),
      approveSilver: () =>
        set((s) => ({
          silverStatus: 'approved',
          tier: s.tier === 'gold' ? 'gold' : 'silver',
          verificationSkipped: false,
        })),
      rejectSilver: () => set({ silverStatus: 'rejected' }),

      consentAadhaar: () => set({ goldStatus: 'aadhaar_consented' }),
      completeLiveness: () =>
        set((s) =>
          s.goldStatus === 'aadhaar_consented' ? { goldStatus: 'liveness_done' } : {}
        ),
      approveGold: () => set({ goldStatus: 'approved', tier: 'gold', verificationSkipped: false }),

      skipVerification: () => set({ verificationSkipped: true }),
      resetVerification: () => set(initial),
    }),
    {
      name: 'lokul.verification.v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const tierLabel = (t: Tier) => (t === 'bronze' ? 'Bronze' : t === 'silver' ? 'Silver' : 'Gold');
export const tierTone = (t: Tier): 'neutral' | 'brand' | 'warning' | 'success' =>
  t === 'bronze' ? 'neutral' : t === 'silver' ? 'brand' : 'warning';

export const proofMeta: Record<ProofType, { title: string; desc: string }> = {
  rent: {
    title: 'Rent agreement',
    desc: 'Active lease showing your name + flat address.',
  },
  bill: {
    title: 'Electricity bill',
    desc: 'Latest MSEB/TPL bill (≤ 60 days) addressed to you.',
  },
  noc: {
    title: 'Society NOC',
    desc: 'No-objection certificate from your RWA/secretary.',
  },
  aadhaar: {
    title: 'Aadhaar card',
    desc: 'UIDAI card or e-Aadhaar PDF — mask first 8 digits if you prefer.',
  },
  pan: {
    title: 'PAN card',
    desc: 'Permanent Account Number card issued by the Income Tax Dept.',
  },
  passport: {
    title: 'Passport',
    desc: 'Front page of a valid Indian passport (≥ 6 months to expiry).',
  },
  driving: {
    title: 'Driving licence',
    desc: 'RTO-issued licence with your photo and current address.',
  },
  voter: {
    title: 'Voter ID (EPIC)',
    desc: 'Election Commission photo identity card.',
  },
  ration: {
    title: 'Ration card',
    desc: 'State PDS ration card listing you at the current flat.',
  },
  digilocker: {
    title: 'DigiLocker fetch',
    desc: 'Pull a verified document directly from your DigiLocker account.',
  },
};

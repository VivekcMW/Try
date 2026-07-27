// PRD §07 — Lokul Wallet store (peer escrow + payouts)
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LedgerType = 'topup' | 'spend' | 'earn' | 'payout' | 'refund' | 'hold' | 'release';

export interface LedgerEntry {
  id: string;
  type: LedgerType;
  amountPaise: number; // +ve credit, -ve debit
  description: string;
  ts: number;
  party?: string;
  reference?: string;
  status: 'completed' | 'pending' | 'failed';
}

interface State {
  userId: string | null;
  token: string | null;
  balancePaise: number;
  heldPaise: number;
  earningsPaise: number;
  ledger: LedgerEntry[];
  setUserId: (id: string) => void;
  setToken: (token: string | null) => void;
  syncFromApi: (data: { balancePaise: number; heldPaise?: number; earningsPaise: number; entries: LedgerEntry[] }) => void;
  setBalance: (paise: number) => void;
  addMoney: (paise: number) => void;
  spend: (paise: number, description: string, party?: string) => void;
  earn: (paise: number, description: string, party?: string) => void;
  hold: (paise: number, description: string) => void;
  release: (paise: number, description: string) => void;
  payout: (paise: number) => void;
}

export const useWalletStore = create<State>()(
  persist(
    (set) => ({
      userId: null,
      token: null,
      balancePaise: 124000, // ₹1,240 seeded
      heldPaise: 0,
      earningsPaise: 380000, // ₹3,800 lifetime earnings
      ledger: [
        { id: 'l1', type: 'topup', amountPaise: 100000, description: 'Top-up via UPI', ts: Date.now() - 5 * 86400000, status: 'completed' },
        { id: 'l2', type: 'spend', amountPaise: -45000, description: 'Group buy: Mangoes', party: 'Rohan P.', ts: Date.now() - 3 * 86400000, status: 'completed' },
        { id: 'l3', type: 'earn', amountPaise: 28000, description: 'Cook order #c2', party: 'Priya M.', ts: Date.now() - 86400000, status: 'completed' },
        { id: 'l4', type: 'hold', amountPaise: -8500, description: 'Errand escrow #e1', ts: Date.now() - 3600000, status: 'pending' },
      ],
      setUserId: (id) => set({ userId: id }),
      setToken: (token) => set({ token }),
      syncFromApi: ({ balancePaise, heldPaise, earningsPaise, entries }) =>
        set((s) => ({
          balancePaise,
          heldPaise: heldPaise ?? s.heldPaise,
          earningsPaise,
          ledger: entries.length > 0 ? entries : s.ledger,
        })),
      setBalance: (paise) => set({ balancePaise: paise }),
      addMoney: (paise) =>
        set((s) => ({
          balancePaise: s.balancePaise + paise,
          ledger: [{ id: `l_${Date.now()}`, type: 'topup', amountPaise: paise, description: 'Top-up via UPI', ts: Date.now(), status: 'completed' }, ...s.ledger],
        })),
      spend: (paise, description, party) =>
        set((s) => ({
          balancePaise: s.balancePaise - paise,
          ledger: [{ id: `l_${Date.now()}`, type: 'spend', amountPaise: -paise, description, party, ts: Date.now(), status: 'completed' }, ...s.ledger],
        })),
      earn: (paise, description, party) =>
        set((s) => ({
          balancePaise: s.balancePaise + paise,
          earningsPaise: s.earningsPaise + paise,
          ledger: [{ id: `l_${Date.now()}`, type: 'earn', amountPaise: paise, description, party, ts: Date.now(), status: 'completed' }, ...s.ledger],
        })),
      hold: (paise, description) =>
        set((s) => ({
          balancePaise: s.balancePaise - paise,
          heldPaise: s.heldPaise + paise,
          ledger: [{ id: `l_${Date.now()}`, type: 'hold', amountPaise: -paise, description, ts: Date.now(), status: 'pending' }, ...s.ledger],
        })),
      release: (paise, description) =>
        set((s) => ({
          balancePaise: s.balancePaise + paise,
          heldPaise: Math.max(0, s.heldPaise - paise),
          ledger: [{ id: `l_${Date.now()}`, type: 'release', amountPaise: paise, description, ts: Date.now(), status: 'completed' }, ...s.ledger],
        })),
      payout: (paise) =>
        set((s) => ({
          balancePaise: s.balancePaise - paise,
          ledger: [{ id: `l_${Date.now()}`, type: 'payout', amountPaise: -paise, description: 'Payout to bank', ts: Date.now(), status: 'pending' }, ...s.ledger],
        })),
    }),
    { name: 'lokul.wallet', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export const rupees = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

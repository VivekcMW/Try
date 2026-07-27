// PRD §06 — Service request management (plumber, electrician, carpenter…)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type QuoteStatus = 'pending' | 'quoted' | 'accepted' | 'in_progress' | 'done' | 'rejected';

export interface ServiceRequest {
  id: string;
  customerName: string;
  customerFlat: string;
  serviceType: string;
  description: string;
  preferredAt: string;
  quoteRupees?: number;
  status: QuoteStatus;
  createdAt: number;
}

export interface OfferedService {
  id: string;
  name: string;
  baseRupees: number;
  available: boolean;
}

const SEED_REQUESTS: ServiceRequest[] = [
  { id: 'sr1', customerName: 'Rohit Joshi',   customerFlat: 'A-501', serviceType: 'Plumbing',    description: 'Kitchen sink leaking badly',          preferredAt: 'Today evening',  status: 'pending',     createdAt: Date.now() - 1_800_000 },
  { id: 'sr2', customerName: 'Ananya S.',      customerFlat: 'B-202', serviceType: 'Electrical',  description: 'Switchboard repair — 3 points gone',  preferredAt: 'Tomorrow 10 AM', quoteRupees: 350, status: 'quoted',      createdAt: Date.now() - 7_200_000 },
  { id: 'sr3', customerName: 'Dev Mehta',      customerFlat: 'C-304', serviceType: 'Carpentry',   description: 'Door hinge replacement × 2',           preferredAt: 'This weekend',   quoteRupees: 500, status: 'accepted',    createdAt: Date.now() - 86_400_000 },
  { id: 'sr4', customerName: 'Seema Raut',     customerFlat: 'D-108', serviceType: 'Plumbing',    description: 'Bathroom tap not closing',            preferredAt: 'ASAP',           quoteRupees: 200, status: 'in_progress', createdAt: Date.now() - 172_800_000 },
  { id: 'sr5', customerName: 'Ramesh Gupta',   customerFlat: 'A-1001',serviceType: 'Electrical',  description: 'Fan speed regulator change',          preferredAt: 'Flexible',       quoteRupees: 150, status: 'done',        createdAt: Date.now() - 432_000_000 },
];

const SEED_OFFERED: OfferedService[] = [
  { id: 'os1', name: 'Plumbing',       baseRupees: 200, available: true },
  { id: 'os2', name: 'Electrical Work',baseRupees: 250, available: true },
  { id: 'os3', name: 'Carpentry',      baseRupees: 300, available: true },
  { id: 'os4', name: 'Painting',       baseRupees: 150, available: false },
  { id: 'os5', name: 'Welding',        baseRupees: 350, available: false },
];

interface ServiceReqState {
  requests: ServiceRequest[];
  offeredServices: OfferedService[];
  addRequest: (req: Omit<ServiceRequest, 'id' | 'status' | 'createdAt'>) => void;
  sendQuote: (id: string, rupees: number) => void;
  updateStatus: (id: string, status: QuoteStatus) => void;
  toggleService: (id: string) => void;
}

export const useServiceRequestStore = create<ServiceReqState>()(
  persist(
    (set) => ({
      requests: SEED_REQUESTS,
      offeredServices: SEED_OFFERED,
      addRequest: (req) =>
        set((st) => ({
          requests: [
            { ...req, id: `sr_${Date.now()}`, status: 'pending', createdAt: Date.now() },
            ...st.requests,
          ],
        })),
      sendQuote: (id, rupees) =>
        set((st) => ({
          requests: st.requests.map((r) =>
            r.id === id ? { ...r, quoteRupees: rupees, status: 'quoted' } : r
          ),
        })),
      updateStatus: (id, status) =>
        set((st) => ({
          requests: st.requests.map((r) => (r.id === id ? { ...r, status } : r)),
        })),
      toggleService: (id) =>
        set((st) => ({
          offeredServices: st.offeredServices.map((s) =>
            s.id === id ? { ...s, available: !s.available } : s
          ),
        })),
    }),
    { name: 'lokul.servicerequests', storage: createJSONStorage(() => AsyncStorage) }
  )
);

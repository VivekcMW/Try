// PRD §09 — Carpool store
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CarpoolKind = 'office' | 'school' | 'airport' | 'event' | 'other';

export interface Carpool {
  id: string;
  kind: CarpoolKind;
  origin: string;
  destination: string;
  departAt: string; // ISO
  recurring: 'one-off' | 'weekday' | 'daily';
  seatsTotal: number;
  seatsTaken: number;
  costPerSeatPaise: number;
  hostName: string;
  hostFlat: string;
  rating: number;
  notes?: string;
}

interface State {
  trips: Carpool[];
  createTrip: (
    t: Omit<Carpool, 'id' | 'seatsTaken' | 'hostName' | 'hostFlat' | 'rating'>,
  ) => string;
  joinTrip: (id: string) => void;
  leaveTrip: (id: string) => void;
}

const seed: Carpool[] = [
  {
    id: 'cp1',
    kind: 'office',
    origin: 'Brigade Meadows, Kanakapura Rd',
    destination: 'Manyata Tech Park, Hebbal',
    departAt: new Date(Date.now() + 16 * 3600000).toISOString(),
    recurring: 'weekday',
    seatsTotal: 3,
    seatsTaken: 1,
    costPerSeatPaise: 12000,
    hostName: 'Arjun S.',
    hostFlat: 'A-1402',
    rating: 4.8,
    notes: 'AC sedan · Music friendly · Drop at gate 2.',
  },
  {
    id: 'cp2',
    kind: 'school',
    origin: 'Tower B parking',
    destination: 'Greenwood High, Bannerghatta',
    departAt: new Date(Date.now() + 14 * 3600000).toISOString(),
    recurring: 'weekday',
    seatsTotal: 4,
    seatsTaken: 3,
    costPerSeatPaise: 4500,
    hostName: 'Meera K.',
    hostFlat: 'B-0805',
    rating: 4.9,
    notes: 'Verified parent · Both ways · Kids age 6-10.',
  },
  {
    id: 'cp3',
    kind: 'airport',
    origin: 'Society main gate',
    destination: 'Kempegowda Intl Airport (BLR)',
    departAt: new Date(Date.now() + 36 * 3600000).toISOString(),
    recurring: 'one-off',
    seatsTotal: 3,
    seatsTaken: 0,
    costPerSeatPaise: 35000,
    hostName: 'Rohan P.',
    hostFlat: 'C-2103',
    rating: 4.6,
    notes: 'Innova · 2 large bags ok · Pickup at 4:30 am.',
  },
];

export const useCarpoolStore = create<State>()(
  persist(
    (set, get) => ({
      trips: seed,
      createTrip: (t) => {
        const id = `cp_${Date.now()}`;
        set((s) => ({
          trips: [
            { ...t, id, seatsTaken: 0, hostName: 'You', hostFlat: 'A-101', rating: 4.5 },
            ...s.trips,
          ],
        }));
        return id;
      },
      joinTrip: (id) =>
        set((s) => ({
          trips: s.trips.map((t) =>
            t.id === id && t.seatsTaken < t.seatsTotal
              ? { ...t, seatsTaken: t.seatsTaken + 1 }
              : t,
          ),
        })),
      leaveTrip: (id) =>
        set((s) => ({
          trips: s.trips.map((t) =>
            t.id === id && t.seatsTaken > 0
              ? { ...t, seatsTaken: t.seatsTaken - 1 }
              : t,
          ),
        })),
    }),
    { name: 'lokul.carpool', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export const CARPOOL_META: Record<CarpoolKind, { label: string; tint: string; emoji: string }> = {
  office: { label: 'Office', tint: '#1D4ED8', emoji: '💼' },
  school: { label: 'School', tint: '#16A34A', emoji: '🎒' },
  airport: { label: 'Airport', tint: '#9333EA', emoji: '✈️' },
  event: { label: 'Event', tint: '#EA580C', emoji: '🎉' },
  other: { label: 'Other', tint: '#475569', emoji: '🚗' },
};

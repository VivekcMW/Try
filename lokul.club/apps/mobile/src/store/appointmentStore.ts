// PRD §06 — Appointment management (salon, clinic, gym, physio…)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ApptService {
  id: string;
  name: string;
  durationMins: number;
  priceRupees: number;
  available: boolean;
}

export interface Appointment {
  id: string;
  customerName: string;
  customerFlat: string;
  serviceId: string;
  serviceName: string;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:MM
  feeRupees: number;
  status: 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  createdAt: number;
}

const today    = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

const SEED_SERVICES: ApptService[] = [
  { id: 'as1', name: 'Haircut',             durationMins: 30, priceRupees: 200, available: true },
  { id: 'as2', name: 'Facial + Cleanup',    durationMins: 60, priceRupees: 500, available: true },
  { id: 'as3', name: 'Manicure + Pedicure', durationMins: 45, priceRupees: 400, available: true },
  { id: 'as4', name: 'Threading',           durationMins: 15, priceRupees: 60,  available: true },
  { id: 'as5', name: 'Waxing (full body)',  durationMins: 40, priceRupees: 350, available: false },
];

const SEED_APPOINTMENTS: Appointment[] = [
  { id: 'ap1', customerName: 'Priya Sharma', customerFlat: 'A-201', serviceId: 'as1', serviceName: 'Haircut',          date: today,    time: '11:00', feeRupees: 200, status: 'confirmed', createdAt: Date.now() - 3_600_000 },
  { id: 'ap2', customerName: 'Meena Iyer',   customerFlat: 'B-304', serviceId: 'as2', serviceName: 'Facial + Cleanup', date: today,    time: '14:00', feeRupees: 500, status: 'confirmed', createdAt: Date.now() - 7_200_000 },
  { id: 'ap3', customerName: 'Sunita Patel', customerFlat: 'C-102', serviceId: 'as3', serviceName: 'Manicure + Pedicure', date: tomorrow, time: '10:00', feeRupees: 400, status: 'confirmed', createdAt: Date.now() - 86_400_000 },
  { id: 'ap4', customerName: 'Lata Singh',   customerFlat: 'A-503', serviceId: 'as4', serviceName: 'Threading',        date: tomorrow, time: '12:30', feeRupees: 60,  status: 'confirmed', createdAt: Date.now() - 90_000_000 },
];

interface ApptState {
  services: ApptService[];
  appointments: Appointment[];
  addService: (s: Omit<ApptService, 'id'>) => void;
  toggleService: (id: string) => void;
  addAppointment: (a: Omit<Appointment, 'id' | 'createdAt'>) => void;
  updateStatus: (id: string, status: Appointment['status']) => void;
}

export const useAppointmentStore = create<ApptState>()(
  persist(
    (set) => ({
      services: SEED_SERVICES,
      appointments: SEED_APPOINTMENTS,
      addService: (s) =>
        set((st) => ({ services: [...st.services, { ...s, id: 'as_' + Date.now() }] })),
      toggleService: (id) =>
        set((st) => ({
          services: st.services.map((s) => (s.id === id ? { ...s, available: !s.available } : s)),
        })),
      addAppointment: (a) =>
        set((st) => ({
          appointments: [...st.appointments, { ...a, id: 'ap_' + Date.now(), createdAt: Date.now() }],
        })),
      updateStatus: (id, status) =>
        set((st) => ({
          appointments: st.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
        })),
    }),
    { name: 'lokul.appointments', storage: createJSONStorage(() => AsyncStorage) }
  )
);

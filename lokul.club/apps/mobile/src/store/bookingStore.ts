import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** How the booking is fulfilled */
export type BookingKind = 'slot' | 'window' | 'project';

export type BookingStatus =
  // shared
  | 'requested'
  | 'cancelled'
  | 'completed'
  // slot (salon/clinic/pet-clinic)
  | 'confirmed'
  | 'checked_in'
  // window (trades / pet home visits)
  | 'accepted'
  | 'on_the_way'
  | 'arrived'
  | 'quote_pending'
  | 'in_progress'
  | 'work_done'
  // project (movers / painter / interior)
  | 'visit_scheduled'
  | 'visit_done'
  | 'quote_shared'
  | 'quote_accepted'
  | 'scheduled';

export type BookingService = {
  id: string;
  name: string;
  pricePaise: number;
  durationMins?: number;
};

export type ServiceBooking = {
  id: string;
  kind: BookingKind;
  merchantId: string;
  merchantName: string;
  category: string;
  services: BookingService[];
  /** ISO date '2026-08-13' */
  date: string;
  /** Display label: '5:00 PM' | '12–3 PM' | '10:00 AM (site visit)' */
  slotLabel: string;
  address?: string;
  bookingFor?: string;
  petName?: string;
  locationType?: 'home' | 'clinic';
  /** Chosen staff member — stylist, doctor etc. */
  providerName?: string;
  providerRole?: string;
  /** Movers: pickup and drop locations */
  fromAddress?: string;
  toAddress?: string;
  /** Movers: home size preset */
  inventory?: string;
  /** Lab tests: fasting sample required */
  fastingRequired?: boolean;
  /** Pest control: home size */
  roomCount?: string;
  /** Subscriptions: tiffin / fitness / tutor */
  recurrence?: { plan: string; meals?: string[] };
  /** Tele-consult: online vs in-office */
  consultMode?: 'online' | 'office';
  /** Customer counter-offer on a project quote */
  counterPaise?: number;
  problem?: string;
  problemPhotoUri?: string;
  urgency?: 'normal' | 'emergency';
  visitFeePaise?: number;
  /** Extra work found on-site — needs customer approval */
  onsiteQuote?: { label: string; pricePaise: number } | null;
  onsiteApproved?: boolean;
  /** Project quote after site visit */
  quote?: { lineItems: { label: string; pricePaise: number }[]; totalPaise: number } | null;
  advancePaise?: number;
  advancePaid?: boolean;
  milestones?: { label: string; done: boolean }[];
  otp: string;
  totalPaise: number;
  rating?: number;
  status: BookingStatus;
  createdAt: string;
  history: { status: BookingStatus; at: string }[];
};

type BookingStore = {
  bookings: ServiceBooking[];
  createBooking: (b: Omit<ServiceBooking, 'otp' | 'status' | 'createdAt' | 'history'>) => ServiceBooking;
  setStatus: (id: string, status: BookingStatus) => void;
  setOnsiteQuote: (id: string, quote: { label: string; pricePaise: number }) => void;
  approveOnsiteQuote: (id: string) => void;
  setQuote: (id: string, quote: { lineItems: { label: string; pricePaise: number }[]; totalPaise: number }) => void;
  acceptQuote: (id: string) => void;
  counterQuote: (id: string, counterPaise: number) => void;
  acceptCounter: (id: string) => void;
  payAdvance: (id: string) => void;
  completeMilestone: (id: string, index: number) => void;
  setRating: (id: string, rating: number) => void;
  getBooking: (id: string) => ServiceBooking | undefined;
};

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      bookings: [],

      createBooking: (b) => {
        const booking: ServiceBooking = {
          ...b,
          otp: String(Math.floor(1000 + Math.random() * 9000)),
          status: b.kind === 'project' ? 'visit_scheduled' : 'requested',
          createdAt: new Date().toISOString(),
          history: [
            {
              status: b.kind === 'project' ? 'visit_scheduled' : 'requested',
              at: new Date().toISOString(),
            },
          ],
        };
        set((s) => ({ bookings: [booking, ...s.bookings] }));
        return booking;
      },

      setStatus: (id, status) =>
        set((s) => ({
          bookings: s.bookings.map((bk) =>
            bk.id === id && bk.status !== 'cancelled'
              ? { ...bk, status, history: [...bk.history, { status, at: new Date().toISOString() }] }
              : bk
          ),
        })),

      setOnsiteQuote: (id, quote) =>
        set((s) => ({
          bookings: s.bookings.map((bk) =>
            bk.id === id ? { ...bk, onsiteQuote: quote, status: 'quote_pending' } : bk
          ),
        })),

      approveOnsiteQuote: (id) =>
        set((s) => ({
          bookings: s.bookings.map((bk) =>
            bk.id === id
              ? {
                  ...bk,
                  onsiteApproved: true,
                  totalPaise: bk.totalPaise + (bk.onsiteQuote?.pricePaise ?? 0),
                  status: 'in_progress',
                }
              : bk
          ),
        })),

      setQuote: (id, quote) =>
        set((s) => ({
          bookings: s.bookings.map((bk) =>
            bk.id === id ? { ...bk, quote, status: 'quote_shared' } : bk
          ),
        })),

      acceptQuote: (id) =>
        set((s) => ({
          bookings: s.bookings.map((bk) =>
            bk.id === id && bk.quote
              ? {
                  ...bk,
                  status: 'quote_accepted',
                  totalPaise: bk.quote.totalPaise,
                  advancePaise: Math.round(bk.quote.totalPaise * 0.2),
                }
              : bk
          ),
        })),

      counterQuote: (id, counterPaise) =>
        set((s) => ({
          bookings: s.bookings.map((bk) =>
            bk.id === id ? { ...bk, counterPaise } : bk
          ),
        })),

      acceptCounter: (id) =>
        set((s) => ({
          bookings: s.bookings.map((bk) =>
            bk.id === id && bk.counterPaise
              ? {
                  ...bk,
                  status: 'quote_accepted',
                  totalPaise: bk.counterPaise,
                  advancePaise: Math.round(bk.counterPaise * 0.2),
                  quote: bk.quote ? { ...bk.quote, totalPaise: bk.counterPaise } : bk.quote,
                }
              : bk
          ),
        })),

      payAdvance: (id) =>
        set((s) => ({
          bookings: s.bookings.map((bk) =>
            bk.id === id ? { ...bk, advancePaid: true, status: 'scheduled' } : bk
          ),
        })),

      completeMilestone: (id, index) =>
        set((s) => ({
          bookings: s.bookings.map((bk) => {
            if (bk.id !== id || !bk.milestones) return bk;
            const milestones = bk.milestones.map((m, i) => (i === index ? { ...m, done: true } : m));
            const allDone = milestones.every((m) => m.done);
            return { ...bk, milestones, status: allDone ? 'work_done' : bk.status };
          }),
        })),

      setRating: (id, rating) =>
        set((s) => ({
          bookings: s.bookings.map((bk) => (bk.id === id ? { ...bk, rating } : bk)),
        })),

      getBooking: (id) => get().bookings.find((bk) => bk.id === id),
    }),
    {
      name: 'lokul-bookings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/** Category → booking kind mapping */
export function bookingKindForCategory(category: string): BookingKind {
  const windowCategories = [
    'repair', 'plumber', 'electrician', 'ac_repair', 'pest_control',
    'appliance_repair', 'lab_test', 'laundry', 'carpenter', 'car_wash', 'gardener',
  ];
  const projectCategories = ['movers', 'packers_movers', 'painter', 'interior_designer', 'event_planner', 'event'];
  if (windowCategories.includes(category)) return 'window';
  if (projectCategories.includes(category)) return 'project';
  return 'slot'; // salon, clinic, pet_care, tiffin, consult, tutors etc.
}

export type Provider = {
  id: string;
  name: string;
  role: string;
  rating: number;
  years: number;
};

/** Demo staff per merchant — stylists for salons, doctors for clinics */
export const DEMO_PROVIDERS: Record<string, Provider[]> = {
  // Glamour Touch Salon
  '5': [
    { id: 'p51', name: 'Rakesh', role: 'Senior Stylist', rating: 4.8, years: 9 },
    { id: 'p52', name: 'Imran', role: 'Hair & Beard Expert', rating: 4.6, years: 6 },
    { id: 'p53', name: 'Sunita', role: 'Skin & Facial Specialist', rating: 4.7, years: 7 },
  ],
  // Style Studio Unisex Salon
  '6': [
    { id: 'p61', name: 'Neha', role: 'Senior Hair Artist', rating: 4.5, years: 8 },
    { id: 'p62', name: 'Priya', role: 'Nail & Spa Expert', rating: 4.3, years: 4 },
    { id: 'p63', name: 'Farhan', role: 'Color Specialist', rating: 4.4, years: 5 },
  ],
  // Sunrise Family Clinic
  '7': [
    { id: 'p71', name: 'Dr. Meera Nair', role: 'General Physician · MBBS, MD', rating: 4.9, years: 14 },
    { id: 'p72', name: 'Dr. Arjun Rao', role: 'Family Medicine · MBBS', rating: 4.7, years: 8 },
  ],
  // Smile Care Dental Clinic
  '8': [
    { id: 'p81', name: 'Dr. Kavita Shah', role: 'Dentist · BDS, MDS', rating: 4.8, years: 12 },
    { id: 'p82', name: 'Dr. Rohit Verma', role: 'Orthodontist · MDS', rating: 4.6, years: 9 },
  ],
  // LifeCare Multispeciality Hospital
  '9': [
    { id: 'p91', name: 'Dr. S. Krishnan', role: 'Internal Medicine · MD', rating: 4.7, years: 18 },
    { id: 'p92', name: 'Dr. Anita Desai', role: 'Cardiologist · DM', rating: 4.8, years: 15 },
    { id: 'p93', name: 'Dr. Vikram Singh', role: 'Orthopaedics · MS', rating: 4.5, years: 11 },
  ],
  // Happy Paws — groomers & vet
  '13': [
    { id: 'p131', name: 'Dr. Tanya Kapoor', role: 'Veterinarian · BVSc', rating: 4.8, years: 10 },
    { id: 'p132', name: 'Suresh', role: 'Senior Pet Groomer', rating: 4.6, years: 6 },
  ],
};

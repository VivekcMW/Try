import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '@/services/apiClient';
import { useWalletStore } from '@/store/walletStore';

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
  /** Backend MerchantStaff.id when a real provider was picked */
  staffId?: string;
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
  /** Backend ServiceBooking.id once the POST succeeds */
  serverId?: string;
  /** Backend milestone ids, index-aligned with `milestones` */
  serverMilestoneIds?: string[];
};

type BookingStore = {
  bookings: ServiceBooking[];
  createBooking: (b: Omit<ServiceBooking, 'otp' | 'status' | 'createdAt' | 'history'>) => ServiceBooking;
  fetchBookings: () => Promise<void>;
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

// ── Server sync ──────────────────────────────────────────────────────────────
// Local state stays the source of truth for the UI (instant + demo timers);
// every action is mirrored to the backend fire-and-forget via `serverId`.

type ServerBooking = {
  id: string;
  kind: BookingKind;
  status: BookingStatus;
  category: string;
  date: string;
  slotLabel: string;
  address?: string | null;
  fromAddress?: string | null;
  toAddress?: string | null;
  bookingFor?: string | null;
  petName?: string | null;
  inventory?: string | null;
  fastingRequired?: boolean;
  roomCount?: string | null;
  recurrence?: { plan: string; meals?: string[] } | null;
  consultMode?: 'online' | 'office' | null;
  problem?: string | null;
  urgency?: 'normal' | 'emergency' | null;
  visitFeePaise?: number | null;
  totalPaise: number;
  advancePaise?: number | null;
  advancePaid?: boolean;
  otp: string;
  rating?: number | null;
  createdAt: string;
  merchant?: { id: string; name: string; category: string };
  staff?: { id: string; name: string; role: string } | null;
  items?: { name: string; pricePaise: number; durationMins?: number | null }[];
  quotes?: {
    type: string;
    label?: string | null;
    lineItems?: { label: string; pricePaise: number }[] | null;
    totalPaise: number;
    counterPaise?: number | null;
    status: string;
  }[];
  milestones?: { id: string; label: string; done: boolean }[];
  statusHistory?: { toStatus: BookingStatus; createdAt: string }[];
};

function currentUserId(): string | null {
  return useWalletStore.getState().userId;
}

/** Placeholder until the server OTP arrives — not security-sensitive */
function localOtp(): string {
  return String(1000 + (Date.now() % 9000));
}

function withServerIdentity(
  bookings: ServiceBooking[],
  localId: string,
  res: { id: string; otp?: string }
): ServiceBooking[] {
  return bookings.map((bk) =>
    bk.id === localId ? { ...bk, serverId: res.id, ...(res.otp ? { otp: res.otp } : {}) } : bk
  );
}

function withMilestoneDone(
  bookings: ServiceBooking[],
  id: string,
  index: number
): ServiceBooking[] {
  return bookings.map((bk) => {
    if (bk.id !== id || !bk.milestones) return bk;
    const milestones = bk.milestones.map((m, i) => (i === index ? { ...m, done: true } : m));
    const allDone = milestones.every((m) => m.done);
    return { ...bk, milestones, status: allDone ? ('work_done' as BookingStatus) : bk.status };
  });
}

function serverIdOf(id: string): string | undefined {
  return useBookingStore.getState().bookings.find((b) => b.id === id)?.serverId;
}

function sync(id: string, fn: (serverId: string, userId: string) => Promise<unknown>) {
  const serverId = serverIdOf(id);
  const userId = currentUserId();
  if (!serverId || !userId) return;
  fn(serverId, userId).catch(() => {});
}

function mapServerBooking(sb: ServerBooking): ServiceBooking {
  const projectQuote = sb.quotes?.find((q) => q.type === 'project');
  const onsiteQuote = sb.quotes?.find((q) => q.type === 'onsite');
  return {
    id: sb.id,
    serverId: sb.id,
    kind: sb.kind,
    merchantId: sb.merchant?.id ?? '',
    merchantName: sb.merchant?.name ?? '',
    category: sb.category,
    services: (sb.items ?? []).map((i) => ({
      id: i.name,
      name: i.name,
      pricePaise: i.pricePaise,
      durationMins: i.durationMins ?? undefined,
    })),
    date: sb.date,
    slotLabel: sb.slotLabel,
    address: sb.address ?? undefined,
    bookingFor: sb.bookingFor ?? undefined,
    petName: sb.petName ?? undefined,
    providerName: sb.staff?.name,
    providerRole: sb.staff?.role,
    staffId: sb.staff?.id,
    fromAddress: sb.fromAddress ?? undefined,
    toAddress: sb.toAddress ?? undefined,
    inventory: sb.inventory ?? undefined,
    fastingRequired: sb.fastingRequired ?? undefined,
    roomCount: sb.roomCount ?? undefined,
    recurrence: sb.recurrence ?? undefined,
    consultMode: sb.consultMode ?? undefined,
    counterPaise: projectQuote?.counterPaise ?? undefined,
    problem: sb.problem ?? undefined,
    urgency: sb.urgency ?? undefined,
    visitFeePaise: sb.visitFeePaise ?? undefined,
    onsiteQuote: onsiteQuote
      ? { label: onsiteQuote.label ?? '', pricePaise: onsiteQuote.totalPaise }
      : undefined,
    onsiteApproved: onsiteQuote?.status === 'approved' || undefined,
    quote: projectQuote?.lineItems
      ? { lineItems: projectQuote.lineItems, totalPaise: projectQuote.totalPaise }
      : undefined,
    advancePaise: sb.advancePaise ?? undefined,
    advancePaid: sb.advancePaid ?? undefined,
    milestones: sb.milestones?.map((m) => ({ label: m.label, done: m.done })),
    serverMilestoneIds: sb.milestones?.map((m) => m.id),
    otp: sb.otp,
    totalPaise: sb.totalPaise,
    rating: sb.rating ?? undefined,
    status: sb.status,
    createdAt: sb.createdAt,
    history: (sb.statusHistory ?? []).map((h) => ({ status: h.toStatus, at: h.createdAt })),
  };
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      bookings: [],

      createBooking: (b) => {
        const booking: ServiceBooking = {
          ...b,
          otp: localOtp(),
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

        const userId = currentUserId();
        if (userId) {
          apiFetch<{ id: string; otp?: string }>('/api/mobile/bookings', {
            method: 'POST',
            body: {
              userId,
              merchantId: b.merchantId,
              staffId: b.staffId,
              kind: b.kind,
              category: b.category,
              date: b.date,
              slotLabel: b.slotLabel,
              services: b.services,
              address: b.address,
              fromAddress: b.fromAddress,
              toAddress: b.toAddress,
              bookingFor: b.bookingFor,
              petName: b.petName,
              inventory: b.inventory,
              fastingRequired: b.fastingRequired,
              roomCount: b.roomCount,
              recurrence: b.recurrence,
              consultMode: b.consultMode,
              problem: b.problem,
              urgency: b.urgency,
              visitFeePaise: b.visitFeePaise,
              totalPaise: b.totalPaise,
              milestones: b.milestones?.map((m) => ({ label: m.label })),
            },
          })
            .then((res) =>
              set((s) => ({ bookings: withServerIdentity(s.bookings, booking.id, res) }))
            )
            .catch(() => {});
        }
        return booking;
      },

      fetchBookings: async () => {
        const userId = currentUserId();
        if (!userId) return;
        try {
          const res = await apiFetch<{ items: ServerBooking[] }>(
            `/api/mobile/bookings?userId=${userId}`
          );
          const local = get().bookings;
          const seen = new Set(local.map((b) => b.serverId).filter(Boolean));
          const incoming = (res.items ?? [])
            .filter((sb) => !seen.has(sb.id))
            .map(mapServerBooking);
          if (incoming.length > 0) {
            set({ bookings: [...incoming, ...local].sort((a, z) => z.createdAt.localeCompare(a.createdAt)) });
          }
        } catch {
          // offline — local cache stays
        }
      },

      setStatus: (id, status) => {
        set((s) => ({
          bookings: s.bookings.map((bk) =>
            bk.id === id && bk.status !== 'cancelled'
              ? { ...bk, status, history: [...bk.history, { status, at: new Date().toISOString() }] }
              : bk
          ),
        }));
        sync(id, (serverId, userId) =>
          status === 'cancelled'
            ? apiFetch(`/api/mobile/bookings/${serverId}/cancel`, {
                method: 'POST',
                body: { userId, reason: 'Cancelled by customer' },
              })
            : apiFetch(`/api/mobile/bookings/${serverId}`, {
                method: 'PATCH',
                body: { status, actorId: userId },
              })
        );
      },

      setOnsiteQuote: (id, quote) => {
        set((s) => ({
          bookings: s.bookings.map((bk) =>
            bk.id === id ? { ...bk, onsiteQuote: quote, status: 'quote_pending' } : bk
          ),
        }));
        sync(id, (serverId) =>
          apiFetch(`/api/mobile/bookings/${serverId}/onsite-quote`, {
            method: 'POST',
            body: { label: quote.label, pricePaise: quote.pricePaise },
          })
        );
      },

      approveOnsiteQuote: (id) => {
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
        }));
        sync(id, (serverId, userId) =>
          apiFetch(`/api/mobile/bookings/${serverId}/onsite-quote`, {
            method: 'PATCH',
            body: { actorId: userId },
          })
        );
      },

      setQuote: (id, quote) => {
        set((s) => ({
          bookings: s.bookings.map((bk) =>
            bk.id === id ? { ...bk, quote, status: 'quote_shared' } : bk
          ),
        }));
        sync(id, (serverId) =>
          apiFetch(`/api/mobile/bookings/${serverId}/quote`, {
            method: 'POST',
            body: { lineItems: quote.lineItems, totalPaise: quote.totalPaise },
          })
        );
      },

      acceptQuote: (id) => {
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
        }));
        sync(id, (serverId, userId) =>
          apiFetch(`/api/mobile/bookings/${serverId}/quote`, {
            method: 'PATCH',
            body: { actorId: userId, action: 'accept' },
          })
        );
      },

      counterQuote: (id, counterPaise) => {
        set((s) => ({
          bookings: s.bookings.map((bk) =>
            bk.id === id ? { ...bk, counterPaise } : bk
          ),
        }));
        sync(id, (serverId, userId) =>
          apiFetch(`/api/mobile/bookings/${serverId}/quote`, {
            method: 'PATCH',
            body: { actorId: userId, action: 'counter', counterPaise },
          })
        );
      },

      acceptCounter: (id) => {
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
        }));
        // merchant-side action in real life — sent without actor in demo
        sync(id, (serverId) =>
          apiFetch(`/api/mobile/bookings/${serverId}/quote`, {
            method: 'PATCH',
            body: { action: 'accept-counter' },
          })
        );
      },

      payAdvance: (id) => {
        set((s) => ({
          bookings: s.bookings.map((bk) =>
            bk.id === id ? { ...bk, advancePaid: true, status: 'scheduled' } : bk
          ),
        }));
        sync(id, (serverId, userId) =>
          apiFetch(`/api/mobile/bookings/${serverId}/advance`, {
            method: 'POST',
            body: { userId, method: 'upi' },
          })
        );
      },

      completeMilestone: (id, index) => {
        set((s) => ({ bookings: withMilestoneDone(s.bookings, id, index) }));
        const milestoneId = get().bookings.find((b) => b.id === id)?.serverMilestoneIds?.[index];
        if (milestoneId) {
          sync(id, (serverId, userId) =>
            apiFetch(`/api/mobile/bookings/${serverId}/milestones`, {
              method: 'PATCH',
              body: { actorId: userId, milestoneId },
            })
          );
        }
      },

      setRating: (id, rating) => {
        set((s) => ({
          bookings: s.bookings.map((bk) => (bk.id === id ? { ...bk, rating } : bk)),
        }));
        sync(id, (serverId, userId) =>
          apiFetch(`/api/mobile/bookings/${serverId}/rate`, {
            method: 'POST',
            body: { userId, rating },
          })
        );
      },

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

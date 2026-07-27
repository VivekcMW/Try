// PRD §05 — Peer Roles store
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type PeerRole =
  // ── Original 8 ──────────────────────────────────────────────────────────────
  | 'cook' | 'rider' | 'coach' | 'reseller' | 'handyman' | 'tutor' | 'beautician' | 'caretaker'
  // ── Home & Kitchen ───────────────────────────────────────────────────────────
  | 'tiffin_maker' | 'baker' | 'pickle_maker' | 'caterer'
  // ── Repairs & Technical ──────────────────────────────────────────────────────
  | 'mobile_repair' | 'computer_repair' | 'tailor' | 'cobbler' | 'watch_repair'
  // ── Health & Wellness ────────────────────────────────────────────────────────
  | 'physiotherapist' | 'dietitian' | 'home_nurse' | 'yoga_instructor' | 'massage_therapist'
  // ── Education & Childcare ────────────────────────────────────────────────────
  | 'music_teacher' | 'art_teacher' | 'language_teacher' | 'dance_teacher' | 'nanny'
  // ── Events & Lifestyle ───────────────────────────────────────────────────────
  | 'photographer' | 'mehendi_artist' | 'decorator' | 'dj' | 'pandit'
  // ── Logistics & Commerce ─────────────────────────────────────────────────────
  | 'courier' | 'kiryana_agent' | 'kabadiwala' | 'laundry_person'
  // ── Professional Services ────────────────────────────────────────────────────
  | 'accountant' | 'legal_helper' | 'interior_designer' | 'graphic_designer';

export interface RoleState {
  active: boolean;
  activatedAt: number | null;
  earningsPaise: number; // lifetime
  completedOrders: number;
  rating: number; // 0-5
}

const initialRole: RoleState = {
  active: false,
  activatedAt: null,
  earningsPaise: 0,
  completedOrders: 0,
  rating: 0,
};

interface PeerStoreState {
  roles: Record<PeerRole, RoleState>;
  activeMode: PeerRole | null; // currently in "role mode" (see PRD 17 §3.2)
  activate: (role: PeerRole) => void;
  deactivate: (role: PeerRole) => void;
  setMode: (role: PeerRole | null) => void;
  recordEarning: (role: PeerRole, paise: number) => void;
}

export const usePeerStore = create<PeerStoreState>()(
  persist(
    (set) => ({
      roles: {
        // Original 8
        cook: { ...initialRole }, rider: { ...initialRole }, coach: { ...initialRole },
        reseller: { ...initialRole }, handyman: { ...initialRole }, tutor: { ...initialRole },
        beautician: { ...initialRole }, caretaker: { ...initialRole },
        // Home & Kitchen
        tiffin_maker: { ...initialRole }, baker: { ...initialRole },
        pickle_maker: { ...initialRole }, caterer: { ...initialRole },
        // Repairs & Technical
        mobile_repair: { ...initialRole }, computer_repair: { ...initialRole },
        tailor: { ...initialRole }, cobbler: { ...initialRole }, watch_repair: { ...initialRole },
        // Health & Wellness
        physiotherapist: { ...initialRole }, dietitian: { ...initialRole },
        home_nurse: { ...initialRole }, yoga_instructor: { ...initialRole },
        massage_therapist: { ...initialRole },
        // Education & Childcare
        music_teacher: { ...initialRole }, art_teacher: { ...initialRole },
        language_teacher: { ...initialRole }, dance_teacher: { ...initialRole },
        nanny: { ...initialRole },
        // Events & Lifestyle
        photographer: { ...initialRole }, mehendi_artist: { ...initialRole },
        decorator: { ...initialRole }, dj: { ...initialRole }, pandit: { ...initialRole },
        // Logistics & Commerce
        courier: { ...initialRole }, kiryana_agent: { ...initialRole },
        kabadiwala: { ...initialRole }, laundry_person: { ...initialRole },
        // Professional Services
        accountant: { ...initialRole }, legal_helper: { ...initialRole },
        interior_designer: { ...initialRole }, graphic_designer: { ...initialRole },
      },
      activeMode: null,
      activate: (role) =>
        set((s) => ({
          roles: {
            ...s.roles,
            [role]: { ...s.roles[role], active: true, activatedAt: Date.now() },
          },
        })),
      deactivate: (role) =>
        set((s) => ({
          roles: {
            ...s.roles,
            [role]: { ...s.roles[role], active: false },
          },
          activeMode: s.activeMode === role ? null : s.activeMode,
        })),
      setMode: (role) => set({ activeMode: role }),
      recordEarning: (role, paise) =>
        set((s) => ({
          roles: {
            ...s.roles,
            [role]: {
              ...s.roles[role],
              earningsPaise: s.roles[role].earningsPaise + paise,
              completedOrders: s.roles[role].completedOrders + 1,
            },
          },
        })),
    }),
    {
      name: 'lokul.peer',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const ROLE_META: Record<
  PeerRole,
  { label: string; tagline: string; tint: string; emoji: string }
> = {
  cook: {
    label: 'Cook',
    tagline: 'Sell home-cooked meals to neighbors',
    tint: '#F97316',
    emoji: '🍛',
  },
  rider: {
    label: 'Rider',
    tagline: 'Run errands and earn',
    tint: '#0EA5E9',
    emoji: '🛵',
  },
  coach: {
    label: 'Coach',
    tagline: 'Teach what you love',
    tint: '#10B981',
    emoji: '🏋',
  },
  reseller: {
    label: 'Reseller',
    tagline: 'Source, list, resell at margin',
    tint: '#A855F7',
    emoji: '📦',
  },
  handyman: {
    label: 'Handyman',
    tagline: 'Fix plumbing, electrical & carpentry',
    tint: '#78716C',
    emoji: '🔧',
  },
  tutor: {
    label: 'Tutor',
    tagline: 'Academic coaching from home',
    tint: '#8B5CF6',
    emoji: '📚',
  },
  beautician: {
    label: 'Beautician',
    tagline: 'Home salon — hair, skin, nails',
    tint: '#EC4899',
    emoji: '💅',
  },
  caretaker: {
    label: 'Caretaker',
    tagline: 'Pet sitting, babysitting & elder care',
    tint: '#F59E0B',
    emoji: '🤝',
  },

  // ── Home & Kitchen ───────────────────────────────────────────────────────────
  tiffin_maker: {
    label: 'Tiffin Maker',
    tagline: 'Daily meal subscriptions for neighbors',
    tint: '#EA580C',
    emoji: '🍱',
  },
  baker: {
    label: 'Baker',
    tagline: 'Cakes, breads & snacks on order',
    tint: '#D97706',
    emoji: '🎂',
  },
  pickle_maker: {
    label: 'Pickle / Papad Maker',
    tagline: 'Home-made preserves & snacks',
    tint: '#84CC16',
    emoji: '🫙',
  },
  caterer: {
    label: 'Caterer',
    tagline: 'Bulk cooking for events & parties',
    tint: '#F97316',
    emoji: '🍽️',
  },

  // ── Repairs & Technical ──────────────────────────────────────────────────────
  mobile_repair: {
    label: 'Mobile Repair',
    tagline: 'Screen fixes, software & hardware issues',
    tint: '#0EA5E9',
    emoji: '📱',
  },
  computer_repair: {
    label: 'Computer Repair',
    tagline: 'Laptop / desktop hardware & software help',
    tint: '#6366F1',
    emoji: '💻',
  },
  tailor: {
    label: 'Tailor',
    tagline: 'Stitching, alteration & hemming from home',
    tint: '#DC2626',
    emoji: '🪡',
  },
  cobbler: {
    label: 'Cobbler',
    tagline: 'Shoe repair, sole fixing & polishing',
    tint: '#78716C',
    emoji: '👞',
  },
  watch_repair: {
    label: 'Watch / Jewellery Repair',
    tagline: 'Watch servicing & jewellery fixing',
    tint: '#A16207',
    emoji: '⌚',
  },

  // ── Health & Wellness ────────────────────────────────────────────────────────
  physiotherapist: {
    label: 'Physiotherapist',
    tagline: 'Home visit physio & rehab sessions',
    tint: '#14B8A6',
    emoji: '🏃',
  },
  dietitian: {
    label: 'Dietitian',
    tagline: 'Personalized meal plans & diet consulting',
    tint: '#16A34A',
    emoji: '🥗',
  },
  home_nurse: {
    label: 'Home Nurse',
    tagline: 'Post-surgery care & elder home nursing',
    tint: '#0284C7',
    emoji: '🩺',
  },
  yoga_instructor: {
    label: 'Yoga Instructor',
    tagline: 'Yoga & meditation sessions at home',
    tint: '#8B5CF6',
    emoji: '🧘',
  },
  massage_therapist: {
    label: 'Massage Therapist',
    tagline: 'Ayurvedic & relaxation massage at home',
    tint: '#EC4899',
    emoji: '🤲',
  },

  // ── Education & Childcare ────────────────────────────────────────────────────
  music_teacher: {
    label: 'Music Teacher',
    tagline: 'Guitar, tabla, vocals, piano & more',
    tint: '#F59E0B',
    emoji: '🎵',
  },
  art_teacher: {
    label: 'Art / Craft Teacher',
    tagline: 'Drawing, painting, pottery & crafts',
    tint: '#EC4899',
    emoji: '🎨',
  },
  language_teacher: {
    label: 'Language Teacher',
    tagline: 'English, Hindi & foreign language coaching',
    tint: '#3B82F6',
    emoji: '🗣️',
  },
  dance_teacher: {
    label: 'Dance Teacher',
    tagline: 'Classical, western & folk dance classes',
    tint: '#A855F7',
    emoji: '💃',
  },
  nanny: {
    label: 'Nanny / Babysitter',
    tagline: 'Trusted childcare at home',
    tint: '#F472B6',
    emoji: '👶',
  },

  // ── Events & Lifestyle ───────────────────────────────────────────────────────
  photographer: {
    label: 'Photographer',
    tagline: 'Portraits, events & product photography',
    tint: '#1E40AF',
    emoji: '📷',
  },
  mehendi_artist: {
    label: 'Mehendi Artist',
    tagline: 'Henna designs for weddings & festivals',
    tint: '#B45309',
    emoji: '✋',
  },
  decorator: {
    label: 'Decorator',
    tagline: 'Home & event decoration & themes',
    tint: '#7C3AED',
    emoji: '🎊',
  },
  dj: {
    label: 'DJ / Emcee',
    tagline: 'Music & hosting for parties & events',
    tint: '#0F172A',
    emoji: '🎧',
  },
  pandit: {
    label: 'Astrologer / Pandit',
    tagline: 'Puja booking, horoscope & rituals',
    tint: '#B91C1C',
    emoji: '🙏',
  },

  // ── Logistics & Commerce ─────────────────────────────────────────────────────
  courier: {
    label: 'Courier',
    tagline: 'Local package pickup & delivery',
    tint: '#0D9488',
    emoji: '📦',
  },
  kiryana_agent: {
    label: 'Kiryana Agent',
    tagline: 'Bulk mandi procurement for neighbors',
    tint: '#10B981',
    emoji: '🛒',
  },
  kabadiwala: {
    label: 'Kabadiwala',
    tagline: 'Scheduled scrap & e-waste collection',
    tint: '#65A30D',
    emoji: '♻️',
  },
  laundry_person: {
    label: 'Laundry',
    tagline: 'Wash, iron & home pick-up/drop service',
    tint: '#7C3AED',
    emoji: '👕',
  },

  // ── Professional Services ────────────────────────────────────────────────────
  accountant: {
    label: 'Accountant',
    tagline: 'ITR filing, GST help for small shops',
    tint: '#1E40AF',
    emoji: '📊',
  },
  legal_helper: {
    label: 'Legal Helper',
    tagline: 'Document drafting & affidavit assistance',
    tint: '#374151',
    emoji: '⚖️',
  },
  interior_designer: {
    label: 'Interior Designer',
    tagline: 'Home renovation & space planning',
    tint: '#9333EA',
    emoji: '🏠',
  },
  graphic_designer: {
    label: 'Graphic Designer',
    tagline: 'Social media, banners & visual content',
    tint: '#DB2777',
    emoji: '🎭',
  },
};

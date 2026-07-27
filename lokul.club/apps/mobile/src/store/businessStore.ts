// PRD §06 — Local Business Hub
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type MerchantType = 'retail' | 'food' | 'appointment' | 'services' | 'education';
export type PaymentMode = 'upi' | 'cash' | 'card' | 'cod';

export type BizCategory =
  // Retail & Shops
  | 'kirana' | 'pharmacy' | 'paan_shop' | 'bakery' | 'dairy'
  | 'gift_shop' | 'stationery' | 'electronics' | 'hardware'
  | 'clothing' | 'footwear' | 'toys'
  // Food & Beverages
  | 'restaurant' | 'cafe' | 'tiffin' | 'sweet_shop' | 'juice_bar'
  // Beauty, Health & Wellness
  | 'salon' | 'beauty_parlour' | 'spa' | 'clinic' | 'dental' | 'physio' | 'gym' | 'yoga_studio'
  // Home Services
  | 'plumber' | 'electrician' | 'carpenter' | 'ac_repair' | 'laundry' | 'tailor' | 'car_wash' | 'pest_control'
  // Education & Classes
  | 'tuition' | 'hobby_classes' | 'daycare'
  | 'other';

export interface BizProfile {
  id: string;
  name: string;
  category: BizCategory;
  merchantType: MerchantType;
  ownerName: string;
  phone: string;
  address: string;
  hoursOpen: string;
  hoursClose: string;
  closedOn: string[];
  bio: string;
  rating: number;
  reviewCount: number;
  registered: boolean;
  subscriptionTier: 'free' | 'pro';
  paymentModes: PaymentMode[];
  deliveryRadius?: number;
  slotDurationMins?: number;
  hasDineIn?: boolean;
  hasDelivery?: boolean;
}

interface BizState {
  myBusiness: BizProfile | null;
  registerBusiness: (b: Omit<BizProfile, 'id' | 'rating' | 'reviewCount' | 'registered' | 'subscriptionTier'>) => void;
  upgradeSubscription: () => void;
  updateBusiness: (partial: Partial<BizProfile>) => void;
}

export const useBusinessStore = create<BizState>()(
  persist(
    (set) => ({
      myBusiness: null,
      registerBusiness: (b) =>
        set({
          myBusiness: {
            ...b,
            id: 'biz_' + Date.now(),
            rating: 0,
            reviewCount: 0,
            registered: true,
            subscriptionTier: 'free',
          },
        }),
      upgradeSubscription: () =>
        set((s) =>
          s.myBusiness ? { myBusiness: { ...s.myBusiness, subscriptionTier: 'pro' } } : s
        ),
      updateBusiness: (partial) =>
        set((s) =>
          s.myBusiness ? { myBusiness: { ...s.myBusiness, ...partial } } : s
        ),
    }),
    { name: 'lokul.business', storage: createJSONStorage(() => AsyncStorage) }
  )
);

// Maps every category to its workflow type
export const MERCHANT_TYPE_MAP: Record<BizCategory, MerchantType> = {
  kirana: 'retail', pharmacy: 'retail', paan_shop: 'retail', bakery: 'retail', dairy: 'retail',
  gift_shop: 'retail', stationery: 'retail', electronics: 'retail', hardware: 'retail',
  clothing: 'retail', footwear: 'retail', toys: 'retail',
  restaurant: 'food', cafe: 'food', tiffin: 'food', sweet_shop: 'food', juice_bar: 'food',
  salon: 'appointment', beauty_parlour: 'appointment', spa: 'appointment', clinic: 'appointment',
  dental: 'appointment', physio: 'appointment', gym: 'appointment', yoga_studio: 'appointment',
  plumber: 'services', electrician: 'services', carpenter: 'services', ac_repair: 'services',
  laundry: 'services', tailor: 'services', car_wash: 'services', pest_control: 'services',
  tuition: 'education', hobby_classes: 'education', daycare: 'education',
  other: 'retail',
};

export type BizCategoryGroup = { type: MerchantType; label: string; categories: BizCategory[] };

export const CATEGORY_GROUPS: BizCategoryGroup[] = [
  {
    type: 'retail', label: 'Retail & Shops',
    categories: ['kirana', 'pharmacy', 'paan_shop', 'bakery', 'dairy', 'gift_shop', 'stationery', 'electronics', 'hardware', 'clothing', 'footwear', 'toys'],
  },
  {
    type: 'food', label: 'Food & Beverages',
    categories: ['restaurant', 'cafe', 'tiffin', 'sweet_shop', 'juice_bar'],
  },
  {
    type: 'appointment', label: 'Beauty, Health & Wellness',
    categories: ['salon', 'beauty_parlour', 'spa', 'clinic', 'dental', 'physio', 'gym', 'yoga_studio'],
  },
  {
    type: 'services', label: 'Home Services',
    categories: ['plumber', 'electrician', 'carpenter', 'ac_repair', 'laundry', 'tailor', 'car_wash', 'pest_control'],
  },
  {
    type: 'education', label: 'Education & Classes',
    categories: ['tuition', 'hobby_classes', 'daycare'],
  },
];

export const BIZ_CATEGORY_META: Record<BizCategory, { label: string; emoji: string; tint: string }> = {
  // Retail
  kirana:         { label: 'Kirana / Grocery',       emoji: '🛒', tint: '#10B981' },
  pharmacy:       { label: 'Pharmacy',                emoji: '💊', tint: '#06B6D4' },
  paan_shop:      { label: 'Paan / Pan Masala',       emoji: '🌿', tint: '#84CC16' },
  bakery:         { label: 'Bakery',                  emoji: '🍞', tint: '#D97706' },
  dairy:          { label: 'Dairy / Milk Booth',      emoji: '🥛', tint: '#38BDF8' },
  gift_shop:      { label: 'Gift / Florist',          emoji: '🎁', tint: '#F472B6' },
  stationery:     { label: 'Stationery / Books',      emoji: '📚', tint: '#A78BFA' },
  electronics:    { label: 'Electronics / Mobile',    emoji: '📱', tint: '#60A5FA' },
  hardware:       { label: 'Hardware / Tools',        emoji: '🔩', tint: '#78716C' },
  clothing:       { label: 'Clothing / Garments',     emoji: '👗', tint: '#FB923C' },
  footwear:       { label: 'Footwear',                emoji: '👟', tint: '#F97316' },
  toys:           { label: 'Toy Store',               emoji: '🧸', tint: '#F59E0B' },
  // Food
  restaurant:     { label: 'Restaurant / Dhaba',      emoji: '🍛', tint: '#F97316' },
  cafe:           { label: 'Cafe / Tea Stall',        emoji: '☕', tint: '#92400E' },
  tiffin:         { label: 'Tiffin / Cloud Kitchen',  emoji: '🍱', tint: '#B45309' },
  sweet_shop:     { label: 'Sweet Shop / Halwai',     emoji: '🍮', tint: '#EF4444' },
  juice_bar:      { label: 'Juice Bar',               emoji: '🥤', tint: '#16A34A' },
  // Appointment
  salon:          { label: 'Unisex Salon',            emoji: '✂️', tint: '#EC4899' },
  beauty_parlour: { label: 'Beauty Parlour',          emoji: '💄', tint: '#DB2777' },
  spa:            { label: 'Spa / Wellness',          emoji: '🧖', tint: '#8B5CF6' },
  clinic:         { label: 'Clinic / Doctor',         emoji: '🩺', tint: '#0EA5E9' },
  dental:         { label: 'Dental Clinic',           emoji: '🦷', tint: '#0284C7' },
  physio:         { label: 'Physiotherapy',           emoji: '🏃', tint: '#14B8A6' },
  gym:            { label: 'Gym / Fitness',           emoji: '🏋️', tint: '#EF4444' },
  yoga_studio:    { label: 'Yoga / Dance Studio',     emoji: '🧘', tint: '#6366F1' },
  // Services
  plumber:        { label: 'Plumber',                 emoji: '🔧', tint: '#0D9488' },
  electrician:    { label: 'Electrician',             emoji: '⚡', tint: '#F59E0B' },
  carpenter:      { label: 'Carpenter',               emoji: '🪚', tint: '#78716C' },
  ac_repair:      { label: 'AC / Appliance Repair',   emoji: '❄️', tint: '#2563EB' },
  laundry:        { label: 'Laundry / Dry Cleaning',  emoji: '👕', tint: '#7C3AED' },
  tailor:         { label: 'Tailor / Alteration',     emoji: '🪡', tint: '#DC2626' },
  car_wash:       { label: 'Car Wash / Garage',       emoji: '🚗', tint: '#1E40AF' },
  pest_control:   { label: 'Pest Control / Painting', emoji: '🐜', tint: '#D97706' },
  // Education
  tuition:        { label: 'Tuition / Coaching',      emoji: '📖', tint: '#8B5CF6' },
  hobby_classes:  { label: 'Hobby Classes',           emoji: '🎨', tint: '#EC4899' },
  daycare:        { label: 'Day Care / Playschool',   emoji: '🧒', tint: '#F59E0B' },
  // Other
  other:          { label: 'Other',                   emoji: '💼', tint: '#64748B' },
};

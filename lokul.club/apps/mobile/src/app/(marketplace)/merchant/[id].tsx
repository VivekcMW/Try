import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle, MessageCircle, Minus, Package, Plus, Search, ShoppingCart, Star } from 'lucide-react-native';
import { Avatar, Button, HStack, Text, VStack } from '@/components/ui';
import { AdSlot } from '@/components/AdSlot';
import { useWalletStore } from '@/store/walletStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useCartStore } from '@/store/cartStore';
import { DEMO_PROVIDERS, type Provider } from '@/store/bookingStore';
import { colors, fontSize, radius, shadows, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const formatPrice = (paise: number) => `₹${(paise / 100).toFixed(paise % 100 === 0 ? 0 : 2)}`;

type ApiMerchant = {
  id: string; name: string; bio?: string; rating?: number; reviewCount?: number;
  priceLabel?: string; verified?: boolean; responseTime?: string;
  societiesServed?: string[]; category?: string;
  owner?: { id: string; name: string; avatarUrl?: string };
  ownerId?: string;
  acceptingOrders?: boolean;
  closedReason?: string;
  closedUntil?: string;
  businessHoursStart?: string;
  businessHoursEnd?: string;
  estimatedDeliveryMins?: number;
};

type CatalogItem = {
  id: string; name: string; description?: string; pricePaise: number;
  unit?: string; imageUrl?: string; isAvailable: boolean; kind: string;
};


const DEMO_CATALOG: Record<string, CatalogItem[]> = {
  '1': [
    { id: '1', name: 'Amul Taaza Milk', description: 'Toned milk pouch', pricePaise: 6000, unit: '500ml', isAvailable: true, kind: 'product' },
    { id: '2', name: 'Britannia Bread', description: 'Whole wheat', pricePaise: 4000, unit: '400g', isAvailable: true, kind: 'product' },
    { id: '4', name: 'Amul Butter', description: 'Pasteurised', pricePaise: 5500, unit: '100g', isAvailable: true, kind: 'product' },
    { id: '5', name: 'Amul Ice Cream', description: 'Vanilla family pack', pricePaise: 15000, unit: '1L', isAvailable: true, kind: 'product' },
  ],
  '2': [
    { id: '21', name: 'Tomatoes', description: 'Fresh & ripe', pricePaise: 4000, unit: '1kg', isAvailable: true, kind: 'product' },
    { id: '22', name: 'Onions', description: 'Nashik red', pricePaise: 3500, unit: '1kg', isAvailable: true, kind: 'product' },
    { id: '23', name: 'Bananas', description: 'Robusta', pricePaise: 5000, unit: '1 dozen', isAvailable: true, kind: 'product' },
  ],
  '3': [
    { id: '31', name: 'Paracetamol 500mg', description: 'Strip of 10', pricePaise: 3000, unit: '10 tabs', isAvailable: true, kind: 'product' },
    { id: '32', name: 'Vitamin C', description: 'Chewable tablets', pricePaise: 12000, unit: '30 tabs', isAvailable: true, kind: 'product' },
    { id: '33', name: 'Band-Aid', description: 'Waterproof', pricePaise: 4500, unit: '20 strips', isAvailable: true, kind: 'product' },
  ],
  '4': [
    { id: '41', name: 'Whole Wheat Bread', description: 'Baked fresh today', pricePaise: 4500, unit: '400g', isAvailable: true, kind: 'product' },
    { id: '42', name: 'Chocolate Cake', description: 'Half kg, eggless', pricePaise: 35000, unit: '500g', isAvailable: true, kind: 'product' },
    { id: '43', name: 'Butter Cookies', description: 'Melt in mouth', pricePaise: 12000, unit: '250g', isAvailable: true, kind: 'product' },
  ],
  '5': [
    { id: '51', name: "Men's Haircut", description: 'Wash, cut & style', pricePaise: 15000, unit: 'session', isAvailable: true, kind: 'service' },
    { id: '52', name: 'Beard Trim & Shape', description: 'Hot towel finish', pricePaise: 8000, unit: 'session', isAvailable: true, kind: 'service' },
    { id: '53', name: 'Classic Facial', description: 'Deep cleanse, 45 min', pricePaise: 50000, unit: 'session', isAvailable: true, kind: 'service' },
    { id: '54', name: 'Hair Color (Global)', description: 'Ammonia-free', pricePaise: 80000, unit: 'session', isAvailable: true, kind: 'service' },
    { id: '55', name: 'Head Massage', description: 'Relaxing champi, 20 min', pricePaise: 20000, unit: 'session', isAvailable: true, kind: 'service' },
  ],
  '6': [
    { id: '61', name: "Women's Haircut", description: 'Consult, cut & blow dry', pricePaise: 30000, unit: 'session', isAvailable: true, kind: 'service' },
    { id: '62', name: 'Hair Spa', description: 'Deep conditioning, 60 min', pricePaise: 90000, unit: 'session', isAvailable: true, kind: 'service' },
    { id: '63', name: 'Manicure', description: 'Classic with polish', pricePaise: 35000, unit: 'session', isAvailable: true, kind: 'service' },
    { id: '64', name: 'Pedicure', description: 'Spa pedicure, 45 min', pricePaise: 45000, unit: 'session', isAvailable: true, kind: 'service' },
    { id: '65', name: 'Threading (Eyebrows)', description: 'Quick & precise', pricePaise: 6000, unit: 'session', isAvailable: true, kind: 'service' },
    { id: '66', name: 'Full Arms Waxing', description: 'Rica wax', pricePaise: 40000, unit: 'session', isAvailable: false, kind: 'service' },
  ],
  '7': [
    { id: '71', name: 'General Consultation', description: 'Dr. Meera Nair, MBBS MD', pricePaise: 30000, unit: 'visit', isAvailable: true, kind: 'service' },
    { id: '72', name: 'Blood Pressure Check', description: 'Walk-in, no appointment', pricePaise: 5000, unit: 'visit', isAvailable: true, kind: 'service' },
    { id: '73', name: 'Diabetes Screening', description: 'HbA1c + fasting sugar', pricePaise: 25000, unit: 'test', isAvailable: true, kind: 'service' },
    { id: '74', name: 'Flu Vaccination', description: 'Adults & children', pricePaise: 50000, unit: 'dose', isAvailable: true, kind: 'service' },
  ],
  '8': [
    { id: '81', name: 'Dental Checkup', description: 'Consultation + X-ray review', pricePaise: 20000, unit: 'visit', isAvailable: true, kind: 'service' },
    { id: '82', name: 'Teeth Cleaning (Scaling)', description: 'Ultrasonic, 30 min', pricePaise: 80000, unit: 'session', isAvailable: true, kind: 'service' },
    { id: '83', name: 'Tooth Filling', description: 'Composite, per tooth', pricePaise: 120000, unit: 'tooth', isAvailable: true, kind: 'service' },
    { id: '84', name: 'Root Canal Treatment', description: 'Single sitting RCT', pricePaise: 450000, unit: 'tooth', isAvailable: true, kind: 'service' },
  ],
  '9': [
    { id: '91', name: 'OPD Consultation', description: 'Specialist of your choice', pricePaise: 50000, unit: 'visit', isAvailable: true, kind: 'service' },
    { id: '92', name: 'Full Body Checkup', description: '62 parameters + reports', pricePaise: 250000, unit: 'package', isAvailable: true, kind: 'service' },
    { id: '93', name: 'X-Ray (Single View)', description: 'Digital, instant report', pricePaise: 40000, unit: 'scan', isAvailable: true, kind: 'service' },
    { id: '94', name: 'ECG', description: '12-lead with cardiologist review', pricePaise: 35000, unit: 'test', isAvailable: true, kind: 'service' },
    { id: '95', name: 'Physiotherapy Session', description: 'At clinic, 45 min', pricePaise: 60000, unit: 'session', isAvailable: true, kind: 'service' },
  ],
  '10': [
    { id: '101', name: 'AC Service (Deep Clean)', description: 'Split/window, foam jet wash', pricePaise: 59900, unit: 'unit', isAvailable: true, kind: 'service' },
    { id: '102', name: 'AC Gas Refill', description: 'R32/R410 with leak check', pricePaise: 150000, unit: 'unit', isAvailable: true, kind: 'service' },
    { id: '103', name: 'Fridge Repair', description: 'Diagnosis + labor', pricePaise: 40000, unit: 'visit', isAvailable: true, kind: 'service' },
    { id: '104', name: 'Washing Machine Repair', description: 'Diagnosis + labor', pricePaise: 45000, unit: 'visit', isAvailable: true, kind: 'service' },
  ],
  '11': [
    { id: '111', name: 'Tap / Faucet Replacement', description: 'Labor only, parts extra', pricePaise: 25000, unit: 'job', isAvailable: true, kind: 'service' },
    { id: '112', name: 'Leak Fix (Minor)', description: 'Joints, valves & pipes', pricePaise: 35000, unit: 'job', isAvailable: true, kind: 'service' },
    { id: '113', name: 'Switchboard / Wiring Fix', description: 'Per point, ISI parts', pricePaise: 20000, unit: 'point', isAvailable: true, kind: 'service' },
    { id: '114', name: 'Geyser Installation', description: 'Wall mount + connections', pricePaise: 60000, unit: 'job', isAvailable: true, kind: 'service' },
  ],
  '12': [
    { id: '121', name: '1BHK Local Shift', description: 'Packing to unloading, insured', pricePaise: 800000, unit: 'move', isAvailable: true, kind: 'service' },
    { id: '122', name: '2BHK Local Shift', description: 'Packing to unloading, insured', pricePaise: 1200000, unit: 'move', isAvailable: true, kind: 'service' },
    { id: '123', name: 'Few Items / Mini Move', description: 'Up to 10 boxes + 2 furniture', pricePaise: 300000, unit: 'move', isAvailable: true, kind: 'service' },
  ],
  '13': [
    { id: '131', name: 'Full Grooming (Dog)', description: 'Bath, haircut, nails — 60-90 min', pricePaise: 120000, unit: 'session', isAvailable: true, kind: 'service' },
    { id: '132', name: 'Bath & Brush (Cat/Dog)', description: 'Gentle shampoo + blow dry', pricePaise: 60000, unit: 'session', isAvailable: true, kind: 'service' },
    { id: '133', name: 'Vet Consultation', description: 'General health check', pricePaise: 40000, unit: 'visit', isAvailable: true, kind: 'service' },
    { id: '134', name: 'Vaccination (Anti-rabies)', description: 'Includes record card', pricePaise: 35000, unit: 'dose', isAvailable: true, kind: 'service' },
  ],
  '14': [
    { id: '141', name: 'Full Body Checkup', description: '60+ parameters · fasting required', pricePaise: 149900, unit: 'package', isAvailable: true, kind: 'service' },
    { id: '142', name: 'HbA1c + Fasting Sugar', description: 'Diabetes profile · fasting required', pricePaise: 45000, unit: 'test', isAvailable: true, kind: 'service' },
    { id: '143', name: 'Thyroid Profile (T3 T4 TSH)', description: 'No fasting needed', pricePaise: 40000, unit: 'test', isAvailable: true, kind: 'service' },
    { id: '144', name: 'Vitamin D + B12', description: 'No fasting needed', pricePaise: 90000, unit: 'test', isAvailable: true, kind: 'service' },
  ],
  '15': [
    { id: '151', name: 'Cockroach Treatment', description: 'Gel + spray, 90-day warranty', pricePaise: 89900, unit: 'home', isAvailable: true, kind: 'service' },
    { id: '152', name: 'Termite Treatment', description: 'Drill & inject, 1-yr warranty', pricePaise: 350000, unit: 'home', isAvailable: true, kind: 'service' },
    { id: '153', name: 'Bed Bug Treatment', description: '2 visits included', pricePaise: 150000, unit: 'home', isAvailable: true, kind: 'service' },
    { id: '154', name: 'Mosquito Fogging', description: 'Balcony + indoor', pricePaise: 60000, unit: 'home', isAvailable: true, kind: 'service' },
  ],
  '16': [
    { id: '161', name: 'Birthday Party Package', description: 'Photo + decor, 4 hrs', pricePaise: 1500000, unit: 'event', isAvailable: true, kind: 'service' },
    { id: '162', name: 'Wedding Photography', description: 'Full day, 2 photographers', pricePaise: 5000000, unit: 'event', isAvailable: true, kind: 'service' },
    { id: '163', name: 'Society Event Coverage', description: 'Photos + highlight video', pricePaise: 800000, unit: 'event', isAvailable: true, kind: 'service' },
  ],
  '17': [
    { id: '171', name: 'Veg Tiffin — Monthly', description: 'Lunch, 26 days, 3 roti + sabzi + dal + rice', pricePaise: 260000, unit: 'month', isAvailable: true, kind: 'service' },
    { id: '172', name: 'Veg + Non-veg — Monthly', description: 'Lunch, 26 days, chicken twice a week', pricePaise: 320000, unit: 'month', isAvailable: true, kind: 'service' },
    { id: '173', name: 'Trial Tiffin — 3 days', description: 'Try before you subscribe', pricePaise: 36000, unit: 'trial', isAvailable: true, kind: 'service' },
  ],
  '18': [
    { id: '181', name: 'ITR Filing Consultation', description: '30 min with CA', pricePaise: 99900, unit: 'session', isAvailable: true, kind: 'service' },
    { id: '182', name: 'GST Registration Help', description: '45 min + document checklist', pricePaise: 149900, unit: 'session', isAvailable: true, kind: 'service' },
    { id: '183', name: 'Legal Consultation', description: '30 min with advocate', pricePaise: 120000, unit: 'session', isAvailable: true, kind: 'service' },
    { id: '184', name: 'Rent Agreement + Notary', description: 'Drafting & registration', pricePaise: 250000, unit: 'document', isAvailable: true, kind: 'service' },
  ],
  '20': [
    { id: '201', name: 'Wash & Fold', description: 'Per kg, 48h turnaround', pricePaise: 8000, unit: 'kg', isAvailable: true, kind: 'service' },
    { id: '202', name: 'Wash & Iron', description: 'Per kg, 48h turnaround', pricePaise: 12000, unit: 'kg', isAvailable: true, kind: 'service' },
    { id: '203', name: 'Dry Clean — Suit/Saree', description: 'Per piece, 72h', pricePaise: 25000, unit: 'piece', isAvailable: true, kind: 'service' },
    { id: '204', name: 'Shoe Cleaning', description: 'Per pair', pricePaise: 20000, unit: 'pair', isAvailable: true, kind: 'service' },
  ],
  '21': [
    { id: '211', name: 'Daily Cleaning — Monthly', description: 'Brooming, mopping & dusting, 26 days', pricePaise: 250000, unit: 'month', isAvailable: true, kind: 'service' },
    { id: '212', name: 'Utensils + Cleaning — Monthly', description: 'Full package, 26 days', pricePaise: 350000, unit: 'month', isAvailable: true, kind: 'service' },
    { id: '213', name: 'Bathroom Deep Clean', description: 'One-time, per bathroom', pricePaise: 45000, unit: 'bathroom', isAvailable: true, kind: 'service' },
    { id: '214', name: 'Trial Visit', description: 'Meet & see the work before hiring', pricePaise: 20000, unit: 'visit', isAvailable: true, kind: 'service' },
  ],
  '22': [
    { id: '221', name: 'Daily Cooking — Monthly', description: 'Lunch + dinner for family of 4, 26 days', pricePaise: 600000, unit: 'month', isAvailable: true, kind: 'service' },
    { id: '222', name: 'One Meal Daily — Monthly', description: 'Lunch or dinner, 26 days', pricePaise: 350000, unit: 'month', isAvailable: true, kind: 'service' },
    { id: '223', name: 'Trial Meal', description: 'One meal cooked at your home', pricePaise: 30000, unit: 'visit', isAvailable: true, kind: 'service' },
    { id: '224', name: 'Party Cooking (up to 15)', description: 'One-day event cooking', pricePaise: 250000, unit: 'event', isAvailable: true, kind: 'service' },
  ],
  '23': [
    { id: '231', name: 'Driver — 4 hours', description: 'Your car, verified driver', pricePaise: 60000, unit: 'booking', isAvailable: true, kind: 'service' },
    { id: '232', name: 'Driver — Full day (8 hrs)', description: 'Outstation allowed', pricePaise: 110000, unit: 'day', isAvailable: true, kind: 'service' },
    { id: '233', name: 'Monthly Driver', description: 'Mon–Sat, 8 hrs/day', pricePaise: 1800000, unit: 'month', isAvailable: true, kind: 'service' },
  ],
  '24': [
    { id: '241', name: 'Furniture Repair', description: 'Hinges, joints & polish touch-up', pricePaise: 35000, unit: 'job', isAvailable: true, kind: 'service' },
    { id: '242', name: 'Curtain Rod / Shelf Fitting', description: 'Per fitting with hardware', pricePaise: 25000, unit: 'fitting', isAvailable: true, kind: 'service' },
    { id: '243', name: 'Door Alignment & Locks', description: 'Per door', pricePaise: 30000, unit: 'door', isAvailable: true, kind: 'service' },
  ],
  '25': [
    { id: '251', name: '1BHK Full Painting', description: 'Putty + primer + 2 coats', pricePaise: 1800000, unit: 'home', isAvailable: true, kind: 'service' },
    { id: '252', name: '2BHK Full Painting', description: 'Putty + primer + 2 coats', pricePaise: 2800000, unit: 'home', isAvailable: true, kind: 'service' },
    { id: '253', name: 'Single Wall / Accent', description: 'Texture or solid color', pricePaise: 250000, unit: 'wall', isAvailable: true, kind: 'service' },
    { id: '254', name: 'Bathroom Waterproofing', description: 'Leak-proof warranty 2 yrs', pricePaise: 600000, unit: 'bathroom', isAvailable: true, kind: 'service' },
  ],
  '27': [
    { id: '271', name: 'Garden Maintenance — Monthly', description: '2 visits/week, pruning & watering setup', pricePaise: 150000, unit: 'month', isAvailable: true, kind: 'service' },
    { id: '272', name: 'One-time Garden Cleanup', description: 'Weeding, trimming & disposal', pricePaise: 80000, unit: 'visit', isAvailable: true, kind: 'service' },
    { id: '273', name: 'Terrace Garden Setup', description: 'Pots, soil & starter plants', pricePaise: 350000, unit: 'setup', isAvailable: true, kind: 'service' },
  ],
  '28': [
    { id: '281', name: 'Exterior Wash', description: 'Waterless eco wash + tyre shine', pricePaise: 30000, unit: 'wash', isAvailable: true, kind: 'service' },
    { id: '282', name: 'Interior + Exterior', description: 'Vacuum, dashboard polish & wash', pricePaise: 60000, unit: 'wash', isAvailable: true, kind: 'service' },
    { id: '283', name: 'Monthly Plan (4 washes)', description: 'Weekly exterior wash', pricePaise: 100000, unit: 'month', isAvailable: true, kind: 'service' },
  ],
  '29': [
    { id: '291', name: 'Personal Training — Session', description: 'At home or society gym, 60 min', pricePaise: 80000, unit: 'session', isAvailable: true, kind: 'service' },
    { id: '292', name: 'Personal Training — Monthly', description: '12 sessions', pricePaise: 800000, unit: 'month', isAvailable: true, kind: 'service' },
    { id: '293', name: 'Yoga — Group Class', description: 'Society clubhouse, 45 min', pricePaise: 30000, unit: 'class', isAvailable: true, kind: 'service' },
    { id: '294', name: 'Yoga — Monthly (12 classes)', description: 'Morning batches', pricePaise: 300000, unit: 'month', isAvailable: true, kind: 'service' },
  ],
  '30': [
    { id: '301', name: 'Swedish Massage — 60 min', description: 'Certified therapist at home', pricePaise: 150000, unit: 'session', isAvailable: true, kind: 'service' },
    { id: '302', name: 'Deep Tissue — 60 min', description: 'For muscle recovery', pricePaise: 180000, unit: 'session', isAvailable: true, kind: 'service' },
    { id: '303', name: 'Physiotherapy Session', description: 'Post-injury / posture care at home', pricePaise: 70000, unit: 'session', isAvailable: true, kind: 'service' },
  ],
  '32': [
    { id: '321', name: 'Maths Tuition — Monthly', description: 'Class 6-10, 3 days/week at home', pricePaise: 400000, unit: 'month', isAvailable: true, kind: 'service' },
    { id: '322', name: 'Science Tuition — Monthly', description: 'Class 6-10, 3 days/week', pricePaise: 400000, unit: 'month', isAvailable: true, kind: 'service' },
    { id: '323', name: 'Demo Class', description: 'Free 45-min trial class', pricePaise: 0, unit: 'class', isAvailable: true, kind: 'service' },
  ],
  '33': [
    { id: '331', name: 'Elder Care — Day Shift', description: '8 hrs, verified caretaker', pricePaise: 120000, unit: 'day', isAvailable: true, kind: 'service' },
    { id: '332', name: 'Elder Care — Monthly', description: 'Mon–Sat day shift', pricePaise: 2500000, unit: 'month', isAvailable: true, kind: 'service' },
    { id: '333', name: 'Nanny — Monthly', description: 'Mon–Sat, 8 hrs/day', pricePaise: 1800000, unit: 'month', isAvailable: true, kind: 'service' },
    { id: '334', name: 'Meet & Greet Visit', description: 'Interview the caretaker first', pricePaise: 0, unit: 'visit', isAvailable: true, kind: 'service' },
  ],
};

export default function MerchantProfileScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);
  const addToCart = useCartStore((s) => s.addItem);
  // Subscribe to items so quantities and the cart FAB stay in sync
  const cartItems = useCartStore((s) => s.items);
  const getItemQuantity = (itemId: string) =>
    cartItems.find((i) => i.id === itemId)?.quantity ?? 0;
  const totalCartItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const [merchant, setMerchant] = useState<ApiMerchant | null>(null);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [staff, setStaff] = useState<Provider[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading,  setLoading]  = useState(true);
  const insets = useSafeAreaInsets();

  const filteredItems = catalogItems
    .filter((item) => {
      if (!searchQuery) return true;
      return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/merchants/${id}`);
      const data = await res.json();

      if (!res.ok || !data?.id) {
        setMerchant(null);
        setCatalogItems([]);
        return;
      }

      setMerchant(data);
      const catalogRes = await fetch(`${BASE}/api/mobile/merchants/${id}/catalog`);
      const catalogData = await catalogRes.json();
      setCatalogItems(catalogRes.ok ? (catalogData.items || []) : []);
    } catch {
      setMerchant(null);
      setCatalogItems([]);
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    fetch(`${BASE}/api/mobile/merchants/${id}/staff`)
      .then((r) => r.json())
      .then((data: { items?: { id: string; name: string; role: string; rating?: number; years?: number }[] }) => {
        if (!alive) return;
        const items = (data.items ?? []).map((s) => ({
          id: s.id, name: s.name, role: s.role, rating: s.rating ?? 0, years: s.years ?? 0,
        }));
        setStaff(items.length > 0 ? items : (DEMO_PROVIDERS[id] ?? []));
      })
      .catch(() => { if (alive) setStaff(DEMO_PROVIDERS[id] ?? []); });
    return () => { alive = false; };
  }, [id]);

  const messageShop = async () => {
    if (!userId) return;
    const recipientId = merchant?.owner?.id ?? merchant?.ownerId;
    if (!recipientId) {
      Alert.alert('Chat unavailable', 'This shop has not enabled chat yet.');
      return;
    }
    try {
      const res = await fetch(`${BASE}/api/mobile/chat/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, recipientId }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/(chat)/thread/${data.id}` as never);
      } else {
        Alert.alert('Error', 'Could not start conversation — please try again.');
      }
    } catch {
      Alert.alert('Error', 'Could not start conversation — please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (!merchant) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack gap={3} align="center" style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
            <ArrowLeft size={20} color={colors.surface.heading} />
          </Pressable>
          <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Shop</Text>
        </HStack>
        <View style={{ alignItems: 'center', paddingTop: spacing[16], paddingHorizontal: spacing[6], gap: spacing[3] }}>
          <Package size={56} color={colors.gray[300]} />
          <Text variant="h3" style={{ color: colors.surface.heading }}>Shop not found</Text>
          <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
            This shop may have moved or is no longer available.
          </Text>
          <Button label="Browse Other Shops" onPress={() => router.replace('/(discover)/catalog' as never)} style={{ marginTop: spacing[3] }} />
        </View>
      </SafeAreaView>
    );
  }

  const isOpen = merchant.acceptingOrders !== false;
  const totalPaise = cartItems.reduce((sum, i) => sum + i.pricePaise * i.quantity, 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Compact nav — shop name lives in the bar */}
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Go back" hitSlop={8}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" numberOfLines={1} style={{ flex: 1, color: colors.surface.heading }}>
          {merchant.name}
        </Text>
        <Pressable onPress={messageShop} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Message shop" hitSlop={8}>
          <MessageCircle size={18} color={colors.brand[600]} />
        </Pressable>
      </HStack>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        stickyHeaderIndices={[2]}
        showsVerticalScrollIndicator={false}
      >
        {/* [0] Identity card */}
        <View style={styles.identityCard}>
          <HStack gap={3} align="center">
            <Avatar name={merchant.name} size="lg" />
            <VStack gap={0.5} style={{ flex: 1 }}>
              <HStack gap={1.5} align="center">
                <Text variant="h3" numberOfLines={1} style={{ color: colors.surface.heading, flexShrink: 1 }}>
                  {merchant.name}
                </Text>
                {merchant.verified && (
                  <CheckCircle size={16} color={colors.semantic.success} />
                )}
              </HStack>
              {!!merchant.bio && (
                <Text variant="caption" tone="secondary" numberOfLines={1}>
                  {merchant.bio}
                </Text>
              )}
              <HStack gap={1} align="center">
                <Star size={12} color={colors.accent[500]} fill={colors.accent[500]} />
                <Text style={styles.ratingLine}>
                  {merchant.rating?.toFixed(1) ?? '—'}
                  <Text style={styles.ratingCount}> ({merchant.reviewCount ?? 0} reviews)</Text>
                </Text>
              </HStack>
            </VStack>
          </HStack>

          {/* Info strip: the 3 facts buyers care about */}
          <View style={styles.infoStrip}>
            <View style={styles.infoCell}>
              <Text style={styles.infoValue}>
                {merchant.estimatedDeliveryMins ? `${merchant.estimatedDeliveryMins} min` : '—'}
              </Text>
              <Text style={styles.infoLabel}>Delivery</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoCell}>
              <Text style={[styles.infoValue, { color: isOpen ? colors.semantic.success : colors.semantic.danger }]}>
                {isOpen ? 'Open' : 'Closed'}
              </Text>
              <Text style={styles.infoLabel}>
                {merchant.businessHoursStart && merchant.businessHoursEnd
                  ? `${merchant.businessHoursStart}–${merchant.businessHoursEnd}`
                  : 'Status'}
              </Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoCell}>
              <Text style={styles.infoValue}>{merchant.responseTime ?? '—'}</Text>
              <Text style={styles.infoLabel}>Responds</Text>
            </View>
          </View>
        </View>

        {/* [1] Closed banner */}
        {!isOpen ? (
          <View style={styles.closedBanner}>
            <AlertTriangle size={18} color={colors.semantic.warning} />
            <VStack gap={0} style={{ flex: 1 }}>
              <Text style={styles.closedTitle}>Not accepting orders right now</Text>
              {!!merchant.closedReason && (
                <Text style={styles.closedBody}>{merchant.closedReason}</Text>
              )}
              {!!merchant.closedUntil && (
                <Text style={styles.closedBody}>
                  Reopens {new Date(merchant.closedUntil).toLocaleString()}
                </Text>
              )}
            </VStack>
          </View>
        ) : (
          <View>
            {/* Team strip — stylists / doctors */}
            {staff.length > 0 && (
              <View style={styles.teamSection}>
                <Text style={styles.teamTitle}>Meet the team</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexGrow: 0 }}
                  contentContainerStyle={{ gap: spacing[2.5], paddingRight: spacing[4] }}
                >
                  {staff.map((p) => (
                    <View key={p.id} style={styles.teamCard}>
                      <View style={styles.teamAvatar}>
                        <Text style={styles.teamInitial}>{p.name.replace('Dr. ', '').charAt(0)}</Text>
                      </View>
                      <Text style={styles.teamName} numberOfLines={1}>{p.name}</Text>
                      <Text style={styles.teamRole} numberOfLines={2}>{p.role}</Text>
                      <HStack gap={1} align="center">
                        <Star size={10} color={colors.accent[500]} fill={colors.accent[500]} />
                        <Text style={styles.teamRating}>{p.rating.toFixed(1)} · {p.years} yrs</Text>
                      </HStack>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* [2] Sticky search */}
        <View style={styles.searchWrap}>
          <View style={styles.searchContainer}>
            <Search size={18} color={colors.surface.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search in ${merchant.name}...`}
              placeholderTextColor={colors.surface.textDisabled}
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel="Search items in this shop"
            />
          </View>
        </View>

        {/* [3] Catalog */}
        <View style={styles.catalogSection}>
          <Text style={styles.catalogTitle}>
            All Items{filteredItems.length > 0 ? ` (${filteredItems.length})` : ''}
          </Text>

          {filteredItems.length === 0 && (
            <View style={styles.emptyCatalog}>
              <Package size={40} color={colors.gray[300]} />
              <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
                {searchQuery ? `No items match "${searchQuery}"` : 'No items listed yet'}
              </Text>
            </View>
          )}

          {filteredItems.map((item, idx) => {
            const qty = getItemQuantity(item.id);
            const canBuy = item.isAvailable && isOpen;
            return (
              <View key={item.id}>
                {idx > 0 && <View style={styles.rowDivider} />}
                <HStack gap={3} style={styles.itemRow}>
                  {/* Info left */}
                  <VStack gap={0.5} style={{ flex: 1 }}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    {!!item.description && (
                      <Text variant="caption" tone="secondary" numberOfLines={1}>
                        {item.description}
                      </Text>
                    )}
                    <HStack gap={1.5} align="center">
                      <Text style={styles.itemPrice}>{formatPrice(item.pricePaise)}</Text>
                      {!!item.unit && (
                        <Text variant="caption" tone="secondary">/ {item.unit}</Text>
                      )}
                    </HStack>
                    {!item.isAvailable && (
                      <Text style={styles.outOfStock}>Out of stock</Text>
                    )}
                  </VStack>

                  {/* Image + ADD overlay right */}
                  <View style={styles.itemImageWrap}>
                    <View style={styles.itemImagePlaceholder}>
                      <Text style={styles.itemInitial}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    {canBuy && (
                      qty === 0 ? (
                        <Pressable
                          style={styles.addBtn}
                          onPress={() => addToCart({
                            id: item.id,
                            merchantId: merchant.id,
                            merchantName: merchant.name,
                            name: item.name,
                            pricePaise: item.pricePaise,
                            unit: item.unit,
                            imageUrl: item.imageUrl,
                            kind: item.kind,
                          })}
                          accessibilityRole="button"
                          accessibilityLabel={`Add ${item.name} to cart`}
                        >
                          <Plus size={13} color={colors.brand[600]} strokeWidth={2.5} />
                          <Text style={styles.addBtnText}>ADD</Text>
                        </Pressable>
                      ) : (
                        <View style={styles.stepper}>
                          <Pressable
                            style={styles.stepBtn}
                            onPress={() => useCartStore.getState().updateQuantity(item.id, qty - 1)}
                            accessibilityRole="button"
                            accessibilityLabel="Decrease quantity"
                            hitSlop={6}
                          >
                            <Minus size={13} color={colors.surface.background} strokeWidth={2.5} />
                          </Pressable>
                          <Text style={styles.stepQty}>{qty}</Text>
                          <Pressable
                            style={styles.stepBtn}
                            onPress={() => useCartStore.getState().updateQuantity(item.id, qty + 1)}
                            accessibilityRole="button"
                            accessibilityLabel="Increase quantity"
                            hitSlop={6}
                          >
                            <Plus size={13} color={colors.surface.background} strokeWidth={2.5} />
                          </Pressable>
                        </View>
                      )
                    )}
                  </View>
                </HStack>
              </View>
            );
          })}
        </View>

        {/* In-feed ad */}
        <View style={{ marginHorizontal: spacing[4], marginTop: spacing[4] }}>
          <AdSlot placement="marketplace" pinCode={pinCode ?? undefined} />
        </View>
      </ScrollView>

      {/* Sticky cart bar */}
      {totalCartItems > 0 && (
        <Pressable
          style={[styles.cartBar, { bottom: insets.bottom + spacing[3] }]}
          onPress={() => router.push('/(marketplace)/cart' as never)}
          accessibilityRole="button"
          accessibilityLabel={`View cart, ${totalCartItems} items, ${formatPrice(totalPaise)}`}
        >
          <HStack gap={2} align="center" style={{ flex: 1 }}>
            <ShoppingCart size={18} color={colors.surface.background} />
            <Text style={styles.cartBarText}>
              {totalCartItems} item{totalCartItems > 1 ? 's' : ''} · {formatPrice(totalPaise)}
            </Text>
          </HStack>
          <HStack gap={1} align="center">
            <Text style={styles.cartBarCta}>View Cart</Text>
            <ArrowRight size={16} color={colors.surface.background} />
          </HStack>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  topBar: {
    paddingHorizontal: spacing[4], paddingVertical: spacing[2.5],
    borderBottomWidth: 1, borderBottomColor: colors.surface.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: radius.full,
    backgroundColor: colors.surface.surfaceMuted,
    borderWidth: 1, borderColor: colors.surface.border,
    alignItems: 'center', justifyContent: 'center',
  },
  identityCard: {
    margin: spacing[4],
    marginBottom: 0,
    padding: spacing[4],
    backgroundColor: colors.surface.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    gap: spacing[3],
  },
  ratingLine: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  ratingCount: {
    fontSize: fontSize.xs,
    fontWeight: '400',
    color: colors.surface.textSecondary,
  },
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.surface.border,
  },
  infoCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.surface.textSecondary,
  },
  infoDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.surface.border,
  },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2.5],
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    padding: spacing[3],
    backgroundColor: colors.semantic.warningBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent[200],
  },
  closedTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.semantic.warning,
  },
  closedBody: {
    fontSize: fontSize.xs,
    color: colors.semantic.warning,
  },
  teamSection: {
    paddingLeft: spacing[4],
    paddingTop: spacing[3],
    gap: spacing[2],
  },
  teamTitle: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  teamCard: {
    width: 128,
    padding: spacing[3],
    backgroundColor: colors.surface.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    alignItems: 'center',
    gap: spacing[1],
  },
  teamAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.brand[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamInitial: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.brand[600],
  },
  teamName: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.surface.heading,
    textAlign: 'center',
  },
  teamRole: {
    fontSize: 10,
    color: colors.surface.textSecondary,
    textAlign: 'center',
    lineHeight: 13,
  },
  teamRating: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.surface.heading,
  },
  searchWrap: {
    backgroundColor: colors.surface.background,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    paddingHorizontal: spacing[3],
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.surface.heading,
  },
  catalogSection: {
    paddingHorizontal: spacing[4],
  },
  catalogTitle: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.surface.heading,
    marginBottom: spacing[2],
  },
  emptyCatalog: {
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[10],
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.surface.border,
  },
  itemRow: {
    paddingVertical: spacing[3.5],
  },
  itemName: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.surface.heading,
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  outOfStock: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.semantic.danger,
  },
  itemImageWrap: {
    width: 88,
    alignItems: 'center',
  },
  itemImagePlaceholder: {
    width: 80,
    height: 68,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInitial: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.brand[600],
  },
  addBtn: {
    // Overlaps the image bottom edge, Swiggy-style
    marginTop: -14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: 76,
    height: 30,
    backgroundColor: colors.brand[50],
    borderWidth: 1,
    borderColor: colors.brand[600],
    borderRadius: radius.sm,
    ...shadows.xs.ios,
    elevation: shadows.xs.android,
  },
  addBtnText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.brand[600],
    letterSpacing: 0.5,
  },
  stepper: {
    marginTop: -14,
    flexDirection: 'row',
    alignItems: 'center',
    width: 76,
    height: 30,
    backgroundColor: colors.brand[600],
    borderRadius: radius.sm,
    overflow: 'hidden',
    ...shadows.xs.ios,
    elevation: shadows.xs.android,
  },
  stepBtn: {
    width: 26,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepQty: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.surface.background,
  },
  cartBar: {
    position: 'absolute',
    left: spacing[4],
    right: spacing[4],
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    backgroundColor: colors.brand[600],
    borderRadius: radius.lg,
    ...shadows.md.ios,
    elevation: shadows.md.android,
  },
  cartBarText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.surface.background,
  },
  cartBarCta: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.surface.background,
  },
});

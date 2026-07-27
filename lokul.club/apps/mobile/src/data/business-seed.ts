// Mock data for PRD §06 Local Business Hub — all merchant types
import type { MerchantType } from '@/store/businessStore';

// ─── Shared ─────────────────────────────────────────────────────────────────
export interface CatalogueItem {
  id: string;
  name: string;
  priceRupees: number;
  category: string;
  stock: number;
  available: boolean;
  imageHint: string;
}

export interface BizPost {
  id: string;
  title: string;
  body: string;
  type: 'offer' | 'announcement' | 'arrival' | 'event';
  postedAt: number;
  reachViews: number;
  clicks: number;
}

export interface BizOrder {
  id: string;
  customerName: string;
  customerFlat: string;
  items: { name: string; qty: number; priceRupees: number }[];
  status: 'new' | 'packing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  totalRupees: number;
  placedAt: number;
  payment: 'paid' | 'cod';
}

export interface NearbyBiz {
  id: string;
  name: string;
  category: string;
  merchantType: MerchantType;
  emoji: string;
  rating: number;
  reviewCount: number;
  distanceM: number;
  openNow: boolean;
  tags: string[];
  promo?: string;
  phone: string;
  hoursOpen: string;
  hoursClose: string;
  bio: string;
}

// ─── Food types ──────────────────────────────────────────────────────────────
export interface MenuItem {
  id: string;
  name: string;
  category: string;
  priceRupees: number;
  available: boolean;
  isVeg: boolean;
  popular?: boolean;
}

export interface FoodOrder {
  id: string;
  customerName: string;
  customerFlat: string;
  items: { name: string; qty: number; priceRupees: number }[];
  status: 'new' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered';
  totalRupees: number;
  placedAt: number;
  orderType: 'delivery' | 'pickup';
  payment: 'paid' | 'cod';
}

// ─── Education types ─────────────────────────────────────────────────────────
export interface EducationBatch {
  id: string;
  subject: string;
  level: string;
  timing: string;
  days: string;
  students: number;
  capacity: number;
  feeRupees: number;
  active: boolean;
}

export interface StudentFee {
  id: string;
  studentName: string;
  flat: string;
  batchName: string;
  month: string;
  feeRupees: number;
  paid: boolean;
}

// ─── Reviews ─────────────────────────────────────────────────────────────────
export interface BizReview {
  id: string;
  authorName: string;
  authorFlat: string;
  rating: number;
  body: string;
  postedAt: number;
}

// ─────────────────────────────────────────────────────────────────────────────

const now = Date.now();
const ago = (n: number) => now - n * 60_000;

// ─── Retail seed ─────────────────────────────────────────────────────────────
export const CATALOGUE: CatalogueItem[] = [
  { id: 'c1', name: 'Aashirvaad Atta 10 kg',   priceRupees: 540, category: 'Staples',   stock: 22, available: true,  imageHint: 'atta' },
  { id: 'c2', name: 'Amul Gold Milk 1 L',       priceRupees: 68,  category: 'Dairy',     stock: 40, available: true,  imageHint: 'milk' },
  { id: 'c3', name: 'Tata Salt 1 kg',           priceRupees: 28,  category: 'Staples',   stock: 60, available: true,  imageHint: 'salt' },
  { id: 'c4', name: 'Surf Excel 1 kg',          priceRupees: 215, category: 'Household', stock: 12, available: true,  imageHint: 'detergent' },
  { id: 'c5', name: 'Maggi (Pack of 4)',         priceRupees: 56,  category: 'Snacks',    stock: 0,  available: false, imageHint: 'maggi' },
  { id: 'c6', name: 'Fortune Sunflower Oil 1 L', priceRupees: 155, category: 'Staples',   stock: 18, available: true,  imageHint: 'oil' },
  { id: 'c7', name: 'Dettol Soap (4 pack)',      priceRupees: 110, category: 'Personal',  stock: 30, available: true,  imageHint: 'soap' },
];

export const BIZ_POSTS: BizPost[] = [
  { id: 'bp1', title: 'Fresh Alphonso Mangoes!',           body: 'Kesar & Alphonso arrived this morning. ₹450/dozen. Limited stock.',                          type: 'arrival',      postedAt: ago(28),  reachViews: 412,  clicks: 38 },
  { id: 'bp2', title: '10% off on groceries above ₹999',  body: 'Valid till Sunday 8 PM. Free home delivery within 500 m.',                                   type: 'offer',        postedAt: ago(120), reachViews: 1284, clicks: 96 },
  { id: 'bp3', title: 'Shop closed Friday — maintenance',  body: "We'll be closed Friday for AC servicing. Re-open Saturday 8 AM.",                            type: 'announcement', postedAt: ago(360), reachViews: 308,  clicks: 4  },
];

export const BIZ_ORDERS: BizOrder[] = [
  { id: 'bo1', customerName: 'Reema Joshi', customerFlat: 'A-1208', items: [{ name: 'Atta 10 kg', qty: 1, priceRupees: 540 }, { name: 'Milk 1 L', qty: 2, priceRupees: 68 }],  status: 'new',              totalRupees: 676, placedAt: ago(6),  payment: 'paid' },
  { id: 'bo2', customerName: 'Aakash V.',   customerFlat: 'B-305',  items: [{ name: 'Surf Excel', qty: 1, priceRupees: 215 }],                                                  status: 'packing',          totalRupees: 215, placedAt: ago(18), payment: 'cod'  },
  { id: 'bo3', customerName: 'Sneha M.',    customerFlat: 'C-1102', items: [{ name: 'Mangoes', qty: 1, priceRupees: 450 }],                                                      status: 'out_for_delivery', totalRupees: 450, placedAt: ago(45), payment: 'paid' },
];

// ─── Food seed ───────────────────────────────────────────────────────────────
export const FOOD_MENU: MenuItem[] = [
  { id: 'm1', name: 'Dal Tadka',        category: 'Mains',    priceRupees: 120, available: true,  isVeg: true,  popular: true  },
  { id: 'm2', name: 'Paneer Butter Masala', category: 'Mains', priceRupees: 160, available: true, isVeg: true,  popular: true  },
  { id: 'm3', name: 'Chicken Curry',    category: 'Mains',    priceRupees: 180, available: true,  isVeg: false, popular: false },
  { id: 'm4', name: 'Tandoori Roti',    category: 'Breads',   priceRupees: 20,  available: true,  isVeg: true,  popular: true  },
  { id: 'm5', name: 'Naan',             category: 'Breads',   priceRupees: 30,  available: true,  isVeg: true,  popular: false },
  { id: 'm6', name: 'Veg Fried Rice',   category: 'Rice',     priceRupees: 110, available: true,  isVeg: true,  popular: false },
  { id: 'm7', name: 'Egg Biryani',      category: 'Rice',     priceRupees: 130, available: false, isVeg: false, popular: true  },
  { id: 'm8', name: 'Masala Chai',      category: 'Beverages',priceRupees: 20,  available: true,  isVeg: true,  popular: true  },
  { id: 'm9', name: 'Cold Coffee',      category: 'Beverages',priceRupees: 60,  available: true,  isVeg: true,  popular: false },
];

export const FOOD_ORDERS: FoodOrder[] = [
  { id: 'fo1', customerName: 'Vivek R.',    customerFlat: 'A-204', items: [{ name: 'Dal Tadka', qty: 1, priceRupees: 120 }, { name: 'Naan', qty: 2, priceRupees: 30 }],    status: 'new',       totalRupees: 180, placedAt: ago(4),  orderType: 'delivery', payment: 'paid' },
  { id: 'fo2', customerName: 'Kavya S.',    customerFlat: 'B-102', items: [{ name: 'Paneer Butter Masala', qty: 1, priceRupees: 160 }, { name: 'Naan', qty: 3, priceRupees: 30 }], status: 'preparing', totalRupees: 250, placedAt: ago(12), orderType: 'delivery', payment: 'cod'  },
  { id: 'fo3', customerName: 'Sanjay M.',   customerFlat: 'C-601', items: [{ name: 'Chicken Curry', qty: 2, priceRupees: 180 }, { name: 'Veg Fried Rice', qty: 1, priceRupees: 110 }], status: 'ready', totalRupees: 470, placedAt: ago(22), orderType: 'pickup',  payment: 'paid' },
];

// ─── Education seed ──────────────────────────────────────────────────────────
export const EDU_BATCHES: EducationBatch[] = [
  { id: 'eb1', subject: 'Mathematics', level: 'Class 8–10', timing: '4:00–5:00 PM', days: 'Mon / Wed / Fri', students: 12, capacity: 15, feeRupees: 800,  active: true  },
  { id: 'eb2', subject: 'Science',     level: 'Class 8–10', timing: '5:00–6:00 PM', days: 'Mon / Wed / Fri', students: 10, capacity: 15, feeRupees: 800,  active: true  },
  { id: 'eb3', subject: 'English',     level: 'Class 5–7',  timing: '4:00–5:00 PM', days: 'Tue / Thu / Sat', students: 8,  capacity: 12, feeRupees: 600,  active: true  },
  { id: 'eb4', subject: 'Hindi',       level: 'Class 3–5',  timing: '3:00–4:00 PM', days: 'Mon–Sat',         students: 6,  capacity: 10, feeRupees: 500,  active: false },
];

export const STUDENT_FEES: StudentFee[] = [
  { id: 'sf1', studentName: 'Arjun Sharma',  flat: 'A-201', batchName: 'Maths 8–10', month: 'May 2026', feeRupees: 800, paid: true  },
  { id: 'sf2', studentName: 'Riya Kapoor',   flat: 'B-304', batchName: 'Science 8–10', month: 'May 2026', feeRupees: 800, paid: false },
  { id: 'sf3', studentName: 'Ananya Nair',   flat: 'C-101', batchName: 'English 5–7', month: 'May 2026', feeRupees: 600, paid: true  },
  { id: 'sf4', studentName: 'Dev Mehta',     flat: 'A-502', batchName: 'Maths 8–10', month: 'May 2026', feeRupees: 800, paid: false },
  { id: 'sf5', studentName: 'Pooja Singh',   flat: 'D-208', batchName: 'Science 8–10', month: 'May 2026', feeRupees: 800, paid: true  },
];

// ─── Reviews seed ─────────────────────────────────────────────────────────────
export const BIZ_REVIEWS: BizReview[] = [
  { id: 'rv1', authorName: 'Neha Joshi',  authorFlat: 'A-304', rating: 5, body: 'Best kirana in the society. Quick delivery and always fresh stock!', postedAt: ago(2 * 24 * 60) },
  { id: 'rv2', authorName: 'Rahul S.',    authorFlat: 'B-102', rating: 4, body: 'Good variety. Prices are fair. Home delivery is a lifesaver.',         postedAt: ago(5 * 24 * 60) },
  { id: 'rv3', authorName: 'Sunita K.',   authorFlat: 'C-501', rating: 5, body: 'Uncle is very helpful. Always keeps Amul products.',                   postedAt: ago(8 * 24 * 60) },
];

// ─── Nearby businesses (covers all merchantTypes) ────────────────────────────
export const NEARBY_BUSINESSES: NearbyBiz[] = [
  // Retail
  { id: 'n1',  name: 'Sharma Kirana',          category: 'Kirana',         merchantType: 'retail',      emoji: '🛒', rating: 4.6, reviewCount: 184, distanceM: 80,   openNow: true,  tags: ['groceries', 'home delivery'], promo: '10% off this weekend', phone: '+91 98001 11001', hoursOpen: '08:00', hoursClose: '22:00', bio: '3rd-generation kirana since 1998. Home delivery within 500 m.' },
  { id: 'n2',  name: 'Apollo Pharmacy',         category: 'Pharmacy',       merchantType: 'retail',      emoji: '💊', rating: 4.7, reviewCount: 540, distanceM: 180,  openNow: true,  tags: ['24×7', 'medicines'],          phone: '+91 98001 11002', hoursOpen: '00:00', hoursClose: '23:59', bio: '24×7 pharmacy. All scheduled & OTC medicines available.' },
  { id: 'n3',  name: 'Raju Paan Corner',        category: 'Paan Shop',      merchantType: 'retail',      emoji: '🌿', rating: 4.3, reviewCount: 67,  distanceM: 50,   openNow: true,  tags: ['paan', 'tobacco', 'cold drinks'], phone: '+91 98001 11003', hoursOpen: '09:00', hoursClose: '23:00', bio: 'All varieties of paan, tobacco, cold drinks and snacks.' },
  { id: 'n4',  name: 'Anand Bakery',            category: 'Bakery',         merchantType: 'retail',      emoji: '🍞', rating: 4.5, reviewCount: 210, distanceM: 240,  openNow: true,  tags: ['fresh bread', 'cakes'], promo: 'Buy 1 get 1 on bun maska', phone: '+91 98001 11004', hoursOpen: '07:00', hoursClose: '21:00', bio: 'Fresh bread, buns, cakes and snacks baked every morning.' },
  // Food
  { id: 'n5',  name: 'Satkar Restaurant',       category: 'Restaurant',     merchantType: 'food',        emoji: '🍛', rating: 4.4, reviewCount: 312, distanceM: 350,  openNow: true,  tags: ['north indian', 'delivery', 'dine-in'], phone: '+91 98001 11005', hoursOpen: '11:00', hoursClose: '23:00', bio: 'Authentic North Indian. Dine-in + delivery. Family meals available.' },
  { id: 'n6',  name: 'Chai Point Cafe',         category: 'Cafe',           merchantType: 'food',        emoji: '☕', rating: 4.6, reviewCount: 98,  distanceM: 120,  openNow: true,  tags: ['tea', 'snacks', 'quick bites'], phone: '+91 98001 11006', hoursOpen: '07:00', hoursClose: '22:00', bio: 'Premium chai, filter coffee, and quick bites. Work-friendly.' },
  { id: 'n7',  name: 'Shree Tiffin Service',    category: 'Tiffin',         merchantType: 'food',        emoji: '🍱', rating: 4.8, reviewCount: 145, distanceM: 200,  openNow: true,  tags: ['tiffin', 'home food'], promo: '₹50 off on first subscription', phone: '+91 98001 11007', hoursOpen: '12:00', hoursClose: '21:00', bio: 'Home-cooked tiffin — 2 dal, 2 sabzi, roti & rice. Monthly subscriptions.' },
  // Appointment
  { id: 'n8',  name: 'Glow Studio Salon',       category: 'Salon',          merchantType: 'appointment', emoji: '✂️', rating: 4.8, reviewCount: 96,  distanceM: 140,  openNow: true,  tags: ['hair', 'spa', 'unisex'],      phone: '+91 98001 11008', hoursOpen: '10:00', hoursClose: '20:00', bio: 'Full-service unisex salon. Book a slot and skip the wait.' },
  { id: 'n9',  name: 'Dr. Rao Clinic',          category: 'Clinic',         merchantType: 'appointment', emoji: '🩺', rating: 4.9, reviewCount: 312, distanceM: 220,  openNow: true,  tags: ['GP', 'pediatric'],            phone: '+91 98001 11009', hoursOpen: '09:00', hoursClose: '13:00', bio: 'General physician & pediatric care. Evening slots 5–8 PM.' },
  { id: 'n10', name: 'FitLife Gym',             category: 'Gym',            merchantType: 'appointment', emoji: '🏋️', rating: 4.5, reviewCount: 220, distanceM: 410,  openNow: true,  tags: ['cardio', 'weights', 'yoga'],  phone: '+91 98001 11010', hoursOpen: '05:30', hoursClose: '22:00', bio: 'State-of-the-art equipment. Personal training & yoga classes.' },
  { id: 'n11', name: 'Serene Spa & Wellness',   category: 'Spa',            merchantType: 'appointment', emoji: '🧖', rating: 4.7, reviewCount: 74,  distanceM: 560,  openNow: false, tags: ['massage', 'facial', 'relaxation'], phone: '+91 98001 11011', hoursOpen: '10:00', hoursClose: '19:00', bio: 'Aromatherapy, deep tissue massage, and facials. Book online.' },
  // Services
  { id: 'n12', name: 'Quick Fix Services',       category: 'Plumber & Electrician', merchantType: 'services', emoji: '🔧', rating: 4.4, reviewCount: 187, distanceM: 90,  openNow: true,  tags: ['plumbing', 'electrical', 'same-day'], phone: '+91 98001 11012', hoursOpen: '08:00', hoursClose: '20:00', bio: 'Plumbing, electrical & carpentry. Same-day service available.' },
  { id: 'n13', name: 'Clean Laundry Co.',        category: 'Laundry',        merchantType: 'services',    emoji: '👕', rating: 4.6, reviewCount: 132, distanceM: 280,  openNow: true,  tags: ['wash & fold', 'dry clean', 'pickup'], promo: 'Free pickup & delivery', phone: '+91 98001 11013', hoursOpen: '09:00', hoursClose: '21:00', bio: 'Wash & fold, dry cleaning, ironing. Free pickup & delivery.' },
  { id: 'n14', name: 'Style Tailor',             category: 'Tailor',         merchantType: 'services',    emoji: '🪡', rating: 4.3, reviewCount: 55,  distanceM: 320,  openNow: false, tags: ['alteration', 'stitching'],    phone: '+91 98001 11014', hoursOpen: '10:00', hoursClose: '19:00', bio: 'Alterations, blouse stitching, and custom garments.' },
  // Education
  { id: 'n15', name: 'Bright Kids Tuitions',     category: 'Tuition Centre', merchantType: 'education',   emoji: '📖', rating: 4.5, reviewCount: 78,  distanceM: 340,  openNow: false, tags: ['Class 6–9', 'maths', 'science'], phone: '+91 98001 11015', hoursOpen: '15:00', hoursClose: '20:00', bio: 'Maths & Science coaching for Classes 6–10. Small batches.' },
  { id: 'n16', name: 'Creative Hobby Studio',    category: 'Hobby Classes',  merchantType: 'education',   emoji: '🎨', rating: 4.7, reviewCount: 43,  distanceM: 480,  openNow: true,  tags: ['drawing', 'music', 'dance'],  phone: '+91 98001 11016', hoursOpen: '10:00', hoursClose: '18:00', bio: 'Drawing, music (keyboard/guitar), and Bharatnatyam dance classes.' },
];


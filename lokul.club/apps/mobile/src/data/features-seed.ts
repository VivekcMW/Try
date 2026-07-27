// ═══════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE SEED DATA FOR ALL LOKUL MOBILE APP FEATURES
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// 1. DOMESTIC HELP VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface DomesticHelper {
  id: string;
  name: string;
  photo?: string;
  role: string;
  phone: string;
  aadhaarLast4?: string;
  verificationStatus: VerificationStatus;
  rating: number;
  reviews: number;
  worksAt: string[];
  joiningDate: string;
  workingDays: string[];
  workingHours: string;
  monthlyPay: number;
  lastVerified?: string;
  documents: {
    aadhaar: boolean;
    police: boolean;
    photo: boolean;
    address: boolean;
  };
}

export const HELPER_ROLES = [
  { id: 'maid', label: 'Maid / Domestic Help', icon: '🧹' },
  { id: 'cook', label: 'Cook', icon: '👨‍🍳' },
  { id: 'driver', label: 'Driver', icon: '🚗' },
  { id: 'nanny', label: 'Nanny / Babysitter', icon: '👶' },
  { id: 'caretaker', label: 'Elderly Caretaker', icon: '👴' },
  { id: 'gardener', label: 'Gardener', icon: '🌱' },
  { id: 'security', label: 'Security Guard', icon: '🛡️' },
  { id: 'watchman', label: 'Watchman', icon: '👁️' },
];

export const DOMESTIC_HELPERS: DomesticHelper[] = [
  {
    id: '1',
    name: 'Sunita Devi',
    role: 'Maid / Domestic Help',
    phone: '+91 98765 43210',
    aadhaarLast4: '4532',
    verificationStatus: 'verified',
    rating: 4.8,
    reviews: 23,
    worksAt: ['A-101', 'A-205', 'B-302'],
    joiningDate: '2024-03-15',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    workingHours: '8:00 AM - 12:00 PM',
    monthlyPay: 8000,
    lastVerified: '2026-05-20',
    documents: { aadhaar: true, police: true, photo: true, address: true },
  },
  {
    id: '2',
    name: 'Ramesh Kumar',
    role: 'Cook',
    phone: '+91 98765 12345',
    aadhaarLast4: '7821',
    verificationStatus: 'pending',
    rating: 4.5,
    reviews: 12,
    worksAt: ['A-101', 'C-402'],
    joiningDate: '2025-01-10',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    workingHours: '6:00 PM - 9:00 PM',
    monthlyPay: 12000,
    documents: { aadhaar: true, police: false, photo: true, address: true },
  },
  {
    id: '3',
    name: 'Lakshmi Bai',
    role: 'Nanny / Babysitter',
    phone: '+91 87654 32109',
    verificationStatus: 'verified',
    rating: 4.9,
    reviews: 31,
    worksAt: ['B-205'],
    joiningDate: '2023-08-20',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    workingHours: '9:00 AM - 6:00 PM',
    monthlyPay: 15000,
    lastVerified: '2026-04-15',
    documents: { aadhaar: true, police: true, photo: true, address: true },
  },
  {
    id: '4',
    name: 'Gopal Singh',
    role: 'Driver',
    phone: '+91 99887 76655',
    aadhaarLast4: '3344',
    verificationStatus: 'verified',
    rating: 4.7,
    reviews: 45,
    worksAt: ['A-101', 'D-601'],
    joiningDate: '2022-06-01',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    workingHours: '8:00 AM - 8:00 PM',
    monthlyPay: 18000,
    lastVerified: '2026-06-01',
    documents: { aadhaar: true, police: true, photo: true, address: true },
  },
  {
    id: '5',
    name: 'Meera Devi',
    role: 'Elderly Caretaker',
    phone: '+91 77889 90011',
    verificationStatus: 'unverified',
    rating: 0,
    reviews: 0,
    worksAt: [],
    joiningDate: '2026-06-25',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    workingHours: '24/7 Live-in',
    monthlyPay: 25000,
    documents: { aadhaar: false, police: false, photo: false, address: false },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. PARKING MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export interface ParkingSlot {
  id: string;
  slotNumber: string;
  type: 'car' | 'bike' | 'visitor';
  location: string;
  vehicle?: {
    number: string;
    type: string;
    color: string;
  };
  status: 'occupied' | 'vacant' | 'reserved';
}

export interface VisitorParkingRequest {
  id: string;
  visitorName: string;
  vehicleNumber: string;
  vehicleType: string;
  purpose: string;
  requestedSlot: string;
  requestedTime: string;
  duration: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  requestedBy?: string;
  flat?: string;
}

export const MY_PARKING_SLOTS: ParkingSlot[] = [
  {
    id: '1',
    slotNumber: 'A-101',
    type: 'car',
    location: 'Basement 1, Section A',
    vehicle: { number: 'MH 02 AB 1234', type: 'Sedan', color: 'White' },
    status: 'occupied',
  },
  {
    id: '2',
    slotNumber: 'B-050',
    type: 'bike',
    location: 'Basement 2, Bike Zone',
    vehicle: { number: 'MH 02 CD 5678', type: 'Scooter', color: 'Red' },
    status: 'occupied',
  },
  {
    id: '3',
    slotNumber: 'A-102',
    type: 'car',
    location: 'Basement 1, Section A',
    status: 'vacant',
  },
];

export const VISITOR_PARKING_REQUESTS: VisitorParkingRequest[] = [
  {
    id: '1',
    visitorName: 'Rahul Sharma',
    vehicleNumber: 'MH 01 XY 9999',
    vehicleType: 'SUV',
    purpose: 'Family visit',
    requestedSlot: 'V-05',
    requestedTime: 'Today, 3:00 PM',
    duration: '4 hours',
    status: 'pending',
  },
  {
    id: '2',
    visitorName: 'Delivery - Amazon',
    vehicleNumber: 'MH 03 DL 4567',
    vehicleType: 'Bike',
    purpose: 'Package delivery',
    requestedSlot: 'V-Bike',
    requestedTime: 'Today, 11:30 AM',
    duration: '30 mins',
    status: 'active',
  },
  {
    id: '3',
    visitorName: 'Dr. Mehta',
    vehicleNumber: 'MH 04 DR 1122',
    vehicleType: 'Hatchback',
    purpose: 'Medical visit',
    requestedSlot: 'V-03',
    requestedTime: 'Yesterday, 5:00 PM',
    duration: '2 hours',
    status: 'completed',
  },
];

export const PARKING_STATS = {
  totalCarSlots: 200,
  occupiedCar: 156,
  totalBikeSlots: 150,
  occupiedBike: 98,
  visitorSlots: 20,
  occupiedVisitor: 8,
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. AMENITY BOOKING
// ─────────────────────────────────────────────────────────────────────────────

export interface Amenity {
  id: string;
  name: string;
  category: string;
  icon: string;
  image?: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  availability: 'available' | 'limited' | 'unavailable';
  rating: number;
  reviews: number;
  rules: string[];
  openTime: string;
  closeTime: string;
}

export interface AmenityBooking {
  id: string;
  amenityName: string;
  amenityIcon: string;
  date: string;
  timeSlot: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  bookingRef: string;
}

export const AMENITIES: Amenity[] = [
  {
    id: '1',
    name: 'Clubhouse',
    category: 'Party',
    icon: '🏛️',
    description: 'Spacious clubhouse with AC, sound system, and seating for 100 people',
    capacity: 100,
    pricePerHour: 500,
    availability: 'available',
    rating: 4.8,
    reviews: 45,
    rules: ['No outside catering without permission', 'Cleanup within 2 hours', 'No loud music after 10 PM'],
    openTime: '6:00 AM',
    closeTime: '10:00 PM',
  },
  {
    id: '2',
    name: 'Swimming Pool',
    category: 'Fitness',
    icon: '🏊',
    description: 'Olympic-size swimming pool with kids section and trained lifeguards',
    capacity: 30,
    pricePerHour: 0,
    availability: 'available',
    rating: 4.9,
    reviews: 120,
    rules: ['Swimming cap mandatory', 'Shower before entering', 'No food near pool'],
    openTime: '6:00 AM',
    closeTime: '9:00 PM',
  },
  {
    id: '3',
    name: 'Gymnasium',
    category: 'Fitness',
    icon: '🏋️',
    description: 'Fully equipped gym with cardio, weights, and personal training available',
    capacity: 25,
    pricePerHour: 0,
    availability: 'limited',
    rating: 4.7,
    reviews: 89,
    rules: ['Proper gym attire required', 'Wipe equipment after use', 'No personal trainers'],
    openTime: '5:00 AM',
    closeTime: '11:00 PM',
  },
  {
    id: '4',
    name: 'Banquet Hall',
    category: 'Party',
    icon: '🎉',
    description: 'Air-conditioned banquet hall perfect for weddings, birthdays, and corporate events',
    capacity: 200,
    pricePerHour: 2000,
    availability: 'available',
    rating: 4.6,
    reviews: 34,
    rules: ['Advance booking required', 'Security deposit ₹10,000', 'Valet parking available'],
    openTime: '8:00 AM',
    closeTime: '11:00 PM',
  },
  {
    id: '5',
    name: 'Tennis Court',
    category: 'Sports',
    icon: '🎾',
    description: 'Professional tennis court with floodlights for evening play',
    capacity: 4,
    pricePerHour: 200,
    availability: 'available',
    rating: 4.8,
    reviews: 56,
    rules: ['Tennis shoes only', 'Book max 2 hours per day', 'Cancel 4 hours before'],
    openTime: '6:00 AM',
    closeTime: '10:00 PM',
  },
  {
    id: '6',
    name: 'Library',
    category: 'Study',
    icon: '📚',
    description: 'Quiet reading space with 5000+ books and high-speed WiFi',
    capacity: 20,
    pricePerHour: 0,
    availability: 'available',
    rating: 4.9,
    reviews: 78,
    rules: ['Silence please', 'No food or drinks', 'Return books within 14 days'],
    openTime: '8:00 AM',
    closeTime: '9:00 PM',
  },
];

export const MY_AMENITY_BOOKINGS: AmenityBooking[] = [
  {
    id: '1',
    amenityName: 'Tennis Court',
    amenityIcon: '🎾',
    date: 'Jul 1, 2026',
    timeSlot: '6:00 PM - 8:00 PM',
    status: 'upcoming',
    bookingRef: 'AMN-2026-0701-001',
  },
  {
    id: '2',
    amenityName: 'Clubhouse',
    amenityIcon: '🏛️',
    date: 'Jul 5, 2026',
    timeSlot: '4:00 PM - 10:00 PM',
    status: 'upcoming',
    bookingRef: 'AMN-2026-0705-003',
  },
  {
    id: '3',
    amenityName: 'Swimming Pool',
    amenityIcon: '🏊',
    date: 'Jun 28, 2026',
    timeSlot: '7:00 AM - 8:00 AM',
    status: 'completed',
    bookingRef: 'AMN-2026-0628-012',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. BILL PAYMENT INTEGRATION
// ─────────────────────────────────────────────────────────────────────────────

export interface BillCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
  providers: string[];
}

export interface SavedBiller {
  id: string;
  category: string;
  categoryIconName: string;
  provider: string;
  accountNumber: string;
  nickname: string;
  lastBillAmount?: number;
  dueDate?: string;
  status: 'due' | 'paid' | 'overdue';
}

export interface BillPayment {
  id: string;
  biller: string;
  provider: string;
  amount: number;
  date: string;
  status: 'success' | 'pending' | 'failed';
}

export const BILL_CATEGORIES: BillCategory[] = [
  { id: 'electricity', name: 'Electricity', iconName: 'Zap', color: '#F59E0B', providers: ['Adani Electricity', 'MSEDCL', 'Tata Power', 'BSES Rajdhani', 'BSES Yamuna'] },
  { id: 'gas', name: 'Gas', iconName: 'Flame', color: '#EF4444', providers: ['Mahanagar Gas', 'Adani Gas', 'IGL', 'Gujarat Gas', 'Sabarmati Gas'] },
  { id: 'water', name: 'Water', iconName: 'Droplets', color: '#3B82F6', providers: ['Municipal Corporation', 'BWSSB', 'Delhi Jal Board', 'MCGM'] },
  { id: 'broadband', name: 'Broadband', iconName: 'Wifi', color: '#8B5CF6', providers: ['Jio Fiber', 'Airtel Xstream', 'ACT Fibernet', 'BSNL', 'Hathway'] },
  { id: 'dth', name: 'DTH / Cable', iconName: 'Tv', color: '#10B981', providers: ['Tata Play', 'Airtel DTH', 'Dish TV', 'Sun Direct', 'Videocon d2h'] },
  { id: 'mobile', name: 'Mobile Postpaid', iconName: 'Phone', color: '#EC4899', providers: ['Jio', 'Airtel', 'Vi (Vodafone Idea)', 'BSNL'] },
  { id: 'creditcard', name: 'Credit Card', iconName: 'CreditCard', color: '#6366F1', providers: ['HDFC Bank', 'ICICI Bank', 'SBI Card', 'Axis Bank', 'Kotak Mahindra'] },
  { id: 'society', name: 'Society Maintenance', iconName: 'Building', color: '#14B8A6', providers: ['Your Society'] },
];

export const SAVED_BILLERS: SavedBiller[] = [
  {
    id: '1',
    category: 'electricity',
    categoryIconName: 'Zap',
    provider: 'Adani Electricity',
    accountNumber: '1234567890',
    nickname: 'Home Electricity',
    lastBillAmount: 2450,
    dueDate: 'Jul 15, 2026',
    status: 'due',
  },
  {
    id: '2',
    category: 'gas',
    categoryIconName: 'Flame',
    provider: 'Mahanagar Gas',
    accountNumber: 'MGL9876543',
    nickname: 'Home Gas',
    lastBillAmount: 850,
    dueDate: 'Jul 20, 2026',
    status: 'due',
  },
  {
    id: '3',
    category: 'broadband',
    categoryIconName: 'Wifi',
    provider: 'Jio Fiber',
    accountNumber: 'JIO12345678',
    nickname: 'Home Internet',
    lastBillAmount: 999,
    dueDate: 'Jul 5, 2026',
    status: 'paid',
  },
  {
    id: '4',
    category: 'society',
    categoryIconName: 'Building',
    provider: 'Harmony Heights',
    accountNumber: 'A-101',
    nickname: 'Society Maintenance',
    lastBillAmount: 5500,
    dueDate: 'Jul 10, 2026',
    status: 'overdue',
  },
];

export const RECENT_BILL_PAYMENTS: BillPayment[] = [
  { id: '1', biller: 'Home Internet', provider: 'Jio Fiber', amount: 999, date: 'Jun 25, 2026', status: 'success' },
  { id: '2', biller: 'Mobile Bill', provider: 'Airtel', amount: 599, date: 'Jun 20, 2026', status: 'success' },
  { id: '3', biller: 'DTH Recharge', provider: 'Tata Play', amount: 350, date: 'Jun 15, 2026', status: 'success' },
  { id: '4', biller: 'Home Electricity', provider: 'Adani', amount: 2100, date: 'Jun 10, 2026', status: 'success' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. INSURANCE MARKETPLACE
// ─────────────────────────────────────────────────────────────────────────────

export interface InsuranceCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
  description: string;
  startingPrice: number;
}

export interface InsurancePlan {
  id: string;
  provider: string;
  name: string;
  category: string;
  coverAmount: number;
  premium: number;
  premiumFrequency: 'monthly' | 'yearly';
  rating: number;
  reviews: number;
  features: string[];
  popular?: boolean;
}

export interface MyInsurancePolicy {
  id: string;
  provider: string;
  planName: string;
  category: string;
  categoryIconName: string;
  policyNumber: string;
  coverAmount: number;
  premium: number;
  nextDue: string;
  status: 'active' | 'expired' | 'pending';
}

export const INSURANCE_CATEGORIES: InsuranceCategory[] = [
  { id: 'health', name: 'Health', iconName: 'Heart', color: '#EF4444', description: 'Medical & hospitalization', startingPrice: 299 },
  { id: 'life', name: 'Life', iconName: 'Shield', color: '#3B82F6', description: 'Term & whole life', startingPrice: 499 },
  { id: 'vehicle', name: 'Vehicle', iconName: 'Car', color: '#8B5CF6', description: 'Car & bike insurance', startingPrice: 199 },
  { id: 'home', name: 'Home', iconName: 'Home', color: '#10B981', description: 'Property protection', startingPrice: 149 },
  { id: 'travel', name: 'Travel', iconName: 'Plane', color: '#F59E0B', description: 'Trip protection', startingPrice: 99 },
  { id: 'business', name: 'Business', iconName: 'Briefcase', color: '#EC4899', description: 'Shop & office', startingPrice: 399 },
];

export const INSURANCE_PLANS: InsurancePlan[] = [
  {
    id: '1',
    provider: 'HDFC Ergo',
    name: 'Optima Restore',
    category: 'health',
    coverAmount: 500000,
    premium: 8999,
    premiumFrequency: 'yearly',
    rating: 4.8,
    reviews: 2345,
    features: ['No room rent capping', 'Restore benefit 100%', 'Daycare procedures covered', 'Annual health checkup'],
    popular: true,
  },
  {
    id: '2',
    provider: 'ICICI Prudential',
    name: 'iProtect Smart',
    category: 'life',
    coverAmount: 10000000,
    premium: 699,
    premiumFrequency: 'monthly',
    rating: 4.7,
    reviews: 1876,
    features: ['99.1% claim settlement', 'Critical illness cover', 'Accidental death benefit', 'Terminal illness benefit'],
  },
  {
    id: '3',
    provider: 'Bajaj Allianz',
    name: 'Motor Protect',
    category: 'vehicle',
    coverAmount: 800000,
    premium: 4999,
    premiumFrequency: 'yearly',
    rating: 4.6,
    reviews: 3456,
    features: ['Zero depreciation', 'Roadside assistance', 'Engine protect', 'NCB protection'],
    popular: true,
  },
  {
    id: '4',
    provider: 'TATA AIG',
    name: 'Home Shield',
    category: 'home',
    coverAmount: 2500000,
    premium: 2499,
    premiumFrequency: 'yearly',
    rating: 4.5,
    reviews: 876,
    features: ['Fire & allied perils', 'Burglary cover', 'Natural calamities', 'Contents cover included'],
  },
];

export const MY_INSURANCE_POLICIES: MyInsurancePolicy[] = [
  {
    id: '1',
    provider: 'HDFC Ergo',
    planName: 'Optima Restore',
    category: 'health',
    categoryIconName: 'Heart',
    policyNumber: 'HLT-2024-789456',
    coverAmount: 500000,
    premium: 8999,
    nextDue: 'Aug 15, 2026',
    status: 'active',
  },
  {
    id: '2',
    provider: 'Bajaj Allianz',
    planName: 'Motor Protect',
    category: 'vehicle',
    categoryIconName: 'Car',
    policyNumber: 'VEH-2025-456123',
    coverAmount: 800000,
    premium: 4999,
    nextDue: 'Sep 20, 2026',
    status: 'active',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. SKILL EXCHANGE
// ─────────────────────────────────────────────────────────────────────────────

export interface SkillCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
}

export interface SkillOffer {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userFlat: string;
  skill: string;
  category: string;
  description: string;
  experience: string;
  mode: 'teach' | 'learn' | 'exchange';
  availability: string;
  rating: number;
  reviews: number;
  sessionsCompleted: number;
  price: number | null;
  featured?: boolean;
}

export interface MySkillPost {
  id: string;
  skill: string;
  mode: 'teach' | 'learn' | 'exchange';
  responses: number;
  status: 'active' | 'paused';
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  { id: 'art', name: 'Art & Craft', iconName: 'Palette', color: '#EC4899' },
  { id: 'music', name: 'Music', iconName: 'Music', color: '#8B5CF6' },
  { id: 'tech', name: 'Tech & Coding', iconName: 'Code', color: '#3B82F6' },
  { id: 'photo', name: 'Photography', iconName: 'Camera', color: '#F59E0B' },
  { id: 'academic', name: 'Academic', iconName: 'BookOpen', color: '#10B981' },
  { id: 'cooking', name: 'Cooking', iconName: 'Utensils', color: '#EF4444' },
  { id: 'fitness', name: 'Fitness & Yoga', iconName: 'Dumbbell', color: '#06B6D4' },
  { id: 'language', name: 'Languages', iconName: 'Languages', color: '#6366F1' },
  { id: 'business', name: 'Business', iconName: 'Briefcase', color: '#14B8A6' },
  { id: 'lifestyle', name: 'Lifestyle', iconName: 'Scissors', color: '#F472B6' },
];

export const SKILL_OFFERS: SkillOffer[] = [
  {
    id: '1',
    userId: 'u1',
    userName: 'Priya Sharma',
    userFlat: 'B-204',
    skill: 'Watercolor Painting',
    category: 'art',
    description: 'Learn watercolor basics - landscapes, florals, and abstract. I have 8+ years of experience.',
    experience: '8+ years',
    mode: 'teach',
    availability: 'Weekends, 10 AM - 12 PM',
    rating: 4.9,
    reviews: 28,
    sessionsCompleted: 45,
    price: 500,
    featured: true,
  },
  {
    id: '2',
    userId: 'u2',
    userName: 'Vikram Joshi',
    userFlat: 'A-105',
    skill: 'Guitar',
    category: 'music',
    description: 'Acoustic guitar lessons for beginners to intermediate. Learn chords, strumming, and songs.',
    experience: '5 years',
    mode: 'teach',
    availability: 'Evenings, Mon-Fri',
    rating: 4.8,
    reviews: 19,
    sessionsCompleted: 32,
    price: 400,
  },
  {
    id: '3',
    userId: 'u3',
    userName: 'Rohan Mehta',
    userFlat: 'C-302',
    skill: 'Python Programming',
    category: 'tech',
    description: 'Software engineer offering Python lessons. Data science, automation, web development.',
    experience: '10+ years',
    mode: 'teach',
    availability: 'Weekends only',
    rating: 4.7,
    reviews: 15,
    sessionsCompleted: 23,
    price: 800,
    featured: true,
  },
  {
    id: '4',
    userId: 'u4',
    userName: 'Ananya Das',
    userFlat: 'B-401',
    skill: 'Yoga & Meditation',
    category: 'fitness',
    description: 'Certified yoga instructor. Morning sessions for stress relief and flexibility.',
    experience: '6 years',
    mode: 'teach',
    availability: 'Daily, 6 AM - 7 AM',
    rating: 4.9,
    reviews: 42,
    sessionsCompleted: 78,
    price: null,
  },
  {
    id: '5',
    userId: 'u5',
    userName: 'Amit Patil',
    userFlat: 'D-201',
    skill: 'French Language',
    category: 'language',
    description: 'Looking to exchange French lessons for Hindi conversation practice.',
    experience: 'Native speaker',
    mode: 'exchange',
    availability: 'Flexible',
    rating: 4.6,
    reviews: 8,
    sessionsCompleted: 12,
    price: null,
  },
];

export const MY_SKILL_POSTS: MySkillPost[] = [
  { id: '1', skill: 'Photography Basics', mode: 'teach', responses: 5, status: 'active' },
  { id: '2', skill: 'Spanish Language', mode: 'learn', responses: 3, status: 'active' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 7. RESOURCE SHARING (BORROW)
// ─────────────────────────────────────────────────────────────────────────────

export interface ItemCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
}

export interface BorrowItem {
  id: string;
  name: string;
  category: string;
  ownerName: string;
  ownerFlat: string;
  description: string;
  condition: 'excellent' | 'good' | 'fair';
  rentalType: 'free' | 'deposit' | 'rent';
  depositAmount?: number;
  rentPerDay?: number;
  maxDays: number;
  available: boolean;
  image?: string;
  rating: number;
  borrowCount: number;
}

export interface MyListing {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'borrowed' | 'returned';
  borrowedBy?: string;
  returnDate?: string;
}

export interface BorrowRequest {
  id: string;
  itemName: string;
  requesterName: string;
  requesterFlat: string;
  duration: string;
  status: 'pending' | 'approved' | 'declined';
  requestDate: string;
}

export const ITEM_CATEGORIES: ItemCategory[] = [
  { id: 'tools', name: 'Tools', iconName: 'Wrench', color: '#F59E0B' },
  { id: 'electronics', name: 'Electronics', iconName: 'Laptop', color: '#3B82F6' },
  { id: 'outdoor', name: 'Outdoor', iconName: 'Tent', color: '#10B981' },
  { id: 'games', name: 'Games', iconName: 'Gamepad2', color: '#8B5CF6' },
  { id: 'baby', name: 'Baby & Kids', iconName: 'Baby', color: '#EC4899' },
  { id: 'sports', name: 'Sports', iconName: 'Dumbbell', color: '#EF4444' },
  { id: 'books', name: 'Books', iconName: 'BookOpen', color: '#6366F1' },
  { id: 'camera', name: 'Camera', iconName: 'Camera', color: '#14B8A6' },
  { id: 'kitchen', name: 'Kitchen', iconName: 'Utensils', color: '#F472B6' },
  { id: 'other', name: 'Other', iconName: 'Package', color: '#6B7280' },
];

export const BORROW_ITEMS: BorrowItem[] = [
  {
    id: '1',
    name: 'Drill Machine',
    category: 'tools',
    ownerName: 'Amit Kumar',
    ownerFlat: 'A-305',
    description: 'Bosch 10mm impact drill, perfect for wall mounting, shelf installation, etc.',
    condition: 'excellent',
    rentalType: 'deposit',
    depositAmount: 500,
    maxDays: 3,
    available: true,
    rating: 4.9,
    borrowCount: 23,
  },
  {
    id: '2',
    name: 'Camping Tent (4-person)',
    category: 'outdoor',
    ownerName: 'Priya Singh',
    ownerFlat: 'B-102',
    description: 'Waterproof tent, easy to set up. Used only twice. Comes with stakes and rainfly.',
    condition: 'excellent',
    rentalType: 'rent',
    depositAmount: 1000,
    rentPerDay: 200,
    maxDays: 7,
    available: true,
    rating: 4.8,
    borrowCount: 8,
  },
  {
    id: '3',
    name: 'PS5 with 2 Controllers',
    category: 'games',
    ownerName: 'Raj Malhotra',
    ownerFlat: 'C-404',
    description: 'PlayStation 5 with 2 controllers. Can include FIFA and GTA V. Great for weekends!',
    condition: 'good',
    rentalType: 'rent',
    depositAmount: 5000,
    rentPerDay: 300,
    maxDays: 3,
    available: false,
    rating: 4.7,
    borrowCount: 15,
  },
  {
    id: '4',
    name: 'Baby Stroller',
    category: 'baby',
    ownerName: 'Sneha Kapoor',
    ownerFlat: 'A-201',
    description: 'Chicco foldable stroller. Very lightweight. Our kid outgrew it.',
    condition: 'good',
    rentalType: 'free',
    maxDays: 14,
    available: true,
    rating: 5,
    borrowCount: 6,
  },
  {
    id: '5',
    name: 'DSLR Camera - Canon 80D',
    category: 'camera',
    ownerName: 'Varun Gupta',
    ownerFlat: 'D-501',
    description: 'Canon 80D with 18-135mm lens. Great for events and vacations.',
    condition: 'excellent',
    rentalType: 'rent',
    depositAmount: 10000,
    rentPerDay: 500,
    maxDays: 5,
    available: true,
    rating: 4.9,
    borrowCount: 12,
  },
];

export const MY_LISTINGS: MyListing[] = [
  { id: '1', name: 'Pressure Cooker (5L)', category: 'kitchen', status: 'borrowed', borrowedBy: 'C-205', returnDate: 'Jul 3, 2026' },
  { id: '2', name: 'Board Games Set', category: 'games', status: 'available' },
];

export const BORROW_REQUESTS: BorrowRequest[] = [
  { id: '1', itemName: 'Pressure Cooker', requesterName: 'Neha Sharma', requesterFlat: 'C-205', duration: '3 days', status: 'approved', requestDate: 'Jun 28, 2026' },
  { id: '2', itemName: 'Board Games Set', requesterName: 'Aditya Rao', requesterFlat: 'B-108', duration: '1 weekend', status: 'pending', requestDate: 'Jun 30, 2026' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 8. PET SERVICES NETWORK
// ─────────────────────────────────────────────────────────────────────────────

export interface PetServiceCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
}

export interface PetService {
  id: string;
  name: string;
  category: string;
  providerName: string;
  providerFlat?: string;
  isNeighbor: boolean;
  description: string;
  price: string;
  rating: number;
  reviews: number;
  distance: string;
  available: boolean;
}

export interface CommunityPet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'fish' | 'other';
  breed: string;
  ownerName: string;
  ownerFlat: string;
  age: string;
  vaccinated: boolean;
}

export interface PetSitter {
  id: string;
  name: string;
  flat: string;
  petTypes: string[];
  experience: string;
  rating: number;
  reviews: number;
  pricePerDay: number;
  available: boolean;
}

export interface LostPet {
  id: string;
  name: string;
  type: string;
  breed: string;
  description: string;
  lastSeen: string;
  location: string;
  ownerName: string;
  ownerContact: string;
  image?: string;
}

export const PET_SERVICE_CATEGORIES: PetServiceCategory[] = [
  { id: 'grooming', name: 'Grooming', iconName: 'Scissors', color: '#EC4899' },
  { id: 'vet', name: 'Vet Care', iconName: 'Stethoscope', color: '#EF4444' },
  { id: 'boarding', name: 'Boarding', iconName: 'Home', color: '#10B981' },
  { id: 'training', name: 'Training', iconName: 'GraduationCap', color: '#8B5CF6' },
  { id: 'supplies', name: 'Supplies', iconName: 'ShoppingBag', color: '#F59E0B' },
  { id: 'walking', name: 'Walking', iconName: 'PawPrint', color: '#3B82F6' },
];

export const PET_SERVICES: PetService[] = [
  {
    id: '1',
    name: 'Pawfect Grooming',
    category: 'grooming',
    providerName: 'Anita',
    providerFlat: 'B-302',
    isNeighbor: true,
    description: 'Full grooming service - bath, haircut, nail trim. All breeds welcome.',
    price: '₹500-1200',
    rating: 4.9,
    reviews: 45,
    distance: 'Same building',
    available: true,
  },
  {
    id: '2',
    name: 'Dr. Sharma Pet Clinic',
    category: 'vet',
    providerName: 'Dr. Sharma',
    isNeighbor: false,
    description: 'Full veterinary services. Vaccinations, surgeries, and 24/7 emergency.',
    price: '₹300-2000',
    rating: 4.8,
    reviews: 156,
    distance: '0.5 km',
    available: true,
  },
  {
    id: '3',
    name: 'Happy Tails Boarding',
    category: 'boarding',
    providerName: 'Ravi',
    providerFlat: 'C-105',
    isNeighbor: true,
    description: 'Home boarding for dogs. Spacious play area. Daily updates with photos.',
    price: '₹400/day',
    rating: 4.7,
    reviews: 23,
    distance: 'Same society',
    available: true,
  },
  {
    id: '4',
    name: 'Paws & Play Walker',
    category: 'walking',
    providerName: 'Vikram',
    providerFlat: 'A-401',
    isNeighbor: true,
    description: 'Daily dog walking. Morning and evening slots. Individual and group walks.',
    price: '₹200/walk',
    rating: 4.9,
    reviews: 67,
    distance: 'Same society',
    available: true,
  },
];

export const COMMUNITY_PETS: CommunityPet[] = [
  { id: '1', name: 'Bruno', type: 'dog', breed: 'Golden Retriever', ownerName: 'Rajesh Kumar', ownerFlat: 'A-101', age: '3 years', vaccinated: true },
  { id: '2', name: 'Mittens', type: 'cat', breed: 'Persian', ownerName: 'Priya Singh', ownerFlat: 'B-205', age: '2 years', vaccinated: true },
  { id: '3', name: 'Charlie', type: 'dog', breed: 'Beagle', ownerName: 'Amit Shah', ownerFlat: 'C-302', age: '1 year', vaccinated: true },
  { id: '4', name: 'Kiwi', type: 'bird', breed: 'Cockatiel', ownerName: 'Neha Gupta', ownerFlat: 'D-104', age: '6 months', vaccinated: false },
  { id: '5', name: 'Max', type: 'dog', breed: 'Labrador', ownerName: 'Vikram Joshi', ownerFlat: 'A-205', age: '4 years', vaccinated: true },
];

export const PET_SITTERS: PetSitter[] = [
  { id: '1', name: 'Sunita Devi', flat: 'B-102', petTypes: ['dog', 'cat'], experience: '5 years', rating: 4.9, reviews: 34, pricePerDay: 400, available: true },
  { id: '2', name: 'Ravi Kumar', flat: 'C-105', petTypes: ['dog'], experience: '3 years', rating: 4.7, reviews: 21, pricePerDay: 350, available: true },
  { id: '3', name: 'Priya Mehta', flat: 'A-303', petTypes: ['cat', 'bird', 'fish'], experience: '4 years', rating: 4.8, reviews: 28, pricePerDay: 300, available: false },
];

export const LOST_PETS: LostPet[] = [
  {
    id: '1',
    name: 'Simba',
    type: 'cat',
    breed: 'Orange Tabby',
    description: 'Orange tabby with white paws. Very friendly. Wearing a red collar.',
    lastSeen: 'Jun 29, 2026 - 6:00 PM',
    location: 'Near Block A garden',
    ownerName: 'Mrs. Sharma',
    ownerContact: 'A-204',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 9. KIDS ACTIVITY HUB
// ─────────────────────────────────────────────────────────────────────────────

export interface KidsActivityCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
}

export interface KidsActivity {
  id: string;
  name: string;
  category: string;
  instructorName: string;
  instructorFlat?: string;
  isNeighbor: boolean;
  ageGroup: string;
  schedule: string;
  duration: string;
  spotsLeft: number;
  totalSpots: number;
  price: number;
  priceType: 'session' | 'month';
  rating: number;
  reviews: number;
  featured?: boolean;
}

export interface Playdate {
  id: string;
  title: string;
  hostName: string;
  hostFlat: string;
  ageGroup: string;
  date: string;
  time: string;
  location: string;
  spotsLeft: number;
  totalSpots: number;
  kids: string[];
}

export interface Tutor {
  id: string;
  name: string;
  flat: string;
  subjects: string[];
  grades: string;
  experience: string;
  rating: number;
  reviews: number;
  pricePerHour: number;
  available: boolean;
}

export const KIDS_ACTIVITY_CATEGORIES: KidsActivityCategory[] = [
  { id: 'art', name: 'Art & Craft', iconName: 'Palette', color: '#EC4899' },
  { id: 'music', name: 'Music', iconName: 'Music', color: '#8B5CF6' },
  { id: 'academics', name: 'Academics', iconName: 'BookOpen', color: '#3B82F6' },
  { id: 'sports', name: 'Sports', iconName: 'Dumbbell', color: '#10B981' },
  { id: 'coding', name: 'Coding', iconName: 'Code', color: '#F59E0B' },
  { id: 'language', name: 'Languages', iconName: 'Languages', color: '#6366F1' },
  { id: 'dance', name: 'Dance & Drama', iconName: 'Drama', color: '#EF4444' },
  { id: 'games', name: 'Games', iconName: 'Gamepad2', color: '#14B8A6' },
];

export const KIDS_ACTIVITIES: KidsActivity[] = [
  {
    id: '1',
    name: 'Watercolor Painting',
    category: 'art',
    instructorName: 'Priya Sharma',
    instructorFlat: 'B-204',
    isNeighbor: true,
    ageGroup: '5-12 years',
    schedule: 'Sat & Sun',
    duration: '1.5 hours',
    spotsLeft: 3,
    totalSpots: 8,
    price: 400,
    priceType: 'session',
    rating: 4.9,
    reviews: 34,
    featured: true,
  },
  {
    id: '2',
    name: 'Guitar for Kids',
    category: 'music',
    instructorName: 'Vikram Joshi',
    instructorFlat: 'A-105',
    isNeighbor: true,
    ageGroup: '8-15 years',
    schedule: 'Mon, Wed, Fri',
    duration: '1 hour',
    spotsLeft: 2,
    totalSpots: 5,
    price: 3000,
    priceType: 'month',
    rating: 4.8,
    reviews: 28,
  },
  {
    id: '3',
    name: 'Scratch Programming',
    category: 'coding',
    instructorName: 'Rohan Mehta',
    instructorFlat: 'C-302',
    isNeighbor: true,
    ageGroup: '7-14 years',
    schedule: 'Saturday',
    duration: '2 hours',
    spotsLeft: 5,
    totalSpots: 10,
    price: 500,
    priceType: 'session',
    rating: 4.7,
    reviews: 19,
    featured: true,
  },
  {
    id: '4',
    name: 'Chess Club',
    category: 'games',
    instructorName: 'Mr. Kapoor',
    instructorFlat: 'D-401',
    isNeighbor: true,
    ageGroup: '6-16 years',
    schedule: 'Sunday',
    duration: '2 hours',
    spotsLeft: 8,
    totalSpots: 12,
    price: 200,
    priceType: 'session',
    rating: 4.9,
    reviews: 45,
  },
];

export const PLAYDATES: Playdate[] = [
  {
    id: '1',
    title: 'Art & Craft Playdate',
    hostName: 'Sneha Kapoor',
    hostFlat: 'A-201',
    ageGroup: '4-7 years',
    date: 'Jul 2, 2026',
    time: '4:00 PM',
    location: 'A-201',
    spotsLeft: 3,
    totalSpots: 6,
    kids: ['Aarav', 'Ishaan', 'Myra'],
  },
  {
    id: '2',
    title: 'Outdoor Games',
    hostName: 'Amit Shah',
    hostFlat: 'C-302',
    ageGroup: '8-12 years',
    date: 'Jul 3, 2026',
    time: '5:30 PM',
    location: 'Garden Area',
    spotsLeft: 6,
    totalSpots: 10,
    kids: ['Arjun', 'Vihaan', 'Reyansh', 'Ananya'],
  },
];

export const TUTORS: Tutor[] = [
  { id: '1', name: 'Mrs. Sharma', flat: 'B-102', subjects: ['Mathematics', 'Science'], grades: '6-10', experience: '15 years', rating: 4.9, reviews: 56, pricePerHour: 500, available: true },
  { id: '2', name: 'Mr. Gupta', flat: 'C-205', subjects: ['English', 'Hindi'], grades: '1-8', experience: '10 years', rating: 4.8, reviews: 34, pricePerHour: 400, available: true },
  { id: '3', name: 'Priya Joshi', flat: 'A-303', subjects: ['French', 'German'], grades: 'All ages', experience: '8 years', rating: 4.7, reviews: 21, pricePerHour: 600, available: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// 10. LOCAL SPORTS LEAGUES
// ─────────────────────────────────────────────────────────────────────────────

export interface SportCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
}

export interface League {
  id: string;
  name: string;
  sport: string;
  format: string;
  teams: number;
  maxTeams: number;
  startDate: string;
  endDate: string;
  venue: string;
  entryFee: number;
  prize: string;
  status: 'registering' | 'ongoing' | 'completed';
  yourTeam?: string;
}

export interface SportsMatch {
  id: string;
  leagueName: string;
  sport: string;
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
  date: string;
  time: string;
  venue: string;
  status: 'upcoming' | 'live' | 'completed';
}

export interface Team {
  id: string;
  name: string;
  sport: string;
  captain: string;
  captainFlat: string;
  members: number;
  maxMembers: number;
  wins: number;
  losses: number;
  lookingForPlayers: boolean;
}

export interface PlayerProfile {
  id: string;
  name: string;
  flat: string;
  sports: string[];
  skill: 'beginner' | 'intermediate' | 'advanced';
  lookingToJoin: boolean;
  available: string[];
}

export const SPORT_CATEGORIES: SportCategory[] = [
  { id: 'cricket', name: 'Cricket', iconName: 'CircleDot', color: '#22C55E' },
  { id: 'football', name: 'Football', iconName: 'CircleDot', color: '#3B82F6' },
  { id: 'badminton', name: 'Badminton', iconName: 'Volleyball', color: '#EF4444' },
  { id: 'tennis', name: 'Tennis', iconName: 'CircleDot', color: '#F59E0B' },
  { id: 'basketball', name: 'Basketball', iconName: 'CircleDot', color: '#8B5CF6' },
  { id: 'running', name: 'Running', iconName: 'Footprints', color: '#EC4899' },
  { id: 'cycling', name: 'Cycling', iconName: 'Bike', color: '#14B8A6' },
  { id: 'swimming', name: 'Swimming', iconName: 'Waves', color: '#0EA5E9' },
];

export const LEAGUES: League[] = [
  {
    id: '1',
    name: 'Lokul Premier League',
    sport: 'cricket',
    format: 'T10',
    teams: 6,
    maxTeams: 8,
    startDate: 'Jul 1',
    endDate: 'Jul 31',
    venue: 'Community Ground',
    entryFee: 2000,
    prize: '₹25,000',
    status: 'registering',
  },
  {
    id: '2',
    name: 'Monsoon Football Cup',
    sport: 'football',
    format: '5-a-side',
    teams: 8,
    maxTeams: 8,
    startDate: 'Jun 20',
    endDate: 'Jul 15',
    venue: 'Turf Arena',
    entryFee: 3000,
    prize: '₹30,000',
    status: 'ongoing',
    yourTeam: 'Block A United',
  },
  {
    id: '3',
    name: 'Summer Badminton Open',
    sport: 'badminton',
    format: 'Singles & Doubles',
    teams: 24,
    maxTeams: 32,
    startDate: 'Jul 5',
    endDate: 'Jul 20',
    venue: 'Indoor Court',
    entryFee: 500,
    prize: '₹10,000',
    status: 'registering',
  },
];

export const SPORTS_MATCHES: SportsMatch[] = [
  {
    id: '1',
    leagueName: 'Monsoon Football Cup',
    sport: 'football',
    teamA: 'Block A United',
    teamB: 'C Wing Warriors',
    date: 'Today',
    time: '5:30 PM',
    venue: 'Turf Arena',
    status: 'upcoming',
  },
  {
    id: '2',
    leagueName: 'Monsoon Football Cup',
    sport: 'football',
    teamA: 'D Block Stars',
    teamB: 'B Wing Blazers',
    scoreA: 2,
    scoreB: 1,
    date: 'Today',
    time: '4:00 PM',
    venue: 'Turf Arena',
    status: 'live',
  },
  {
    id: '3',
    leagueName: 'Monsoon Football Cup',
    sport: 'football',
    teamA: 'Block A United',
    teamB: 'E Wing Eagles',
    scoreA: 3,
    scoreB: 0,
    date: 'Jun 28',
    time: '5:30 PM',
    venue: 'Turf Arena',
    status: 'completed',
  },
];

export const TEAMS: Team[] = [
  { id: '1', name: 'Block A United', sport: 'football', captain: 'Rahul Verma', captainFlat: 'A-301', members: 8, maxMembers: 10, wins: 3, losses: 0, lookingForPlayers: true },
  { id: '2', name: 'C Wing Warriors', sport: 'football', captain: 'Amit Singh', captainFlat: 'C-205', members: 10, maxMembers: 10, wins: 2, losses: 1, lookingForPlayers: false },
  { id: '3', name: 'Lokul XI', sport: 'cricket', captain: 'Vikas Kumar', captainFlat: 'B-402', members: 11, maxMembers: 15, wins: 0, losses: 0, lookingForPlayers: true },
];

export const PLAYER_PROFILES: PlayerProfile[] = [
  { id: '1', name: 'Arjun Reddy', flat: 'A-105', sports: ['cricket', 'badminton'], skill: 'intermediate', lookingToJoin: true, available: ['weekends'] },
  { id: '2', name: 'Priya Kapoor', flat: 'B-302', sports: ['tennis', 'swimming'], skill: 'advanced', lookingToJoin: false, available: ['evenings'] },
];

// ─────────────────────────────────────────────────────────────────────────────
// 11. HYPERLOCAL DELIVERY
// ─────────────────────────────────────────────────────────────────────────────

export interface StoreCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
}

export interface Store {
  id: string;
  name: string;
  category: string;
  distance: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  isOpen: boolean;
  isNeighborhood: boolean;
  offers?: string;
  featured?: boolean;
}

export interface DeliveryOrder {
  id: string;
  storeName: string;
  items: string;
  total: number;
  status: 'preparing' | 'picked' | 'delivering' | 'delivered' | 'cancelled';
  orderedAt: string;
  estimatedTime?: string;
  deliveryPartner?: string;
}

export interface QuickDeliveryItem {
  id: string;
  name: string;
  store: string;
  price: number;
  originalPrice?: number;
  image: string;
  deliveryTime: string;
}

export const STORE_CATEGORIES: StoreCategory[] = [
  { id: 'grocery', name: 'Grocery', iconName: 'ShoppingBag', color: '#22C55E' },
  { id: 'food', name: 'Food', iconName: 'Utensils', color: '#EF4444' },
  { id: 'pharmacy', name: 'Pharmacy', iconName: 'Pill', color: '#3B82F6' },
  { id: 'dairy', name: 'Dairy', iconName: 'Milk', color: '#F59E0B' },
  { id: 'bakery', name: 'Bakery', iconName: 'Cake', color: '#EC4899' },
  { id: 'meat', name: 'Meat & Fish', iconName: 'Beef', color: '#8B5CF6' },
  { id: 'vegetables', name: 'Vegetables', iconName: 'Leaf', color: '#10B981' },
];

export const STORES: Store[] = [
  {
    id: '1',
    name: 'Fresh Mart',
    category: 'grocery',
    distance: '0.3 km',
    rating: 4.8,
    reviews: 256,
    deliveryTime: '15-20 min',
    deliveryFee: 0,
    minOrder: 99,
    isOpen: true,
    isNeighborhood: true,
    offers: '20% off on first order',
    featured: true,
  },
  {
    id: '2',
    name: 'Sharma Dairy',
    category: 'dairy',
    distance: '0.2 km',
    rating: 4.9,
    reviews: 189,
    deliveryTime: '10-15 min',
    deliveryFee: 0,
    minOrder: 50,
    isOpen: true,
    isNeighborhood: true,
  },
  {
    id: '3',
    name: 'Green Leaf Vegetables',
    category: 'vegetables',
    distance: '0.4 km',
    rating: 4.7,
    reviews: 134,
    deliveryTime: '20-25 min',
    deliveryFee: 10,
    minOrder: 150,
    isOpen: true,
    isNeighborhood: true,
    offers: 'Free delivery above ₹300',
  },
  {
    id: '4',
    name: 'MedPlus Pharmacy',
    category: 'pharmacy',
    distance: '0.5 km',
    rating: 4.6,
    reviews: 312,
    deliveryTime: '25-30 min',
    deliveryFee: 25,
    minOrder: 0,
    isOpen: true,
    isNeighborhood: false,
  },
  {
    id: '5',
    name: 'Bakes & More',
    category: 'bakery',
    distance: '0.6 km',
    rating: 4.8,
    reviews: 178,
    deliveryTime: '20-30 min',
    deliveryFee: 20,
    minOrder: 100,
    isOpen: true,
    isNeighborhood: true,
    featured: true,
  },
  {
    id: '6',
    name: 'Royal Meats',
    category: 'meat',
    distance: '0.8 km',
    rating: 4.5,
    reviews: 89,
    deliveryTime: '30-40 min',
    deliveryFee: 30,
    minOrder: 200,
    isOpen: true,
    isNeighborhood: false,
  },
];

export const DELIVERY_ORDERS: DeliveryOrder[] = [
  {
    id: '1',
    storeName: 'Fresh Mart',
    items: 'Milk, Bread, Eggs, Butter',
    total: 245,
    status: 'delivering',
    orderedAt: '10:30 AM',
    estimatedTime: '10:50 AM',
    deliveryPartner: 'Raju',
  },
  {
    id: '2',
    storeName: 'Sharma Dairy',
    items: 'Paneer, Curd, Lassi',
    total: 180,
    status: 'delivered',
    orderedAt: 'Yesterday, 6:00 PM',
  },
];

export const QUICK_DELIVERY_ITEMS: QuickDeliveryItem[] = [
  { id: '1', name: 'Amul Taza Milk 1L', store: 'Sharma Dairy', price: 54, originalPrice: 60, image: '🥛', deliveryTime: '10 min' },
  { id: '2', name: 'Fresh Bread', store: 'Bakes & More', price: 35, image: '🍞', deliveryTime: '15 min' },
  { id: '3', name: 'Farm Eggs (12)', store: 'Fresh Mart', price: 84, image: '🥚', deliveryTime: '20 min' },
  { id: '4', name: 'Bananas 1 dozen', store: 'Green Leaf', price: 50, image: '🍌', deliveryTime: '20 min' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 12. REAL ESTATE HUB
// ─────────────────────────────────────────────────────────────────────────────

export type PropertyType = 'sale' | 'rent' | 'pg';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  propertyType: 'apartment' | 'house' | 'villa' | 'plot' | 'pg';
  bhk?: string;
  area: number;
  price: number;
  priceUnit?: string;
  location: string;
  distance: string;
  postedBy: string;
  postedByFlat?: string;
  isOwner: boolean;
  isNeighbor: boolean;
  postedAt: string;
  images: number;
  amenities: string[];
  verified: boolean;
  featured?: boolean;
  furnishing?: string;
  floor?: string;
  availableFrom?: string;
}

export interface RealEstateAgent {
  id: string;
  name: string;
  flat: string;
  rating: number;
  reviews: number;
  listings: number;
  experience: string;
  specialization: string[];
  verified: boolean;
}

export const PROPERTY_TYPES = [
  { id: 'sale', label: 'Buy', iconName: 'Key' },
  { id: 'rent', label: 'Rent', iconName: 'Home' },
  { id: 'pg', label: 'PG', iconName: 'Users' },
];

export const PROPERTIES: Property[] = [
  {
    id: '1',
    title: '3 BHK Apartment for Sale',
    type: 'sale',
    propertyType: 'apartment',
    bhk: '3 BHK',
    area: 1450,
    price: 12500000,
    location: 'Block B, Harmony Heights',
    distance: 'Same Society',
    postedBy: 'Rajesh Kumar',
    postedByFlat: 'B-502',
    isOwner: true,
    isNeighbor: true,
    postedAt: '2 days ago',
    images: 8,
    amenities: ['Parking', 'Gym', 'Pool', 'Garden'],
    verified: true,
    featured: true,
    furnishing: 'Semi-Furnished',
    floor: '5th of 12',
  },
  {
    id: '2',
    title: '2 BHK for Rent',
    type: 'rent',
    propertyType: 'apartment',
    bhk: '2 BHK',
    area: 1100,
    price: 25000,
    priceUnit: '/month',
    location: 'A Wing, Ground Floor',
    distance: 'Same Society',
    postedBy: 'Anita Sharma',
    postedByFlat: 'A-102',
    isOwner: true,
    isNeighbor: true,
    postedAt: '5 days ago',
    images: 6,
    amenities: ['Parking', 'Power Backup'],
    verified: true,
    furnishing: 'Fully Furnished',
    floor: 'Ground',
    availableFrom: 'Immediate',
  },
  {
    id: '3',
    title: 'Spacious 4 BHK Villa',
    type: 'sale',
    propertyType: 'villa',
    bhk: '4 BHK',
    area: 2800,
    price: 35000000,
    location: 'Palm Grove Villas',
    distance: '0.8 km',
    postedBy: 'Suresh Agents',
    isOwner: false,
    isNeighbor: false,
    postedAt: '1 week ago',
    images: 12,
    amenities: ['Private Garden', 'Parking', 'Servant Quarter'],
    verified: true,
    featured: true,
    furnishing: 'Unfurnished',
  },
  {
    id: '4',
    title: 'PG for Working Professionals',
    type: 'pg',
    propertyType: 'pg',
    area: 0,
    price: 8000,
    priceUnit: '/month',
    location: 'C Wing, 3rd Floor',
    distance: 'Same Society',
    postedBy: 'Mrs. Kapoor',
    postedByFlat: 'C-301',
    isOwner: true,
    isNeighbor: true,
    postedAt: '3 days ago',
    images: 4,
    amenities: ['Meals Included', 'WiFi', 'AC Room'],
    verified: true,
    availableFrom: 'Jul 1, 2026',
  },
];

export const REAL_ESTATE_AGENTS: RealEstateAgent[] = [
  { id: '1', name: 'Suresh Realty', flat: 'B-G02', rating: 4.8, reviews: 67, listings: 15, experience: '12 years', specialization: ['Residential', 'Commercial'], verified: true },
  { id: '2', name: 'Priya Properties', flat: 'D-105', rating: 4.6, reviews: 34, listings: 8, experience: '5 years', specialization: ['Rentals', 'PG'], verified: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// 13. LOCAL JOBS BOARD
// ─────────────────────────────────────────────────────────────────────────────

export interface JobCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
}

export type JobType = 'full-time' | 'part-time' | 'freelance' | 'internship';
export type WorkMode = 'onsite' | 'remote' | 'hybrid';

export interface Job {
  id: string;
  title: string;
  company: string;
  companyFlat?: string;
  isNeighbor: boolean;
  category: string;
  type: JobType;
  workMode: WorkMode;
  location: string;
  distance: string;
  salary: string;
  experience: string;
  postedAt: string;
  applicants?: number;
  verified: boolean;
  featured?: boolean;
  urgent?: boolean;
  description?: string;
}

export interface Freelancer {
  id: string;
  name: string;
  flat: string;
  skills: string[];
  experience: string;
  hourlyRate: number;
  rating: number;
  reviews: number;
  available: boolean;
}

export const JOB_CATEGORIES: JobCategory[] = [
  { id: 'tech', name: 'Tech', iconName: 'Laptop', color: '#3B82F6' },
  { id: 'service', name: 'Services', iconName: 'Wrench', color: '#F59E0B' },
  { id: 'sales', name: 'Sales', iconName: 'ShoppingBag', color: '#22C55E' },
  { id: 'support', name: 'Support', iconName: 'Headphones', color: '#8B5CF6' },
  { id: 'design', name: 'Design', iconName: 'PenTool', color: '#EC4899' },
  { id: 'finance', name: 'Finance', iconName: 'Calculator', color: '#14B8A6' },
  { id: 'delivery', name: 'Delivery', iconName: 'Truck', color: '#EF4444' },
  { id: 'domestic', name: 'Domestic', iconName: 'Baby', color: '#6366F1' },
];

export const JOBS: Job[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'TechStart Solutions',
    companyFlat: 'B-401',
    isNeighbor: true,
    category: 'tech',
    type: 'full-time',
    workMode: 'hybrid',
    location: 'Work from Society',
    distance: 'Same Society',
    salary: '₹8-12 LPA',
    experience: '2-4 years',
    postedAt: '2 days ago',
    applicants: 12,
    verified: true,
    featured: true,
  },
  {
    id: '2',
    title: 'Part-time Accountant',
    company: 'Sharma & Associates',
    companyFlat: 'A-302',
    isNeighbor: true,
    category: 'finance',
    type: 'part-time',
    workMode: 'onsite',
    location: 'Home Office, A-302',
    distance: 'Same Society',
    salary: '₹15,000/month',
    experience: '1-2 years',
    postedAt: '5 days ago',
    verified: true,
  },
  {
    id: '3',
    title: 'Delivery Executive',
    company: 'QuickMart Delivery',
    isNeighbor: false,
    category: 'delivery',
    type: 'full-time',
    workMode: 'onsite',
    location: 'MG Road Area',
    distance: '2.5 km',
    salary: '₹18,000-22,000/month',
    experience: 'Fresher OK',
    postedAt: '1 day ago',
    applicants: 34,
    verified: true,
    urgent: true,
  },
  {
    id: '4',
    title: 'UI/UX Design Intern',
    company: 'DesignWorks Studio',
    companyFlat: 'C-505',
    isNeighbor: true,
    category: 'design',
    type: 'internship',
    workMode: 'hybrid',
    location: 'Work from Society',
    distance: 'Same Society',
    salary: '₹10,000/month',
    experience: 'Students',
    postedAt: '3 days ago',
    applicants: 8,
    verified: true,
    featured: true,
  },
  {
    id: '5',
    title: 'Nanny / Babysitter',
    company: 'Direct Hire',
    companyFlat: 'D-201',
    isNeighbor: true,
    category: 'domestic',
    type: 'full-time',
    workMode: 'onsite',
    location: 'D-201',
    distance: 'Same Society',
    salary: '₹12,000-15,000/month',
    experience: '2+ years',
    postedAt: '1 week ago',
    verified: true,
  },
];

export const FREELANCERS: Freelancer[] = [
  { id: '1', name: 'Rohan Mehta', flat: 'C-302', skills: ['Web Development', 'React', 'Node.js'], experience: '5 years', hourlyRate: 800, rating: 4.9, reviews: 23, available: true },
  { id: '2', name: 'Priya Sharma', flat: 'B-204', skills: ['Graphic Design', 'UI/UX', 'Branding'], experience: '4 years', hourlyRate: 600, rating: 4.8, reviews: 18, available: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// 14. TELEMEDICINE INTEGRATION
// ─────────────────────────────────────────────────────────────────────────────

export interface MedicalSpecialty {
  id: string;
  name: string;
  iconName: string;
  color: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  clinicName?: string;
  clinicFlat?: string;
  isNeighbor: boolean;
  rating: number;
  reviews: number;
  consultationFee: number;
  videoFee?: number;
  languages: string[];
  availableToday: boolean;
  nextSlot?: string;
  verified: boolean;
  featured?: boolean;
}

export interface MedicalAppointment {
  id: string;
  doctorName: string;
  specialty: string;
  type: 'video' | 'audio' | 'in-person';
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  prescriptionAvailable?: boolean;
}

export interface HealthRecord {
  id: string;
  type: 'prescription' | 'report' | 'record';
  title: string;
  doctorName: string;
  date: string;
}

export const MEDICAL_SPECIALTIES: MedicalSpecialty[] = [
  { id: 'general', name: 'General', iconName: 'Stethoscope', color: '#3B82F6' },
  { id: 'dermatology', name: 'Skin', iconName: 'UserRound', color: '#EC4899' },
  { id: 'pediatrics', name: 'Pediatrics', iconName: 'Baby', color: '#F59E0B' },
  { id: 'orthopedics', name: 'Bones', iconName: 'Bone', color: '#8B5CF6' },
  { id: 'cardiology', name: 'Heart', iconName: 'Activity', color: '#EF4444' },
  { id: 'psychology', name: 'Mental', iconName: 'Brain', color: '#14B8A6' },
  { id: 'ophthalmology', name: 'Eye', iconName: 'Eye', color: '#6366F1' },
  { id: 'dentistry', name: 'Dental', iconName: 'ThermometerSun', color: '#22C55E' },
];

export const DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Priya Sharma',
    specialty: 'general',
    qualification: 'MBBS, MD (Medicine)',
    experience: '15 years',
    clinicName: 'HealthFirst Clinic',
    clinicFlat: 'B-G01',
    isNeighbor: true,
    rating: 4.9,
    reviews: 234,
    consultationFee: 300,
    videoFee: 200,
    languages: ['English', 'Hindi'],
    availableToday: true,
    nextSlot: '11:30 AM',
    verified: true,
    featured: true,
  },
  {
    id: '2',
    name: 'Dr. Rajesh Kumar',
    specialty: 'pediatrics',
    qualification: 'MBBS, DCH',
    experience: '12 years',
    clinicFlat: 'A-102',
    isNeighbor: true,
    rating: 4.8,
    reviews: 156,
    consultationFee: 400,
    videoFee: 300,
    languages: ['English', 'Hindi', 'Marathi'],
    availableToday: true,
    nextSlot: '2:00 PM',
    verified: true,
  },
  {
    id: '3',
    name: 'Dr. Anita Desai',
    specialty: 'dermatology',
    qualification: 'MBBS, MD (Dermatology)',
    experience: '10 years',
    clinicName: 'Skin Care Center',
    isNeighbor: false,
    rating: 4.7,
    reviews: 189,
    consultationFee: 500,
    videoFee: 400,
    languages: ['English', 'Hindi'],
    availableToday: false,
    nextSlot: 'Tomorrow 10:00 AM',
    verified: true,
  },
  {
    id: '4',
    name: 'Dr. Vikram Joshi',
    specialty: 'orthopedics',
    qualification: 'MBBS, MS (Ortho)',
    experience: '18 years',
    clinicName: 'Bone & Joint Clinic',
    isNeighbor: false,
    rating: 4.8,
    reviews: 267,
    consultationFee: 600,
    videoFee: 500,
    languages: ['English', 'Hindi'],
    availableToday: true,
    nextSlot: '4:30 PM',
    verified: true,
    featured: true,
  },
];

export const MEDICAL_APPOINTMENTS: MedicalAppointment[] = [
  {
    id: '1',
    doctorName: 'Dr. Priya Sharma',
    specialty: 'General',
    type: 'video',
    date: 'Jul 1, 2026',
    time: '11:30 AM',
    status: 'upcoming',
  },
  {
    id: '2',
    doctorName: 'Dr. Rajesh Kumar',
    specialty: 'Pediatrics',
    type: 'in-person',
    date: 'Jun 25, 2026',
    time: '3:00 PM',
    status: 'completed',
    prescriptionAvailable: true,
  },
];

export const HEALTH_RECORDS: HealthRecord[] = [
  { id: '1', type: 'prescription', title: 'General Checkup Prescription', doctorName: 'Dr. Priya Sharma', date: 'Jun 15, 2026' },
  { id: '2', type: 'report', title: 'Blood Test Report', doctorName: 'Path Lab', date: 'Jun 10, 2026' },
  { id: '3', type: 'record', title: 'Vaccination Record', doctorName: 'Dr. Rajesh Kumar', date: 'May 20, 2026' },
];

// ─────────────────────────────────────────────────────────────────────────────
// DEMO DATA SUMMARY STATS
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_STATS = {
  domesticHelpers: DOMESTIC_HELPERS.length,
  parkingSlots: MY_PARKING_SLOTS.length,
  amenities: AMENITIES.length,
  savedBillers: SAVED_BILLERS.length,
  insurancePlans: INSURANCE_PLANS.length,
  skillOffers: SKILL_OFFERS.length,
  borrowItems: BORROW_ITEMS.length,
  petServices: PET_SERVICES.length,
  communityPets: COMMUNITY_PETS.length,
  kidsActivities: KIDS_ACTIVITIES.length,
  playdates: PLAYDATES.length,
  leagues: LEAGUES.length,
  stores: STORES.length,
  properties: PROPERTIES.length,
  jobs: JOBS.length,
  doctors: DOCTORS.length,
};

// Seed data for Modules 05, 07, 08, 09, 11
import {
  AirVent,
  Apple,
  Baby,
  Bolt,
  Briefcase,
  Bug,
  Building,
  Building2,
  Calculator,
  Camera,
  Car,
  Cctv,
  ChefHat,
  ClipboardList,
  Droplets,
  Dumbbell,
  FileText,
  FlaskConical,
  Flower,
  GraduationCap,
  Hammer,
  Hand,
  HeartHandshake,
  HeartPulse,
  Leaf,
  PaintBucket,
  PartyPopper,
  PawPrint,
  PersonStanding,
  Scale,
  Scissors,
  ShowerHead,
  Shirt,
  Sofa,
  Sparkles,
  Stethoscope,
  Truck,
  Tv2,
  UtensilsCrossed,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

// ─────────────────────────────────────────────
// MODULE 05 — Marketplace / Services
// ─────────────────────────────────────────────
export type ServiceCategory =
  // ── Existing ──
  | 'maid'
  | 'cook'
  | 'tiffin'
  | 'plumber'
  | 'electrician'
  | 'carpenter'
  | 'ac_repair'
  | 'salon'
  | 'photographer'
  | 'fitness'
  | 'driver'
  // ── Blue Collar / Home & Trades ──
  | 'painter'
  | 'pest_control'
  | 'appliance_repair'
  | 'water_purifier'
  | 'cctv_security'
  | 'packers_movers'
  | 'car_wash'
  | 'laundry'
  | 'gardener'
  | 'mason'
  // ── Blue Collar / Personal Care ──
  | 'barber'
  | 'mehendi'
  | 'yoga'
  | 'massage'
  | 'physiotherapy'
  | 'dietitian'
  | 'nurse'
  | 'lab_test'
  | 'pet_care'
  // ── White Collar / Professional ──
  | 'ca_accountant'
  | 'lawyer'
  | 'interior_designer'
  | 'event_planner'
  | 'catering'
  | 'tutor_academic'
  | 'career_counsellor'
  | 'insurance_advisor'
  // ── Society-Specific ──
  | 'society_maintenance'
  | 'elderly_care'
  | 'childcare'
  | 'other';

export const SERVICE_CATEGORIES: { id: ServiceCategory; label: string; Icon: LucideIcon; group: string }[] = [
  // ── Existing ──
  { id: 'maid',        label: 'Maid',         Icon: Shirt,          group: 'Home Help' },
  { id: 'cook',        label: 'Cook',          Icon: ChefHat,        group: 'Home Help' },
  { id: 'tiffin',      label: 'Tiffin',        Icon: UtensilsCrossed,group: 'Home Help' },
  { id: 'driver',      label: 'Driver',        Icon: Car,            group: 'Home Help' },

  // ── Blue Collar / Home & Trades ──
  { id: 'plumber',           label: 'Plumber',          Icon: ShowerHead,     group: 'Home & Trades' },
  { id: 'electrician',       label: 'Electrician',      Icon: Bolt,           group: 'Home & Trades' },
  { id: 'carpenter',         label: 'Carpenter',        Icon: Hammer,         group: 'Home & Trades' },
  { id: 'ac_repair',         label: 'AC Repair',        Icon: AirVent,        group: 'Home & Trades' },
  { id: 'painter',           label: 'Painter',          Icon: PaintBucket,    group: 'Home & Trades' },
  { id: 'mason',             label: 'Mason / Civil',    Icon: Building2,      group: 'Home & Trades' },
  { id: 'pest_control',      label: 'Pest Control',     Icon: Bug,            group: 'Home & Trades' },
  { id: 'appliance_repair',  label: 'Appliance Repair', Icon: Tv2,            group: 'Home & Trades' },
  { id: 'water_purifier',    label: 'Water Purifier',   Icon: Droplets,       group: 'Home & Trades' },
  { id: 'cctv_security',     label: 'CCTV / Security',  Icon: Cctv,           group: 'Home & Trades' },
  { id: 'packers_movers',    label: 'Packers & Movers', Icon: Truck,          group: 'Home & Trades' },
  { id: 'car_wash',          label: 'Car Wash',         Icon: Sparkles,       group: 'Home & Trades' },
  { id: 'laundry',           label: 'Laundry',          Icon: Wind,           group: 'Home & Trades' },
  { id: 'gardener',          label: 'Gardener / Mali',  Icon: Leaf,           group: 'Home & Trades' },

  // ── Blue Collar / Personal Care ──
  { id: 'salon',         label: 'Salon',          Icon: Scissors,       group: 'Personal Care' },
  { id: 'barber',        label: 'Barber',         Icon: Zap,            group: 'Personal Care' },
  { id: 'mehendi',       label: 'Mehendi Artist', Icon: Flower,         group: 'Personal Care' },
  { id: 'fitness',       label: 'Fitness Trainer',Icon: Dumbbell,       group: 'Personal Care' },
  { id: 'yoga',          label: 'Yoga',           Icon: PersonStanding, group: 'Personal Care' },
  { id: 'massage',       label: 'Massage',        Icon: Hand,           group: 'Personal Care' },
  { id: 'physiotherapy', label: 'Physiotherapy',  Icon: HeartPulse,     group: 'Personal Care' },
  { id: 'dietitian',     label: 'Dietitian',      Icon: Apple,          group: 'Personal Care' },
  { id: 'nurse',         label: 'Home Nurse',     Icon: Stethoscope,    group: 'Personal Care' },
  { id: 'lab_test',      label: 'Lab Test @Home', Icon: FlaskConical,   group: 'Personal Care' },
  { id: 'pet_care',      label: 'Pet Care',       Icon: PawPrint,       group: 'Personal Care' },

  // ── White Collar / Professional ──
  { id: 'photographer',      label: 'Photographer',     Icon: Camera,         group: 'Professional' },
  { id: 'ca_accountant',     label: 'CA / Accountant',  Icon: Calculator,     group: 'Professional' },
  { id: 'lawyer',            label: 'Lawyer / Notary',  Icon: Scale,          group: 'Professional' },
  { id: 'interior_designer', label: 'Interior Design',  Icon: Sofa,           group: 'Professional' },
  { id: 'event_planner',     label: 'Event Planner',    Icon: PartyPopper,    group: 'Professional' },
  { id: 'catering',          label: 'Catering',         Icon: ClipboardList,  group: 'Professional' },
  { id: 'tutor_academic',    label: 'Tutor',            Icon: GraduationCap,  group: 'Professional' },
  { id: 'career_counsellor', label: 'Career Counsellor',Icon: Briefcase,      group: 'Professional' },
  { id: 'insurance_advisor', label: 'Insurance Advisor',Icon: FileText,       group: 'Professional' },

  // ── Society-Specific ──
  { id: 'society_maintenance', label: 'Society Maintenance', Icon: Building,       group: 'Society' },
  { id: 'elderly_care',        label: 'Elderly Care',         Icon: HeartHandshake, group: 'Society' },
  { id: 'childcare',           label: 'Childcare / Creche',   Icon: Baby,           group: 'Society' },

  { id: 'other', label: 'Other', Icon: Wrench, group: 'Other' },
];

export interface Merchant {
  id: string;
  name: string;
  category: ServiceCategory;
  rating: number;
  reviewCount: number;
  distanceM: number;
  priceLabel: string;
  responseTime: string;
  availableNow: boolean;
  verified: boolean;
  bio: string;
  services: { name: string; price: number; duration: string }[];
  societiesServed: string[];
}

export const MERCHANTS: Merchant[] = [
  {
    id: 'm1',
    name: 'Sunita Home Services',
    category: 'maid',
    rating: 4.8,
    reviewCount: 47,
    distanceM: 120,
    priceLabel: '₹2,000/month',
    responseTime: '< 1hr',
    availableNow: true,
    verified: true,
    bio: 'Professional maid service with 5+ years experience in Kumar Sienna and Amanora.',
    services: [
      { name: 'Sweeping + mopping (1BHK)', price: 1500, duration: '45 min' },
      { name: 'Sweeping + mopping (2BHK)', price: 2000, duration: '1 hr' },
      { name: 'Full cleaning (3BHK)', price: 3000, duration: '2 hr' },
      { name: 'Deep cleaning', price: 5000, duration: '4 hr' },
    ],
    societiesServed: ['Kumar Sienna', 'Amanora Park Town'],
  },
  {
    id: 'm2',
    name: 'Raju Electricals',
    category: 'electrician',
    rating: 4.6,
    reviewCount: 33,
    distanceM: 350,
    priceLabel: 'From ₹300',
    responseTime: '< 2hr',
    availableNow: true,
    verified: true,
    bio: 'Licensed electrician, 10 years experience. All types of wiring, fan, AC installation.',
    services: [
      { name: 'Fan installation', price: 300, duration: '30 min' },
      { name: 'AC installation (split)', price: 1000, duration: '2 hr' },
      { name: 'Wiring & switchboard repair', price: 500, duration: '1 hr' },
      { name: 'MCB replacement', price: 400, duration: '30 min' },
    ],
    societiesServed: ['Kumar Sienna', 'Magarpatta Daffodils', 'Godrej Infinity'],
  },
  {
    id: 'm3',
    name: "Laxmi's Tiffin",
    category: 'tiffin',
    rating: 4.9,
    reviewCount: 118,
    distanceM: 80,
    priceLabel: '₹120/meal',
    responseTime: 'Same day',
    availableNow: true,
    verified: true,
    bio: 'Homestyle Maharashtrian and North Indian tiffin. Delivery within society by 1pm.',
    services: [
      { name: 'Veg tiffin (lunch)', price: 120, duration: 'Delivered by 1pm' },
      { name: 'Non-veg tiffin (lunch)', price: 150, duration: 'Delivered by 1pm' },
      { name: 'Monthly veg plan (22 days)', price: 2400, duration: 'Daily' },
    ],
    societiesServed: ['Kumar Sienna'],
  },
  {
    id: 'm4',
    name: 'Sharma Plumbing',
    category: 'plumber',
    rating: 4.4,
    reviewCount: 21,
    distanceM: 450,
    priceLabel: 'From ₹400',
    responseTime: '< 3hr',
    availableNow: false,
    verified: true,
    bio: 'All plumbing repairs, pipe fitting, bathroom work. Available weekdays 8am–7pm.',
    services: [
      { name: 'Tap / faucet repair', price: 400, duration: '30 min' },
      { name: 'Drain unclogging', price: 600, duration: '1 hr' },
      { name: 'Toilet repair', price: 500, duration: '45 min' },
      { name: 'Pipe leakage fix', price: 800, duration: '1.5 hr' },
    ],
    societiesServed: ['Kumar Sienna', 'Nyati Equatorial'],
  },
  {
    id: 'm5',
    name: 'Kiran Fitness Coach',
    category: 'fitness',
    rating: 4.7,
    reviewCount: 29,
    distanceM: 200,
    priceLabel: '₹1,500/month',
    responseTime: 'Appointment',
    availableNow: false,
    verified: true,
    bio: 'Certified personal trainer. Yoga, Zumba, strength training. Early morning slots available.',
    services: [
      { name: 'Yoga (group, 5 pax max)', price: 500, duration: '1 hr' },
      { name: 'Personal training', price: 800, duration: '1 hr' },
      { name: 'Zumba (group)', price: 400, duration: '45 min' },
    ],
    societiesServed: ['Kumar Sienna', 'Amanora Park Town', 'Blue Ridge Township'],
  },
  {
    id: 'm6',
    name: 'Sanjay AC Services',
    category: 'ac_repair',
    rating: 4.5,
    reviewCount: 44,
    distanceM: 600,
    priceLabel: 'From ₹500',
    responseTime: '< 4hr',
    availableNow: true,
    verified: true,
    bio: 'AC servicing, repair, and installation for all brands. Same-day service available.',
    services: [
      { name: 'AC service (split)', price: 600, duration: '1 hr' },
      { name: 'AC service (window)', price: 500, duration: '45 min' },
      { name: 'Gas refill (R32)', price: 2500, duration: '1.5 hr' },
      { name: 'PCB repair', price: 1500, duration: '2 hr' },
    ],
    societiesServed: ['Kumar Sienna', 'Godrej Infinity', 'Lodha Belmondo'],
  },
];

// ─────────────────────────────────────────────
// MODULE 07 — Classifieds
// ─────────────────────────────────────────────
export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair';
export type ListingStatus = 'active' | 'reserved' | 'sold';
export type ClassifiedCategory =
  | 'furniture'
  | 'electronics'
  | 'books'
  | 'kids'
  | 'appliances'
  | 'sports'
  | 'other';

export interface ClassifiedListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerTier: 'bronze' | 'silver' | 'gold';
  title: string;
  description: string;
  price: number; // 0 = free, -1 = open
  condition: ListingCondition;
  category: ClassifiedCategory;
  imageUris: string[];
  location: string;
  status: ListingStatus;
  createdAt: number;
  savedCount: number;
}

const now = Date.now();
const mins = (n: number) => now - n * 60_000;
const hrs = (n: number) => now - n * 60 * 60_000;
const days = (n: number) => now - n * 24 * 60 * 60_000;

export const CLASSIFIEDS: ClassifiedListing[] = [
  {
    id: 'cl-1',
    sellerId: 'u6',
    sellerName: 'Sneha Kulkarni',
    sellerTier: 'gold',
    title: 'Philips Air Fryer HD9252',
    description: 'Barely used — 2 months old. Comes with original box, manual and extra grill rack. Selling because we upgraded to a larger model. Pick-up only from Tower B.',
    price: 3500,
    condition: 'like_new',
    category: 'appliances',
    imageUris: [],
    location: 'Tower B-702',
    status: 'active',
    createdAt: hrs(12),
    savedCount: 8,
  },
  {
    id: 'cl-2',
    sellerId: 'u4',
    sellerName: 'Anita Desai',
    sellerTier: 'gold',
    title: 'IKea study table + chair set',
    description: 'IKEA Micke desk (90x50cm) with matching swivel chair. Light brown/white. 3 years old, excellent condition. Self-assembly required.',
    price: 4500,
    condition: 'good',
    category: 'furniture',
    imageUris: [],
    location: 'Tower A-805',
    status: 'active',
    createdAt: hrs(28),
    savedCount: 12,
  },
  {
    id: 'cl-3',
    sellerId: 'u7',
    sellerName: 'Arjun Patil',
    sellerTier: 'silver',
    title: 'Engineering textbooks (SPPU 2nd year)',
    description: 'Set of 6 SPPU-approved textbooks for 2nd year Computer Engineering. Authors: Forouzan, Korth, Dennis Ritchie. Good condition, some highlights.',
    price: 800,
    condition: 'good',
    category: 'books',
    imageUris: [],
    location: 'Tower A-201',
    status: 'active',
    createdAt: days(2),
    savedCount: 3,
  },
  {
    id: 'cl-4',
    sellerId: 'u5',
    sellerName: 'Vikram Joshi',
    sellerTier: 'silver',
    title: 'Kids cycle (14 inch, age 4-6)',
    description: 'Red Hero cycle, training wheels included. Used for 1 year by our daughter. Works perfectly, just a few cosmetic scratches.',
    price: 1200,
    condition: 'good',
    category: 'kids',
    imageUris: [],
    location: 'Tower D-401',
    status: 'reserved',
    createdAt: days(3),
    savedCount: 5,
  },
  {
    id: 'cl-5',
    sellerId: 'u2',
    sellerName: 'Priya Sharma',
    sellerTier: 'gold',
    title: 'Yoga mat + resistance bands (set)',
    description: 'Strauss 6mm yoga mat (non-slip) + 5-resistance-band set. Like new, used 3-4 times. Price is for the set.',
    price: 600,
    condition: 'like_new',
    category: 'sports',
    imageUris: [],
    location: 'Tower B-1204',
    status: 'active',
    createdAt: days(1),
    savedCount: 6,
  },
  {
    id: 'cl-6',
    sellerId: 'u3',
    sellerName: 'Rohan Mehta',
    sellerTier: 'silver',
    title: 'JBL Go 3 Bluetooth speaker',
    description: 'JBL Go 3 in blue. IP67 waterproof. Works great, battery life 5+ hours. Selling as I got a larger speaker.',
    price: 1400,
    condition: 'good',
    category: 'electronics',
    imageUris: [],
    location: 'Tower C-302',
    status: 'active',
    createdAt: days(4),
    savedCount: 11,
  },
];

// ─────────────────────────────────────────────
// MODULE 08 — Events
// ─────────────────────────────────────────────
export type RSVPStatus = 'yes' | 'maybe' | 'no' | 'none';

export interface Event {
  id: string;
  organizerId: string;
  organizerName: string;
  organizerTier: 'bronze' | 'silver' | 'gold';
  title: string;
  description: string;
  location: string;
  startAt: number;
  endAt: number;
  capacity?: number;
  ticketFee: number; // 0 = free
  rsvpYes: number;
  rsvpMaybe: number;
  myRsvp: RSVPStatus;
  coverColor: string; // bg color for placeholder
  tags: string[];
}

export const EVENTS: Event[] = [
  {
    id: 'ev-1',
    organizerId: 'u4',
    organizerName: 'Anita Desai',
    organizerTier: 'gold',
    title: 'Garba Night 2026',
    description: 'Annual Navratri Garba Night at the clubhouse. Bring your dandiya sticks! Snacks and prasad arranged by the Cultural Committee. Dress code: traditional.',
    location: 'Clubhouse — Main Hall',
    startAt: now + 2 * 24 * 60 * 60_000 + 19 * 60 * 60_000,
    endAt: now + 2 * 24 * 60 * 60_000 + 23 * 60 * 60_000,
    capacity: 200,
    ticketFee: 0,
    rsvpYes: 86,
    rsvpMaybe: 22,
    myRsvp: 'yes',
    coverColor: '#FEF3C7',
    tags: ['culture', 'festival'],
  },
  {
    id: 'ev-2',
    organizerId: 'u-rwa',
    organizerName: 'Kumar Sienna RWA',
    organizerTier: 'gold',
    title: 'Society AGM — June 2026',
    description: 'Annual General Meeting for all residents. Topics: FY25-26 accounts, maintenance hike proposal, security upgrade decision, and open floor for suggestions.',
    location: 'Clubhouse — Conference Room',
    startAt: now + 4 * 24 * 60 * 60_000 + 11 * 60 * 60_000,
    endAt: now + 4 * 24 * 60 * 60_000 + 13 * 60 * 60_000,
    capacity: 150,
    ticketFee: 0,
    rsvpYes: 45,
    rsvpMaybe: 18,
    myRsvp: 'maybe',
    coverColor: '#EEF4FB',
    tags: ['rwa', 'agm'],
  },
  {
    id: 'ev-3',
    organizerId: 'u5',
    organizerName: 'Vikram Joshi',
    organizerTier: 'silver',
    title: 'Morning Yoga — Terrace Garden',
    description: 'Free weekly yoga session for all residents. Suitable for beginners. Bring your own mat. Every Saturday 6:30am.',
    location: 'Terrace Garden, Tower B',
    startAt: now + 1 * 24 * 60 * 60_000 + 6.5 * 60 * 60_000,
    endAt: now + 1 * 24 * 60 * 60_000 + 7.5 * 60 * 60_000,
    capacity: 20,
    ticketFee: 0,
    rsvpYes: 14,
    rsvpMaybe: 4,
    myRsvp: 'none',
    coverColor: '#F0FDF4',
    tags: ['fitness', 'wellness'],
  },
  {
    id: 'ev-4',
    organizerId: 'u2',
    organizerName: 'Priya Sharma',
    organizerTier: 'gold',
    title: "Kids' Craft Workshop",
    description: 'Fun craft workshop for children aged 5-10. Activities include origami, poster making, and clay modelling. All materials provided.',
    location: "Children's Play Room",
    startAt: now + 7 * 24 * 60 * 60_000 + 15 * 60 * 60_000,
    endAt: now + 7 * 24 * 60 * 60_000 + 17 * 60 * 60_000,
    capacity: 25,
    ticketFee: 15000,
    rsvpYes: 11,
    rsvpMaybe: 3,
    myRsvp: 'none',
    coverColor: '#FFF7ED',
    tags: ['kids', 'workshop'],
  },
];

// ─────────────────────────────────────────────
// MODULE 09 — Notices, Polls, Lost & Found
// ─────────────────────────────────────────────
export interface Notice {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  createdAt: number;
  expiresAt: number;
  actionRequired: boolean;
  readCount: number;
  totalCount: number;
  attachments?: string[];
}

export const NOTICES: Notice[] = [
  {
    id: 'notice-1',
    authorId: 'u-rwa',
    authorName: 'Kumar Sienna RWA',
    title: 'June 2026 Maintenance Dues — ₹4,200/flat',
    body: 'Dear residents,\n\nMaintenance for June 2026 is ₹4,200 per flat. Please pay by 5th June to avoid a ₹200 late fee.\n\nPay via:\n• NEFT: A/c 987654321001 HDFC Bank, IFSC: HDFC0001234\n• QR at security office\n\nRegards,\nMr. Shah — RWA Secretary',
    createdAt: hrs(18),
    expiresAt: now + 15 * 24 * 60 * 60_000,
    actionRequired: true,
    readCount: 148,
    totalCount: 312,
  },
  {
    id: 'notice-2',
    authorId: 'u-rwa',
    authorName: 'Kumar Sienna RWA',
    title: 'Water Tank Cleaning — 28 May, 8am–11am',
    body: 'Water tank cleaning is scheduled for Wednesday 28th May, 8am to 11am. There will be no water supply during this window. Please store sufficient water for the morning.',
    createdAt: hrs(36),
    expiresAt: now + 2 * 24 * 60 * 60_000,
    actionRequired: false,
    readCount: 276,
    totalCount: 312,
  },
  {
    id: 'notice-3',
    authorId: 'u-rwa',
    authorName: 'Kumar Sienna RWA',
    title: 'New Security Agency from 1st June',
    body: 'After the AGM decision, we are switching to Securitas India from 1st June. All residents are requested to register their vehicles and domestic staff on the new system by 31 May.',
    createdAt: days(3),
    expiresAt: now + 5 * 24 * 60 * 60_000,
    actionRequired: true,
    readCount: 201,
    totalCount: 312,
  },
];

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  authorId: string;
  authorName: string;
  question: string;
  options: PollOption[];
  anonymous: boolean;
  multiSelect: boolean;
  closesAt: number;
  totalVotes: number;
  myVote?: string | null;
  createdAt: number;
}

export const POLLS: Poll[] = [
  {
    id: 'poll-1',
    authorId: 'u-rwa',
    authorName: 'Kumar Sienna RWA',
    question: 'Should we increase the maintenance amount to cover 24/7 security?',
    options: [
      { id: 'p1-a', text: 'Yes — worth the safety', votes: 89 },
      { id: 'p1-b', text: 'No — current amount is enough', votes: 34 },
      { id: 'p1-c', text: 'Yes, but only a small increase', votes: 56 },
    ],
    anonymous: false,
    multiSelect: false,
    closesAt: now + 5 * 24 * 60 * 60_000,
    totalVotes: 179,
    myVote: null,
    createdAt: hrs(10),
  },
  {
    id: 'poll-2',
    authorId: 'u4',
    authorName: 'Anita Desai',
    question: 'Which day works best for the monthly community meetup?',
    options: [
      { id: 'p2-a', text: 'Saturday afternoon', votes: 45 },
      { id: 'p2-b', text: 'Sunday morning', votes: 38 },
      { id: 'p2-c', text: 'Sunday evening', votes: 29 },
    ],
    anonymous: true,
    multiSelect: false,
    closesAt: now + 3 * 24 * 60 * 60_000,
    totalVotes: 112,
    myVote: 'p2-a',
    createdAt: hrs(24),
  },
  {
    id: 'poll-3',
    authorId: 'u5',
    authorName: 'Vikram Joshi',
    question: 'What amenity should we add to the clubhouse first?',
    options: [
      { id: 'p3-a', text: 'Table tennis table', votes: 67 },
      { id: 'p3-b', text: 'Better gym equipment', votes: 81 },
      { id: 'p3-c', text: 'Reading room / library', votes: 43 },
      { id: 'p3-d', text: 'Indoor games room', votes: 52 },
    ],
    anonymous: true,
    multiSelect: false,
    closesAt: now + 7 * 24 * 60 * 60_000,
    totalVotes: 243,
    myVote: null,
    createdAt: days(2),
  },
];

export type LostFoundType = 'lost' | 'found';
export type LostFoundCategory = 'wallet' | 'keys' | 'phone' | 'pet' | 'document' | 'bag' | 'umbrella' | 'other';

export interface LostFoundItem {
  id: string;
  authorId: string;
  authorName: string;
  type: LostFoundType;
  category: LostFoundCategory;
  title: string;
  description: string;
  location: string;
  when: number;
  createdAt: number;
  resolved: boolean;
  contactHint: string;
}

export const LOST_FOUND_ITEMS: LostFoundItem[] = [
  {
    id: 'lf-1',
    authorId: 'u3',
    authorName: 'Rohan Mehta',
    type: 'lost',
    category: 'umbrella',
    title: 'Black umbrella with wooden handle',
    description: 'Lost near the children\'s play area around 6pm yesterday. Has a small "R.M." initial tag on the handle.',
    location: 'Play area / Garden',
    when: hrs(28),
    createdAt: hrs(27),
    resolved: true,
    contactHint: 'Chat in app',
  },
  {
    id: 'lf-2',
    authorId: 'u6',
    authorName: 'Sneha Kulkarni',
    type: 'lost',
    category: 'keys',
    title: 'Set of keys — 5 keys on a blue keychain',
    description: 'Lost somewhere between Tower B lobby and the parking lot this morning. Blue Decathlon keychain with a gym locker key, house keys, and a car key.',
    location: 'Tower B lobby / Parking',
    when: hrs(4),
    createdAt: hrs(4),
    resolved: false,
    contactHint: 'Message or call on app',
  },
  {
    id: 'lf-3',
    authorId: 'u7',
    authorName: 'Arjun Patil',
    type: 'found',
    category: 'wallet',
    title: 'Brown leather wallet found near Gate 1',
    description: 'Found a brown leather wallet near Gate 1 entrance at around 9am. Has some cash and cards inside. Deposited at security desk.',
    location: 'Security desk (Gate 1)',
    when: hrs(6),
    createdAt: hrs(5),
    resolved: false,
    contactHint: 'Collect from security desk with ID',
  },
  {
    id: 'lf-4',
    authorId: 'u2',
    authorName: 'Priya Sharma',
    type: 'found',
    category: 'pet',
    title: 'Friendly orange cat — near B block parking',
    description: 'Found a small orange tabby cat near Tower B parking. Looks well-fed and friendly, might be a resident\'s pet. Has no collar.',
    location: 'Tower B parking',
    when: hrs(2),
    createdAt: hrs(2),
    resolved: false,
    contactHint: 'Contact via app — have cat with me',
  },
];

// ─────────────────────────────────────────────
// MODULE 11 — Visitors & Staff
// ─────────────────────────────────────────────
export type VisitorStatus = 'approved' | 'pending' | 'denied' | 'pre_approved';
export type VisitorPurpose = 'guest' | 'delivery' | 'service' | 'cab' | 'other';

export interface Visitor {
  id: string;
  name: string;
  purpose: VisitorPurpose;
  host: string;
  arrivalTime: number;
  status: VisitorStatus;
  phone?: string;
  note?: string;
}

export const VISITORS: Visitor[] = [
  {
    id: 'v1',
    name: 'Swiggy Delivery',
    purpose: 'delivery',
    host: 'You',
    arrivalTime: now - 5 * 60_000,
    status: 'approved',
    note: 'Pizza order',
  },
  {
    id: 'v2',
    name: 'Suresh Kumar',
    purpose: 'guest',
    host: 'You',
    arrivalTime: now + 60 * 60_000 * 2,
    status: 'pre_approved',
    phone: '98765XXXXX',
    note: 'College friend visiting for dinner',
  },
  {
    id: 'v3',
    name: 'Raju Electricals',
    purpose: 'service',
    host: 'You',
    arrivalTime: now + 60 * 60_000 * 4,
    status: 'pre_approved',
    phone: '90123XXXXX',
    note: 'Fan installation, Tower A flat',
  },
  {
    id: 'v4',
    name: 'Unknown visitor',
    purpose: 'other',
    host: 'You',
    arrivalTime: now - 30 * 60_000,
    status: 'denied',
  },
];

export type StaffRole = 'maid' | 'cook' | 'driver' | 'nanny' | 'gardener' | 'other';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  phone: string;
  schedule: string;
  todayStatus: 'present' | 'absent' | 'not_yet';
  checkIn?: number;
  checkOut?: number;
  monthAttendance: number; // days present this month
  salary: number; // monthly
}

export const STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'st1',
    name: 'Sunita Bai',
    role: 'maid',
    phone: '98XXXXXXX1',
    schedule: 'Mon-Sat, 8–10am',
    todayStatus: 'present',
    checkIn: now - 2 * 60 * 60_000,
    checkOut: now - 60 * 60_000,
    monthAttendance: 21,
    salary: 2500,
  },
  {
    id: 'st2',
    name: 'Ramesh Driver',
    role: 'driver',
    phone: '98XXXXXXX2',
    schedule: 'Mon-Fri, 8am–7pm',
    todayStatus: 'present',
    checkIn: now - 8 * 60 * 60_000,
    monthAttendance: 18,
    salary: 12000,
  },
];

// ─────────────────────────────────────────────
// MODULE 12 — Notifications
// ─────────────────────────────────────────────
export type NotifCategory =
  | 'safety'
  | 'mention'
  | 'comment'
  | 'reaction'
  | 'booking'
  | 'rwa_notice'
  | 'event_reminder'
  | 'chat'
  | 'system';

export interface AppNotification {
  id: string;
  category: NotifCategory;
  title: string;
  body: string;
  deepLink?: string;
  createdAt: number;
  read: boolean;
}

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    category: 'rwa_notice',
    title: 'Maintenance dues posted',
    body: 'June 2026 maintenance of ₹4,200/flat due by 5 June.',
    deepLink: 'notice-1',
    createdAt: hrs(18),
    read: false,
  },
  {
    id: 'n2',
    category: 'safety',
    title: 'Safety alert near you',
    body: 'Suspicious person reported near Tower B parking.',
    deepLink: 'inc-1',
    createdAt: mins(90),
    read: false,
  },
  {
    id: 'n3',
    category: 'chat',
    title: 'Kumar Sienna — All Residents',
    body: 'Mr. Shah: Maintenance bill for June has been posted.',
    deepLink: 'thread-society',
    createdAt: mins(18),
    read: false,
  },
  {
    id: 'n4',
    category: 'event_reminder',
    title: 'Garba Night tomorrow at 7pm',
    body: "You've RSVP'd YES. Don't forget your dandiya sticks!",
    deepLink: 'ev-1',
    createdAt: hrs(2),
    read: true,
  },
  {
    id: 'n5',
    category: 'reaction',
    title: 'Priya Sharma reacted to your post',
    body: 'She reacted with "Thanks" on your Water Tank notice.',
    createdAt: hrs(3),
    read: true,
  },
  {
    id: 'n6',
    category: 'comment',
    title: 'Rohan Mehta commented on your post',
    body: '"Great suggestion! I also think Gate 2 chai is excellent."',
    createdAt: hrs(5),
    read: true,
  },
  {
    id: 'n7',
    category: 'booking',
    title: 'Booking confirmed',
    body: "Sunita Home Services accepted your booking for tomorrow at 10am.",
    createdAt: hrs(8),
    read: true,
  },
  {
    id: 'n8',
    category: 'mention',
    title: 'Mr. Shah mentioned you',
    body: '"Thanks to @you for organising the waste segregation drive."',
    createdAt: hrs(10),
    read: true,
  },
];

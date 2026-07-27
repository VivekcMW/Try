// Mock data for PRD §02 Home Feed — replaces backend until APIs land.
import {
  AlertOctagon,
  AlertTriangle,
  BarChart2,
  Building2,
  Calendar,
  Car,
  CloudRain,
  HandHeart,
  Heart,
  LayoutGrid,
  MapPin,
  MessageSquare,
  Newspaper,
  PawPrint,
  Search,
  Shield,
  ShoppingBag,
  Star,
  ThumbsUp,
  Users,
  Utensils,
  Wrench,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

export type PostType =
  | 'rwa_notice'
  | 'safety'
  | 'lost'
  | 'event'
  | 'update'
  | 'sell'
  | 'sos'
  | 'traffic'
  | 'weather'
  | 'carpool'
  | 'appreciation'
  | 'poll';

export type ReactionKind = 'like' | 'love' | 'thanks' | 'support' | 'concern';

export interface FeedAuthor {
  id: string;
  name: string;
  avatarUri?: string | null;
  tier: 'bronze' | 'silver' | 'gold';
  flat?: string;
}

export interface FeedPost {
  id: string;
  author: FeedAuthor;
  type: PostType;
  body: string;
  tags: string[];
  visibility: 'tower' | 'society' | 'neighborhood';
  createdAt: number; // epoch ms
  pinned?: boolean;
  reactions: Partial<Record<ReactionKind, number>>;
  commentCount: number;
  viewCount: number;
  media?: Array<{ type: 'image' | 'video'; uri: string; thumb?: string }>;
  location?: { label: string; lat: number; lng: number };
  pollOptions?: Array<{ id: string; label: string; votes: number }>;
}

const now = Date.now();
const mins = (n: number) => now - n * 60_000;
const hrs = (n: number) => now - n * 60 * 60_000;

export const FEED_POSTS: FeedPost[] = [
  {
    id: 'p1',
    author: {
      id: 'u-rwa',
      name: 'Kumar Sienna RWA',
      tier: 'gold',
      flat: 'Office',
    },
    type: 'rwa_notice',
    body:
      'Water tank cleaning tomorrow (Wed) 8am–11am.\nNo supply during this window. Please store enough for the morning.',
    tags: ['rwa', 'water'],
    visibility: 'society',
    createdAt: mins(35),
    pinned: true,
    reactions: { thanks: 24, like: 12 },
    commentCount: 6,
    viewCount: 184,
  },
  {
    id: 'p2',
    author: {
      id: 'u2',
      name: 'Priya Sharma',
      tier: 'gold',
      flat: 'B-1204',
    },
    type: 'safety',
    body:
      'Heads up — unattended bike at Tower B entrance since last night. Looks abandoned. Security has been informed.',
    tags: ['safety'],
    visibility: 'society',
    createdAt: hrs(2),
    reactions: { concern: 8, thanks: 11 },
    commentCount: 4,
    viewCount: 96,
  },
  {
    id: 'p3',
    author: {
      id: 'u3',
      name: 'Rohan Mehta',
      tier: 'silver',
      flat: 'C-302',
    },
    type: 'lost',
    body:
      'Lost: black umbrella with wooden handle near the play area around 6pm. If found, please drop at security desk.',

    tags: ['lost-found'],
    visibility: 'society',
    createdAt: hrs(4),
    reactions: { support: 5 },
    commentCount: 1,
    viewCount: 42,
  },
  {
    id: 'p4',
    author: {
      id: 'u4',
      name: 'Anita Desai',
      tier: 'gold',
      flat: 'A-805',
    },
    type: 'event',
    body:
      'Garba night this Saturday 7pm onwards at the clubhouse. Bring dandiya sticks. Snacks sponsored by the cultural committee!',
    tags: ['events', 'culture'],
    visibility: 'society',
    createdAt: hrs(6),
    reactions: { love: 32, like: 18, thanks: 4 },
    commentCount: 12,
    viewCount: 220,
    media: [
      { type: 'image' as const, uri: 'https://picsum.photos/seed/garba-night/600/300' },
      { type: 'image' as const, uri: 'https://picsum.photos/seed/garba-dance/600/300' },
    ],
  },
  {
    id: 'p5',
    author: {
      id: 'u5',
      name: 'Vikram Joshi',
      tier: 'silver',
      flat: 'D-401',
    },
    type: 'update',
    body:
      'Reminder — clubhouse gym is closed Mon morning for AC service. Pool is open as usual.',
    tags: ['gym'],
    visibility: 'society',
    createdAt: hrs(9),
    reactions: { like: 6 },
    commentCount: 0,
    viewCount: 58,
  },
  {
    id: 'p6',
    author: {
      id: 'u6',
      name: 'Sneha Kulkarni',
      tier: 'gold',
      flat: 'B-702',
    },
    type: 'sell',
    body:
      'Selling: barely used Philips air fryer (HD9252) — ₹3,500. Comes with original box & manual. DM if interested.',
    tags: ['classifieds'],
    visibility: 'society',
    createdAt: hrs(12),
    reactions: { like: 9 },
    commentCount: 3,
    viewCount: 87,
    media: [
      { type: 'image' as const, uri: 'https://picsum.photos/seed/air-fryer-box/600/400' },
    ],
  },
  {
    id: 'p7',
    author: {
      id: 'u7',
      name: 'Arjun Patil',
      tier: 'silver',
      flat: 'A-201',
    },
    type: 'update',
    body:
      'Strong recommend for the new chai stall outside Gate 2 — masala chai is ₹15 and genuinely great. Open till 10pm.',
    tags: ['food', 'local'],
    visibility: 'neighborhood',
    createdAt: hrs(18),
    reactions: { love: 14, like: 7 },
    commentCount: 5,
    viewCount: 132,
  },
  {
    id: 'p8',
    author: { id: 'u8', name: 'Karthik Nair', tier: 'silver', flat: 'C-1101' },
    type: 'sos',
    body:
      '🚨 Urgently need O+ blood donor — Tower D resident, admitted at Manipal Hospital. Please call 9880-XXXXX immediately. Every minute counts.',
    tags: ['sos', 'urgent'],
    visibility: 'society',
    createdAt: mins(5),
    reactions: { support: 19, concern: 7 },
    commentCount: 11,
    viewCount: 310,
  },
  {
    id: 'p9',
    author: { id: 'u9', name: 'Divya Iyer', tier: 'bronze', flat: 'A-603' },
    type: 'update',
    body:
      'Anyone know a reliable plumber? Pipe burst under the kitchen sink — water seeping into the cabinet. Need someone today if possible.',
    tags: ['help'],
    visibility: 'tower',
    createdAt: mins(18),
    reactions: { support: 3, thanks: 2 },
    commentCount: 7,
    viewCount: 64,
  },
  {
    id: 'p10',
    author: { id: 'u10', name: 'Meena Rajan', tier: 'silver', flat: 'B-504' },
    type: 'lost',
    body:
      'My tabby cat "Mochi" slipped out through the balcony door this afternoon. Last seen near Tower B stairwell. She is orange-striped, very friendly. Please check balconies/corridors and DM if you spot her 🙏',
    tags: ['pets', 'lost-found'],
    visibility: 'society',
    createdAt: hrs(1),
    reactions: { support: 22, concern: 5 },
    commentCount: 14,
    viewCount: 198,
    media: [
      { type: 'image' as const, uri: 'https://picsum.photos/seed/orange-tabby-cat/600/400' },
    ],
  },
  {
    id: 'p11',
    author: { id: 'u11', name: 'Rahul Shetty', tier: 'gold', flat: 'D-202' },
    type: 'sell',
    body:
      'Selling: BSA Champ 20" kids cycle — barely used, great condition. Includes helmet and side wheels. Asking ₹1,800. Can bring down for a look anytime.',
    tags: ['classifieds'],
    visibility: 'society',
    createdAt: hrs(3),
    reactions: { like: 5 },
    commentCount: 3,
    viewCount: 74,
  },
  {
    id: 'p12',
    author: { id: 'u12', name: 'Sunita Rao', tier: 'silver', flat: 'C-801' },
    type: 'update',
    body:
      'Starting a free morning yoga batch this Sunday 6am at the garden near Gate 1. All levels welcome — just bring a mat. First two weeks free, then ₹200/month. DM to join.',
    tags: ['health', 'events'],
    visibility: 'neighborhood',
    createdAt: hrs(5),
    reactions: { love: 18, like: 11, thanks: 6 },
    commentCount: 9,
    viewCount: 167,
  },
  {
    id: 'p13',
    author: { id: 'u13', name: 'Aditya Kumar', tier: 'bronze', flat: 'A-1002' },
    type: 'update',
    body:
      'Water pressure in Tower C has been very low since yesterday evening. Anyone else facing this? Have raised a complaint at the security desk — just checking if it is widespread.',
    tags: ['help'],
    visibility: 'tower',
    createdAt: hrs(7),
    reactions: { concern: 12, support: 4 },
    commentCount: 8,
    viewCount: 91,
  },
  {
    id: 'p14',
    author: { id: 'u14', name: 'Pooja Nambiar', tier: 'gold', flat: 'B-903' },
    type: 'update',
    body:
      'Highly recommend Dr. Priya Mehta at Sanjeevani Clinic (HSR Layout) — thorough, patient, no 2-hour waiting. She takes same-day appointments via phone.',
    tags: ['health', 'local'],
    visibility: 'neighborhood',
    createdAt: hrs(10),
    reactions: { thanks: 27, love: 9 },
    commentCount: 6,
    viewCount: 145,
  },
  {
    id: 'p15',
    author: { id: 'u15', name: 'Farhan Sheikh', tier: 'silver', flat: 'D-701' },
    type: 'event',
    body:
      'Flash sale this Sunday 9am at Gate 1 — home-baked cookies, brownies & banana bread. Everything under ₹100. All proceeds go to the building staff Diwali fund 🍪',
    tags: ['events', 'food'],
    visibility: 'society',
    createdAt: hrs(13),
    reactions: { love: 38, like: 21, thanks: 7 },
    commentCount: 15,
    viewCount: 289,
  },
  {
    id: 'p16',
    author: { id: 'u16', name: 'Lakshmi Venkat', tier: 'silver', flat: 'A-407' },
    type: 'safety',
    body:
      'The street light near Gate 3 on the main road has been out for 3 nights now — very dark and risky. I have raised a complaint on BBMP Sahaaya. Others can +1 the complaint: #1238847.',
    tags: ['safety'],
    visibility: 'neighborhood',
    createdAt: hrs(16),
    reactions: { thanks: 31, support: 8 },
    commentCount: 7,
    viewCount: 203,
  },
  {
    id: 'p17',
    author: { id: 'u17', name: 'Neha Gupta', tier: 'bronze', flat: 'C-605' },
    type: 'lost',
    body:
      'Found: small gold-coloured drop earring near the kids pool this morning. Looks like it could be valuable. DM me to describe and claim — happy to drop at security desk too.',
    tags: ['lost-found'],
    visibility: 'society',
    createdAt: hrs(22),
    reactions: { thanks: 4 },
    commentCount: 2,
    viewCount: 38,
  },
  {
    id: 'p18',
    author: { id: 'u18', name: 'Suresh Pillai', tier: 'silver' as const, flat: 'A-1101' },
    type: 'traffic' as const,
    body: 'Road closed near Gate 1 — BBMP pipeline work in progress. Expected to reopen by 6pm. Please use the service lane via Palm Avenue as alternate.',
    tags: ['traffic'],
    visibility: 'neighborhood' as const,
    createdAt: mins(45),
    reactions: { thanks: 18, concern: 3 },
    commentCount: 5,
    viewCount: 142,
    media: [{ type: 'image' as const, uri: 'https://picsum.photos/seed/road-construction/600/300' }],
    location: { label: 'Gate 1, Palm Ave Junction', lat: 12.9279, lng: 77.6271 },
  },
  {
    id: 'p19',
    author: { id: 'u19', name: 'Kavitha Reddy', tier: 'bronze' as const, flat: 'C-208' },
    type: 'traffic' as const,
    body: 'Signal at the HSR-Koramangala junction is completely down since morning. No traffic cop. Heavy backup on both sides — avoid if you can.',
    tags: ['traffic'],
    visibility: 'neighborhood' as const,
    createdAt: hrs(3),
    reactions: { concern: 21, thanks: 9 },
    commentCount: 8,
    viewCount: 187,
    location: { label: 'HSR-Koramangala Junction', lat: 12.9116, lng: 77.6370 },
  },
  {
    id: 'p20',
    author: { id: 'u20', name: 'Rajan Bose', tier: 'silver' as const, flat: 'D-602' },
    type: 'weather' as const,
    body: 'IMD Yellow Alert: Heavy rain expected from 5pm today. Low-lying areas and Tower D ground-floor parking prone to flooding. Please move vehicles to upper deck before 4pm.',
    tags: ['weather', 'safety'],
    visibility: 'society' as const,
    createdAt: hrs(1),
    reactions: { thanks: 34, concern: 7 },
    commentCount: 12,
    viewCount: 301,
  },
  {
    id: 'p21',
    author: { id: 'u21', name: 'Jayesh Bhatt', tier: 'silver' as const, flat: 'B-301' },
    type: 'weather' as const,
    body: 'Dense fog advisory tomorrow morning — visibility below 100m expected until 8am. If you have school runs, leave 30 min early. Drive safe.',
    tags: ['weather'],
    visibility: 'neighborhood' as const,
    createdAt: hrs(8),
    reactions: { thanks: 15, like: 4 },
    commentCount: 3,
    viewCount: 94,
  },
  {
    id: 'p22',
    author: { id: 'u22', name: 'Preethi Nair', tier: 'gold' as const, flat: 'D-1003' },
    type: 'carpool' as const,
    body: 'Driving to Indiranagar tomorrow (Wed) — leaving at 8:30am, 2 seats available. Stopping at 100 Feet Road. DM me, we split petrol equally.',
    tags: ['carpool'],
    visibility: 'society' as const,
    createdAt: hrs(2),
    reactions: { thanks: 6, like: 3 },
    commentCount: 4,
    viewCount: 68,
  },
  {
    id: 'p23',
    author: { id: 'u23', name: 'Naveen Kumar', tier: 'silver' as const, flat: 'A-505' },
    type: 'carpool' as const,
    body: 'Anyone heading toward Whitefield / Outer Ring Road this Friday after 7pm? Happy to split a cab. Roughly Rs 150 each. Drop a message.',
    tags: ['carpool'],
    visibility: 'society' as const,
    createdAt: hrs(14),
    reactions: { like: 5, thanks: 2 },
    commentCount: 3,
    viewCount: 55,
  },
  {
    id: 'p24',
    author: { id: 'u24', name: 'Meenakshi Iyer', tier: 'gold' as const, flat: 'B-1101' },
    type: 'appreciation' as const,
    body: 'Big shoutout to Ramu Bhaiya (Tower B night security) — found my house keys in the parking at midnight and waited 2 hours to return them. A true gem, underappreciated every single day.',
    tags: ['appreciation'],
    visibility: 'society' as const,
    createdAt: hrs(6),
    reactions: { love: 52, thanks: 29, like: 11 },
    commentCount: 18,
    viewCount: 384,
  },
  {
    id: 'p25',
    author: { id: 'u25', name: 'Rohit Kulkarni', tier: 'bronze' as const, flat: 'C-402' },
    type: 'appreciation' as const,
    body: "Savitri aunty's poha at the Diwali morning breakfast was absolutely amazing — light, perfectly spiced, made with so much love. These unsung heroes deserve more recognition!",
    tags: ['appreciation', 'food'],
    visibility: 'society' as const,
    createdAt: hrs(11),
    reactions: { love: 41, thanks: 18, like: 9 },
    commentCount: 14,
    viewCount: 256,
  },
  {
    id: 'p26',
    author: { id: 'u-rwa', name: 'Kumar Sienna RWA', tier: 'gold' as const, flat: 'Office' },
    type: 'poll' as const,
    body: 'We are planning a morning yoga batch in the garden. Which time slot works best for most of you?',
    tags: ['events', 'health'],
    visibility: 'society' as const,
    createdAt: hrs(4),
    reactions: { like: 7, thanks: 3 },
    commentCount: 9,
    viewCount: 178,
    pollOptions: [
      { id: 'o1', label: '5:30 AM', votes: 18 },
      { id: 'o2', label: '6:00 AM', votes: 47 },
      { id: 'o3', label: '6:30 AM', votes: 29 },
      { id: 'o4', label: '7:00 AM', votes: 12 },
    ],
  },
  {
    id: 'p27',
    author: { id: 'u27', name: 'Tanya Bose', tier: 'silver' as const, flat: 'D-604' },
    type: 'event' as const,
    body: 'Weekend Garage Sale — Saturday 9am to 1pm at Tower A lobby! Declutter and find bargains. Books, clothes, toys, kitchenware and more. Everything under Rs 500. All welcome!',
    tags: ['events', 'classifieds'],
    visibility: 'society' as const,
    createdAt: hrs(20),
    reactions: { love: 27, like: 15, thanks: 5 },
    commentCount: 11,
    viewCount: 198,
    media: [
      { type: 'image' as const, uri: 'https://picsum.photos/seed/garage-sale-items/600/300' },
      { type: 'video' as const, uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumb: 'https://picsum.photos/seed/event-video-thumb/600/300' },
    ],
  },
];

export const FILTER_TAGS: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: 'all', label: 'All', Icon: LayoutGrid },
  { id: 'safety', label: 'Safety', Icon: Shield },
  { id: 'sos', label: 'SOS', Icon: AlertOctagon },
  { id: 'traffic', label: 'Traffic', Icon: MapPin },
  { id: 'weather', label: 'Weather', Icon: CloudRain },
  { id: 'news',    label: 'News',    Icon: Newspaper },
  { id: 'carpool', label: 'Carpool', Icon: Car },
  { id: 'lost-found', label: 'Lost', Icon: Search },
  { id: 'appreciation', label: 'Thanks', Icon: Star },
  { id: 'events', label: 'Events', Icon: Calendar },
  { id: 'poll', label: 'Polls', Icon: BarChart2 },
  { id: 'help', label: 'Help', Icon: Wrench },
  { id: 'pets', label: 'Pets', Icon: PawPrint },
  { id: 'rwa', label: 'RWA', Icon: Building2 },
  { id: 'classifieds', label: 'Market', Icon: ShoppingBag },
  { id: 'food', label: 'Food', Icon: Utensils },
];

export const REACTION_ICONS: Record<ReactionKind, LucideIcon> = {
  like: ThumbsUp,
  love: Heart,
  thanks: HandHeart,
  support: Users,
  concern: AlertTriangle,
};

export function relativeTime(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export const POST_TYPE_META: Record<
  PostType,
  { label: string; tone: 'neutral' | 'brand' | 'warning' | 'danger' | 'info' | 'success'; Icon: LucideIcon }
> = {
  rwa_notice: { label: 'RWA notice', tone: 'brand', Icon: Building2 },
  safety: { label: 'Safety', tone: 'warning', Icon: Shield },
  lost: { label: 'Lost', tone: 'info', Icon: Search },
  event: { label: 'Event', tone: 'success', Icon: Calendar },
  update: { label: 'Update', tone: 'neutral', Icon: MessageSquare },
  sell: { label: 'For sale', tone: 'neutral', Icon: ShoppingBag },
  sos: { label: 'SOS', tone: 'danger', Icon: AlertOctagon },
  traffic: { label: 'Traffic', tone: 'warning', Icon: MapPin },
  weather: { label: 'Weather', tone: 'info', Icon: CloudRain },
  carpool: { label: 'Ride pool', tone: 'success', Icon: Car },
  appreciation: { label: 'Appreciation', tone: 'warning', Icon: Star },
  poll: { label: 'Poll', tone: 'brand', Icon: BarChart2 },
};

// ─── Promo Carousel slides ────────────────────────────────────────────────────
export type PromoSlide = {
  id: string;
  type: 'brand' | 'feature';
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaRoute?: string;
  bgColor: string;
  emoji: string;
};

export const PROMO_SLIDES: PromoSlide[] = [
  {
    id: 's1', type: 'feature',
    title: 'Book Services Now Live',
    subtitle: 'Get quotes from plumbers, electricians & more — in minutes.',
    ctaLabel: 'Try it', ctaRoute: '/(business)/nearby',
    bgColor: '#1D65AF', emoji: '🔧',
  },
  {
    id: 's2', type: 'feature',
    title: 'Shop Local Stores',
    subtitle: 'Order from your kirana, bakery or pharmacy without stepping out.',
    ctaLabel: 'Explore', ctaRoute: '/(business)/nearby',
    bgColor: '#0D9488', emoji: '🛒',
  },
  {
    id: 's3', type: 'brand',
    title: 'MedPlus Pharmacy',
    subtitle: '10% off on all generic medicines this week.',
    ctaLabel: 'View offers',
    bgColor: '#5B21B6', emoji: '💊',
  },
  {
    id: 's4', type: 'brand',
    title: 'FreshBasket Grocery',
    subtitle: 'Free delivery on orders above ₹499 for society members.',
    ctaLabel: 'Order now',
    bgColor: '#C2410C', emoji: '🥦',
  },
  {
    id: 's5', type: 'feature',
    title: 'Book Salon Appointments',
    subtitle: 'Skip the wait — book your slot at the nearest salon instantly.',
    ctaLabel: 'Book now', ctaRoute: '/(business)/nearby',
    bgColor: '#9D174D', emoji: '✂️',
  },
  {
    id: 's6', type: 'brand',
    title: 'QuickBite Tiffin Service',
    subtitle: 'Home-cooked lunch delivered to your door daily. ₹80/meal.',
    ctaLabel: 'Subscribe',
    bgColor: '#B45309', emoji: '🍱',
  },
  {
    id: 's7', type: 'feature',
    title: 'Lost Something? Post It',
    subtitle: 'Your society can help — post a lost & found alert in seconds.',
    ctaLabel: 'Post now', ctaRoute: '/(business)/nearby',
    bgColor: '#1E40AF', emoji: '🔍',
  },
  {
    id: 's8', type: 'brand',
    title: 'SparkleClean Laundry',
    subtitle: 'Free pickup from your flat. Ready in 24 hrs. First wash free!',
    ctaLabel: 'Book now',
    bgColor: '#065F46', emoji: '👕',
  },
  {
    id: 's9', type: 'feature',
    title: 'Society Events Near You',
    subtitle: 'Garba nights, yoga classes & more — all happening this week.',
    ctaLabel: 'Explore', ctaRoute: '/(business)/nearby',
    bgColor: '#6B21A8', emoji: '🎉',
  },
];

// ─── Ad Strips ────────────────────────────────────────────────────────────────
export type AdStrip = {
  id: string;
  brand: string;
  tagline: string;
  emoji: string;
  ctaLabel: string;
  bgColor: string;
};

export const AD_STRIPS: AdStrip[] = [
  { id: 'a1', brand: 'MedPlus Pharmacy', tagline: 'Medicines delivered in 45 min', emoji: '💊', ctaLabel: 'Order', bgColor: '#EDE9FE' },
  { id: 'a2', brand: 'FreshBasket', tagline: '₹499 min order · Free delivery today', emoji: '🥦', ctaLabel: 'Shop', bgColor: '#ECFDF5' },
  { id: 'a3', brand: 'SwiftClean Laundry', tagline: 'Pickup & delivery, same day', emoji: '👕', ctaLabel: 'Book', bgColor: '#EFF6FF' },
  { id: 'a4', brand: 'New on Lokul', tagline: 'Safety alerts now in real-time', emoji: '🛡️', ctaLabel: 'See more', bgColor: '#FEF3C7' },
];

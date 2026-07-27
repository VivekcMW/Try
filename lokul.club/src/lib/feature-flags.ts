/**
 * Feature Flags Utility
 * 
 * Centralized feature flag definitions and metadata.
 * Server-side functions moved to feature-flags-server.ts to avoid client bundle issues.
 * 
 * Usage:
 * - Server: await isFeatureEnabled('telemedicine') // import from feature-flags-server
 * - Client: const enabled = useFeatureFlag('carpool') // fetch from API
 */

/**
 * Feature flag definitions with metadata
 * Use this as source of truth for what features exist
 */
export const FEATURE_FLAGS = {
  // Phase 1: Core features (enabled by default)
  FEED: 'feed',
  SERVICES: 'services',
  WALLET: 'wallet',
  CLASSIFIEDS: 'classifieds',
  EVENTS: 'events',
  LOST_FOUND: 'lost_found',
  SAFETY_CONTACTS: 'safety_contacts',
  SHOP_DIRECTORY: 'shop_directory',

  // Phase 2+: Hidden until validated (disabled by default)
  TELEMEDICINE: 'telemedicine',
  INSURANCE: 'insurance',
  CARPOOL: 'carpool',
  GROUP_BUYING: 'group_buying',
  SPORTS_GROUPS: 'sports_groups',
  PET_CARE: 'pet_care',
  BILL_SPLITTING: 'bill_splitting',
  ITEM_BORROWING: 'item_borrowing',
  RWA_MANAGEMENT: 'rwa_management',

  // Phase 3+: Advanced features
  SOS_ALERTS: 'sos_alerts',
  STORIES: 'stories',
  VIDEO_CALLS: 'video_calls',
  HEADER_ADS: 'header_ads',
  PARKING_SHARING: 'parking_sharing',
  KIDS_EDUCATION: 'kids_education',
  JOBS_BOARD: 'jobs_board',
  REALESTATE: 'realestate',
  AMENITY_BOOKING: 'amenity_booking',
  DOMESTIC_HELP: 'domestic_help',
} as const;

/**
 * Feature metadata for admin UI
 */
export const FEATURE_METADATA: Record<
  string,
  { name: string; description: string; phase: 1 | 2 | 3; category: string }
> = {
  feed: {
    name: 'Home Feed',
    description: 'Neighborhood activity feed with posts, reactions, comments',
    phase: 1,
    category: 'Core',
  },
  services: {
    name: 'Peer Services',
    description: 'Marketplace for home cook, handyman, tutor services',
    phase: 1,
    category: 'Core',
  },
  wallet: {
    name: 'Wallet & Payments',
    description: 'Add money, pay for services, withdraw funds',
    phase: 1,
    category: 'Core',
  },
  classifieds: {
    name: 'Classifieds',
    description: 'Buy/Sell/Rent items in neighborhood',
    phase: 1,
    category: 'Core',
  },
  events: {
    name: 'Community Events',
    description: 'Create and RSVP to local events',
    phase: 1,
    category: 'Core',
  },
  lost_found: {
    name: 'Lost & Found',
    description: 'Post and find lost items/pets',
    phase: 1,
    category: 'Core',
  },
  safety_contacts: {
    name: 'Safety Contacts',
    description: 'Add emergency contacts (limited SOS)',
    phase: 1,
    category: 'Core',
  },
  shop_directory: {
    name: 'Local Shops',
    description: 'Directory of nearby shops with contact info',
    phase: 1,
    category: 'Core',
  },

  // Phase 2 features
  telemedicine: {
    name: 'Telemedicine',
    description: 'Doctor consultations (needs verification, legal compliance)',
    phase: 2,
    category: 'Health',
  },
  insurance: {
    name: 'Insurance',
    description: 'Insurance marketplace (needs IRDAI license)',
    phase: 2,
    category: 'Finance',
  },
  carpool: {
    name: 'Carpool',
    description: 'Ride sharing (needs 50+ active users)',
    phase: 2,
    category: 'Transport',
  },
  group_buying: {
    name: 'Group Buying',
    description: 'Bulk purchases with neighbors (needs 20+ per deal)',
    phase: 2,
    category: 'Commerce',
  },
  sports_groups: {
    name: 'Sports Groups',
    description: 'Sports and fitness communities',
    phase: 2,
    category: 'Community',
  },
  pet_care: {
    name: 'Pet Care',
    description: 'Pet services (grooming, vet, walking)',
    phase: 2,
    category: 'Services',
  },
  bill_splitting: {
    name: 'Bill Splitting',
    description: 'Split bills with neighbors',
    phase: 2,
    category: 'Finance',
  },
  item_borrowing: {
    name: 'Item Borrowing',
    description: 'Borrow/lend items with neighbors',
    phase: 2,
    category: 'Community',
  },
  rwa_management: {
    name: 'RWA Management',
    description: 'RWA admin tools (B2B feature)',
    phase: 2,
    category: 'Admin',
  },

  // Phase 3 features
  sos_alerts: {
    name: 'SOS Alerts',
    description: 'Emergency broadcast to neighbors',
    phase: 3,
    category: 'Safety',
  },
  stories: {
    name: 'Stories',
    description: 'Instagram-style disappearing stories',
    phase: 3,
    category: 'Social',
  },
  video_calls: {
    name: 'Video Calls',
    description: 'Video calls with service providers',
    phase: 3,
    category: 'Communication',
  },
  header_ads: {
    name: 'Header Ads',
    description: 'Promotional ads in feed',
    phase: 3,
    category: 'Monetization',
  },
  parking_sharing: {
    name: 'Parking Sharing',
    description: 'Share/rent parking spaces',
    phase: 3,
    category: 'Services',
  },
  kids_education: {
    name: 'Kids & Education',
    description: 'Playschools, daycares, tutoring',
    phase: 3,
    category: 'Services',
  },
  jobs_board: {
    name: 'Jobs Board',
    description: 'Local job postings',
    phase: 3,
    category: 'Services',
  },
  realestate: {
    name: 'Real Estate',
    description: 'Property listings (needs RERA compliance)',
    phase: 3,
    category: 'Services',
  },
  amenity_booking: {
    name: 'Amenity Booking',
    description: 'Book society facilities (clubhouse, pool)',
    phase: 3,
    category: 'Community',
  },
  domestic_help: {
    name: 'Domestic Help',
    description: 'Maid/cook/driver directory',
    phase: 3,
    category: 'Services',
  },
};

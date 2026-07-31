export type ProfilePrivacy = {
  // Profile Visibility
  showFlatNumber: boolean;
  showPhoneNumber: boolean;
  showInDirectory: boolean;
  showReviews: boolean;
  // Activity & Chat
  showOnlineStatus: boolean;
  readReceipts: boolean;
  typingIndicator: boolean;
  activityStatusOnPosts: boolean;
  // Search & Discovery
  discoverableInSearch: boolean;
  anonymousPosting: boolean;
  // Data & Location
  preciseLocation: boolean;
  usageAnalytics: boolean;
  personalizedAds: boolean;
};

// Self-declared, optional — never asked at signup. Mirrors the AgeBand
// Prisma enum. Only used for ad targeting when personalizedAds is on.
export type AgeBand = 'age_18_24' | 'age_25_34' | 'age_35_44' | 'age_45_54' | 'age_55_plus';

export type UserProfile = {
  name: string;
  photoUri: string | null;
  bio: string;
  phone: string | null;
  societyName: string | null;
  tower: string | null;
  flat: string;
  city: string | null;
  pin: string;
  interests: string[];
  ageBand: AgeBand | null;
  privacy: ProfilePrivacy;
  updatedAt: number;
};

export type ProfileUpdateInput = Partial<Omit<UserProfile, 'privacy' | 'updatedAt'>>;

export const DEFAULT_PRIVACY: ProfilePrivacy = {
  showFlatNumber: true,
  showPhoneNumber: false,
  showInDirectory: true,
  showReviews: true,
  showOnlineStatus: true,
  readReceipts: true,
  typingIndicator: true,
  activityStatusOnPosts: true,
  discoverableInSearch: true,
  anonymousPosting: false,
  preciseLocation: false,
  usageAnalytics: true,
  personalizedAds: false,
};

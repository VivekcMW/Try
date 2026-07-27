// PRD §03 — Community Groups seed data
import type { Community, CommunityCategory } from '@/store/communityStore';

export interface CommunityPost {
  id: string;
  communityId: string;
  authorName: string;
  authorFlat: string;
  body: string;
  postedAt: number;
  reactions: number;
  comments: number;
  type: 'discussion' | 'event' | 'poll' | 'announcement';
}

export const DISCOVER_COMMUNITIES: Community[] = [
  {
    id: 'c_yoga',
    name: 'Morning Yoga Club',
    slug: 'morning-yoga',
    category: 'fitness',
    privacy: 'open',
    bio: '6 AM yoga sessions in Park 2. All levels welcome.',
    emoji: '🧘',
    bannerColor: '#10B981',
    createdAt: Date.now() - 86400000 * 18,
    ownerId: 'u1',
    memberCount: 142,
    postCount: 67,
    rulesCount: 4,
    pinned: true,
  },
  {
    id: 'c_kids',
    name: 'Kids Activities (5–10)',
    slug: 'kids-activities',
    category: 'parenting',
    privacy: 'request',
    bio: 'Playdates, hobby classes, weekend trips for kids in 5–10 age group.',
    emoji: '🧒',
    bannerColor: '#F472B6',
    createdAt: Date.now() - 86400000 * 65,
    ownerId: 'u2',
    memberCount: 312,
    postCount: 188,
    rulesCount: 6,
    pinned: false,
  },
  {
    id: 'c_pets',
    name: 'Pet Parents — Sector 14',
    slug: 'pet-parents',
    category: 'pets',
    privacy: 'open',
    bio: 'Vet recommendations, lost pets, walks & playdates.',
    emoji: '🐶',
    bannerColor: '#A855F7',
    createdAt: Date.now() - 86400000 * 9,
    ownerId: 'u3',
    memberCount: 89,
    postCount: 41,
    rulesCount: 3,
    pinned: false,
  },
  {
    id: 'c_badminton',
    name: 'Badminton Buddies',
    slug: 'badminton',
    category: 'sports',
    privacy: 'open',
    bio: 'Court 3, weekday evenings. Singles, doubles, all levels.',
    emoji: '🏸',
    bannerColor: '#16A34A',
    createdAt: Date.now() - 86400000 * 41,
    ownerId: 'u4',
    memberCount: 56,
    postCount: 23,
    rulesCount: 2,
    pinned: false,
  },
  {
    id: 'c_civic',
    name: 'Sector 14 Civic Watch',
    slug: 'civic-watch',
    category: 'civic',
    privacy: 'open',
    bio: 'Roads, garbage, water, electricity — collective civic voice.',
    emoji: '🏛',
    bannerColor: '#1D65AF',
    createdAt: Date.now() - 86400000 * 220,
    ownerId: 'u5',
    memberCount: 1820,
    postCount: 904,
    rulesCount: 8,
    pinned: true,
  },
  {
    id: 'c_startup',
    name: 'Startup Founders Circle',
    slug: 'startup-circle',
    category: 'business',
    privacy: 'invite',
    bio: 'Founders & early operators in 5km radius. Closed group.',
    emoji: '🚀',
    bannerColor: '#0D9488',
    createdAt: Date.now() - 86400000 * 90,
    ownerId: 'u6',
    memberCount: 28,
    postCount: 15,
    rulesCount: 5,
    pinned: false,
  },
];

export const COMMUNITY_FEED: CommunityPost[] = [
  {
    id: 'cp1',
    communityId: 'c_yoga',
    authorName: 'Priya M.',
    authorFlat: 'B-402',
    body: 'Reminder: Sunday Surya Namaskar challenge at 6 AM near pond. Bring your mat 🧘',
    postedAt: Date.now() - 32 * 60000,
    reactions: 18,
    comments: 4,
    type: 'announcement',
  },
  {
    id: 'cp2',
    communityId: 'c_yoga',
    authorName: 'Aman K.',
    authorFlat: 'C-1101',
    body: 'Anyone has spare yoga blocks I can borrow this week? Will return.',
    postedAt: Date.now() - 4 * 3600000,
    reactions: 6,
    comments: 9,
    type: 'discussion',
  },
  {
    id: 'cp3',
    communityId: 'c_yoga',
    authorName: 'Riya S.',
    authorFlat: 'A-203',
    body: 'Vote: Should we move sessions to 6:30 AM in winter?',
    postedAt: Date.now() - 12 * 3600000,
    reactions: 23,
    comments: 17,
    type: 'poll',
  },
];

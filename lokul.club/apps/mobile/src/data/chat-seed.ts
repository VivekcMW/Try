// Mock data for Module 04 — Chat & Calls
import type { LucideIcon } from 'lucide-react-native';

export type MessageType = 'text' | 'image' | 'voice' | 'location' | 'system';
export type ThreadType = 'society_main' | 'tower' | 'topic' | 'dm';

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderTier: 'bronze' | 'silver' | 'gold';
  type: MessageType;
  text?: string;
  imageUri?: string;
  timestamp: number;
  readBy: string[];
  reactions?: Record<string, string[]>;
  replyToId?: string;
  replyPreview?: string;
}

export interface ChatThread {
  id: string;
  type: ThreadType;
  name: string;
  avatarUri?: string | null;
  memberCount: number;
  lastMessage: string;
  lastMessageAt: number;
  unreadCount: number;
  muted: boolean;
  pinned: boolean;
  description?: string;
}

const now = Date.now();
const mins = (n: number) => now - n * 60_000;
const hrs = (n: number) => now - n * 60 * 60_000;

export const CHAT_THREADS: ChatThread[] = [
  {
    id: 'thread-society',
    type: 'society_main',
    name: 'Kumar Sienna — All Residents',
    memberCount: 312,
    lastMessage: 'Mr. Shah: Maintenance bill for June has been posted.',
    lastMessageAt: mins(18),
    unreadCount: 7,
    muted: false,
    pinned: true,
    description: 'Official channel for all Kumar Sienna residents.',
  },
  {
    id: 'thread-tower-b',
    type: 'tower',
    name: 'Tower B',
    memberCount: 78,
    lastMessage: 'Sneha: Anyone else getting low water pressure?',
    lastMessageAt: mins(45),
    unreadCount: 3,
    muted: false,
    pinned: false,
    description: 'Tower B residents group.',
  },
  {
    id: 'thread-parents',
    type: 'topic',
    name: 'Parents & Kids',
    memberCount: 41,
    lastMessage: 'Anita: school bus leaves at 7:20 tomorrow.',
    lastMessageAt: hrs(2),
    unreadCount: 0,
    muted: false,
    pinned: false,
    description: 'Discussion for parents with school-going kids.',
  },
  {
    id: 'thread-dm-priya',
    type: 'dm',
    name: 'Priya Sharma',
    memberCount: 2,
    lastMessage: "Sure, I'll send the recipe!",
    lastMessageAt: hrs(5),
    unreadCount: 1,
    muted: false,
    pinned: false,
  },
  {
    id: 'thread-dm-rohan',
    type: 'dm',
    name: 'Rohan Mehta',
    memberCount: 2,
    lastMessage: 'Found it, thanks a lot!',
    lastMessageAt: hrs(10),
    unreadCount: 0,
    muted: false,
    pinned: false,
  },
];

export const CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'thread-society': [
    {
      id: 'msg-s1',
      threadId: 'thread-society',
      senderId: 'u-rwa',
      senderName: 'Mr. Shah (RWA)',
      senderTier: 'gold',
      type: 'text',
      text: 'Dear residents, the society AGM is scheduled for Sunday 1st June at 11am in the clubhouse. Please attend.',
      timestamp: hrs(20),
      readBy: ['me'],
    },
    {
      id: 'msg-s2',
      threadId: 'thread-society',
      senderId: 'u2',
      senderName: 'Priya Sharma',
      senderTier: 'gold',
      type: 'text',
      text: 'Thank you for the reminder, will be there.',
      timestamp: hrs(19),
      readBy: ['me'],
    },
    {
      id: 'msg-s3',
      threadId: 'thread-society',
      senderId: 'u3',
      senderName: 'Rohan Mehta',
      senderTier: 'silver',
      type: 'text',
      text: 'Can the agenda be shared in advance?',
      timestamp: hrs(18),
      readBy: ['me'],
    },
    {
      id: 'msg-s4',
      threadId: 'thread-society',
      senderId: 'u-rwa',
      senderName: 'Mr. Shah (RWA)',
      senderTier: 'gold',
      type: 'text',
      text: 'Yes, will share the agenda tomorrow evening.',
      timestamp: hrs(17),
      readBy: ['me'],
    },
    {
      id: 'msg-s5',
      threadId: 'thread-society',
      senderId: 'u-rwa',
      senderName: 'Mr. Shah (RWA)',
      senderTier: 'gold',
      type: 'text',
      text: 'Maintenance bill for June has been posted.',
      timestamp: mins(18),
      readBy: [],
    },
  ],
  'thread-tower-b': [
    {
      id: 'msg-t1',
      threadId: 'thread-tower-b',
      senderId: 'u5',
      senderName: 'Vikram Joshi',
      senderTier: 'silver',
      type: 'text',
      text: 'Hi Tower B folks — lift B2 is under service today, use B1.',
      timestamp: hrs(3),
      readBy: ['me'],
    },
    {
      id: 'msg-t2',
      threadId: 'thread-tower-b',
      senderId: 'u6',
      senderName: 'Sneha Kulkarni',
      senderTier: 'gold',
      type: 'text',
      text: 'Anyone else getting low water pressure?',
      timestamp: mins(45),
      readBy: [],
    },
    {
      id: 'msg-t3',
      threadId: 'thread-tower-b',
      senderId: 'u7',
      senderName: 'Arjun Patil',
      senderTier: 'silver',
      type: 'text',
      text: 'Yes, on 4th floor too.',
      timestamp: mins(40),
      readBy: [],
    },
  ],
  'thread-dm-priya': [
    {
      id: 'msg-p1',
      threadId: 'thread-dm-priya',
      senderId: 'me',
      senderName: 'You',
      senderTier: 'silver',
      type: 'text',
      text: 'Hi Priya! Could you share that dal makhani recipe?',
      timestamp: hrs(6),
      readBy: ['u2'],
    },
    {
      id: 'msg-p2',
      threadId: 'thread-dm-priya',
      senderId: 'u2',
      senderName: 'Priya Sharma',
      senderTier: 'gold',
      type: 'text',
      text: "Of course! I'll send it right away.",
      timestamp: hrs(5.5),
      readBy: ['me'],
    },
    {
      id: 'msg-p3',
      threadId: 'thread-dm-priya',
      senderId: 'u2',
      senderName: 'Priya Sharma',
      senderTier: 'gold',
      type: 'text',
      text: "Sure, I'll send the recipe!",
      timestamp: hrs(5),
      readBy: [],
    },
  ],
  'thread-dm-rohan': [
    {
      id: 'msg-r1',
      threadId: 'thread-dm-rohan',
      senderId: 'me',
      senderName: 'You',
      senderTier: 'silver',
      type: 'text',
      text: 'Hey Rohan, did you find your umbrella?',
      timestamp: hrs(11),
      readBy: ['u3'],
    },
    {
      id: 'msg-r2',
      threadId: 'thread-dm-rohan',
      senderId: 'u3',
      senderName: 'Rohan Mehta',
      senderTier: 'silver',
      type: 'text',
      text: 'Found it, thanks a lot!',
      timestamp: hrs(10),
      readBy: ['me'],
    },
  ],
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

// Seed data for Module 03 — Safety & SOS
import { AlertTriangle, Flame, ShieldAlert, Stethoscope, TrafficCone, Wrench } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

export type SeverityLevel = 'info' | 'caution' | 'danger';
export type SafetyCategory =
  | 'theft'
  | 'suspicious'
  | 'fire'
  | 'medical'
  | 'traffic'
  | 'infra'
  | 'animal'
  | 'other';

export interface SafetyIncident {
  id: string;
  authorId: string;
  authorName: string;
  authorTier: 'bronze' | 'silver' | 'gold';
  severity: SeverityLevel;
  category: SafetyCategory;
  title: string;
  body: string;
  location: string;
  lat?: number;
  lng?: number;
  createdAt: number;
  resolvedAt?: number;
  responders: number;
  safeCount: number;
  active: boolean;
}

export const CATEGORY_META: Record<SafetyCategory, { label: string; Icon: LucideIcon; tone: string }> = {
  theft: { label: 'Theft', Icon: ShieldAlert, tone: 'danger' },
  suspicious: { label: 'Suspicious', Icon: AlertTriangle, tone: 'warning' },
  fire: { label: 'Fire', Icon: Flame, tone: 'danger' },
  medical: { label: 'Medical', Icon: Stethoscope, tone: 'danger' },
  traffic: { label: 'Traffic', Icon: TrafficCone, tone: 'info' },
  infra: { label: 'Infrastructure', Icon: Wrench, tone: 'info' },
  animal: { label: 'Animal', Icon: AlertTriangle, tone: 'warning' },
  other: { label: 'Other', Icon: AlertTriangle, tone: 'neutral' },
};

const now = Date.now();
const mins = (n: number) => now - n * 60_000;
const hrs = (n: number) => now - n * 60 * 60_000;

export const SAFETY_INCIDENTS: SafetyIncident[] = [
  {
    id: 'inc-1',
    authorId: 'u2',
    authorName: 'Priya Sharma',
    authorTier: 'gold',
    severity: 'caution',
    category: 'suspicious',
    title: 'Suspicious person near parking B',
    body: 'A person has been loitering near Tower B parking entrance for the past hour. Dark jacket, watching parked cars. Security has been informed.',
    location: 'Tower B parking',
    createdAt: mins(90),
    responders: 5,
    safeCount: 0,
    active: true,
  },
  {
    id: 'inc-2',
    authorId: 'u-rwa',
    authorName: 'Kumar Sienna RWA',
    authorTier: 'gold',
    severity: 'info',
    category: 'infra',
    title: 'Power cut — Tower A floors 8-12',
    body: 'MSEB scheduled maintenance. Restored by 3pm today.',
    location: 'Tower A',
    createdAt: hrs(3),
    resolvedAt: hrs(1),
    responders: 0,
    safeCount: 12,
    active: false,
  },
  {
    id: 'inc-3',
    authorId: 'u7',
    authorName: 'Arjun Patil',
    authorTier: 'silver',
    severity: 'caution',
    category: 'theft',
    title: 'Bike theft attempt at gate',
    body: 'Someone tried to pick the lock on a bike near Gate 2 last night. Please ensure your vehicles are locked with additional disc locks.',
    location: 'Gate 2',
    createdAt: hrs(12),
    responders: 3,
    safeCount: 0,
    active: false,
  },
  {
    id: 'inc-4',
    authorId: 'u5',
    authorName: 'Vikram Joshi',
    authorTier: 'silver',
    severity: 'info',
    category: 'traffic',
    title: 'Road blocked on Main Road',
    body: 'Heavy traffic jam near society main road due to BMC pipe work. Take the service road through Gate 3.',
    location: 'Main Road entrance',
    createdAt: hrs(6),
    responders: 0,
    safeCount: 8,
    active: false,
  },
];

// Static insurance catalog — categories, plans, and community agents are reference
// data (not user-generated content), so they live here rather than as backend models.
import { Heart, Shield, Car, Home, Plane, Briefcase } from 'lucide-react-native';

export type InsuranceIconName = 'Heart' | 'Shield' | 'Car' | 'Home' | 'Plane' | 'Briefcase';

export const INSURANCE_ICON_MAP: Record<InsuranceIconName, typeof Shield> = {
  Heart,
  Shield,
  Car,
  Home,
  Plane,
  Briefcase,
};

export interface InsuranceCategory {
  id: string;
  name: string;
  icon: InsuranceIconName;
  color: string;
  description: string;
  startingPrice: number;
}

export interface Plan {
  id: string;
  provider: string;
  name: string;
  category: string;
  coverAmount: number;
  premium: number; // rupees
  premiumFrequency: 'monthly' | 'yearly';
  rating: number;
  reviews: number;
  features: string[];
  popular?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  photo?: string;
  expertise: string[];
  rating: number;
  experience: number;
}

export const CATEGORIES: InsuranceCategory[] = [
  { id: 'health', name: 'Health', icon: 'Heart', color: '#EF4444', description: 'Medical & hospitalization', startingPrice: 299 },
  { id: 'life', name: 'Life', icon: 'Shield', color: '#3B82F6', description: 'Term & whole life', startingPrice: 499 },
  { id: 'vehicle', name: 'Vehicle', icon: 'Car', color: '#8B5CF6', description: 'Car & bike insurance', startingPrice: 199 },
  { id: 'home', name: 'Home', icon: 'Home', color: '#10B981', description: 'Property protection', startingPrice: 149 },
  { id: 'travel', name: 'Travel', icon: 'Plane', color: '#F59E0B', description: 'Trip protection', startingPrice: 99 },
  { id: 'business', name: 'Business', icon: 'Briefcase', color: '#EC4899', description: 'Shop & office', startingPrice: 399 },
  { id: 'personal_accident', name: 'Personal Accident', icon: 'Shield', color: '#06B6D4', description: 'Injury & disability cover', startingPrice: 129 },
  { id: 'cyber', name: 'Cyber', icon: 'Briefcase', color: '#6366F1', description: 'Online fraud & data protection', startingPrice: 199 },
  { id: 'pet', name: 'Pet', icon: 'Heart', color: '#F97316', description: 'Vet bills & pet care', startingPrice: 249 },
];

export const PLANS: Plan[] = [
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
    name: 'Motor OD + TP',
    category: 'vehicle',
    coverAmount: 800000,
    premium: 4500,
    premiumFrequency: 'yearly',
    rating: 4.5,
    reviews: 3421,
    features: ['Cashless garage network', 'Personal accident cover', 'Zero depreciation', '24x7 roadside assistance'],
  },
];

export const AGENTS: Agent[] = [
  { id: '1', name: 'Rajesh Sharma', phone: '+91 98765 11111', expertise: ['Health', 'Life'], rating: 4.9, experience: 12 },
  { id: '2', name: 'Priya Mehta', phone: '+91 98765 22222', expertise: ['Vehicle', 'Home'], rating: 4.8, experience: 8 },
];

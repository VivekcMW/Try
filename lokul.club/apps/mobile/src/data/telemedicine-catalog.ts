// Telemedicine catalog — doctors/medicines/lab tests are a static reference
// catalog with no backend model (there's no real marketplace of clinics yet).
// Appointments, health records, orders and lab bookings ARE backed by the
// API (see /api/mobile/telemedicine/*) — only this reference data is static.
import {
  Stethoscope,
  UserRound,
  Baby,
  Bone,
  Activity,
  Brain,
  Eye,
  ThermometerSun,
} from 'lucide-react-native';

export type Specialty = {
  id: string;
  name: string;
  icon: typeof Stethoscope;
  color: string;
};

export const SPECIALTIES: Specialty[] = [
  { id: 'general', name: 'General', icon: Stethoscope, color: '#3B82F6' },
  { id: 'dermatology', name: 'Skin', icon: UserRound, color: '#EC4899' },
  { id: 'pediatrics', name: 'Pediatrics', icon: Baby, color: '#F59E0B' },
  { id: 'orthopedics', name: 'Bones', icon: Bone, color: '#8B5CF6' },
  { id: 'cardiology', name: 'Heart', icon: Activity, color: '#EF4444' },
  { id: 'psychology', name: 'Mental', icon: Brain, color: '#14B8A6' },
  { id: 'ophthalmology', name: 'Eye', icon: Eye, color: '#6366F1' },
  { id: 'dentistry', name: 'Dental', icon: ThermometerSun, color: '#22C55E' },
];

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  clinicName?: string;
  clinicFlat?: string;
  clinicPhone?: string;
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
};

export const DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Priya Sharma',
    specialty: 'general',
    qualification: 'MBBS, MD (Medicine)',
    experience: '15 years',
    clinicName: 'HealthFirst Clinic',
    clinicFlat: 'B-G01',
    clinicPhone: '+911140011001',
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
    clinicPhone: '+911140011002',
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
    clinicPhone: '+911140011003',
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
    name: 'Dr. Vikram Mehta',
    specialty: 'psychology',
    qualification: 'MBBS, MD (Psychiatry)',
    experience: '8 years',
    isNeighbor: true,
    clinicFlat: 'C-405',
    clinicPhone: '+911140011004',
    rating: 4.9,
    reviews: 98,
    consultationFee: 600,
    videoFee: 500,
    languages: ['English', 'Hindi'],
    availableToday: true,
    nextSlot: '4:00 PM',
    verified: true,
  },
];

export type MedicineCatalogItem = {
  id: string;
  name: string;
  form: string;
  price: number;
  requiresPrescription?: boolean;
};

export const MEDICINE_CATALOG: MedicineCatalogItem[] = [
  { id: 'm1', name: 'Paracetamol 500mg', form: '10 tablets', price: 30 },
  { id: 'm2', name: 'Cetirizine 10mg', form: '10 tablets', price: 25 },
  { id: 'm3', name: 'ORS Sachets', form: '5 sachets', price: 45 },
  { id: 'm4', name: 'Vitamin C 500mg', form: '15 tablets', price: 90 },
  { id: 'm5', name: 'Cough Syrup', form: '100ml bottle', price: 110 },
  { id: 'm6', name: 'Amoxicillin 500mg', form: '10 capsules', price: 120, requiresPrescription: true },
];

export type LabTestCatalogItem = {
  id: string;
  name: string;
  sampleType: string;
  price: number;
  fastingRequired?: boolean;
};

export const LAB_TEST_CATALOG: LabTestCatalogItem[] = [
  { id: 'l1', name: 'Complete Blood Count (CBC)', sampleType: 'Blood', price: 350 },
  { id: 'l2', name: 'Lipid Profile', sampleType: 'Blood', price: 600, fastingRequired: true },
  { id: 'l3', name: 'Thyroid Profile (T3/T4/TSH)', sampleType: 'Blood', price: 550 },
  { id: 'l4', name: 'Fasting Blood Sugar', sampleType: 'Blood', price: 150, fastingRequired: true },
  { id: 'l5', name: 'Urine Routine', sampleType: 'Urine', price: 200 },
  { id: 'l6', name: 'Vitamin D Test', sampleType: 'Blood', price: 900 },
];
